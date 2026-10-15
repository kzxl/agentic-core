---
desc: Android Performance Standards — Compose recomposition, memory efficiency, and frame rate optimization
rules: [R_ANDROID, R_PERF]
---
# ⚡ Android Performance & Optimization Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Cold Start Latency (`TTID` / `TTFD`)** | `TTID < 400 ms`; `TTFD < 800 ms` on mid-tier ARM64 | `MacrobenchmarkRule` StartupTimingMetric in CI |
| **Frame Pacing Budget (`60` / `120 Hz`)** | `< 16.6 ms` (`60fps`) / `< 8.3 ms` (`120fps`); Jank `< 1.0%` | `FrameTimingMetric` & `JankStats` telemetry |
| **Main Thread Disk / Network I/O** | `0` synchronous reads/writes/SQLite calls on UI thread | `StrictMode.ThreadPolicy.Builder().detectAll().penaltyLog()` |
| **AOT Compilation Coverage** | `100%` of startup & critical scroll journeys in `baseline-prof.txt` | `androidx.baselineprofile` Gradle plugin |
| **Release Binary Shrinking** | R8 Full Mode (`android.enableR8.fullMode=true`) + resource shrinking | `isMinifyEnabled = true` & `isShrinkResources = true` |

---

## 2. Startup Latency Budgets (`TTID`/`TTFD`) & `StrictMode` Enforcement

Blocking `Application.onCreate()` or `Activity.onCreate()` with synchronous `SharedPreferences` disk reads, Dagger/Hilt eager graph initialization, or third-party SDK bootstrapping triggers ANRs (`> 5s`) and violates the `400 ms` Time-To-Initial-Display (`TTID`) budget.
- **Lazy Initialization & App Startup:** Defer non-critical SDKs using `androidx.startup` or background `Dispatchers.Default` coroutines launched after `reportFullyDrawn()`.
- **`StrictMode` Guard:** Enable `StrictMode` in all `debug` and staging builds to immediately surface accidental main-thread disk I/O, unclosed `Closeable` cursors/streams, and leaked SQLite connections.

```kotlin
// ❌ BAD: Synchronous SharedPreferences disk read & heavy SDK init on Main thread during cold start
class AppBad : Application() {
    override fun onCreate() {
        super.onCreate()
        val prefs = getSharedPreferences("config", MODE_PRIVATE) // Blocks Main thread on disk I/O!
        val theme = prefs.getString("theme", "dark")
        AnalyticsSdk.initializeBlocking(this, theme) // Adds 350ms to cold TTID!
    }
}

// ✅ GOOD: StrictMode violation trap in debug + non-blocking async bootstrap on Dispatchers.IO
class AppGood : Application() {
    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(
                StrictMode.ThreadPolicy.Builder()
                    .detectDiskReads()
                    .detectDiskWrites()
                    .detectNetwork()
                    .penaltyLog()
                    .penaltyFlashScreen()
                    .build()
            )
            StrictMode.setVmPolicy(
                StrictMode.VmPolicy.Builder()
                    .detectLeakedClosableObjects()
                    .detectActivityLeaks()
                    .penaltyLog()
                    .build()
            )
        }
        appScope.launch(Dispatchers.IO) {
            AnalyticsSdk.initializeAsync(applicationContext)
        }
    }
}
```

---

## 3. Baseline Profiles (`Macrobenchmark`) & R8 Full-Mode Shrinking

Without a **Baseline Profile**, Android's ART runtime interprets bytecode and JIT-compiles methods on the fly during the user's first launch, causing `30% – 40%` slower startup and severe first-scroll frame drops.
1. **Baseline Profile Generation:** Maintain a `:baselineprofile` test module using `BaselineProfileRule` that exercises Cold Start, Main Feed fling scrolling, and Core Detail navigation, outputting `src/main/baseline-prof.txt`.
2. **Call-complete `reportFullyDrawn()`:** Invoke `ComponentActivity.reportFullyDrawn()` (or Compose `ReportDrawnWhen { uiState.isContentReady }`) once initial asynchronous data is rendered to accurately measure Time-To-Full-Display (`TTFD`).
3. **R8 Full Mode:** Enable `android.enableR8.fullMode=true` in `gradle.properties`. Keep reflection rules (`@Keep` / `proguard-rules.pro`) scoped strictly to serialized DTOs (`@Serializable`) and JNI entry points.

---

## 4. Bitmap Downsampling & Zero-Allocation Frame Pacing

- **Sub-Sampled Decoding:** Decoding a `4000x3000` (`12 MP`) RGBA_8888 image allocates `48 MB` of contiguous RAM. Always downsample to the target viewport dimensions using Coil's `SizeResolver` or `BitmapFactory.Options.inSampleSize` with `Bitmap.Config.RGB_565` / `HARDWARE` bitmaps when alpha channel and pixel mutation are unneeded.
- **Zero Per-Frame Allocations:** In `Canvas` `onDraw`, camera analyzers, or `120 Hz` animation loops (`< 8.3 ms` budget), pre-allocate `Paint`, `Path`, `Matrix`, and `DirectByteBuffer` instances once outside the draw loop to prevent GC pauses during frame rendering.

