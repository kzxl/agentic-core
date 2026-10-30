---
name: AgenticBrainstormingAndSpec
description: Requirements exploration, grilling interview, and executable specification before coding. Use when a request is ambiguous or underspecified, when a design decision is open, when the user wants a plan stress-tested or types /grill-me, or before writing a spec, acceptance criteria, or non-goals for a feature.
desc: Codebase archaeology, grilling rounds over a design tree (frontier, recommended answers), trade-off matrix, and Given-When-Then executable spec before coding (inspired by obra/superpowers and mattpocock/skills)
rules: [R_CORE]
category: Agentic
---
# Agentic Brainstorming, Grilling and Specification Protocol

**Goal:** Reach a shared understanding with the user before any source file changes: facts gathered from the codebase, every open decision settled through grilling rounds, at least two architectures compared, non-goals declared, and acceptance criteria written as executable Given-When-Then assertions.

Incorporates practices adapted from mattpocock/skills (MIT).

**Entry points:** the user types Antigravity's built-in `/grill-me` slash command, or another workflow (for example Step 1 of [`skills/feature-implementation/SKILL.md`](../feature-implementation/SKILL.md)) sends ambiguous work here.

---

## 1. Pre-Coding Specification Gates
| Specification Gate | Mandatory Requirement | Failure Consequence |
| :--- | :--- | :--- |
| **Codebase Recon First** | Trace entrypoint $\to$ service $\to$ persistence before proposing design | Prevents duplicate utilities and broken contracts |
| **Grilling Frontier Empty** | Every decision in the design tree settled by the user, nothing silently assumed | Blocks speculative assumptions on schema/auth rules |
| **Trade-Off Matrix** | Compare $\ge 2$ viable architectures (`Option A` vs `Option B`) | Prevents over-engineering and hidden latency traps |
| **Explicit Non-Goals** | Define $\ge 2$ out-of-scope boundaries | Prevents scope creep and multi-module diff sprawl |
| **Executable Acceptance Criteria** | $100\%$ mapped to testable Given-When-Then assertions | Guarantees deterministic verification (`R_PROOF`) |
| **Zero-Context Spec Audit** | Spawns isolated Goldfish reviewer; passes 4-stage filter (Zoom Out, Comprehension, Critic, Readiness) | Eliminates self-review confirmation bias and tacit unstated assumptions |

---

## 2. The 5-Step Pre-Coding Workflow

```text
[1. ARCHAEOLOGY]      ──► Grep existing routes, schemas, DTOs, and SemanticBrain lessons (facts)
                              │
[2. GRILLING ROUNDS]  ──► Walk the design tree frontier with the user (decisions)
                              │
[3. TRADE-OFF MATRIX] ──► Evaluate Option A (Simple/Local) vs Option B (Distributed/Extensible)
                              │
[4. EXECUTABLE SPEC]  ──► Lock Scope, Non-Goals, Data Contracts, and Given-When-Then Acceptance Criteria
                              │
[5. GOLDFISH REVIEW]  ──► Zero-context subagent audits spec via 4-stage gate (Zoom Out -> Comprehension -> Critic -> Readiness)
```

### Step 1: Codebase Archaeology & Constraint Discovery
Before drafting any design, inspect the repository to answer:
1. Which domain module owns the target table or state? (`R_UNIVERSE`)
2. Are there existing base classes (`BaseForm`, `DbScope`, `HandlerDispatcher`) that govern this workflow?
3. What are the concurrency and latency constraints (`p95`, batch size)?

**Done when** each question has an answer citing a file path (or "not found").

### Step 2: Grilling Rounds over the Design Tree
Model the plan as a **design tree**: each decision branches into the decisions that depend on it. The **frontier** is every decision whose prerequisites are already settled.

1. **Ask the whole frontier in one round.** Number each question and give your recommended answer, worded so that "yes" accepts it. A question that depends on another question still open in this round waits for a later round.
2. **Use the right channel.** For a question with discrete options, use the `ask_question` tool (recommended option first, prefixed "(Recommended)"); batch the round's multiple-choice questions into one call. Open-ended questions go in chat in this format:
   ```text
   Q1 - <question title>: <question body, options if any>
   Recommended: <your answer>
   ```
3. **Facts are the agent's job; decisions are the user's.** When a frontier question needs a fact from the environment (code, config, schema, tool output), dispatch a `research` subagent to find it instead of asking the user. Keep going: only the questions downstream of that lookup wait for its report; ask the rest of the frontier now.
4. **Recompute after each answer set.** Settled decisions push the frontier outward; ask the next round.
5. **Sharpen the language.** When an answer introduces or blurs a domain term, or settles a hard-to-reverse trade-off, read [`skills/domain-modeling/SKILL.md`](../domain-modeling/SKILL.md) and follow it to update the glossary inline or record an ADR.

**Done when** the frontier is empty (every branch visited, nothing silently assumed) and the user confirms shared understanding. Source edits begin only after that confirmation.

### Step 3: Architectural Trade-Off Decision Matrix
Every non-trivial design specification evaluates at least two concrete options:

| Evaluation Criterion | Option A: In-Database Upsert with `UPDLOCK` (Recommended) | Option B: Distributed Redis Lock + Application Loop |
| :--- | :--- | :--- |
| **Latency (`p95`)** | $\le 8\text{ ms}$ ($1$ DB roundtrip) | $\approx 45\text{ ms}$ ($N$ network hops) |
| **Failure Modes** | Atomic ACID rollback on crash | Lock lease expiry / split-brain hazard |
| **New Dependencies** | $0$ (Uses existing SQL Server / Dapper) | Requires Redis cluster & Redlock client |
| **Engineering Cost** | $35$ LOC | $220$ LOC + operational infra overhead |

**Done when** the matrix has at least two options and a stated recommendation the user accepted.

### Step 4: Explicit Scope, Non-Goals & Executable Spec
Bound what the implementation will touch so coding stays surgical:
- **In Scope:** Idempotent batch stock reservation endpoint (`POST /api/v1/inventory/reserve`) and unit tests.
- **Explicit Non-Goals:** Legacy warehouse billing reports stay unchanged; no background message brokers are introduced.

**Done when** at least two non-goals are listed and every acceptance criterion is a Given-When-Then assertion that maps to a test.

### Step 5: Zero-Context Goldfish Spec Review Gate
Before writing any production code or creating implementation files:
1. **Spawn Zero-Context Reviewer:** Dispatch an isolated subagent (role: `Goldfish Spec Reviewer`, referencing `agents/governance/goldfish-spec-critic.md`). The subagent is passed strictly the candidate spec document path (`docs/designs/<feature>.md` or `task.md`) and referenced codebase contracts — zero conversational history is inherited.
2. **Execute 4-Stage Spec Review Filter:**
   - **Zoom Out & YAGNI:** Check problem boundaries, blast radius, and strip speculative abstractions (`AS-C4`).
   - **Comprehension Test:** Ensure the specification is 100% self-contained. Any missing entity definition, route, or state transition that requires guessing triggers an immediate `P0 Blocker: Tacit Assumption Gap`.
   - **Critic Review:** Deep structural audit on concurrency races (TOCTOU, row locking), cascading failure modes, tenant isolation, and boundary conditions.
   - **Implementation-Readiness:** Verify concrete file paths, method/DTO signatures, and testable Given-When-Then criteria.
3. **Remediation Loop (The Resolve Phase):** If the Goldfish returns `[REQUEST CHANGES]` with `P0`/`P1` defects, the author agent patches the spec addressing all gaps and re-verifies until `[APPROVED]`.

**Done when** `SPEC_AUDIT.md` reports `Verdict: [APPROVED]` with zero blocking findings, clearing the spec for implementation.

---

## 3. Specification Comparison: Vague Plan vs Executable Engineering Spec

```markdown
<!-- BAD: Vague, untestable "vibe coding" plan -->
## Plan
- Update the inventory service to handle reservations better.
- Add error handling and make sure it is fast.
- Update the frontend to call the new API.

<!-- GOOD: Concrete, verifiable Engineering Specification -->
## Executable Specification: Batch Stock Reservation (`Features/Inventory/`)
1. **Contract (`ReserveStockRequest`):** `WarehouseId (int)`, `IdempotencyKey (Guid)`, `Lines (IReadOnlyList<ReserveLineDTO>)` (max 500 items).
2. **Invariants:**
   - Lock rows in ascending `MaterialId` order using `WITH (UPDLOCK, ROWLOCK)` to guarantee 0 deadlocks.
   - If any line has `AvailableQty < RequestedQty`, rollback entire transaction and return HTTP `409 Conflict` with offending `MaterialId`.
3. **Acceptance Criteria (Given-When-Then):**
   - **AC-1 (Atomic Reservation):** *Given* `MaterialId=10` has `AvailableQty=50`, *When* two concurrent requests each reserve `30`, *Then* exactly one succeeds (`200 OK`, remaining `20`) and one fails (`409 Conflict`).
   - **AC-2 (Idempotency):** *Given* a completed `IdempotencyKey`, *When* the identical payload is re-sent within 24h, *Then* return the cached `ReservationId` with `0` duplicate stock deductions.
```
