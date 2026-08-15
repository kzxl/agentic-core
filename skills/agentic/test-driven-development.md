---
name: AgenticTestDrivenDevelopment
desc: Rigorous Test-Driven Development (TDD) protocol for autonomous AI coding agents
rules: [R_TDD, R_CORE]
category: Agentic
---
# 🧪 Agentic Test-Driven Development (TDD) Protocol

**Goal:** Ensure 100% functional correctness, prevent regressions, and prove bug fixes through reproducible automated tests before and after code changes.

---

## 1. The Red-Green-Refactor Cycle for AI Agents

```
[1. RED]   -> Write a failing test or reproduction script that isolates the bug/feature.
                 |
[2. GREEN] -> Write the MINIMUM production code required to make the test pass.
                 |
[3. REFACTOR] -> Clean up code, remove duplication, and optimize while tests stay green.
                 |
[4. VERIFY] -> Run the full test suite / build to guarantee zero regressions.
```

---

## 2. Agent Execution Workflow

### Step 1: Write Reproduction / Unit Test First
- For Backend (Node.js/C#/Go): Write a Jest/Vitest/xUnit test asserting the expected behavior.
- For UI/Routing: Use browser subagent or integration tests to reproduce the issue before modifying code.

### Step 2: Implement Targeted Solution
- Modify only the necessary files.
- Never add unrelated changes or unsolicited refactorings in the same step.

### Step 3: Verify Green
- Execute the test command (`npm test`, `dotnet test`, `go test ./...`).
- Inspect test output to ensure all assertions pass cleanly.

---

## 3. Checklist
- [ ] Bug fix is accompanied by a test that failed before the fix and passes after.
- [ ] Edge cases (null inputs, empty lists, network timeouts, unauthenticated states) are covered.
- [ ] Entire test suite and production build pass with zero warnings/errors.
