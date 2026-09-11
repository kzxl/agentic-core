---
title: Empirical Benchmarking, Hardware Provenance, and Reproducibility Standard
desc: Mandatory standard for documenting host hardware specifications, toolchain configurations, and empirical evidence in performance benchmarks
rules: [R_CORE, R_PERF, R_ENG_OS, R_BENCH]
---
# ⏱️ Empirical Benchmarking & Hardware Provenance Standard

**Goal:** Establish an uncompromising standard for empirical performance measurement, preventing baseless claims, unverified latency figures, and unreproducible benchmarks across all systems and repositories.

---

## 1. The Evidence-First Benchmarking Invariant

> [!IMPORTANT]
> **Performance metrics without explicit hardware provenance are considered unverifiable hearsay.**  
> Any latency, throughput, or memory benchmark cited in documentation (`README.md`), commit logs, architectural decisions, or technical reports **MUST** be accompanied by the exact **Hardware & Environment Provenance Matrix (HEPM)**.

Unsubstantiated claims (e.g. *"Our ringbuffer processes 160M ops/sec"* or *"Span has zero overhead"*) are **strictly rejected** in architectural reviews unless the execution context is fully disclosed.

---

## 2. Mandatory Hardware & Environment Provenance Matrix (HEPM)

Every benchmark report must document the following 6 dimensions:

| Dimension | Mandatory Fields | Example Specification |
| :--- | :--- | :--- |
| **1. Host Processor** | Model name, Microarchitecture, Base/Turbo Clock, Physical Cores, Logical Threads, Cache (L1/L2/L3) | `Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz (6C/12T, Comet Lake, 12MB Cache)` |
| **2. Memory Subsystem** | Total Capacity, Technology, Channels, Configured Frequency | `32 GB DDR4-2666 MHz (Dual Channel)` |
| **3. Operating System** | OS Name, Kernel / Build Number, Target Architecture | `Microsoft Windows 10 Pro x64 (Build 19045) / Linux 6.8.0-x86_64` |
| **4. Toolchain & Flags** | Compiler / JIT version, Target ABI, Optimization Level, LTO, SIMD flags | `MSVC 19.44.35225 (/O2 /W4 /arch:AVX2) / Rustc 1.85 (opt-level="3", lto=true)` |
| **5. High-Res Timer** | Timer mechanism, Resolution, Base Frequency, Monotonicity guarantee | `Windows QPC (QueryPerformanceCounter, 10,000,000 Hz / 100 ns resolution)` |
| **6. Run Conditions** | Warm-up iterations, Thermal state, Power plan, Thread affinity | `High Performance Power Plan, 10,000 warm-up iterations, 10x averaged runs` |

---

## 3. Benchmark Runner Self-Audit Protocol (In-Code Requirement)

All benchmark executables (`bench_suite`, `BenchmarkDotNet`, `criterion-rs`) must **programmatically discover and log** the testbed environment to `stdout` before running any test payload.

### Standard Output Header Format:
```text
================================================================================
 BENCHMARK EXECUTION ENVIRONMENT (HARDWARE PROVENANCE)
================================================================================
 Host Processor    : Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz
 CPU Topology      : 6 Physical Cores, 12 Logical Processors
 Total Physical RAM: 32 GB DDR4
 Operating System  : Windows 10 Pro x64 (Build 19045)
 Compiler / Toolset: MSVC 19.44.35225 (Target: x86_64, Mode: Release /O2)
 Performance Timer : Windows QPC (Frequency: 10,000,000 Hz, Resolution: 100 ns)
 Execution Date    : 2026-09-11 09:45:00 UTC+7
 Target Workload   : Single-Threaded Real-Time Primitives
================================================================================
```

### Self-Audit Implementation Guidelines

#### C / C++ (Windows Native via CPUID & Win32)
```c
#include <windows.h>
#include <intrin.h>
#include <stdio.h>

void print_benchmark_provenance(void) {
    int cpu_info[4] = {0};
    char cpu_brand[49] = {0};
    
    /* Query CPU brand string via CPUID (leaves 0x80000002-0x80000004) */
    __cpuid(cpu_info, 0x80000000);
    if ((unsigned int)cpu_info[0] >= 0x80000004) {
        __cpuid((int*)(cpu_brand + 0),  0x80000002);
        __cpuid((int*)(cpu_brand + 16), 0x80000003);
        __cpuid((int*)(cpu_brand + 32), 0x80000004);
    }
    
    SYSTEM_INFO sys_info;
    GetSystemInfo(&sys_info);
    
    MEMORYSTATUSEX mem_status = { sizeof(MEMORYSTATUSEX) };
    GlobalMemoryStatusEx(&mem_status);
    
    LARGE_INTEGER freq;
    QueryPerformanceFrequency(&freq);
    
    printf("================================================================================\n");
    printf(" BENCHMARK EXECUTION ENVIRONMENT (HARDWARE PROVENANCE)\n");
    printf("================================================================================\n");
    printf(" Host Processor    : %s\n", cpu_brand[0] ? cpu_brand : "Unknown x86/x64 Processor");
    printf(" Logical Processors: %u\n", sys_info.dwNumberOfProcessors);
    printf(" Total Physical RAM: %llu GB\n", (mem_status.ullTotalPhys + (1ULL << 29)) / (1ULL << 30));
#if defined(_MSC_VER)
    printf(" Compiler / Mode   : MSVC %d (Arch: x64, Optimization: /O2)\n", _MSC_VER);
#elif defined(__GNUC__)
    printf(" Compiler / Mode   : GCC %s (Arch: %s, Optimization: -O3)\n", __VERSION__, __VERSION__);
#endif
    printf(" Performance Timer : QPC Frequency = %llu Hz\n", freq.QuadPart);
    printf(" Build Date / Time : %s %s\n", __DATE__, __TIME__);
    printf("================================================================================\n\n");
}
```

#### .NET (C# BenchmarkDotNet)
- Always utilize `BenchmarkDotNet` attributes or standard environment dump:
```csharp
[SimpleJob(RuntimeMoniker.Net10_0)]
[MemoryDiagnoser]
[HardwareCounters(HardwareCounter.CacheMisses, HardwareCounter.BranchMispredictions)]
public class MemoryBenchmarks { ... }
```
`BenchmarkDotNet` automatically outputs OS, CPU, hardware counters, and JIT compiler configuration.

#### Rust (Criterion-rs / libtest)
- Include host environment metadata in `benches/` or custom runner via `env!("RUSTC_VERSION")` and `sysinfo` crate.

---

## 4. Documentation Compliance (README / Artifacts)

Whenever benchmark numbers are presented in tables or charts:
1. **Immediately Preceding Provenance Table**: Place the testbed specification table right above or below the performance numbers.
2. **Relative Speedup Context**: Never present raw milliseconds alone; show baseline comparison (e.g. `CRT malloc` vs `fw_pool`), speedup factor, and per-operation latency (`ns/op`).
3. **Statistical Invariants**:
   - Minimum **100,000 to 10,000,000** iterations for sub-microsecond operations to eliminate measurement quantization error.
   - Mandatory **warm-up phase** to fill CPU instruction/data caches and branch target buffers.
   - Define acceptable variance thresholds (e.g., zero-cost abstraction overhead $\le 1.05x$).

---

## 5. Agent Compliance Checklist (`R_BENCH`)

Before declaring a benchmark task complete or committing benchmark figures:
- [ ] Has the benchmark runner executed and logged the hardware environment?
- [ ] Does the documentation include the 6-dimension hardware testbed table?
- [ ] Were the numbers generated on a production/optimized build (`/O2`, `-O3`, `--release`) rather than debug?
- [ ] Is the timer resolution confirmed to be sub-microsecond ($\ge 1\text{ MHz}$)?
- [ ] Are the units clearly specified (`ns/op`, `MB/s`, `M ops/sec`, relative ratio)?
