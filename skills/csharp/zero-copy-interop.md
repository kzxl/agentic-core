---
name: ZeroCopyInterop
desc: Zero-Copy C# and C++ Native Memory Interoperability via P/Invoke and NativeMemory
rules: [R_CPP, R_PERF, R_CS]
category: Skill
---
# 🚀 Zero-Copy C# and C++ Native Interop

## 1. Direct Pointer P/Invoke with LibraryImport

```csharp
using System.Runtime.InteropServices;

public static partial class NativeCompute
{
    private const string DllName = "FStack.Native";

    [LibraryImport(DllName, EntryPoint = "FStack_FastLaplacian")]
    [UnmanagedCallConv(CallConvs = new Type[] { typeof(System.Runtime.CompilerServices.CallConvCdecl) })]
    public static unsafe partial int FastLaplacian(
        float* src, 
        float* dst, 
        int width, 
        int height, 
        int stride);
}
```

---

## 2. Caller-Allocated NativeMemory Pattern

```csharp
public unsafe sealed class UnmanagedMatrix : IDisposable
{
    public float* Pointer { get; private set; }
    public int Length { get; }

    public UnmanagedMatrix(int length)
    {
        Length = length;
        Pointer = (float*)NativeMemory.Alloc((nuint)(length * sizeof(float)));
    }

    public Span<float> AsSpan() => new(Pointer, Length);

    public void Dispose()
    {
        if (Pointer != null)
        {
            NativeMemory.Free(Pointer);
            Pointer = null;
        }
        GC.SuppressFinalize(this);
    }
}
```

---

## 3. Safe Delegate Callbacks from Native Code

When passing callbacks (progress/cancellation) to native code, prevent GC collection:

```csharp
[UnmanagedFunctionPointer(CallingConvention.Cdecl)]
public delegate void NativeProgressCallback(int completed, int total);

// Pin delegate to prevent GC collection during long-running native call
GCHandle handle = GCHandle.Alloc(callback);
try
{
    IntPtr fnPtr = Marshal.GetFunctionPointerForDelegate(callback);
    NativeCompute.ExecuteJob(dataPtr, fnPtr);
}
finally
{
    handle.Free();
}
```
