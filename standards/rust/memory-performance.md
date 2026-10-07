---
desc: Rust Zero-Allocation, Cacheline Alignment, SIMD Vectorization & Lock-Free Memory Standards
rules: [R_RUST, R_PERF, R_CORE]
---
# ⚡ Rust Memory & High-Performance Compute Standards

## 1. Zero-Allocation Hot-Path Directives

1. **Strict Prohibition on Runtime Heap Allocation**:
   - `Vec::new()`, `Box::new()`, `String::from()`, `format!()`, or standard collections MUST NOT be allocated inside high-frequency execution loops:
     - Real-time graphical/streaming loops ($\ge 30\text{ fps}$ or $\le 33\text{ ms}$ period).
     - Fieldbus & robotics control cycles ($\le 1\text{ ms}$ period).
     - Network packet ingestion/processing loops.
2. **Pre-Allocated Memory Pools (`FrameBufferPool`)**:
   - Allocate contiguous memory blocks at initialization time.
   - Use lock-free acquisition via atomic flags (`AtomicBool` with `Ordering::AcqRel`).
   - Reclaim buffers deterministically via RAII guards implementing `Drop` (`Ordering::Release`).
3. **Pre-Sized Buffers & Scratch Space**:
   - When dynamic collections are required, always pre-allocate exact capacity with `Vec::with_capacity(capacity)` and reuse scratch buffers via `.clear()`.
   - Use stack arrays `[u8; N]` for deterministic small payloads ($\le 4096\text{ bytes}$).

---

## 2. Memory Alignment & Cache Architecture

1. **64-Byte Cacheline Alignment**:
   - High-throughput buffers accessed by SIMD vector instructions (AVX2, AVX-512, NEON) must be 64-byte aligned:
     ```rust
     #[repr(C, align(64))]
     pub struct AlignedBuffer {
         pub data: [u8; 4096],
     }
     ```
   - Dynamically allocated pools must use `Layout::from_size_align(size, 4096)` to align with operating system memory pages.
2. **False Sharing Prevention**:
   - Concurrent atomic variables modified by distinct threads must reside on separate cachelines using `#[repr(align(64))]`.

---

## 3. SIMD Vectorization & Numerical Arithmetic

1. **Fast 64-Bit Word & SIMD Differential Diffing**:
   - Avoid byte-by-byte comparison loops. Compare memory in 64-bit (`u64`) chunks or 256-bit AVX2 registers (`_mm256_xor_si256`, `_mm256_testz_si256`).
2. **Integer Fixed-Point over Floating-Point**:
   - In high-speed color conversion, motion interpolation, or embedded compute, prefer integer fixed-point arithmetic ($Q8, Q16$) over `f32`/`f64` to maximize CPU pipeline throughput:
     ```rust
     // ITU-R BT.601 integer fixed-point YUV conversion:
     let y = ((66 * r + 129 * g + 25 * b + 128) >> 8) + 16;
     ```
3. **Ceiling Division Standard**:
   - Use `.div_ceil()` rather than manual `(n + d - 1) / d` to prevent integer overflow and adhere to standard library idioms.

---

## 4. Zero-Copy Slicing

1. **Borrow over Clone**:
   - Prefer passing borrowed slices `&[u8]` and `&mut [u8]` over owned `Vec<u8>`.
2. **Raw Pointer Transmutation Safety**:
   - When wrapping external buffers into slices (`std::slice::from_raw_parts`), verify non-null pointer, proper alignment, and total capacity bounds before invocation.
