---
name: RustTypestateErrorTaxonomy
desc: Compile-time typestate machines, zero-panic Result<T, E> hierarchies with thiserror, and infallible transitions
rules: [R_RUST, R_CORE, R_SEC]
category: Rust
---
# 🛡️ Rust Compile-Time Typestate Machines & Error Taxonomy

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Production `.unwrap()` / `.expect()`** | `0` instances in non-test crates (`src/`) | `#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]` |
| **Unchecked Indexing (`slice[i]`)** | `0` instances on dynamic indices; use `.get(i)` | `#![deny(clippy::indexing_slicing)]` |
| **Illegal State Representation** | `0` runtime `bool` flags (`is_authenticated`) for protocol phases | Zero-sized `PhantomData<State>` typestate transitions |
| **Library Error Contract** | Strongly typed `enum` via `thiserror::Error` + `#[non_exhaustive]` | Callers match exhaustively on structured error variants |
| **Silent Result Discarding** | `#[must_use]` on all pure state transitions and domain builders | `#![deny(unused_must_use)]` |

---

## 2. Zero-Cost Compile-Time Typestate Pattern (`PhantomData<S>`)

Encoding state machines with runtime booleans (`is_connected`) requires defensive checks on every call and allows invalid transitions to compile. Parameterizing structs over zero-sized state markers (`PhantomData<State>`) and consuming `self` by value turns illegal state transitions into **compile-time errors** with `0 bytes` of runtime overhead.

```rust
use std::marker::PhantomData;

// ❌ BAD: Runtime state flags require defensive branches and allow double-commit bugs
pub struct DatabaseTxBad {
    pub is_begun: bool,
    pub is_committed: bool,
}

impl DatabaseTxBad {
    pub fn execute(&self, sql: &str) {
        if !self.is_begun || self.is_committed {
            panic!("Invalid transaction state!"); // Runtime crash in production!
        }
    }
}

// ✅ GOOD: Zero-sized Typestate markers enforce valid lifecycle transitions at compile time
pub struct Idle;
pub struct Active;
pub struct Committed;

#[must_use = "Transaction must be explicitly committed or rolled back"]
pub struct Transaction<State> {
    conn_id: u64,
    _state: PhantomData<State>,
}

impl Transaction<Idle> {
    pub fn new(conn_id: u64) -> Self {
        Self { conn_id, _state: PhantomData }
    }

    pub fn begin(self) -> Result<Transaction<Active>, TxError> {
        Ok(Transaction { conn_id: self.conn_id, _state: PhantomData })
    }
}

impl Transaction<Active> {
    pub fn execute(&mut self, query: &str) -> Result<u64, TxError> {
        if query.is_empty() {
            return Err(TxError::EmptyStatement { conn_id: self.conn_id });
        }
        Ok(1)
    }

    pub fn commit(self) -> Result<Transaction<Committed>, TxError> {
        Ok(Transaction { conn_id: self.conn_id, _state: PhantomData })
    }

    pub fn rollback(self) -> Transaction<Idle> {
        Transaction { conn_id: self.conn_id, _state: PhantomData }
    }
}
```

---

## 3. Zero-Panic Error Hierarchies with `thiserror`

Never expose `anyhow::Error` or `Box<dyn Error>` in library or domain-service signatures where callers must distinguish retryable transient faults from validation errors. Define `#[non_exhaustive]` error enums via `thiserror::Error` with explicit `#[source]` chaining.

```rust
use thiserror::Error;

#[derive(Debug, Error)]
#[non_exhaustive]
pub enum TxError {
    #[error("empty SQL statement on connection {conn_id}")]
    EmptyStatement { conn_id: u64 },

    #[error("serialization deadlock after {attempts} attempts")]
    DeadlockExhausted {
        attempts: u8,
        #[source]
        cause: std::io::Error,
    },

    #[error("optimistic concurrency conflict on entity '{entity_id}' (expected v{expected})")]
    VersionConflict { entity_id: String, expected: u64 },
}

impl TxError {
    #[must_use]
    pub const fn is_retryable(&self) -> bool {
        matches!(self, Self::DeadlockExhausted { .. })
    }
}
```

---

## 4. Infallible Conversions & Total Functions

Enforce "Parse, Don't Validate" at domain boundaries: construct validated newtypes (`NonEmptyString`, `PositiveQty`) via `TryFrom` so downstream functions operate on total, infallible types without `.unwrap()`.
