---
desc: C# High-Performance Compute & Memory Management Standards — SIMD, NativeMemory, Zero-Alloc Loops
rules: [R_PERF, R_CS]
---
# ⚡ C# High-Performance Compute & Memory Standards

## 1. Pragmatic Dual-Tier Allocation Standard
- **Core Philosophy:** "Zero-allocation on Hot-Paths, Minimal Allocation & Buffer Pooling on Application-Paths, Maximum Performance & Ergonomics Everywhere."
- **Tier 1 — Hot Paths (Strict Zero-Allocation):**
  - **Stack Allocation:** Use `stackalloc T[size]` for small transient buffers (<1KB) with `Span<T>` and `ReadOnlySpan<T>`.
  - **Zero Struct Boxing:** Use `ref struct`, `in`, `readonly ref`, and generic constraints instead of interfaces or boxing objects.
  - **Unmanaged Memory:** Allocate persistent large buffers using `NativeMemory.Alloc()` / `NativeMemory.AllocZeroed()` wrapped in `IDisposable` to avoid Large Object Heap (LOH) fragmentation.
- **Tier 2 — Application & Warm Paths (Minimal Allocation & Pooling):**
  - **Buffer Pooling:** For medium/large transient buffers, use `ArrayPool<T>.Shared.Rent(minSize)` (or `ArrayPoolBufferWriter<T>`) and guarantee return via `IDisposable` or `finally`.
  - **Exact Single Allocation:** Avoid intermediate string/buffer allocations (e.g., `StringBuilder` churn or chained `.Replace()`). Allocate exact destination size once (e.g., `string.Create`, `FastHex.ToString`).
  - **Async/Await Compatibility:** Use `Memory<T>` / `ReadOnlyMemory<T>` across `await` boundaries where `ref struct` cannot be captured by the compiler state machine.

## 2. Contiguous Memory & Fast Access
- **`Span<T>` & `ReadOnlySpan<T>`:** Mandatory abstraction for slicing arrays, strings, and unmanaged pointers without copying.
- **Row-Major Layout:** Structure 2D/3D matrix data sequentially in 1D memory (`index = (y * width + x) * channels + c`) to maximize CPU L1/L2 data cache hits.
- **Unsafe Pointers:** For inner mathematical kernels (convolutions, matrix multiplication, pixel transforms), obtain raw pointers (`T* ptr = buffer.DataPointer`) and index via pointer arithmetic.

## 3. Vectorization & SIMD Intrinsics
- **Hardware Acceleration:** Leverage `System.Runtime.Intrinsics.X86` (`Avx2`, `Avx512F`, `Fma`, `Sse41`) or cross-platform `Vector<T>` / `Vector256<T>` / `Vector512<T>`.
- **Alignment:** Ensure unmanaged pointers are 32-byte or 64-byte aligned for AVX2 / AVX-512 loads (`Avx2.LoadVector256()`).
- **SIMD Remainder Loop:** Always include a scalar tail loop to handle residual elements when `length % Vector.Count != 0`.

## 4. Multi-Threading & Cache Line Protection
- **Parallel Partitioning:** Use `Parallel.For` with row-level chunking rather than pixel-level scheduling to avoid task dispatch overhead.
- **False Sharing Defense:** Ensure thread-local accumulators do not share the same 64-byte cache line. Use padding or thread-local storage.
