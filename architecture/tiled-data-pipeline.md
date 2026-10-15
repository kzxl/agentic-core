---
name: TiledDataPipeline
desc: High-Throughput Tiled Data Pipeline — Producer-Consumer Channels, Bounded Memory Pools, Tile Slicing
rules: [R_PIPE, R_PERF, R_CORE]
category: Architecture
---
# 🌊 High-Throughput Tiled Data Pipeline Blueprint

**Goal:** Process massive datasets (e.g. 500+ high-resolution images, multi-gigabyte video or point clouds) exceeding available physical RAM without out-of-memory crashes or pipeline stalls.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Disk / IO Producer (Channel<TileTask>)                  │
│    Reads raw chunks / downsampled slices from storage       │
├─────────────────────────────────────────────────────────────┤
│ 2. Bounded Ring Buffer / Channel Queue                      │
│    Limits in-flight memory to bounded size (e.g. 4GB pool)  │
├─────────────────────────────────────────────────────────────┤
│ 3. Parallel Compute Workers (SIMD / GPU)                    │
│    Transforms, filters, aligns tiles independently          │
├─────────────────────────────────────────────────────────────┤
│ 4. Accumulator / Reducer & Disk Cache                       │
│    Merges tile results into output pyramid or final file    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Quantitative Pipeline Invariants & Memory Budgets

| Pipeline Dimension | Mandatory Invariant | Rationale | Violation Failure Mode |
| :--- | :--- | :--- | :--- |
| **Tile Footprint** | `256x256`–`1024x1024` (`256 KB–4 MB`) | Fits L2/L3 CPU cache | LLC thrashing & DRAM bottleneck |
| **Halo Overlap** | `R = floor(KernelSize / 2)` px | Prevents border seams | Visible grid discontinuities |
| **Channel Capacity** | `BoundedChannelOptions(2 * Cores)` | Natural I/O backpressure | Unbounded RAM flood (`OOM`) |
| **Buffer Policy** | `0` LOH allocs (`ArrayPool<byte>`) | Zero Gen2/LOH GC | `> 500ms` GC stalls |

1. **Halo Slicing:** Filters of radius $R$ read $(W + 2R) \times (H + 2R)$ input tiles and write to the inner $W \times H$ region.
2. **Deterministic Recycling:** Return every rented buffer to `ArrayPool<byte>.Shared` inside `finally`.

---

## 2. Production Implementation: Bounded Tiled Pipeline

```csharp
// ❌ BAD: Allocates 4MB per tile on LOH and spawns unbounded tasks -> OOM crash!
public async Task ProcessBadAsync(Stream src, int tiles) {
    await Task.WhenAll(Enumerable.Range(0, tiles).Select(async _ => {
        byte[] buf = new byte[1024 * 1024 * 4];
        await src.ReadExactlyAsync(buf);
        await Task.Run(() => ApplyFilter(buf));
    }));
}

// ✅ GOOD: BoundedChannel backpressure + ArrayPool<byte> zero-LOH tile recycling
using System.Buffers;
using System.Threading.Channels;

public readonly record struct TileSlice(int X, int Y, int W, int H, int Halo, byte[] Buf, int Len);

public static class TiledPipelineEngine
{
    public static async Task ExecuteAsync(
        IAsyncEnumerable<TileSlice> producer,
        Action<ReadOnlySpan<byte>, Span<byte>, TileSlice> kernel,
        Func<TileSlice, ReadOnlyMemory<byte>, ValueTask> sink,
        int workersCount,
        CancellationToken ct)
    {
        var ch = Channel.CreateBounded<TileSlice>(new BoundedChannelOptions(workersCount * 2) {
            FullMode = BoundedChannelFullMode.Wait, SingleWriter = true
        });

        Task writer = Task.Run(async () => {
            try {
                await foreach (var t in producer.WithCancellation(ct)) await ch.Writer.WriteAsync(t, ct);
                ch.Writer.Complete();
            } catch (Exception ex) { ch.Writer.Complete(ex); throw; }
        }, ct);

        Task[] consumers = Enumerable.Range(0, workersCount).Select(_ => Task.Run(async () => {
            await foreach (TileSlice t in ch.Reader.ReadAllAsync(ct)) {
                int outLen = t.W * t.H * 4;
                byte[] outBuf = ArrayPool<byte>.Shared.Rent(outLen);
                try {
                    kernel(t.Buf.AsSpan(0, t.Len), outBuf.AsSpan(0, outLen), t);
                    await sink(t, outBuf.AsMemory(0, outLen));
                } finally {
                    ArrayPool<byte>.Shared.Return(t.Buf);
                    ArrayPool<byte>.Shared.Return(outBuf);
                }
            }
        }, ct)).ToArray();

        await Task.WhenAll([writer, .. consumers]);
    }
}
```

