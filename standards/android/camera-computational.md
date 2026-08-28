---
desc: Android Camera2 & CameraX standards for manual sensor control, focus bracketing, and frame analysis
rules: [R_ANDROID, R_PERF]
---
# 📷 Android Computational Photography & Camera Standards

## 1. Camera2 / CameraX Architecture
- **Preview & Lifecycle:** Use **CameraX** (`ProcessCameraProvider`, `PreviewView`, `ImageAnalysis`) for rock-solid lifecycle binding and device compatibility.
- **Manual Sensor & Burst:** Use **Camera2 API** (`CameraDevice`, `CameraCaptureSession`, `CaptureRequest`) when precise physical lens diopter control or high-speed hardware bursts are required.

## 2. Focus Bracketing & Manual Lens Stepping
- **Diopter Linearization:** Android `LENS_FOCUS_DISTANCE` operates in Diopters ($D = \frac{1}{\text{distance in meters}}$). Calculate stepping linearly in diopters, NOT in meters:
  $$\Delta D = \frac{D_{\text{near}} - D_{\text{far}}}{\text{Steps} - 1}$$
- **Disabling Auto-Focus:** Explicitly set `CONTROL_AF_MODE = CONTROL_AF_MODE_OFF` before issuing manual `LENS_FOCUS_DISTANCE` burst requests.
- **Hardware Burst Queues:** Issue a single `captureSession.captureBurst(requests, callback, handler)` call rather than individual capture loops to minimize mechanical latency ($<1$ second for $10\text{ frames}$).

## 3. Real-Time Stream Analysis & Focus Peaking
- **YUV to RGBA Conversion:** Decode `ImageProxy` (YUV_420_888) directly into a pre-allocated native `DirectByteBuffer`.
- **Latency Budget:** Frame analysis pipelines MUST execute in $<16\text{ms}$ ($>60\text{ FPS}$). If processing takes longer, drop intermediate frames or offload to C++ NDK.
- **Buffer Recycling:** Always allocate direct ByteBuffers once during initialization; NEVER allocate new ByteBuffers per frame in `analyze(image)`.

## 4. Anti-Patterns
- ❌ **Leaking ImageProxy:** Forgetting to call `image.close()` in `ImageAnalysis.Analyzer` freezes the camera pipeline permanently.
- ❌ **Blocking Camera Handler:** Never run heavy computational algorithms on the Camera background `HandlerThread`.
