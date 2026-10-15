---
title: Working Memory & Execution State Standard
desc: Universal engineering standards for agent state awareness, delta tracking, and hypothesis verification
rules: [R_CORE, R_STATE]
---
# 📊 Universal Working Memory & Execution State Standard

## 1. Cognitive Memory Hierarchy & L0–L4 State Machine Invariants

An autonomous engineering agent operates across 3 coupled memory planes: **Knowledge Memory** (immutable rules `R_*`, standards, architecture blueprints), **Episodic Memory** (`SemanticBrain` historical root causes and harvested lessons), and **Working Memory** (ephemeral execution state for the active task).

| Working Memory Level | State Transition Trigger | Mandatory Captured Tuple / Artifact |
| :--- | :--- | :--- |
| **L0 — Intake & Normalization** | Raw user prompt received | Canonical `[Action] @[Scope] \| [Goal] \| [Constraints]` + `context-fetch.js` |
| **L1 — Sensory Baseline** | Pre-edit workspace inspection | `git status -s`, target file AST/lines (`view_file`), caller blast radius (`rg`) |
| **L2 — Hypothesis & Mutation** | Formulating & applying code edits | Explicit single-variable hypothesis $H_i$ + exact `Workspace Delta` list |
| **L3 — Empirical Verification** | Compiler / Test / Runtime check | Command executed, exit code (`0` vs non-zero), raw stderr/stdout evidence |
| **L4 — Checkpoint & Harvest** | Sub-goal completion or context >60% | State checkpoint artifact + atomic commit + `auto-post-task.js` |

---

## 2. The 4 Mandatory Working Memory Registers

At every step $t$, the agent MUST maintain an accurate mental and artifact representation of four registers: $\mathcal{M}_t = (\mathcal{G}, \Delta, \mathcal{E}, \mathcal{H})$:
1. **Task Goal ($\mathcal{G}$):** Immutable acceptance criteria, quantitative performance/size thresholds, and strict file ownership boundaries.
2. **Workspace Delta ($\Delta$):** Exact set of modified, created, or staged files (`git diff --stat`), plus active side-effects (spawned background processes, temp files, DB migrations).
3. **Diagnostic Evidence ($\mathcal{E}$):** Verbatim compiler errors (`file:line:col`), failing assertion stack traces, or benchmark outputs. Never paraphrase or guess error causes without reading raw output.
4. **Active Hypotheses ($\mathcal{H}$):** Ordered queue of falsifiable root-cause hypotheses, explicitly marking falsified hypotheses so they are **never repeated**.

```yaml
# ❌ BAD: Amnesia Loop — Blindly re-applying failed edits without tracking Workspace Delta or falsified hypotheses
Step 1: Edit UserService.cs (adds .ConfigureAwait(false)) -> Build fails: CS0103 'userId' does not exist
Step 2: Edit OrderService.cs -> Forgets UserService.cs is still broken!
Step 3: Re-applies same edit to UserService.cs -> Enters infinite edit-compile failure loop!

# ✅ GOOD: Structured L0–L4 Working Memory Register Checkpoint (Anti-Amnesia Protocol)
WorkingMemoryState:
  phase: L3_EMPIRICAL_VERIFICATION
  task_goal: "Fix deadlock in OrderService.ReserveStockAsync while keeping p99 < 50ms"
  workspace_delta:
    modified: ["src/Services/OrderService.cs#L42-L78"]
    untracked: []
  diagnostic_evidence:
    last_command: "dotnet test tests/Order.Tests --filter ReserveStock_Concurrent"
    exit_code: 0
    raw_metric: "Passed! - Failed: 0, Passed: 12, Duration: 184 ms"
  hypotheses_ledger:
    - id: H1
      claim: "Missing UPDLOCK on Inventory SELECT causes S->X conversion deadlock under parallel calls"
      status: VERIFIED_TRUE
```

---

## 3. Pre-Action & Post-Action Empirical Verification Gates

Never chain more than `3` file mutations without executing an intermediate verification probe (`view_file` size/syntax check, linter, or compiler build).
- **Pre-Action Gate:** Before invoking `replace_file_content` or `write_to_file`, verify:
  1. Has the target file been inspected via `view_file` in the current turn?
  2. Does the planned edit respect file ownership boundaries and preserve existing metadata/frontmatter?
  3. Which specific hypothesis $H_k \in \mathcal{H}$ does this edit test?
- **Post-Action Gate (Zero-Speculation Rule):** If a build or test fails (`Exit Code != 0`), immediately transition back to **L1/L2**: record the exact error in $\mathcal{E}$, mark the current hypothesis `FALSIFIED` (if contradicted), and revert or fix the broken delta before touching any other module.

---

## 4. Long-Horizon Anti-Amnesia Checkpointing

During multi-file refactorings (`> 5` files) or multi-agent execution workflows, persist the Working Memory state into the conversation's `task.md` artifact at the end of every batch so context compaction never erases completed file metrics or pending verification gates.

