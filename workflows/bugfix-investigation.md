---
name: BugfixInvestigationWorkflow
desc: 5-step scientific bug reproduction, isolation, root-cause fix, regression testing, and post-harvest workflow
rules: [R_CORE, R_TDD]
category: Workflows
---
# 🔬 Systematic Bugfix & Root-Cause Investigation Workflow

**Goal:** Diagnose and resolve complex production bugs, race conditions, memory leaks, and UI crashes using scientific proof and regression tests rather than speculative guesswork.

---

### Step 1: Input Normalization & Symptom Capture
Convert the user bug report into a canonical normalized symptom payload:
// turbo
```text
[NORM] FIX @<Domain>.<Feature> | <Exact Error Message or Symptom> | [BLAST, DBG, PONY]
```

### Step 2: Semantic Brain PRE-Fetch (Past Incident Lookup)
Check if similar bugs, race conditions, or DB deadlocks were previously solved:
// turbo
```bash
node [AgentOption]/tools/brain.js pre "<Error Message or Symptom>" --tags=<domain>,bug
```

### Step 3: Reproduce & Isolate (Scientific Proof)
1. **Reproduce:** Create an automated failing test, script, or browser session proving the bug exists.
2. **Isolate:** Trace call stack and inspect variable types (`typeof`, `null`, `undefined`, `DBNull`).

### Step 4: Formulate & Verify Hypothesis
State explicit hypothesis before editing any code:
- *"The UI freezes because `RunAfterShown` invoked synchronous void delegate instead of awaiting Task."*
- *"Query throws `InvalidCastException` because `cboWarehouse.EditValue` is `DBNull.Value` when deselected."*

### Step 5: Root-Cause Minimalist Fix & Blast-Radius Scan
Apply fix strictly at the single root source:
// turbo
```bash
# Grep all callers to ensure fix does not cause cascading breakages
rg "<TargetMethodName>\(" --type cs --type ts --type js
```

### Step 6: Verify Green & Regression Test
Re-run the reproduction test to confirm it transitions from Red to Green:
```bash
# Node.js
npm test
# C# .NET
dotnet test
# Go
go test ./...
```

### Step 7: Commit & Semantic Brain POST-Harvest
Commit the fix and save the 3-field technical lesson for future agent sessions:
```bash
git add .
git commit -m "fix(<domain>): resolve <symptom> by <concrete_fix>"
```
// turbo
```bash
node [AgentOption]/tools/brain.js post "[Symptom: <Problem>] | [Root Cause: <Cause>] | [Fix: <Action & Gotcha>]" --tags=<domain>,bug
```
