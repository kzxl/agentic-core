---
name: continuous-learning-harvest
description: Use for automated pre-task context lookup and post-task knowledge harvesting workflow using SemanticBrain bridge.
desc: Automated pre-task context lookup and post-task knowledge harvesting workflow using SemanticBrain bridge.
rules: [R_CORE, R_RES_MEM, R_DEAD_LOOP, R_STATE]
---

# 🧠 Continuous Learning & Semantic Memory Harvest Workflow

**Goal:** Eliminate cross-session amnesia and repetitive failed fixes (`R_RES_MEM`, `R_DEAD_LOOP`) by enforcing progressive pre-task episodic memory retrieval (`PRE-Fetch`) and high-signal post-task technical lesson harvesting (`POST-Harvest`) via SemanticBrain.

---

## 1. Dual-Phase Memory Lifecycle

```text
[Task Arrival] ──► [1. L0 PRE-Fetch (~50 tok/item)] ──► [2. L1 Deep View (`brain.js view <id>`)]
                                                                       │
[4. Quality-Gated POST-Harvest] ◄── [3. Grounded Execution, Test Proof & Atomic Commit]
```

---

## 2. Step-by-Step Execution Protocol

### Step 1: PRE-Fetch Progressive Disclosure (`L0` Index $\to$ `L1` Deep View)
Before designing architecture, refactoring, or debugging a non-trivial issue, query SemanticBrain for prior project incidents and negative knowledge (`failed_approaches`):

1. **Smart Context Wrapper (Auto-resolves `.project-rule.md` & git tags):**
   // turbo
   ```bash
   node E:\Tools\SemanticBrain\tools\context-fetch.js "<task description or error symptom>"
   ```
2. **Portable AgentOption Bridge (`L0` Compact Retrieval):**
   // turbo
   ```bash
   node E:\16. AgentOption\tools\brain.js pre "<task description>" --tags=<domain>
   ```
3. **Progressive Disclosure (`L0` vs `L1`):**
   - **`L0` Compact Index (Default):** Returns condensed summaries (`ID`, `Symptom`, 1-line `Solution`, `Confidence`) to protect context window budget.
   - **`L1` Deep Inspection (`view <id>`):** When an `L0` entry matches the active subsystem or error signature, fetch the full record before editing code:
     // turbo
     ```bash
     node E:\16. AgentOption\tools\brain.js view <qa_id>
     ```

### Step 2: Apply Retrieved Invariants & Negative Knowledge Gate (`R_RES_MEM`)
- **Negative Knowledge Check:** If retrieved records document a previously failed approach under identical constraints, **strictly forbid** repeating that approach.
- **Asset & Pattern Alignment:** Reuse verified patterns documented in memory (`DbScope`, `RunAfterShown`, `1-to-1 Partial Partitioning`, `TaskGroup` bounds).

### Step 3: Execute Task, Verify & Commit Atomically (`R_PROOF`, `R_GIT`)
Verify compiler exit code `0` and passing tests, then commit strictly task-scoped files via `git-safe-commit.js`:
```bash
node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "<type>(<scope>): <subject>" <file1> <file2>
```

---

### Step 4: POST-Harvest Distilled Technical Lesson (Mandatory for Complex Tasks)
After completing any non-trivial feature, refactoring, or bugfix, harvest the distilled engineering insight:

1. **Automated Git-Diff Aware Wrapper (Recommended):**
   // turbo
   ```bash
   node E:\Tools\SemanticBrain\tools\auto-post-task.js "[Symptom/Context] | [Root Cause/Constraint] | [Concrete Fix, File/Symbol & Reusable Rule]"
   ```
2. **Explicit Portable Bridge Command:**
   // turbo
   ```bash
   node E:\16. AgentOption\tools\brain.js post "[Symptom/Context] | [Root Cause/Constraint] | [Concrete Fix & Gotcha]" --tags=<domain>,<tech>,<pattern>
   ```

---

## 3. Multidimensional Tagging Taxonomy & Quality Gate

Every manually harvested lesson **MUST** include at least **2 multidimensional tags** (1 Domain Tag + 1 Technical/Pattern Tag):

| Tag Dimension | Canonical Tag Values | Purpose |
| :--- | :--- | :--- |
| **1. Business Domain** | `inventory`, `production`, `sales`, `inspection`, `handover`, `rd`, `auth`, `scada` | Functional ERP/enterprise vertical. |
| **2. Technology Stack** | `csharp`, `winforms`, `wpf`, `webapi`, `rust`, `python`, `golang`, `php`, `react`, `nodejs`, `sql`, `cpp`, `embedded`, `godot` | Language runtime or UI framework. |
| **3. Engineering Pattern** | `bug`, `refactor`, `perf`, `async`, `permission`, `pattern`, `deadlock`, `security`, `unit-test` | Structural class of the lesson. |

| Criterion | ❌ Low-Signal Noise (Rejected) | ✅ High-Signal Distilled Lesson (Accepted) |
| :--- | :--- | :--- |
| **Specificity** | *"Fixed bug in inventory form and updated service."* | *"[Symptom: StockOut form throws ObjectDisposedException] \| [Cause: Unawaited timer tick] \| [Fix: Cancel CTS in OnFormClosing]"* |
| **Exemptions** | Routine git commits, typo fixes, formatting, version bumps. | Race conditions, SQL execution plan regressions, FFI alignment, ERP ledger locks. |
| **Curation** | Duplicate entries repeating existing QA records. | Run `node E:\16. AgentOption\tools\brain.js curate --dry-run` to prune duplicates. |


