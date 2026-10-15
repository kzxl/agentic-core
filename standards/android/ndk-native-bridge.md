---
desc: Android NDK & C++ JNI Integration Standards — Zero-copy memory, SIMD vectorization, and build configuration
rules: [R_ANDROID, R_CPP, R_PERF]
---
# ⚙️ Android NDK & C++ JNI Integration Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Java-to-Native Payload Transfer** | `0` `GetByteArrayElements` heap copies for buffers `> 16 KB` | Mandatory `ByteBuffer.allocateDirect` + `GetDirectBufferAddress` |
| **Critical Array Pinning Window** | `< 500 µs`; `0` blocking I/O or nested JNI calls inside critical region | `GetPrimitiveArrayCritical` / `ReleasePrimitiveArrayCritical` |
| **JNI Local Reference Ceiling** | `< 64` active local refs per native loop iteration (ART max `512`) | `env->PushLocalFrame(cap)` / `env->DeleteLocalRef(ref)` |
| **`JNIEnv*` Thread Affinity** | `0` cross-thread `JNIEnv*` shares (strictly thread-local pointer) | Resolve via `JavaVM::AttachCurrentThread` + `DetachCurrentThread` |
| **Native Exception Escape** | `0` C++ exceptions crossing `extern "C" JNIEXPORT` boundary | `-fno-exceptions` or outermost `try/catch` &rarr; `env->ThrowNew(...)` |

---

## 2. Zero-Copy `DirectByteBuffer` & Local Reference Table Hygiene

Calling `env->GetByteArrayElements(jarray, nullptr)` pins or copies managed ART heap arrays, stalling concurrent Garbage Collection (`CMC` / `Generational CC`). Furthermore, creating `jobject`, `jstring`, or `jbyteArray` instances inside a native C++ loop without releasing them overflows ART's 512-entry JNI Local Reference Table (`JNI ERROR (app bug): local reference table overflow (max=512)`).

```cpp
// ❌ BAD: Copies 12MB frame across ART/C++ heaps; leaks local references in loop -> crashes after 512 iterations!
extern "C" JNIEXPORT void JNICALL
Java_com_app_NativeBridge_processBatchBad(JNIEnv* env, jobject thiz, jbyteArray frameData, jobjectArray items) {
    jbyte* raw = env->GetByteArrayElements(frameData, nullptr); // Heap copy + GC pin!
    jsize count = env->GetArrayLength(items);
    for (jsize i = 0; i < count; ++i) {
        jobject elem = env->GetObjectArrayElement(items, i); // Local ref leaked every iteration!
        jclass cls = env->GetObjectClass(elem);              // Second local ref leaked!
    }
    // Forgot ReleaseByteArrayElements -> permanent native memory leak!
}

// ✅ GOOD: Zero-copy DirectByteBuffer with capacity validation + PushLocalFrame/PopLocalFrame loop hygiene
extern "C" JNIEXPORT jint JNICALL
Java_com_app_NativeBridge_processBatchGood(
    JNIEnv* env,
    jobject /* thiz */,
    jobject directBuf,
    jint width,
    jint height,
    jobjectArray metadataItems
) noexcept {
    if (directBuf == nullptr || width <= 0 || height <= 0) return -1;

    auto* basePtr = static_cast<uint8_t*>(env->GetDirectBufferAddress(directBuf));
    const jlong capacity = env->GetDirectBufferCapacity(directBuf);
    const jlong requiredBytes = static_cast<jlong>(width) * height * 4;
    if (basePtr == nullptr || capacity < requiredBytes) return -2;

    const jsize count = (metadataItems != nullptr) ? env->GetArrayLength(metadataItems) : 0;
    for (jsize i = 0; i < count; ++i) {
        if (env->PushLocalFrame(8) < 0) return -3; // Guarantees O(1) local reference table footprint
        jobject item = env->GetObjectArrayElement(metadataItems, i);
        if (item != nullptr) {
            // Process item safely; all local refs inside frame are reclaimed automatically below
        }
        env->PopLocalFrame(nullptr);
    }

    processRgbaSimdNeon(basePtr, width, height);
    return 0;
}
```

---

## 3. Critical Array Pinning Bounds & `CheckJNI` Diagnostics

- **`GetPrimitiveArrayCritical` Contract:** Use `GetPrimitiveArrayCritical` only for small contiguous arrays (`<= 16 KB`) where `DirectByteBuffer` cannot be used. Between `GetPrimitiveArrayCritical` and `ReleasePrimitiveArrayCritical`, the ART Garbage Collector is completely suspended: **never** make any other `JNIEnv` calls, **never** block on mutexes/I/O, and **always** release within `< 500 µs`.
- **Cached `jmethodID` / `jfieldID`:** Looking up `FindClass`, `GetMethodID`, or `GetFieldID` on every frame costs microseconds of string reflection. Cache `jclass` (wrapped in `env->NewGlobalRef`) and `jmethodID` once inside `JNI_OnLoad(JavaVM* vm, void*)`.
- **`CheckJNI` Verification:** Enable `adb shell setprop debug.checkjni 1` in debug/CI instrumentation suites to trap stale local refs, invalid UTF-8 strings (`NewStringUTF`), and pending exception violations (`env->ExceptionCheck()`).

---

## 4. CMake Build Hardening & 16KB ELF Page Alignment

Android 15+ (API 35) mandates **16 KB ELF page alignment** for all `.so` libraries:

```cmake
target_compile_options(native_core PRIVATE -std=c++20 -O3 -ffast-math -fvisibility=hidden -fno-exceptions -fno-rtti)
target_link_options(native_core PRIVATE "-Wl,-z,max-page-size=16384")
```
