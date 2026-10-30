---
name: ZeroCopyInterop
desc: Zero-Copy C# and C++ Native Memory Interoperability via P/Invoke and NativeMemory.
rules: [R_CPP, R_PERF, R_CS]
category: Skill
---
# 🚀 Zero-Copy C# and C++ Native Interop Protocol

**Goal:** Achieve zero-allocation, zero-copy memory sharing between managed C# (.NET 8+) and native C/C++ SIMD kernels using source-generated `[LibraryImport]`, `NativeMemory.AlignedAlloc`, `Span<T>`, and `SafeHandle` deterministic resource governance.

---

## 1. Quantitative Interop Performance & Safety Invariants
| Interop Dimension | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **P/Invoke Binding Generation** | $100\%$ `[LibraryImport]` (`.NET 7+`) | Ban legacy runtime `[DllImport]` reflection stubs |
| **Managed Heap Allocations** | $0\text{ B}$ per hot-path native invocation | Pass `Span<T>` / `ReadOnlySpan<T>` or `NativeMemory` pointers |
| **SIMD Memory Alignment** | $32\text{-byte}$ (`AVX2`) or $64\text{-byte}$ (`AVX-512`) | `NativeMemory.AlignedAlloc(byteCount, alignment: 64)` |
| **GC Handle Pinning Duration** | $\le 100\text{ }\mu\text{s}$ for `fixed` managed buffers | Use off-heap `NativeMemory` for long-running async native jobs |
| **Unmanaged Handle Leaks** | $0$ leaked native pointers or descriptors | Wrap native handles in `SafeHandleZeroOrMinusOneIsInvalid` |

---

## 2. Source-Generated `[LibraryImport]` & Pinning Minimization

- **Compile-Time Marshaling (`[LibraryImport]`):** Always declare native bindings inside a `static partial class` decorated with `[LibraryImport]` and `[UnmanagedCallConv(CallConvs = [typeof(CallConvCdecl)])]`. Mark pure, non-blocking < $1\text{ }\mu\text{s}$ C functions with `[SuppressGCTransition]` to eliminate the ~15ns thread-state transition overhead.
- **Avoid Marshaling Copies:** Never pass `float[]` or `string` by value into C++ hot loops, which triggers hidden runtime array cloning or UTF-16-to-ANSI conversions. Pass `ReadOnlySpan<T>` (pinned automatically by the source generator via the fast `fixed` statement) or raw aligned pointers.

```csharp
// ❌ BAD: Legacy [DllImport] copies managed arrays across the boundary on every call
public static class LegacyNativeInterop
{
    [DllImport("VisionCore.dll", CallingConvention = CallingConvention.Cdecl)]
    public static extern int ComputeSobel([In] float[] input, [Out] float[] output, int length);
}

// ✅ GOOD: Zero-copy source-generated [LibraryImport] over Span<float> with GC transition suppression
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

public static partial class NativeVisionKernels
{
    private const string LibraryName = "VisionCore";

    [LibraryImport(LibraryName, EntryPoint = "Vision_ComputeSobelAvx2")]
    [UnmanagedCallConv(CallConvs = [typeof(CallConvCdecl)])]
    [SuppressGCTransition]
    public static partial int ComputeSobelAvx2(
        ReadOnlySpan<float> src,
        Span<float> dst,
        int width,
        int height,
        int strideElements);
}
```

---

## 3. 64-Byte Cache-Aligned `NativeMemory` & `Span<T>` Projection

For buffers exceeding $85,000$ bytes (which would otherwise land on the GC Large Object Heap and fragment Gen 2) or buffers accessed by native background threads, allocate off-heap aligned memory via `NativeMemory.AlignedAlloc`:

```csharp
public unsafe sealed class AlignedNativeTensor<T> : IDisposable where T : unmanaged
{
    private const nuint CacheLineAlignment = 64;
    private T* _ptr;
    public int Length { get; }

    public AlignedNativeTensor(int length)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(length);
        Length = length;
        nuint byteCount = checked((nuint)length * (nuint)sizeof(T));
        _ptr = (T*)NativeMemory.AlignedAlloc(byteCount, CacheLineAlignment);
        NativeMemory.Clear(_ptr, byteCount);
    }

    public T* RawPointer
    {
        get
        {
            ObjectDisposedException.ThrowIf(_ptr == null, this);
            return _ptr;
        }
    }

    public Span<T> AsSpan()
    {
        ObjectDisposedException.ThrowIf(_ptr == null, this);
        return new Span<T>(_ptr, Length);
    }

    public void Dispose()
    {
        T* ptr = _ptr;
        if (ptr != null)
        {
            _ptr = null;
            NativeMemory.AlignedFree(ptr);
        }
    }
}
```

---

## 4. `SafeHandle` Lifecycle & Native Callback Pinning
- **Opaque Engine Handles:** Wrap native `void*` contexts (`CreateEngine()` / `DestroyEngine(void*)`) in a `SafeHandleZeroOrMinusOneIsInvalid` subclass instead of raw `IntPtr` fields to guarantee release via Critical Finalizer.
- **Reverse P/Invoke Callbacks:** Prefer `delegate* unmanaged[Cdecl]<int, int, void>` static function pointers over `Marshal.GetFunctionPointerForDelegate`. When passing an instance delegate, pin it with `GCHandle.Alloc(callback)` in a `try/finally` block for the call duration.
