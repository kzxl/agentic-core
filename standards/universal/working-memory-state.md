---
title: Working Memory & Execution State Standard
desc: Universal engineering standards for agent state awareness, delta tracking, and hypothesis verification
rules: [R_CORE, R_STATE]
---
# 📊 Universal Working Memory & Execution State Standard

**Core Principle:** An AI Agent without execution state suffers from amnesia loops. Every action must operate on verified state (Workspace Delta + Diagnostic Evidence + Active Hypothesis) combined with Engineering Knowledge.

---

## 1. The 4 State Invariants

Every agent execution session must respect 4 state invariants:

1. **Delta Awareness:**
   - Know exactly which files have been modified, staged, or generated.
   - Run `git status -s` or inspect touched file lists before applying multi-file refactorings.

2. **Evidence-Driven Progression:**
   - Never assume a change works without concrete evidence (Compiler success, Test pass, HTTP 200 response).
   - Capture raw error messages and line numbers directly into working context.

3. **Hypothesis Isolation & Anti-Repetition:**
   - Explicitly formulate the hypothesis before editing: *"Bug occurs because X is called before Y initializes"*.
   - If a fix fails, record the failure cause and pivot to a new hypothesis. Never retry the exact same edit.

4. **Environment & Side-Effect Tracking:**
   - Track local side-effects: database migrations executed, active Docker containers, mock servers spawned.
   - Clean up temporary artifacts upon session completion.

---

## 2. Micro State Checklist (Agent Action Gate)

Before executing any modifying tool call:

- [ ] **Where am I?** (Current task goal, target module, sub-step).
- [ ] **What changed so far?** (Touched files, uncommitted diffs).
- [ ] **What is the current evidence?** (Last error output, test result).
- [ ] **What hypothesis am I testing?** (Expected outcome of this exact action).
