---
name: AgenticSystematicDebugging
desc: Scientific 5-step debugging methodology (Reproduce, Isolate, Hypothesize, Verify, Prevent) for complex production issues
rules: [R_CORE]
category: Agentic
---
# 🔬 Agentic Systematic Debugging Protocol

**Goal:** Solve difficult bugs, race conditions, memory leaks, and white screens through the rigorous Scientific Method rather than random trial-and-error guessing.

---

## 1. The 5-Step Scientific Debugging Process

```
[1. REPRODUCE]  -> Recreate the failure reliably in a controlled test or browser environment.
                     |
[2. ISOLATE]    -> Narrow down the exact file, component, or line where state diverges.
                     |
[3. HYPOTHESIZE]-> Formulate an explicit, testable hypothesis ("Component crashes because X is null").
                     |
[4. VERIFY]     -> Test the hypothesis by inspecting runtime variables, logs, or breakpoints.
                     |
[5. FIX & PREVENT]-> Apply the minimal root-cause fix and add a regression test to prevent recurrence.
```

---

## 2. Practical Debugging Rules
1. **Never "Guess & Edit":** Do not modify multiple random files hoping the issue disappears. Always find conclusive proof in console logs, network tabs, or stack traces first.
2. **Binary Search the Codebase:** When debugging complex multi-file regressions, comment out half the pipeline to quickly isolate the faulty stage.
3. **Inspect the State at the Point of Failure:** Check exact payload types (`typeof`, `Array.isArray`, `null` vs `undefined`).
4. **Verify Clean Root Cause:** Confirm that the fix addresses the actual root cause, not merely masking a symptom with a superficial try-catch.
