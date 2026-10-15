---
desc: C# High-Performance Compute & Memory Management Standards — SIMD, NativeMemory, Zero-Alloc Loops
rules: [R_PERF, R_CS]
---
# ⚡ C# High-Performance Compute & Memory Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **`stackalloc` Buffer Ceiling** | `<= 1,024 bytes` (`1 KB` max per frame; `0` `stackalloc` inside loops) | Prevents `StackOverflowException` (`CA2014`) |
| **Transient Buffers (`1 KB – 1 MB`)** | `ArrayPool<T>.Shared.Rent(n)` + `Return(arr)` in `finally` | Zero Gen0/LOH GC churn (`> 85,000 bytes` LOH threshold) |
| **Large / SIMD Buffers (`> 1 MB`)** | `NativeMemory.AlignedAlloc(byteCount, 64)` wrapped in `SafeHandle`/`IDisposable` | `64-byte` AVX-512 & cache-line alignment; `0` GC pinning |
| **Struct Parameter Semantics** | `readonly struct` or `readonly record struct` when passed via `in` | Eliminates hidden `ldobj` compiler defensive copies |
| **SIMD Vectorization Remainder** | `100%` of `Vector256<T>` / `Vector512<T>` loops include scalar tail loop | Handles `length % Vector256<T>.Count != 0` safely |

---

## 2. `Span<T>`, `stackalloc` Thresholds & `ArrayPool<T>` Hygiene

Never allocate `new byte[N]` or `new float[N]` on hot paths (`> 1,000 calls/sec`). Use `stackalloc` for tiny buffers (`<= 1,024 bytes`) and `ArrayPool<T>.Shared` for larger buffers. Because `ArrayPool<T>.Shared.Rent(minLength)` returns an array that may be **larger** than `minLength` (rounded to powers of 2), always slice it immediately (`rented.AsSpan(0, exactLength)`) and guarantee `Return()` inside a `finally` block.

```csharp
using System.Buffers;
using System.Runtime.InteropServices;
using System.Runtime.Intrinsics;

// ❌ BAD: Allocates on LOH (>85KB), stackalloc inside loop risks StackOverflow, non-readonly struct causes defensive copies
public struct MutableMatrixBad { public float M11, M12, M21, M22; public float Trace() => M11 + M22; }

public static float ProcessSignalBad(ReadOnlySpan<float> input, in MutableMatrixBad mat)
{
    float sum = 0f;
    for (int i = 0; i < 100; i++)
    {
        Span<float> scratch = stackalloc float[4096]; // FATAL: 16KB * 100 = 1.6MB stack overflow!
        sum += mat.Trace(); // Hidden 16-byte defensive struct copy on EVERY call because MutableMatrixBad is not readonly!
    }
    float[] temp = new float[input.Length]; // LOH heap allocation if input.Length >= 21,250!
    return sum;
}

// ✅ GOOD: readonly record struct (0 defensive copies), stackalloc <= 1KB fallback to ArrayPool with try/finally
public readonly record struct Transform2D(float M11, float M12, float M21, float M22)
{
    public float Trace => M11 + M22;
}

public static float ComputeWeightedSumGood(ReadOnlySpan<float> src, float scale)
{
    const int StackAllocThreshold = 256; // 256 * 4B = 1,024 bytes max on stack
    float[]? rented = null;
    Span<float> buffer = src.Length <= StackAllocThreshold
        ? stackalloc float[src.Length]
        : (rented = ArrayPool<float>.Shared.Rent(src.Length)).AsSpan(0, src.Length);

    try
    {
        SimdScale(src, buffer, scale);
        float total = 0f;
        foreach (float v in buffer) total += v;
        return total;
    }
    finally
    {
        if (rented is not null)
        {
            ArrayPool<float>.Shared.Return(rented, clearArray: false);
        }
    }
}
```

---

## 3. Cross-Platform `Vector256<T>` SIMD & Scalar Tail Loops

Use `Vector256<T>` (or `Vector512<T>`) hardware intrinsics to process `8` (`AVX2` / ARM `NEON`x2) or `16` (`AVX-512`) `float` elements per instruction cycle, followed by a scalar remainder loop for trailing elements when `src.Length` is not a multiple of the vector width.

```csharp
public static void SimdScale(ReadOnlySpan<float> src, Span<float> dst, float factor)
{
    int length = src.Length;
    int i = 0;

    if (Vector256.IsHardwareAccelerated && length >= Vector256<float>.Count)
    {
        ref float srcRef = ref MemoryMarshal.GetReference(src);
        ref float dstRef = ref MemoryMarshal.GetReference(dst);
        Vector256<float> vFactor = Vector256.Create(factor);
        int lastBlockIndex = length - Vector256<float>.Count;

        for (; i <= lastBlockIndex; i += Vector256<float>.Count)
        {
            Vector256<float> v = Vector256.LoadUnsafe(ref srcRef, (nuint)i);
            (v * vFactor).StoreUnsafe(ref dstRef, (nuint)i);
        }
    }

    // Mandatory scalar tail loop for remaining (length % 8) elements
    for (; i < length; i++)
    {
        dst[i] = src[i] * factor;
    }
}
```

---

## 4. `NativeMemory.AlignedAlloc` (`64-Byte` Cache-Line Alignment)

For multi-megabyte buffers or native interop arenas, allocate via `NativeMemory.AlignedAlloc(byteCount, 64)` and release in `Dispose()` via `NativeMemory.AlignedFree(ptr)` to bypass GC overhead and guarantee `64-byte` AVX-512 alignment.
