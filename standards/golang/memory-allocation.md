---
desc: Golang Zero-Allocation, Pre-allocation & Sync.Pool Optimization
rules: [R_GO]
---
# ⚡ Golang Memory & Allocation Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Struct Padding Waste** | `0` unnecessary alignment bytes on hot-path structs | `fieldalignment ./...` static analyzer |
| **Slice / Map Pre-Allocation** | `100%` of known-bound collections pre-sized via `make(..., cap)` | Code review & `prealloc` linter |
| **Subslice Backing Array Pinning** | Never retain `< 10%` slice window of a `> 64 KB` buffer | Explicit `bytes.Clone` or `slices.Clone` |
| **`sync.Pool` Max Retained Cap** | Drop pooled buffers exceeding `64 KB` before `Put()` | Capacity guard prior to `pool.Put()` |
| **Hot-Path Heap Escapes** | Verified via `go build -gcflags="-m=2"` and `b.ReportAllocs()` | Benchmark regression gate (`allocs/op`) |

---

## 2. Struct Field Alignment & Escape Analysis (`-gcflags="-m"`)

Go aligns struct fields to natural word boundaries (`8B` on 64-bit). Interleaving `1B` (`bool`/`uint8`) and `8B` (`int64`/pointers) fields inserts up to `7B` of padding per field. Order fields strictly from **largest alignment to smallest** (`16B` slices/strings &rarr; `8B` int64/pointers &rarr; `4B` &rarr; `2B` &rarr; `1B`). Pass small immutable structs (`<= 32B`) by value to avoid heap escapes (`go build -gcflags="-m"`).

```go
// ❌ BAD: 40 bytes due to 14 bytes of alignment padding; returning *Metric forces heap escape
type MetricBad struct {
	IsActive  bool    // 1B + 7B padding
	Timestamp int64   // 8B
	ShardID   uint8   // 1B + 7B padding
	Value     float64 // 8B
	Flag      bool    // 1B + 7B padding
} // sizeof = 40 bytes

// ✅ GOOD: 24 bytes (40% reduction), zero internal padding, stack-allocated value semantics
type MetricGood struct {
	Timestamp int64   // 8B
	Value     float64 // 8B
	ShardID   uint8   // 1B
	IsActive  bool    // 1B
	Flag      bool    // 1B + 5B tail padding
} // sizeof = 24 bytes
```

---

## 3. Slice Capacity Leak Traps (`bytes.Clone` & 3-Index Slicing)

Slicing (`header := packet[:16]`) shares the underlying backing array. Retaining a small subslice in a cache or channel pins the entire multi-MB buffer against GC, while `append()` on a 2-index subslice overwrites adjacent data.

```go
// ❌ BAD: Retaining 16-byte ID slice pins the entire 4MB network payload in heap memory!
func ExtractMessageIDBad(rawPayload []byte) []byte {
	return rawPayload[0:16] // Shares 4MB backing array; append() also corrupts rawPayload[16:]!
}

// ✅ GOOD: Detach long-lived subslice via bytes.Clone; cap capacity with 3-index slicing s[:n:n]
func ExtractMessageIDGood(rawPayload []byte) []byte {
	return bytes.Clone(rawPayload[:16]) // Exact 16-byte copy; 4MB payload is GC-eligible
}

func PartitionFrameWindow(buf []byte, split int) (head, tail []byte) {
	return buf[:split:split], buf[split:] // 3-index slice forces new allocation if caller appends
}
```

---

## 4. `sync.Pool` Reset Safety & Pre-Sized Collections

1. **Pointer Wrapping:** Pool pointer types (`*bytes.Buffer` or `*[]byte`) to avoid `24B` interface-boxing allocations on `Put()`.
2. **Mandatory Reset:** Call `buf.Reset()` on `Get()` and before `Put()` to prevent cross-request data leaks.
3. **Oversize Guard:** Drop buffers whose `.Cap()` exceeds `64 KB` instead of returning them to `sync.Pool`.

```go
// ❌ BAD: Value slice boxes on Put, no Reset leaks prior data, pins outlier mega-buffers forever
var badPool = sync.Pool{New: func() any { return make([]byte, 0, 1024) }}

func FormatPayloadBad(items []string) []byte {
	b := badPool.Get().([]byte)
	for _, s := range items {
		b = append(b, s...)
	}
	badPool.Put(b) // DATA RACE: returning slice to pool while also returning it to caller!
	return b
}

// ✅ GOOD: Pointer-backed *bytes.Buffer, Reset() + 64KB cap guard, cloned output ownership
var bufPool = sync.Pool{New: func() any { return bytes.NewBuffer(make([]byte, 0, 4096)) }}

func FormatPayloadGood(items []string) []byte {
	buf := bufPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer func() {
		if buf.Cap() <= 64*1024 {
			buf.Reset()
			bufPool.Put(buf)
		}
	}()
	for _, s := range items {
		buf.WriteString(s)
	}
	return bytes.Clone(buf.Bytes())
}
```
