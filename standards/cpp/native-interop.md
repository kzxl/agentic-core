---
desc: Modern C++20 & Native Interop Standards — C-ABI Export, LibraryImport, Zero-Copy Buffers
rules: [R_CPP, R_PERF, R_CORE]
---
# 🧩 Modern C++20 & Native Interop Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **C++ Exceptions Across DLL ABI** | `0` exceptions escaping `extern "C"` functions (`noexcept`) | Outermost `try/catch (...)` returning integer status code |
| **STL Types in Exported Signatures** | `0` `std::string`, `std::vector`, or `std::function` across ABI | Strictly POD structs (`#[repr(C)]`), raw pointers, and `size_t` |
| **SIMD Buffer Alignment** | `alignas(64)` (`64-byte` AVX-512 / cache-line boundary) | Verified via `(reinterpret_cast<uintptr_t>(p) & 63) == 0` |
| **.NET P/Invoke Binding** | `100%` `[LibraryImport]` source-generated (`0` legacy `[DllImport]`) | `DisableRuntimeMarshalling` assembly attribute |
| **Cross-Runtime Heap Deallocation** | `0` `free()` / `Marshal.FreeHGlobal` on foreign C++ `new[]` | Caller-allocated destination buffers or paired `native_free()` |

---

## 2. `extern "C"` ABI Stability, `std::span` & Exception Firewalls

Passing `std::vector<float>` or throwing C++ exceptions across a DLL/SO boundary into .NET, Rust, or Python causes immediate memory corruption due to CRT heap mismatch and ABI layout differences between MSVC, Clang, and GCC. Exported functions MUST use `extern "C"`, mark signatures `noexcept`, validate pointers at the boundary, and immediately wrap raw `(ptr, len)` pairs into bounds-safe C++20 `std::span<T>`.

```cpp
// ❌ BAD: Exposes std::vector across DLL boundary, throws C++ exception into .NET P/Invoke, raw pointer math
__declspec(dllexport) std::vector<float> ComputeConvolutionBad(const float* src, int count) {
    if (!src) throw std::invalid_argument("Null pointer!"); // Crashes .NET CLR / corrupts stack!
    std::vector<float> out(count); // Allocated on C++ CRT heap; .NET GC cannot free it safely!
    for (int i = 0; i <= count; ++i) out[i] = src[i] * 2.0f; // Off-by-one buffer overflow!
    return out;
}

// ✅ GOOD: Stable C-ABI, noexcept firewall, caller-allocated buffers, and C++20 std::span inside kernel
#include <cstdint>
#include <cstddef>
#include <span>
#include <exception>

#if defined(_WIN32)
  #define NATIVE_API extern "C" __declspec(dllexport)
#else
  #define NATIVE_API extern "C" __attribute__((visibility("default")))
#endif

enum class NativeStatus : int32_t {
    Ok = 0,
    NullPointer = -1,
    InvalidLength = -2,
    AlignmentError = -3,
    InternalException = -99,
};

struct alignas(64) SimdKernelBlock {
    float coefficients[16];
};

static void scaleKernelInternal(std::span<const float> input, std::span<float> output, float gain) noexcept {
    const size_t n = input.size();
    const float* __restrict inPtr = input.data();
    float* __restrict outPtr = output.data();
    #pragma omp simd aligned(inPtr, outPtr : 64)
    for (size_t i = 0; i < n; ++i) {
        outPtr[i] = inPtr[i] * gain;
    }
}

NATIVE_API int32_t Native_ScaleSignal64(
    const float* srcPtr,
    float* dstPtr,
    size_t elementCount,
    float gain
) noexcept {
    if (srcPtr == nullptr || dstPtr == nullptr) return static_cast<int32_t>(NativeStatus::NullPointer);
    if (elementCount == 0) return static_cast<int32_t>(NativeStatus::InvalidLength);
    if (((reinterpret_cast<uintptr_t>(srcPtr) | reinterpret_cast<uintptr_t>(dstPtr)) & 63u) != 0u) {
        return static_cast<int32_t>(NativeStatus::AlignmentError);
    }

    try {
        scaleKernelInternal({srcPtr, elementCount}, {dstPtr, elementCount}, gain);
        return static_cast<int32_t>(NativeStatus::Ok);
    } catch (...) {
        return static_cast<int32_t>(NativeStatus::InternalException);
    }
}
```

---

## 3. .NET 8+ `[LibraryImport]` Zero-Overhead Marshaling

Never use legacy `[DllImport]`, which synthesizes runtime IL marshaling stubs and fails under NativeAOT. Declare `partial` P/Invoke methods with `[LibraryImport]` and `[SuppressGCTransition]` (for fast non-blocking kernels `< 1 µs`) and pass `Span<T>` pinned via `fixed`:

```csharp
internal static partial class NativeSignalInterop
{
    [LibraryImport("native_core", EntryPoint = "Native_ScaleSignal64")]
    [UnmanagedCallConv(CallConvs = [typeof(System.Runtime.CompilerServices.CallConvCdecl)])]
    internal static unsafe partial int ScaleSignal64(
        float* srcPtr, float* dstPtr, nuint elementCount, float gain);
}
```

---

## 4. OpenMP & Thread-Pool Oversubscription Guard

When .NET `Parallel.For` invokes a C++ function that spawns `#pragma omp parallel for` threads on an $N$-core machine, $N \times N$ threads contend for $N$ physical cores. Parallelize exclusively in the host orchestrator calling single-threaded SIMD kernels (`#pragma omp simd`), or cap OpenMP via `omp_set_num_threads(1)`.
