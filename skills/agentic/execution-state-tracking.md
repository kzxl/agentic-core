---
name: AgenticExecutionStateTracking
desc: 3-tier memory protocol (Knowledge Memory, Episodic Memory, Working Memory) and execution state tracking to eliminate agent amnesia loops
rules: [R_CORE, R_STATE]
category: Agentic
---
# 🧠 Agentic 3-Tier Memory Architecture & Execution State Protocol

**Goal:** Provide AI Coding Agents with a complete cognitive memory architecture. Eliminate the *Amnesia Loop* by clearly separating stable **Knowledge Memory**, historical **Episodic Memory**, and ephemeral **Working Memory**.

---

## 1. The 3-Tier Memory Architecture

```
                                  AGENT
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ↓                            ↓                            ↓
① KNOWLEDGE MEMORY           ② EPISODIC MEMORY           ③ WORKING MEMORY
 (Semantic / Invariant)       (Historical Experience)     (Active Execution State)
       │                            │                            │
 • Architecture Blueprints   • Past Bugfixes & Events     • Current Goal & Scope
 • Coding Standards          • Historical Root Causes     • Modified Files (Diff)
 • Design Patterns           • Past Deadlock Solutions    • Active Hypotheses
 • Business/Security Rules   • SemanticBrain Vector DB    • Compiler/Test Evidence
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    ↓
                                DECISION
                                    ↓
                                 ACTION
                                    ↓
                                EVIDENCE (Compiler / Test / Logs)
                                    ↓
                      ┌─────────────┴─────────────┐
                      ↓ (Short-Term Loop)         ↓ (Long-Term Loop)
                 UPDATE STATE                POST-HARVEST
               (Working Memory)             (Episodic Memory)
```

---

## 2. Memory Tier Comparison

| Dimension | ① Knowledge Memory (Semantic) | ② Episodic Memory (Experience) | ③ Working Memory (Execution State) |
| :--- | :--- | :--- | :--- |
| **Nature** | **Invariants & Blueprints** | **Historical Events & Lessons** | **Active Scratchpad & State** |
| **Lifespan** | Permanent / Multi-year | Long-term (Append-only per task) | Short-term (Current session/turn) |
| **Storage** | Git files (`standards/`, `architecture/`, `rules.json`) | Vector DB / JSONL (`SemanticBrain`) | Session Context, Plan, Git diff, Logs |
| **Retrieval** | Injected System Prompt / Rule lookup | Semantic Vector Search (PRE-Fetch by tags) | Read workspace state, `git status`, log output |
| **Core Question** | *"HOW should things be designed?"* | *"WHAT happened when we touched this before?"* | *"WHERE am I and WHAT just happened right now?"* |
| **Concrete Example** | `R_DB`: No cross-module query; `BaseForm` lifecycle | `2026-08-20`: Inventory deadlock fixed by adding index to `TonKho` | Active: Step 2; Touched: `MaterialService.cs`; Test `CheckStock` failing L42 |

---

## 3. Memory Lifecycle & Transition Flow

```
[1. PRE-TASK INITIALIZATION]
  ├── Load ① Knowledge Memory (Hard rules R_*, Standards)
  ├── PRE-Fetch ② Episodic Memory (Query SemanticBrain for historical lessons)
  └── Initialize ③ Working Memory (Set Goal, Plan, Target Module Scope)
        │
        ▼
[2. DURING-TASK EXECUTION LOOP]
  ├── DECISION: Formulate hypothesis using Knowledge + Episodic + Working Memory
  ├── ACTION: Execute bounded edit, migration, or test command
  ├── EVIDENCE: Capture compiler output, test assertions, or runtime logs
  └── UPDATE: Immediately update ③ Working Memory (Touched files, pass/fail state, failed attempt log)
        │
        ▼
[3. POST-TASK HARVEST]
  └── POST-Harvest lesson from ③ Working Memory -> Commit to ② Episodic Memory (SemanticBrain)
        │
        ▼
[4. KNOWLEDGE EVOLUTION]
  └── When a pattern in ② Episodic Memory repeats >= 3 times -> Codify into ① Knowledge Memory (Rule / Standard)
```

---

## 4. The 4-Quadrant Working Memory (Execution State)

```
                    WORKING MEMORY / EXECUTION STATE
                                    │
   ┌────────────────┬───────────────┴───────────────┬────────────────┐
   ↓                ↓                               ↓                ↓
[TASK STATE]  [DELTA STATE]                 [DIAGNOSTIC STATE]  [HYPOTHESIS STATE]
 • Active Goal    • Touched Files             • Compiler Errors   • Current Hypothesis
 • Current Step   • Staged/Unstaged Diffs     • Failing Tests     • Failed Attempts Log
 • Module Scope   • Executed DB Migrations    • Runtime Logs      • Root Cause Proof
```

### 1. Task & Scope State (Phạm vi)
- **Active Goal:** Specific feature or bug under investigation.
- **Current Phase:** e.g., `Phase 1: DTO Localization` | `Phase 2: Service Refactoring`.
- **Module Boundary:** Exact assemblies and namespaces in scope.

### 2. Workspace Delta State (Biến đổi thực tế)
- **Files Modified:** Exact list of touched files in current session.
- **Git Status / Diff:** Uncommitted line changes (`git status -s`).
- **External State:** Executed SQL migrations, running background dev servers.

### 3. Diagnostic & Evidence State (Bằng chứng phản hồi)
- **Raw Diagnostic Output:** Exact compiler errors, failed assertions, stack traces.
- **Verification Proof:** Success logs (`Build succeeded. 0 Error(s)`).

### 4. Hypothesis & Attempt History Log (Trí nhớ thử nghiệm)
- **Current Hypothesis:** Explicit, testable statement of root cause.
- **Attempt History (Anti-Loop):**
  ```markdown
  - Attempt 1: Changed lock order to `A -> B` -> Failed (Deadlock on concurrent update).
  - Attempt 2: Added `ROWLOCK` hint -> Succeeded (Verified with 50 parallel requests).
  ```

---

## 5. Execution Directives

1. **Pre-Action State Check:** Before modifying code, always verify workspace delta (`git status -s`).
2. **Never Action Without Evidence:** Bind every fix to direct compiler, test, or log feedback.
3. **Anti-Amnesia Gate:** If an attempt fails, log *why* in the Attempt History before creating a new hypothesis. Never retry the exact same code modification twice.
