---
name: AgenticExecutionStateTracking
desc: Dynamic working memory protocol (Task, Delta, Diagnostic Evidence, Hypothesis & Attempt Log) to eliminate agent amnesia loops
rules: [R_CORE, R_STATE]
category: Agentic
---
# 🧠 Agentic Execution State & Working Memory Protocol

**Goal:** Bridge the gap between static **Knowledge** (Architecture, Standards, Skills) and dynamic **State** (Working Memory, Workspace Delta, Evidence). Eliminate the *Amnesia Loop* where agents forget previous failed attempts or touched files.

---

## 1. Knowledge vs. State

```
                    AGENT
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
      KNOWLEDGE                 STATE
          │                       │
 • Architecture          • Current Task & Phase
 • Standards             • Current Changes (Diff)
 • Skills                • Current Errors & Evidence
 • Workflows             • Current Hypotheses & Attempt History
          │                       │
          └───────────┬───────────┘
                      ↓
                  DECISION
                      ↓
                  ACTION
                      ↓
                 EVIDENCE (Compiler / Test / Runtime logs)
                      ↓
           ┌──────────┴──────────┐
           ↓ (Short-term)        ↓ (Long-term)
      UPDATE STATE          POST-HARVEST
     (Working Memory)      (SemanticBrain)
```

| Dimension | Knowledge (Static / Semi-Permanent) | State (Dynamic / Working Memory) |
| :--- | :--- | :--- |
| **Scope** | Global / Repository-wide rules & patterns | Local to current task & active turn |
| **Examples** | `R_DB`: No cross-module query, `DBS`: DbScope | Current Module: `Inventory`, Modified: `MaterialService.cs` |
| **Storage** | Rulesets, Standards, SemanticBrain DB | Session context, Plan checklist, Git diff, Test logs |
| **Purpose** | Answers: *"HOW should things be built?"* | Answers: *"WHERE am I and WHAT just happened?"* |

---

## 2. The 4-Quadrant Working Memory Architecture

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
- **Active Goal:** Feature/Bug being addressed.
- **Current Phase:** e.g., `Phase 1: DTO Migration` | `Phase 2: Service Refactoring`.
- **Module Boundary:** Exact folders and assemblies in scope (no bleeding into other modules).

### 2. Workspace Delta State (Biến đổi thực tế)
- **Files Modified:** List of exact files touched in the current session.
- **Git Status / Diff:** Uncommitted changes (`git status -s`).
- **External State:** Applied SQL scripts, running background servers, active ports.

### 3. Diagnostic & Evidence State (Bằng chứng phản hồi)
- **Direct Output:** Raw compiler errors, linter output, test failure assertion logs.
- **Verification Proof:** Success logs (`Build succeeded`, `Passed! 12/12`).

### 4. Hypothesis & Attempt History Log (Trí nhớ thử nghiệm)
- **Current Hypothesis:** Clear statement of why the problem exists.
- **Attempt History (Anti-Loop):**
  ```markdown
  - Attempt 1: Changed lock order to `A -> B` -> Failed (Deadlock on concurrent update).
  - Attempt 2: Added `ROWLOCK` hint -> Succeeded (Verified with 50 parallel requests).
  ```

---

## 3. Closed-Loop Execution Protocol

```
[Pre-Action State Check]
        │  (Inspect git status, verify active step)
        ▼
[Decision Formulation]
        │  (Combine Knowledge Rules + Working Memory State)
        ▼
[Bounded Action]
        │  (Single focused edit or command execution)
        ▼
[Evidence Capture]
        │  (Compile, run test, check server logs)
        ▼
[State & Memory Update]
        │  (Update touched files, record failure/success, advance step)
        ▼
[Loop / Complete]
```

### Execution Directives:
1. **Never Action Without State Inspection:** Before modifying files, confirm what has already been changed in previous turns (`git status -s`).
2. **Never Repeat a Failed Attempt (Anti-Amnesia):** If an edit caused a build break or test failure, log *why* it failed before formulating the next hypothesis. Never re-apply the identical diff.
3. **Bind Evidence to State:** Every decision must reference direct evidence (e.g., *"Error CS0246 at Line 42 proves DTO is missing from namespace"*), not intuition.
