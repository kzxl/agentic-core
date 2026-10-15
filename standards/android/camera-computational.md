---
desc: Android Camera2 & CameraX standards for manual sensor control, focus bracketing, and frame analysis
rules: [R_ANDROID, R_PERF]
---
# 📷 Android Computational Photography & Camera Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **`ImageAnalysis` Backpressure** | `STRATEGY_KEEP_ONLY_LATEST` (`imageQueueDepth = 1`) | Prevents frame queue memory bloat & preview lag |
| **`ImageProxy` Lifecycle** | `100%` closed via `imageProxy.use { ... }` (`try/finally`) | Unclosed `ImageProxy` stalls camera pipeline after `maxImages` |
| **Frame Analysis Execution Budget** | `< 12.0 ms` per frame on dedicated single-thread `Executor` | Zero main-thread analysis; offload heavy kernels to NDK |
| **YUV_420_888 Stride Compliance** | Explicit `rowStride` and `pixelStride` indexing on all 3 planes | Never assume `rowStride == width` (causes diagonal skew) |
| **Manual Sensor Capability Gate** | Verify `INFO_SUPPORTED_HARDWARE_LEVEL >= FULL` & `MANUAL_SENSOR` | Fallback gracefully on `LIMITED` / `LEGACY` camera HALs |

---

## 2. Deterministic `ImageProxy` Lifecycle & `YUV_420_888` Stride Alignment

Hardware camera ISP buffers pad rows to hardware alignment boundaries (e.g., `64-byte` or `128-byte` stride). Reading `plane.buffer` as `width * height` contiguous bytes produces sheared/corrupted images on devices where `rowStride > width`, and UV chroma planes frequently interleave pixels (`pixelStride == 2` for NV12/NV21). Furthermore, failing to call `imageProxy.close()` on every code path starves the underlying `ImageReader` surface and freezes the camera preview permanently.

```kotlin
// ❌ BAD: Assumes rowStride == width (corrupts padded sensors) and leaks imageProxy on early return!
class BadFrameAnalyzer : ImageAnalysis.Analyzer {
    override fun analyze(image: ImageProxy) {
        if (image.format != ImageFormat.YUV_420_888) return // FATAL: image.close() never called -> camera freezes!
        val yBytes = ByteArray(image.width * image.height)
        image.planes[0].buffer.get(yBytes) // Ignores rowStride padding -> diagonal image skew!
        image.close()
    }
}

// ✅ GOOD: Kotlin .use {} guarantees ImageProxy.close(); respects rowStride & pixelStride into reused DirectByteBuffer
class StrideSafeYuvAnalyzer(
    private val outLumaBuffer: ByteBuffer,
    private val onLumaFrameReady: (ByteBuffer, Int, Int) -> Unit,
) : ImageAnalysis.Analyzer {

    override fun analyze(image: ImageProxy) {
        image.use { proxy ->
            if (proxy.format != ImageFormat.YUV_420_888) return@use
            val width = proxy.width
            val height = proxy.height
            val yPlane = proxy.planes[0]
            val yBuffer = yPlane.buffer
            val rowStride = yPlane.rowStride

            outLumaBuffer.clear()
            if (rowStride == width) {
                // Fast zero-padding path: single bulk copy
                yBuffer.rewind()
                val limit = width * height
                yBuffer.limit(limit)
                outLumaBuffer.put(yBuffer)
            } else {
                // Padded sensor HAL path: copy row-by-row stripping hardware stride padding
                val rowBytes = ByteArray(width)
                for (row in 0 until height) {
                    yBuffer.position(row * rowStride)
                    yBuffer.get(rowBytes, 0, width)
                    outLumaBuffer.put(rowBytes)
                }
            }
            outLumaBuffer.flip()
            onLumaFrameReady(outLumaBuffer, width, height)
        }
    }
}
```

---

## 3. Hardware Capability Querying & Diopter-Linear Focus Bracketing

Before issuing manual `CaptureRequest.LENS_FOCUS_DISTANCE` or `SENSOR_EXPOSURE_TIME` commands via Camera2 (`Camera2Interop`), query `CameraCharacteristics`:
1. Verify `REQUEST_AVAILABLE_CAPABILITIES` contains `REQUEST_AVAILABLE_CAPABILITIES_MANUAL_SENSOR`.
2. Read `LENS_INFO_MINIMUM_FOCUS_DISTANCE` ($D_{\text{max}}$ in diopters; returns `0.0f` on fixed-focus lenses) and check `LENS_INFO_FOCUS_DISTANCE_CALIBRATION`.
3. **Diopter Linearization:** Because optical depth-of-field scales linearly in diopters ($D = 1 / \text{meters}$), step focus bursts uniformly across diopters ($\Delta D = (D_{\text{near}} - D_{\text{far}}) / (N - 1)$) with `CONTROL_AF_MODE_OFF` and `CONTROL_AE_LOCK = true`, submitting the entire sequence atomically via `captureSession.captureBurst(requestList, callback, cameraHandler)`.

---

## 4. Non-Blocking Executor Segregation

Bind `ImageAnalysis.Builder().setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).setOutputImageFormat(OUTPUT_IMAGE_FORMAT_YUV_420_888)` to a dedicated single-threaded `Executors.newSingleThreadExecutor()` so frame analysis never contends with the Camera HAL `HandlerThread` or Compose UI rendering.

