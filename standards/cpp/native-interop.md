---
desc: Modern C++20 & Native Interop Standards — C-ABI Export, LibraryImport, Zero-Copy Buffers
rules: [R_CPP, R_PERF, R_CORE]
---
# 🧩 Modern C++20 & Native Interop Standards

## 1. Clean C-ABI Export Boundaries
- **No C++ Name Mangling:** Always wrap exported functions in `extern "C"` to provide a stable, language-agnostic C-ABI.
- **Cross-Platform Export Macros:**
  ```cpp
  #if defined(_WIN32)
      #define FSTACK_API __declspec(dllexport)
  #else
      #define FSTACK_API __attribute__((visibility("default")))
  #endif
  ```
- **Error Codes & Exception Boundaries:** NEVER throw C++ exceptions across DLL boundaries. Return integer status codes (`0 = OK`, `<0 = Error`) or write error messages to caller-provided buffer.

## 2. High-Performance .NET Interoperability
- **`[LibraryImport]` Source Generator:** Prefer .NET 7+ `[LibraryImport]` over legacy `[DllImport]` to eliminate runtime Marshalling IL stubs.
- **Direct Pointers:** Pass raw unmanaged pointers (`float*`, `byte*`) directly without marshalling overhead.
- **Memory Pinning:** For managed arrays, pin temporarily with `fixed (byte* p = array)` or pass `ref T` with `Unsafe.AsPointer()`.

## 3. Zero-Copy Memory Ownership
- **Caller-Allocated Buffers:** The higher-level orchestrator (.NET) allocates destination buffers and passes output pointers into C++ native kernels.
- **No Double-Allocation:** C++ native compute functions execute in-place or write directly to destination pointer.

## 4. Modern C++20 Best Practices
- Use `std::span`, `std::ranges`, `std::unique_ptr` inside the native implementation.
- Use OpenMP (`#pragma omp parallel for`) or standard C++20 `<execution>` policies for multi-threaded native kernels.
