---
name: AgenticBrainstormingAndSpec
desc: Disciplined requirements exploration, ambiguity resolution, and acceptance criteria specification before coding (inspired by obra/superpowers)
rules: [R_CORE]
category: Agentic
---
# 🧠 Agentic Brainstorming & Specification Protocol

**Goal:** Eliminate premature "vibe coding" by enforcing Socratic ambiguity resolution, explicit architectural trade-off evaluation (`Option A` vs `Option B`), strict non-goals scoping, and executable Given-When-Then acceptance criteria before modifying any source file.

---

## 1. Quantitative Pre-Coding Specification Invariants
| Specification Gate | Mandatory Requirement | Failure Consequence |
| :--- | :--- | :--- |
| **Codebase Recon First** | Trace entrypoint $\to$ service $\to$ persistence before proposing design | Prevents duplicate utilities and broken contracts |
| **Ambiguity Resolution** | $\le 3$ high-impact Socratic questions if requirements conflict | Blocks speculative assumptions on schema/auth rules |
| **Trade-Off Matrix** | Compare $\ge 2$ viable architectures (`Option A` vs `Option B`) | Prevents over-engineering and hidden latency traps |
| **Explicit Non-Goals** | Define $\ge 2$ out-of-scope boundaries | Prevents scope creep and multi-module diff sprawl |
| **Executable Acceptance Criteria** | $100\%$ mapped to testable Given-When-Then assertions | Guarantees deterministic verification (`R_PROOF`) |

---

## 2. The 4-Step Pre-Coding Specification Workflow

```text
[1. ARCHAEOLOGY]      ──► Grep existing routes, schemas, DTOs, and SemanticBrain lessons
                              │
[2. SOCRATIC INQUIRY] ──► Identify underspecified invariants (concurrency, idempotency, failure recovery)
                              │
[3. TRADE-OFF MATRIX] ──► Evaluate Option A (Simple/Local) vs Option B (Distributed/Extensible)
                              │
[4. EXECUTABLE SPEC]  ──► Lock Scope, Non-Goals, Data Contracts, and Given-When-Then Acceptance Criteria
```

### Step 1: Codebase Archaeology & Constraint Discovery
Before drafting any design, inspect the existing repository to answer:
1. Which domain module owns the target table or state? (`R_UNIVERSE`)
2. Are there existing base classes (`BaseForm`, `DbScope`, `HandlerDispatcher`) that govern this workflow?
3. What are the concurrency and latency constraints (`p95`, batch size)?

### Step 2: Architectural Trade-Off Decision Matrix
Every non-trivial design specification MUST evaluate at least two concrete options:

| Evaluation Criterion | Option A: In-Database Upsert with `UPDLOCK` (Recommended) | Option B: Distributed Redis Lock + Application Loop |
| :--- | :--- | :--- |
| **Latency (`p95`)** | $\le 8\text{ ms}$ ($1$ DB roundtrip) | $\approx 45\text{ ms}$ ($N$ network hops) |
| **Failure Modes** | Atomic ACID rollback on crash | Lock lease expiry / split-brain hazard |
| **New Dependencies** | $0$ (Uses existing SQL Server / Dapper) | Requires Redis cluster & Redlock client |
| **Engineering Cost** | $35$ LOC | $220$ LOC + operational infra overhead |

### Step 3: Explicit Scope & Non-Goals Declaration
Clearly bound what the implementation will **NOT** touch so coding stays surgical:
- **In Scope:** Idempotent batch stock reservation endpoint (`POST /api/v1/inventory/reserve`) and unit tests.
- **Explicit Non-Goals:** Do *not* modify legacy warehouse billing reports; do *not* introduce background message brokers.

---

## 3. Specification Comparison: Vague Plan vs Executable Engineering Spec

```markdown
<!-- ❌ BAD: Vague, untestable "vibe coding" plan -->
## Plan
- Update the inventory service to handle reservations better.
- Add error handling and make sure it is fast.
- Update the frontend to call the new API.

<!-- ✅ GOOD: Concrete, verifiable Engineering Specification -->
## Executable Specification: Batch Stock Reservation (`Features/Inventory/`)
1. **Contract (`ReserveStockRequest`):** `WarehouseId (int)`, `IdempotencyKey (Guid)`, `Lines (IReadOnlyList<ReserveLineDTO>)` (max 500 items).
2. **Invariants:**
   - Lock rows in ascending `MaterialId` order using `WITH (UPDLOCK, ROWLOCK)` to guarantee 0 deadlocks.
   - If any line has `AvailableQty < RequestedQty`, rollback entire transaction and return HTTP `409 Conflict` with offending `MaterialId`.
3. **Acceptance Criteria (Given-When-Then):**
   - **AC-1 (Atomic Reservation):** *Given* `MaterialId=10` has `AvailableQty=50`, *When* two concurrent requests each reserve `30`, *Then* exactly one succeeds (`200 OK`, remaining `20`) and one fails (`409 Conflict`).
   - **AC-2 (Idempotency):** *Given* a completed `IdempotencyKey`, *When* the identical payload is re-sent within 24h, *Then* return the cached `ReservationId` with `0` duplicate stock deductions.
```

