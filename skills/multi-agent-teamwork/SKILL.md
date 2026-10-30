---
name: multi-agent-teamwork
description: Use when orchestrating multi-agent subagent teams with zero-collision file ownership contracts, parallel research/execution partitioning, and adversarial review gates.
desc: End-to-end multi-agent team dispatch, role partitioning, adversarial review/challenge gates, and synthesis
rules: [R_TEAM, R_CORE, R_COG_LOOP, R_PROOF]
---
# 🤝 Multi-Agent Teamwork Orchestration Skill

**Goal:** Execute complex, multi-module engineering tasks by orchestrating specialized subagents in parallel with zero file-edit collisions, deterministic handoff contracts, and independent adversarial verification.

---

## 1. Execution Workflow Overview

```text
[Phase 1: Complexity Triage & Recon] ──► Spawn read-only `research` subagents -> Build BRIEFING.md
                 │
                 ▼
[Phase 2: Zero-Collision Partitioning] ──► Assign disjoint file locks (P1 ∩ P2 = ∅) -> Write DISPATCH.md
                 │
                 ▼
[Phase 3: Parallel Worker Dispatch]    ──► Single `invoke_subagent` batch call -> Wait for reactive wakeup
                 │
                 ▼
[Phase 4: Adversarial Gate & Fixes]    ──► Audit diffs, run Conformance/CLI gates, message Workers for fixes
                 │
                 ▼
[Phase 5: Root Synthesis & Safe Commit] ──► Wire shared registries, run full test suite, git-safe-commit
```

---

## 2. Step-by-Step Orchestration Protocol

### Step 1: Complexity Triage & Parallel Reconnaissance
1. **Assess Blast Radius:** If the task touches $\le 3$ files in a single module, execute directly without subagents. If it spans $\ge 4$ files across multiple domains or requires a repo-wide audit, initiate Multi-Agent Teamwork.
2. **Pre-Fetch Context:** Run `node [AgentOption]/tools/brain.js pre "<task>"` to load historical lessons.
3. **Parallel Recon:** Invoke 1–3 read-only `research` subagents in a single `invoke_subagent` call to map disjoint subsystems into `BRIEFING.md`.

### Step 2: Zero-Collision File Lock Partitioning (`DISPATCH.md`)
Before invoking write-capable Workers (`TypeName: "self"`), partition target files into strictly disjoint sets ($P_1 \cap P_2 = \emptyset$):
- **Exclusive Ownership:** Each Worker Prompt MUST list the exact absolute file paths it may view, modify, or create.
- **Shared Root Reservation:** Hold back shared root files (`index.json`, `README.md`, `Program.cs`, `App.tsx`) for Orchestrator synthesis in Phase 5.
- **Mandatory Worker Prompt Header:**
  ```text
  STRICT FILE OWNERSHIP RULE: You may ONLY view, modify, or create the specific files listed below.
  Always call `view_file` on any existing file before modifying it.
  Do NOT run `git commit` and do NOT touch any other files in the repository.
  All technical documentation and code comments MUST be written in Standard Technical English.
  ```

### Step 3: Batch Parallel Worker Invocation
- **Single-Call Batching:** Launch all independent Workers simultaneously in one `invoke_subagent` call.
- **Reactive Wakeup Discipline:** After calling `invoke_subagent`, **stop calling tools to end your turn** (or perform strictly Orchestrator-scoped work). Never poll `manage_subagents` in a loop; the runtime wakes you reactively when subagents call `send_message`.

```json
{
  "Subagents": [
    {
      "TypeName": "self",
      "Role": "Backend Order Slice Architect",
      "Model": "inherit",
      "Prompt": "Worker 1. STRICT FILE OWNERSHIP: Only touch E:\\Repo\\Features\\Orders\\**..."
    },
    {
      "TypeName": "self",
      "Role": "Frontend Order Grid Specialist",
      "Model": "inherit",
      "Prompt": "Worker 2. STRICT FILE OWNERSHIP: Only touch E:\\Repo\\src\\features\\orders\\**..."
    }
  ]
}
```

### Step 4: Adversarial Verification & Iterative Continuation
When all Workers report completion:
1. **Boundary Audit:** Check `git status -s` to verify zero out-of-partition edits and 100% deliverable completion.
2. **Adversarial Gate:** Run verification commands (`dotnet build`, `pytest`, `cargo check`, `node tools/RegistryBuild.js --verify`) or invoke an `Adversarial Code Reviewer` subagent to audit diffs against `R_NEV` and `R_PROOF`.
3. **Subagent Continuation (`send_message`):** Route any partition defect back to the owning Worker's existing `conversationId` via `send_message` rather than spawning a new subagent.

### Step 5: Root Integration, Final Verification & Post-Harvest
1. **Shared Registry Wiring:** Update reserved root files (`index.json`, DI containers, route tables) in the Orchestrator context.
2. **Full-Suite Proof & Commit:** Verify build/test exit code `0`, commit task-scoped files via `git-safe-commit.js`, and harvest lessons via `node [AgentOption]/tools/brain.js ingest --file=atoms.json` (one atom per independent lesson).
