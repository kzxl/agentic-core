---
name: bugfix-investigation
description: Gated diagnosis workflow for hard bugs and performance regressions. Use when the user reports something broken, throwing, failing, flaky, slow, leaking, freezing, or deadlocking, or asks to debug, diagnose, find the root cause, or fix a bug.
desc: Six gated phases (feedback loop, reproduce and minimise, hypothesise, instrument, fix with regression test, cleanup) plus incident pre-fetch, safe commit, and post-harvest.
rules: [R_CORE, R_TDD, R_PROOF, R_RES_MEM, R_DEAD_LOOP, R_EPISTEMIC]
---

# Systematic Bugfix and Root-Cause Investigation

**Goal:** Fix defects, races, leaks, deadlocks, and regressions at the root cause, driven by a tight red-capable loop. Incorporates practices adapted from mattpocock/skills (MIT).

Enter a phase only when the previous "Done when" holds. **Redact** first: show `<REDACTED>` for secrets in commands and output; keep credentials in env vars.

## Phase 0: Normalize and Pre-Fetch (`R_RES_MEM`)
`[NORM] FIX @<Domain>.<Feature> | <Exception / Input State> | [DBG, BLAST, TDD]`, then:
// turbo
```bash
node E:\16. AgentOption\tools\brain.js pre "<Exact Error Message or Exception>" --tags=<domain>,bug
```
**Done when** the NORM line is written and past incidents are listed (or "none").

## Phase 1: Tight Feedback Loop (`R_EPISTEMIC`)
Production logic stays untouched until the loop exists. Read [`skills/agentic/systematic-debugging.md`](../agentic/systematic-debugging.md) when choosing, tightening, or failing to build a loop; read [references/fix-patterns.md](references/fix-patterns.md) for test runner commands.

**Done when** one command, already run (redacted output shown), is:
- [ ] **Red-capable:** asserts the user's exact symptom on the real code path.
- [ ] **Deterministic:** same verdict every run (flaky: pinned high rate).
- [ ] **Fast:** seconds, not minutes.
- [ ] **Agent-runnable:** unattended, or a structured HITL script.

No loop, no hypotheses.

## Phase 2: Reproduce and Minimise
Confirm it is the user's failure mode, reproducible, with the verbatim symptom and boundary inputs captured. Cut inputs, callers, config, and steps one at a time, re-running after each cut.
**Done when** every remaining element is load-bearing.

## Phase 3: Hypothesise (`H0` vs `H1`)
Log 3-5 ranked falsifiable hypotheses in the `H0`/`H1` matrix and show them to the user. Read [references/hypothesis-and-instrumentation.md](references/hypothesis-and-instrumentation.md) for the format and example.
**Done when** each hypothesis has a prediction and the list was shown.

## Phase 4: Instrument
One variable at a time; each probe maps to one prediction. Tag debug logs `[DEBUG-xxxx]`. For performance regressions, baseline then bisect (same reference).
**Done when** one hypothesis is `CONFIRMED` by evidence and the rest are `REFUTED`.

## Phase 5: Fix at a Correct Seam (`BLAST`)
1. Before changing a signature, shared query, or DTO, scan callers:
   // turbo
   ```bash
   rg "\b<TargetMethodOrProperty>\b"
   ```
2. Write the failing regression test at a correct seam and watch it fail; prove forced mutations landed. No correct seam: record an architectural finding.
3. Apply the root-cause fix (no symptom masking), watch the test pass, re-run the Phase 1 loop on the original scenario. Read [references/fix-patterns.md](references/fix-patterns.md) when judging a seam or a fix pattern.

> **2-Strike Pivot Rule (`R_DEAD_LOOP`):** If 2 consecutive fix attempts fail to turn the reproduction test Green, immediately `git checkout -- <file>`, mark the hypothesis `REFUTED`, and re-instrument (Phase 4). Never stack speculative patches.

**Done when** the test went red then green (or the missing seam is recorded) and the module suite has `0` errors, `0` warnings.

## Phase 6: Cleanup, Commit, Harvest (`R_GIT`)
- [ ] Phase 1 loop green; regression test passes.
- [ ] `rg -n "DEBUG-"` finds no session tag; prototypes deleted.
- [ ] Winning hypothesis is in the commit message.
```bash
node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "fix(<domain>): resolve <symptom> by enforcing <invariant>; root cause: <hypothesis>" <files...>
node E:\16. AgentOption\tools\brain.js post "[Symptom: <Error>] | [Root Cause: <Broken Invariant>] | [Fix: <Solution & Repro Test>]" --tags=<domain>,bug
```
**Done when** all boxes are ticked, the commit exists, and harvest ran.
