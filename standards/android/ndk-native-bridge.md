---
desc: Android NDK & C++ JNI Integration Standards — Zero-copy memory, SIMD vectorization, and build configuration
rules: [R_ANDROID, R_CPP, R_PERF]
---
# ⚙️ Android NDK & C++ JNI Standards

## 1. JNI Export Interface Standards
- **Strict Parameter Validation:** Always check buffer pointers and bounds before accessing memory:
  ```cpp
  extern "C" JNIEXPORT jint JNICALL
  Java_com_example_app_NativeBridge_processDirect(
      JNIEnv* env, jobject /* this */, jobject directBuf, jint width, jint height) {
      auto* ptr = static_cast<uint8_t*>(env->GetDirectBufferAddress(directBuf));
      if (!ptr || width <= 0 || height <= 0) return -1;
      // Process...
      return 0;
  }
  ```
- **Zero-Copy Memory Access:** Use `env->GetDirectBufferAddress()` instead of `GetByteArrayElements()` to avoid copying arrays between Java heap and C++ native memory.

## 2. Multi-Threading & Compiler Vectorization
- **OpenMP / ARM NEON:** Compile native code with `-std=c++17 -O3 -fopenmp` in `CMakeLists.txt` for automatic loop vectorization and multi-core thread parallelization across ARM big.LITTLE cores.
- **Thread Safety:** Never pass a `JNIEnv*` pointer across different native threads (it is thread-local). Use `JavaVM->AttachCurrentThread` if a worker thread must call back into Java.

## 3. ABI Filtering & Build Setup
- **Target ABIs:** Standard release configurations MUST target `arm64-v8a` (primary 64-bit modern devices), with optional `armeabi-v7a` and `x86_64` (emulators):
  ```kotlin
  ndk {
      abiFilters += listOf("arm64-v8a", "armeabi-v7a", "x86_64")
  }
  ```
