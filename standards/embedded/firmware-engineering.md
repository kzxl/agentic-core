# Embedded Firmware Engineering Standards & Coding Directives

## 1. Scope & Objective

This standard defines the mandatory engineering conventions, safety invariants, and memory guidelines for real-time bare-metal and RTOS firmware projects across ARM Cortex-M/R/A, legacy ARMv5TE, RISC-V, and modern microcontrollers.

---

## 2. Core Directives

### 2.1. Memory Allocation & Heap Discipline
1. **Zero Dynamic Allocation in Critical Contexts**:
   - `malloc()`, `free()`, `realloc()`, or RTOS dynamic allocations are strictly prohibited inside:
     - Interrupt Service Routines (ISRs) and CallBack Routines (CBRs).
     - High-frequency loops ($\ge 30\text{ fps}$ or $\le 33\text{ ms}$ period).
2. **Pools & Arenas First**:
   - Use fixed-size block pools (`fw_pool_t`) with $O(1)$ allocation/free for uniform objects.
   - Use resetable linear arenas (`fw_arena_t`) for request-scoped or frame-scoped temporary allocations.
3. **Multi-Tier Routing**:
   - Route memory through the Memory Hub based on hardware context:
     - `FW_MEM_TIER_FAST`: Critical math, crypto, and fast loop buffers.
     - `FW_MEM_TIER_DMA`: Cache-coherent / uncached regions for peripheral DMA.
     - `FW_MEM_TIER_BULK`: Large images and external PSRAM/SDRAM.
   - Always specify `reserve_bytes` to protect host OS/RTOS from out-of-memory crashes.

### 2.2. Execution Context Safety Annotations
Every function with context constraints must carry static analyzer attributes:
* `FW_ISR`: Marks an interrupt routine. Any blocking call (`delay`, `sleep`, `take_semaphore`, `printf`, `malloc`) inside an `FW_ISR` function is a fatal violation.
* `FW_DMA`: Marks buffer pointers accessed asynchronously by hardware DMA. Must guarantee persistent lifetime and proper cache maintenance.
* `FW_NORMAL`: Standard task or superloop context where cooperative yields and timeouts are allowed.

### 2.3. Cache Coherency & DMA Contracts
When transferring data via DMA on microprocessors with Data Cache (e.g., ARM946E-S, Cortex-M7, Cortex-R, Cortex-A):
1. **TX Contract (CPU to Peripheral)**:
   - Must call `fw_cache_clean(buffer, size)` immediately before triggering hardware DMA.
2. **RX Contract (Peripheral to CPU)**:
   - Must call `fw_cache_invalidate(buffer, size)` immediately after DMA completion and before CPU accesses memory.
3. **Alignment**:
   - DMA buffers must be aligned to the hardware cache line (`FW_CACHE_ALIGNED(32)` or `64`). Size must be a multiple of cache line size to prevent false sharing.

### 2.4. Memory Barriers & Architecture Compatibility
Never assume universal ARMv7 `dmb` instructions. Use architecture-aware barrier macros:
* ARM pre-v7 (ARMv4T / ARMv5TE): Use CP15 Drain Write Buffer (`mcr p15, 0, r0, c7, c10, 4`).
* ARMv7+ / Cortex-M: Use `dmb 0xF`.
* RISC-V: Use `fence rw, rw`.
* Compiler optimization boundary: Always pair hardware barriers with `FW_COMPILER_BARRIER()`.

### 2.5. Stack Safety & Task Profiling
1. Every RTOS task stack must be painted with `FW_STACK_PAINT_CANARY` (`0x5A5A5A5A`) before task initialization.
2. The empirical high-water mark (`fw_task_stack_peak()`) must be audited in release builds.
3. A safety margin of at least $25\%$ of total stack size must remain uncorrupted during stress tests.

### 2.6. Boot Loop Guard & Safe Mode
1. Maintain a persistent crash counter across reboots (via RTC backup registers or NVS).
2. Clear the counter only after the system reaches operational steady-state (`fw_boot_guard_mark_success()`).
3. If 3 consecutive crashes occur, the system must enter minimal Safe Mode (disabling secondary sensors/tasks and exposing diagnostic console/OTA).

---

## 3. Compliance Matrix

| Check | Tool / Verification | Consequence of Failure |
| :--- | :--- | :--- |
| **ISR Safety** | `zero_analyzer.py` Clang AST scanner | Build failure (`-Werror`) / CI rejection |
| **Compilation Warnings** | `-Wall -Wextra -Werror` / `/W4 /WX` | Strict build failure |
| **Cache Line Misalignment** | Static assertions (`FW_STATIC_ASSERT`) | Memory corruption during DMA |
| **Stack Overflow** | `fw_task_stack_peak()` audit | System lockup / hard fault |
| **Crash Loop** | `fw_boot_guard_is_safe_mode()` | Permanent device bricking |
