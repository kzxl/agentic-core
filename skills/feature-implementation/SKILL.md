---
name: feature-implementation
description: End-to-end automated workflow for new feature development (Normalization, Pre-Fetch, Spec, TDD, Blast-Radius, Commit, Post-Harvest).
desc: End-to-end automated workflow for new feature development (Normalization, Pre-Fetch, Spec, TDD, Blast-Radius, Commit, Post-Harvest).
rules: [R_CORE, R_TDD, R_GIT, R_PROOF]
---

# 🏗️ End-to-End Feature Implementation Workflow

**Goal:** Deliver production-ready features with zero hallucination, strict 4-tier architectural isolation (`CLEAN`, `FEAT`), asset-first reuse (`R_REUSE`), Red-Green-Refactor test-driven development (`R_TDD`), and atomic version control discipline (`R_GIT`).

---

## 1. Feature Engineering Lifecycle

```text
[1. NORM + System 1 Route + PRE-Fetch] ──► [2. Asset Survey (`R_REUSE`) & Pre-Mortem Spec]
                                                                  │
[5. Adversarial Audit, Commit & Harvest] ◄── [4. TDD (Red-Green)] ◄── [3. Localized DTOs & 1-to-1 Partials]
```

---

## 2. Step-by-Step Implementation Protocol

### Step 1: Input Normalization, System 1 Routing & Context PRE-Fetch
1. **Normalize Request (`NORM`):** `[NORM] ADD @<Domain>.<Feature> | <Primary Deliverable & Constraints> | [<ActiveRules>]`
2. **Execute System 1 Decision Router (`R_ROUTE`) & PRE-Fetch (`R_RES_MEM`):**
   // turbo
   ```bash
   node E:\16. AgentOption\tools\brain.js route "<Feature Description>"
   node E:\16. AgentOption\tools\brain.js pre "<Feature Name> <Domain>" --tags=<domain>
   ```

---

### Step 2: Existing Asset Discovery (`R_REUSE`) & Pre-Mortem Specification (`R_PRE_MORTEM`)
1. **Mandatory Asset Survey (`R_REUSE`):** Before creating any helper, mapper, validator, or UI control, grep the repository for existing reusable assets:
   // turbo
   ```bash
   rg "(Helper|Extension|Validator|BaseForm|DbScope|ApiClient)" --files
   ```
2. **Pre-Mortem Simulation (`R_PRE_MORTEM`):** Evaluate 3 failure modes before writing code:
   - *Concurrency & Lock Contention:* What happens if two operators submit the same document simultaneously?
   - *Scale & Data Volume:* Does the query remain SARGable and paginated at $10^6$ rows (zero N+1 queries)?
   - *Operator Ergonomics:* Are UI actions labeled with clear imperative verbs ($\le 20$ chars) and protected against double-click re-entrancy?

---

### Step 3: Contract-First DTO & Layer Boundary Design (`CLEAN`, `FEAT`, `PART`)
Design data contracts and service boundaries adhering to Folder-per-Feature and 1-to-1 Partial Partitioning:

| Architectural Layer | Artifact Responsibility | Mandatory Invariant |
| :--- | :--- | :--- |
| **1. Domain / Entities** | Pure business invariants, enums, value objects. | Zero dependency on ORM, HTTP, or UI frameworks. |
| **2. Localized DTOs** | `<Feature>ActionDTO`, `<Feature>QueryDTO`, `<Feature>LookupDTO`. | Co-located inside the feature folder; never dump into a global `Models/` folder. |
| **3. Application Service** | `<Feature>Service.Action.cs`, `.Query.cs`, `.Lookup.cs`. | Each partial file $\le 200$ LOC; methods $\le 40$ LOC; propagate `CancellationToken` (`CTOK`). |
| **4. Presentation / API** | Thin Controller endpoint or `BaseForm`/`XtraForm` view. | Zero business logic or raw SQL in UI/Controllers; use `RunAfterShown` and 1-way mapping. |

---

### Step 4: Red-Green-Refactor TDD Cycle (`R_TDD`)
1. **Red Phase (Failing Tests First):** Write unit/integration tests covering happy path, boundary values (empty, `null`, max limit), and invalid state transitions:
   ```bash
   dotnet test --filter "FullyQualifiedName~<FeatureName>"  # or node --test / pytest / cargo test
   ```
2. **Green Phase (Minimalist Implementation — `PONY`):** Implement the cleanest, shortest production code that satisfies all test assertions using standard library primitives and existing project helpers.
3. **Refactor Phase (`R_NEV`):** Eliminate duplication, ensure nesting depth $\le 3$, and verify zero compiler warnings.

---

### Step 5: Adversarial Self-Review, Blast-Radius Check & Atomic Commit (`R_GIT`, `R_PROOF`)
1. **Blast-Radius & Security Audit (`REV`, `BLAST`):**
   - Grep all touched shared symbols to ensure zero breaking changes to existing callers.
   - Verify parameterized SQL queries (`R_DB`), RBAC permission checks (`R_DOMAIN_AUTH`), and zero hardcoded secrets/paths (`R_SEC_STD`, `R_PKG`).
2. **Full Build & Test Proof (`R_PROOF`):** Run the complete build and test suite with exit code `0`.
3. **Atomic Scoped Commit (`R_GIT`) & POST-Harvest (`R_RES_MEM`):**
   ```bash
   node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "feat(<domain>): implement <feature_name>" <feature_files...>
   node E:\16. AgentOption\tools\brain.js post "[Feature: <Name>] | [Constraint / Edge Case] | [Pattern & Reusable Asset Applied]" --tags=<domain>,pattern
   ```


