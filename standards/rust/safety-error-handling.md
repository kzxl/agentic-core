---
desc: Rust Zero-Panic Invariants, Unsafe Hygiene, Typed Error Modeling & Safe C-FFI Contracts
rules: [R_RUST, R_CORE, R_CPP]
---
# 🛡️ Rust Safety, Error Handling & FFI Standards

## 1. Zero-Panic Invariant

1. **Strict Prohibition on Runtime Panics**:
   - `unwrap()`, `expect()`, `panic!()`, `unreachable!()`, and indexing without bounds checks (`slice[i]`) are STRICTLY FORBIDDEN on active runtime and packet processing paths.
   - `expect("Descriptive message")` is permitted ONLY in:
     - Initialization code before operational loop begins (e.g. initial memory pool allocation).
     - Automated test suites (`#[cfg(test)]`).
2. **Explicit Error Modeling**:
   - All fallible operations must return `Result<T, E>`.
   - Domain errors must be strongly typed `enum` variants deriving `Debug, Clone, PartialEq, Eq` and implementing `std::fmt::Display` and `std::error::Error`:
     ```rust
     #[derive(Debug, Clone, PartialEq, Eq)]
     pub enum ProtocolError {
         BufferTooSmall { required: usize, actual: usize },
         InvalidMagic(u16),
         ChecksumMismatch,
     }
     ```

---

## 2. Unsafe Code Hygiene

1. **Mandatory `/// # Safety` Documentation**:
   - Every `unsafe fn` MUST contain an explicit `/// # Safety` documentation section specifying:
     - Pointer validity and nullness contracts.
     - Memory alignment and lifetime guarantees.
     - Buffer capacity boundaries.
     ```rust
     /// Applies the XOR delta to a reference tile to reconstruct the current tile.
     ///
     /// # Safety
     /// `ref_ptr` and `out_ptr` must point to valid image memory of at least `stride * 32` bytes.
     /// `delta_ptr` must point to at least 4096 bytes of valid delta data.
     pub unsafe fn apply_tile_xor(ref_ptr: *const u8, delta_ptr: *const u8, out_ptr: *mut u8, stride: usize) { ... }
     ```
2. **Safe Encapsulation**:
   - Unsafe operations must be strictly encapsulated inside safe public APIs via RAII wrappers (`FrameGuard`, `Drop`).

---

## 3. Safe C-FFI & Interop Contracts

1. **C-ABI Export Boundary**:
   - Exported functions must be marked `#[no_mangle] pub unsafe extern "C"`.
2. **Null & Boundary Validation on Entry**:
   - Every FFI function must validate input pointers and return error codes on failure:
     ```rust
     #[no_mangle]
     pub unsafe extern "C" fn zconn_client_ingest(client: *mut ZConnClient, data: *const u8, len: usize) -> i32 {
         if client.is_null() || data.is_null() || len == 0 {
             return -1;
         }
         let slice = std::slice::from_raw_parts(data, len);
         (*client).handle_incoming_packet(slice);
         0
     }
     ```
3. **Opaque Handle Lifecycle**:
   - Manage instance lifecycle via `Box::into_raw(Box::new(...))` for creation and `drop(Box::from_raw(ptr))` for destruction.
4. **Panic Unwinding Prohibition**:
   - A Rust panic must NEVER unwind across the C-ABI boundary. Wrap non-trivial logic in `std::panic::catch_unwind` if necessary.
