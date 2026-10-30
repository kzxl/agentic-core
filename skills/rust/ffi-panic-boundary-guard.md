---
name: RustFfiPanicBoundaryGuard
desc: catch_unwind FFI barriers, #[repr(C)] layout verification, opaque pointer handles, and safety contracts.
rules: [R_RUST, R_CPP, R_SEC]
category: Rust
---
# 🛡️ Rust FFI Panic Boundary Guard & Memory Ownership Contracts

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Unwinding Across `extern "C"`** | `0` panics escaping FFI (Undefined Behavior) | `std::panic::catch_unwind` in every `extern "C"` fn |
| **Pointer Null & Alignment** | `100%` verified via `.is_null()` & `.is_aligned()` | Guard before `slice::from_raw_parts` or dereference |
| **Cross-Allocator Free** | `0` foreign `free()` calls on Rust heap memory | Paired `cipher_engine_destroy` exported destructor |
| **ABI Struct Layout** | `#[repr(C)]` on shared types; opaque handles | `cbindgen` + compile-time size assertions |
| **`unsafe` Documentation** | `100%` of `unsafe` blocks carry `// SAFETY:` | `#![deny(clippy::undocumented_unsafe_blocks)]` |

---

## 2. `catch_unwind` FFI Barrier & Opaque Handle Lifecycle (`Box::into_raw`)

Unwinding a Rust `panic!` across `extern "C"` into C/C++/C#/Python causes immediate **Undefined Behavior (`UB`)**. Every `#[no_mangle] pub unsafe extern "C"` function MUST: (1) validate raw pointers (`!ptr.is_null()`), (2) wrap execution inside `panic::catch_unwind`, and (3) expose Rust state as **Opaque Handles** (`Box::into_raw` / `Box::from_raw`).

```rust
use std::panic::{self, AssertUnwindSafe};
use std::slice;

#[repr(C)]
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum FfiStatus {
    Ok = 0,
    NullPointerError = 1,
    InternalPanicError = 255,
}

pub struct CipherEngine {
    key_schedule: [u64; 4],
}

// ❌ BAD: No null check, no catch_unwind (UB on panic!), and slice::from_raw_parts(NULL, 0) is UB!
#[no_mangle]
pub unsafe extern "C" fn cipher_process_bad(
    engine: *mut CipherEngine,
    data: *const u8,
    len: usize,
) -> u64 {
    let eng = &mut *engine; // UB if NULL!
    let buf = slice::from_raw_parts(data, len); // UB if data is NULL even when len == 0!
    eng.key_schedule[0] ^ u64::from(buf[0]) // Panics on len == 0 -> unwinds across FFI (UB)!
}

// ✅ GOOD: Opaque handle lifecycle, strict pointer guards, and catch_unwind FFI barrier
#[no_mangle]
pub unsafe extern "C" fn cipher_engine_create(seed: u64, out: *mut *mut CipherEngine) -> FfiStatus {
    if out.is_null() {
        return FfiStatus::NullPointerError;
    }
    panic::catch_unwind(AssertUnwindSafe(|| {
        let engine = Box::new(CipherEngine { key_schedule: [seed; 4] });
        // SAFETY: out verified non-null; caller owns returned opaque handle.
        unsafe { *out = Box::into_raw(engine) };
        FfiStatus::Ok
    }))
    .unwrap_or(FfiStatus::InternalPanicError)
}

#[no_mangle]
pub unsafe extern "C" fn cipher_engine_process(
    handle: *mut CipherEngine,
    input_ptr: *const u8,
    input_len: usize,
    out_checksum: *mut u64,
) -> FfiStatus {
    if handle.is_null() || out_checksum.is_null() || (input_ptr.is_null() && input_len > 0) {
        return FfiStatus::NullPointerError;
    }
    panic::catch_unwind(AssertUnwindSafe(|| {
        // SAFETY: handle and out_checksum are non-null and valid per FFI contract.
        let engine = unsafe { &mut *handle };
        let bytes: &[u8] = if input_len == 0 {
            &[]
        } else {
            // SAFETY: input_ptr is non-null and valid for input_len bytes.
            unsafe { slice::from_raw_parts(input_ptr, input_len) }
        };
        let acc = bytes.iter().fold(engine.key_schedule[0], |h, &b| h.rotate_left(5) ^ u64::from(b));
        unsafe { *out_checksum = acc };
        FfiStatus::Ok
    }))
    .unwrap_or(FfiStatus::InternalPanicError)
}

#[no_mangle]
pub unsafe extern "C" fn cipher_engine_destroy(handle: *mut CipherEngine) -> FfiStatus {
    if handle.is_null() {
        return FfiStatus::Ok;
    }
    panic::catch_unwind(AssertUnwindSafe(|| {
        // SAFETY: Reclaims Box allocated by cipher_engine_create; must not be called twice.
        unsafe { drop(Box::from_raw(handle)) };
        FfiStatus::Ok
    }))
    .unwrap_or(FfiStatus::InternalPanicError)
}
```

---

## 3. Zero-Slice Trap (`slice::from_raw_parts`) & Aliasing Rules

Calling `slice::from_raw_parts(ptr::null(), 0)` is **Undefined Behavior** because Rust slices require a non-null, aligned pointer even when `len == 0`. Always guard with `if len == 0 { &[] }`.
