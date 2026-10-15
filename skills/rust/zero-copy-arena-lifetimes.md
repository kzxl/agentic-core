---
name: RustZeroCopyArenaLifetimes
desc: Bump/arena allocation, zero-copy slice parsing, Cow<str>, and cacheline-aligned ring buffers
rules: [R_RUST, R_PERF]
category: Rust
---
# 🦀 Rust Zero-Copy Parsing, Arena Lifetimes & Cache-Aligned Buffers

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Hot-Path Heap Allocations** | `0` per-field `String::from` / `Vec::clone` during frame parsing | Borrowed slices (`&'a [u8]`, `&'a str`, `Cow<'a, str>`) |
| **Phase-Scoped Scratch Memory** | `O(1)` bump allocation (`bumpalo::Bump`) reset per request/batch | Zero individual `free()` syscalls on AST/frame nodes |
| **False Sharing Mitigation** | `#[repr(align(64))]` (`128` on Apple Silicon) for cross-thread atomics | Prevents L1d cache-line invalidation storms |
| **Small Vector Stack Inlining** | `SmallVec<[T; 8]>` for collections where `p95` length `<= 8` | Avoids global allocator lock contention |
| **Arena High-Water Cap** | Reset `bump.reset()` per turn; drop & re-create if capacity `> 4 MB` | Prevents outlier burst from pinning RSS |

---

## 2. Zero-Copy Frame Borrowing (`&'a str` & `Cow<'a, str>`)

Allocating owned `String` and `Vec<u8>` fields per parsed frame invokes the heap allocator dozens of times per packet. Tie the struct's lifetime `'a` directly to the input buffer `&'a [u8]`. Use `Cow<'a, str>` when a field is borrowed `99%` of the time and only allocates an owned `String` when normalization or un-escaping is needed.

```rust
use std::borrow::Cow;
use std::str;

// ❌ BAD: 3 separate heap allocations (String / Vec) per parsed frame!
pub struct TelemetryFrameBad {
    pub tenant_id: String,
    pub metric_key: String,
    pub raw_payload: Vec<u8>,
}

pub fn parse_frame_bad(buf: &[u8]) -> Option<TelemetryFrameBad> {
    if buf.len() < 32 { return None; }
    Some(TelemetryFrameBad {
        tenant_id: String::from_utf8_lossy(&buf[0..16]).into_owned(),
        metric_key: String::from_utf8_lossy(&buf[16..32]).into_owned(),
        raw_payload: buf[32..].to_vec(),
    })
}

// ✅ GOOD: Zero heap allocations in the fast path; borrows directly from &'a [u8]
#[derive(Debug, PartialEq, Eq)]
pub struct TelemetryFrame<'a> {
    pub tenant_id: &'a str,
    pub metric_key: Cow<'a, str>,
    pub raw_payload: &'a [u8],
}

pub fn parse_frame_good<'a>(buf: &'a [u8]) -> Result<TelemetryFrame<'a>, &'static str> {
    if buf.len() < 32 {
        return Err("frame shorter than 32-byte header");
    }
    let tenant_id = str::from_utf8(&buf[0..16]).map_err(|_| "invalid UTF-8 tenant_id")?;
    let raw_key = str::from_utf8(&buf[16..32]).map_err(|_| "invalid UTF-8 metric_key")?;

    let metric_key = if raw_key.bytes().any(|b| b.is_ascii_uppercase()) {
        Cow::Owned(raw_key.to_ascii_lowercase())
    } else {
        Cow::Borrowed(raw_key)
    };

    Ok(TelemetryFrame {
        tenant_id: tenant_id.trim_end_matches('\0'),
        metric_key,
        raw_payload: &buf[32..],
    })
}
```

---

## 3. Phase-Scoped Bump Arena Allocation (`bumpalo::Bump`)

Allocate intermediate AST nodes, query plans, or batch buffers that live for a single request/tick inside a `bumpalo::Bump` arena. Bump allocation increments a pointer (`~2 cycles`) and reclaims the entire graph in `O(1)` via `arena.reset()`.

```rust
use bumpalo::Bump;
use bumpalo::collections::Vec as BumpVec;

pub fn process_batch_in_arena(arena: &mut Bump, inputs: &[u64]) -> u64 {
    arena.reset(); // O(1) reset keeps backing chunk warm in L1/L2 cache
    let mut scratch = BumpVec::with_capacity_in(inputs.len(), arena);
    for &val in inputs {
        if val % 2 == 0 {
            scratch.push(val.wrapping_mul(3));
        }
    }
    scratch.iter().copied().sum()
}
```

---

## 4. Cache-Line Alignment (`#[repr(align(64))]`) Against False Sharing

When producer and consumer threads update adjacent `AtomicUsize` cursors (`head` and `tail`) in a ring buffer, placing both on the same `64-byte` cache line triggers MESI cache-coherency invalidation storms (**False Sharing**). Wrap each atomic cursor in a `#[repr(align(64))]` struct so they occupy independent hardware cache lines.
