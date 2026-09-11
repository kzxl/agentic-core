---
name: BareMetalRtosHooking
desc: Non-disruptive bare-metal RTOS hooking, EDMAC DMA zero-copy streaming, dynamic module relocation, and macro-gated firmware architecture derived from Magic Lantern
rules: [R_CORE, R_PERF, R_EMBEDDED]
category: Embedded
---
# ⚡ Bare-Metal RTOS Hooking & Modular Firmware Architecture

**Goal:** Provide standardized architectural patterns for extending proprietary or bare-metal Real-Time Operating Systems (RTOS) without disrupting vendor firmware, utilizing non-intrusive trampoline hooking, hardware DMA zero-copy streaming, in-memory dynamic module relocation, and dynamic menu layout reflection.

---

## 1. Architectural Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VENDOR EMBEDDED SYSTEM                          │
│                                                                        │
│   ┌─────────────────┐     Hardware Events      ┌───────────────────┐   │
│   │ Proprietary OS  │ ───────────────────────► │ Hardware Units    │   │
│   │ (DryOS/VxWorks/ │ ◄─────────────────────── │ (Sensors, Timers, │   │
│   │  FreeRTOS)      │       VSYNC / DMA IRQ    │  DMA Controller)  │   │
│   └────────┬────────┘                          └─────────▲─────────┘   │
│            │                                             │             │
│            ▼ Trampoline Hooks                            │ Direct DMA  │
│   ┌──────────────────────────────────────────────────────┴─────────┐   │
│   │                    EXTENSION FIRMWARE CORE                     │   │
│   │                                                                │   │
│   │  • Cooperative Task Co-existence (msleep / yield in hook loops)│   │
│   │  • EDMAC / DMA Zero-Copy Pipeline (Sensor -> RAM Ring Buffer)  │   │
│   │  • Memory Cache Flushing (clean_d_cache, cache_lock)           │   │
│   │  • Symbol Export Table (res_symbols.sym)                       │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                   │
│                                    ▼ Dynamic Linking                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                  RELOCATABLE MODULES (.MO / TCC)               │   │
│   │  • Dual-Gain / Sensor DSP Tuning    • Automated Bracketing     │   │
│   │  • Silent Frame Readout (EDMAC)     • Scripting Runtimes (Lua) │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Engineering Patterns

### Pattern 1: Cooperative Trampoline Hooking & Cache Synchronization
When hooking into vendor RTOS tasks, never replace task code with busy-wait loops. Use function stubs with instruction cache invalidation:

1. **Trampoline Hook Pattern**:
   - Save target instruction word at hook address.
   - Patch hook address with an unconditional branch (`b my_trampoline`).
   - Flush the Data Cache (`clean_d_cache`) and invalidate Instruction Cache (`flush_i_cache`) across the modified address range.
   - In `my_trampoline`, execute custom interceptor logic, then execute the original saved instruction and branch back.

2. **Cooperative Yield Invariant**:
   - Extension background tasks hooked into high-priority vendor threads must yield control cooperatively (e.g. `msleep(10)` or semaphore wait). Starving the vendor RTOS causes watchdog resets (`ERR70` / `ERR99`).

```c
// Example: Safe in-memory code patching with cache coherence
void patch_instruction(uint32_t *target_addr, uint32_t new_inst)
{
    *target_addr = new_inst;
    clean_d_cache(target_addr, sizeof(uint32_t));
    flush_i_cache(target_addr, sizeof(uint32_t));
}
```

---

### Pattern 2: Hardware DMA (EDMAC) Zero-Copy Pipeline
High-bandwidth streaming (e.g. raw 14-bit image frames or telemetry data) must bypass the CPU:

1. **Direct Memory Access Configuration**:
   - Program the hardware DMA controller (e.g. EDMAC channels) with source physical address, stride/pitch, and target RAM buffer address.
   - Trigger DMA transfer on hardware synchronization events (e.g. `VSYNC` or `FRAME_DONE`).
2. **Ping-Pong Buffer Management**:
   - Utilize double-buffering or triple-buffering where the DMA hardware writes to `Buffer[N]` while the extension processing logic reads from `Buffer[N-1]`.
   - Swap pointers atomically inside the interrupt service routine (`ISR`) or vsync callback (`CBR_VSYNC`).

---

### Pattern 3: Sensor Dual-Gain Interleaving (Dual ISO Pattern)
Achieving ultra-high dynamic range without physical motion artifacts:

1. **Alternating Amplifier Programming**:
   - Program sensor analog gain registers (e.g. base ISO 100 vs high ISO 1600) on alternating horizontal scanlines during the vertical blanking interval.
2. **Post-Readout Splitting**:
   - Ingest the resulting raw frame as two interleaved exposures: even rows preserve highlights without clipping; odd rows amplify shadow details with low read noise.

---

### Pattern 4: Relocatable Runtime Modules (`.mo` via In-Memory Linking)
In resource-constrained embedded systems without an MMU/virtual-memory loader:

1. **Symbol Table Export**:
   - The resident core binary exports an internal symbol table (`firmware.sym`) mapping public API function pointers to memory addresses.
2. **In-Memory Relocation**:
   - Dynamically loaded modules (`.mo`) compiled with position-independent or relocatable ELF objects are relocated into spare SDRAM heaps (`alloc_dma_memory`).
   - The resident loader resolves imported symbol names against `firmware.sym` and rewrites module relocation offsets before calling `module_init()`.

---

### Pattern 5: Dead-Tab Auto-Omission in Dynamic UI Menus
When building extensible on-device configuration menus:

1. **Active Item Querying**:
   - The top-level menu rendering loop evaluates `menu_has_visible_items(tab)`.
   - If all features under a specific tab are disabled or compiled out via `#undef`, the tab is **automatically omitted** from the rendered tab bar.
2. **Dynamic Space Redistribution**:
   - Recompute horizontal icon spacing dynamically:
     $$\text{icon\_spacing} = \frac{\text{screen\_width} - \text{margin}}{\text{active\_tabs\_count}}$$
   - Guarantees zero UI clutter without hardcoding different layout code for different product variants.

---

### Pattern 6: Macro Feature-Flag Decoupling & C99 Zero-Length Guarding
When stripping features across product targets:

1. **Central vs Platform Override**:
   - `all_features.h` defines universal defaults.
   - `platform/features.h` overrides with explicit `#undef FEATURE_X`.
2. **Array Guarding Invariant**:
   - In ISO C99, initializing a static array with zero elements (`struct entry items[] = {};`) yields compiler warnings or errors when all inner `#ifdef` blocks are stripped.
   - Always guard the array declaration and registration call with a composite macro:

```c
#if defined(FEATURE_A) || defined(FEATURE_B)
#define HAS_FEATURE_MENU
#endif

#ifdef HAS_FEATURE_MENU
static struct menu_entry feature_menus[] = {
    #ifdef FEATURE_A
    { .name = "Feature A", ... },
    #endif
    #ifdef FEATURE_B
    { .name = "Feature B", ... },
    #endif
};
#endif

void feature_menu_init(void)
{
    #ifdef HAS_FEATURE_MENU
    menu_add("Feature", feature_menus, COUNT(feature_menus));
    #endif
}
```

---

## 3. Checklist for Embedded AI Agents

- [ ] **Memory Invariants**: Never overwrite hardware bootloader addresses, vector tables, or MMU mappings without verified memory dumps.
- [ ] **Zero Dynamic Allocation in Hot Loops**: Strictly prohibit `malloc` / `fio_malloc` inside frame rendering loops ($\ge 30\text{ fps}$) or ISR callbacks. Use static buffers (`display_filter_buffers`).
- [ ] **Cache Coherence**: Always flush data cache (`clean_d_cache`) and invalidate instruction cache after self-modifying code or trampolines.
- [ ] **Mandatory Nullity Audits**: Validate all pointers from memory allocators, OS stubs, and hardware structures for `NULL` before dereferencing.
- [ ] **Cooperative Scheduling**: Ensure all extension loops yield CPU time back to the vendor RTOS via explicit sleep/semaphore calls.
- [ ] **Feature Gating**: Guard static menu/data arrays with `#ifdef HAS_*` macros to avoid ISO C99 zero-length array compilation failures when features are stripped.
- [ ] **Compiler Hygiene**: Build with `-Wall -Werror` zero-warning discipline to catch pointer truncation, missing prototypes, and stack corruption early.
- [ ] **RAM Sovereignty**: Free high-bandwidth DMA buffers when subsystems (e.g. video) are unused to maximize RAM for target workloads (e.g. burst capture, RAW caching).
