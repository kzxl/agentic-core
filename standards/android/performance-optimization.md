---
desc: Android Performance Standards — Compose recomposition, memory efficiency, and frame rate optimization
rules: [R_ANDROID, R_PERF]
---
# ⚡ Android Performance & Optimization Standards

## 1. Jetpack Compose Recomposition Optimization
- **`@Immutable` / `@Stable` Contract:** Annotate domain models and UI states with `@Immutable` so Compose skips recomposition when model properties have not changed.
- **Derived State:** Use `derivedStateOf { ... }` whenever a composable depends on rapidly changing inputs (e.g. scroll offsets, drag coordinates, slider values):
  ```kotlin
  val isHeaderCollapsed by remember {
      derivedStateOf { scrollState.value > thresholdPx }
  }
  ```
- **Lambda Stability:** Wrap event handlers in `remember` or method references to prevent unstable lambda instances triggering child recompositions.

## 2. Memory & Zero-Allocation Pipelines
- **Direct ByteBuffer Sharing:** When communicating between Camera, NDK C++, and Compose rendering, allocate direct memory via `ByteBuffer.allocateDirect(bytes)` to eliminate JNI heap copy overhead.
- **Bitmap Recycling:** Avoid creating transient `Bitmap` objects in loops. Reuse fixed bitmap instances via `Bitmap.copyPixelsFromBuffer(...)`.
- **Image Downsampling:** Never load raw 48MP camera images directly into memory. Downsample with Coil `size(...)` or decode scaled sub-samples using `BitmapFactory.Options.inSampleSize`.

## 3. Profiling & Baseline Profiles
- **Baseline Profiles:** Generate Baseline Profiles (`androidx.profileinstaller`) to pre-compile critical paths (Cold start, Camera launch, Scrolling) to AOT machine code, eliminating first-frame JIT stutter.
- **R8 / Proguard:** Keep release builds minified with aggressive tree-shaking and native symbol stripping.
