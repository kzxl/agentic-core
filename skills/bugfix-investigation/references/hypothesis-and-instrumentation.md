---
name: bugfix-investigation-hypothesis-and-instrumentation
description: Hypothesis matrix and instrumentation detail for bug diagnosis. Read when writing ranked falsifiable hypotheses, choosing debug probes, tagging debug logs, or diagnosing a performance regression with baseline and bisection.
desc: Hypothesis matrix example, falsifiable prediction format, instrumentation tool order, and performance bisection for bugfix-investigation Phases 3-4.
rules: [R_CORE, R_STATE, R_DEAD_LOOP]
---
# Hypothesis Matrix and Instrumentation Reference

Read this from [`../SKILL.md`](../SKILL.md) Phase 3 or 4. Incorporates practices adapted from mattpocock/skills (MIT).

## Falsifiable Hypotheses (Phase 3)

Generate 3-5 ranked hypotheses before testing any of them; a single hypothesis anchors on the first plausible idea. Each states a prediction: "If `<X>` is the cause, then changing `<Y>` makes the bug disappear (or changing `<Z>` makes it worse)." A hypothesis without a prediction is a vibe: sharpen or discard it.

Trace data flow backward from the failure site to the first corrupted state boundary, and log the matrix in working memory (`R_STATE`):

| ID | Rank | Postulated Mechanism | Prediction / Falsification Probe | Verdict |
| :--- | :---: | :--- | :--- | :---: |
| **$H_1$** | 1 | `CommitStockAsync` deadlocks because `StockLedger` is locked before `WarehouseBalance` (reverse order vs `ReserveStockAsync`). | Aligning lock order makes the loop green; deadlock graph shows the two lock orders. | **CONFIRMED** |
| **$H_2$** | 2 | Lock escalation to table level under batch size > 5000. | Batch of 100 still deadlocks if false. | **REFUTED** |
| **$H_0$** | 3 | Timeout is caused by a missing index on `StockLedger.LotNumber`. | Execution plan shows `IX_StockLedger_LotNumber` index seek in $< 1\text{ms}$. | **REFUTED** |

Show the ranked list to the user before testing: domain knowledge often re-ranks instantly ("we deployed a change to #2 yesterday"). If the user is away, proceed with your ranking.

## Instrumentation (Phase 4)

Each probe maps to one prediction. Change one variable at a time. Tool order:
1. Debugger or REPL inspection; one breakpoint beats ten logs.
2. Targeted logs at the boundaries that distinguish hypotheses, never "log everything and grep".
3. Every debug log carries one session tag such as `[DEBUG-a4f2]`; untagged logs survive cleanup, tagged logs die in one grep.

## Performance Branch

Logs are usually the wrong tool for regressions. Measure first, fix second:
1. **Baseline:** timing harness (`Stopwatch`, `performance.now()`), profiler (dotnet-trace, Chrome DevTools), or SQL execution plan and `SET STATISTICS IO, TIME ON`. Record the number.
2. **Bisect:** `git bisect start <bad> <good>` then `git bisect run <loop command>` where the loop exits non-zero above the threshold; or halve the pipeline (Middleware, Validator, Service, SQL, Serializer) and time each half.
3. **Confirm:** the fix moves the baseline number back under the threshold across repeated runs.
