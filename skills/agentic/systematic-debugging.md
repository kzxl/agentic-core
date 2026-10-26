---
name: AgenticSystematicDebugging
description: Reference for building, tightening, and escalating debugging feedback loops. Use during Phase 1 of skills/bugfix-investigation/SKILL.md when choosing how to reproduce a bug, when a loop is slow or flaky, when a bug is intermittent or non-deterministic, or when no loop can be built.
desc: Feedback-loop construction reference for bugfix-investigation (ten ordered techniques, tightening, raising reproduction rate, escalation when no loop is possible).
rules: [R_CORE, R_EPISTEMIC]
category: Agentic
---
# Feedback-Loop Construction Reference

**Goal:** Produce the one command that Phase 1 of [`skills/bugfix-investigation/SKILL.md`](../bugfix-investigation/SKILL.md) requires: red-capable on the user's exact symptom, deterministic, fast, and agent-runnable. The phases, hypothesis matrix, fix rules, and cleanup live in that skill; this file covers only how to build the loop.

Incorporates practices adapted from mattpocock/skills (MIT).

---

## 1. Ten Ways to Build a Loop (try in this order)

Start at the top and move down only when the earlier technique cannot reach the bug code path.

| # | Technique | Use when | Example |
| :---: | :--- | :--- | :--- |
| 1 | **Failing test** at whatever seam reaches the bug (unit, integration, e2e) | The code path is callable from a test project | `dotnet test --filter "FullyQualifiedName~StockReserveRepro"` |
| 2 | **HTTP script** against a running dev server | The bug surfaces at an API boundary | `curl -s -H "Authorization: Bearer $env:API_TOKEN" http://localhost:5000/api/v1/stock/42` |
| 3 | **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot | Batch jobs, importers, converters | `node tools/import.js fixtures/bad-lot.csv \| diff - fixtures/bad-lot.expected.txt` |
| 4 | **Headless browser script** (Playwright / Puppeteer) asserting on DOM, console, or network | The symptom is visible only in the rendered UI | `npx playwright test repro/grid-freeze.spec.ts` |
| 5 | **Replay a captured trace**: save a real request, payload, or event log to disk and replay it through the code path in isolation | The trigger is a specific production input | Replay a redacted `.har` entry or SQL parameter set into the service method |
| 6 | **Throwaway harness**: a minimal subset of the system (one service, faked dependencies) driven by a single call | Full startup is slow or needs unavailable infrastructure | Console project that constructs the service with in-memory adapters |
| 7 | **Property / fuzz loop**: 1000 random inputs, assert the invariant | The bug is "sometimes wrong output" | FsCheck, fast-check, or a seeded `Random(42)` loop |
| 8 | **Bisection harness**: automate "build at state X, check" | The bug appeared between two known commits, datasets, or versions | `git bisect start <bad> <good>; git bisect run <loop command>` |
| 9 | **Differential loop**: same input through old vs new version (or two configs), diff outputs | A regression against a known-good build | Run both builds against one fixture and `diff` the results |
| 10 | **HITL script** (last resort): a script that prompts the human one step at a time and captures their observations to a file | A human must click or observe hardware | PowerShell script with `Read-Host` per step, appending answers and timestamps to `repro-log.txt` |

**Done when** one technique produces a command that you have run and that drives the bug code path.

## 2. Tighten the Loop

Treat the loop as a product. Once a loop exists, improve it on three axes:

| Axis | Question | Levers |
| :--- | :--- | :--- |
| **Faster** | Can it run in seconds? | Cache setup, skip unrelated initialisation, narrow the test filter, `--no-build` on re-runs |
| **Sharper** | Does it assert the specific symptom? | Assert the exact exception type, message, wrong value, or timing threshold, not "did not crash" |
| **Deterministic** | Does it give the same verdict every run? | Inject `TimeProvider` / `FakeTimeProvider` or a clock function, seed randomness, isolate the filesystem (temp dir per run), freeze the network (recorded responses) |

A 30-second flaky loop is barely better than no loop; a 2-second deterministic loop is tight.

**Done when** the loop runs in seconds and returns the same verdict across 5 consecutive runs (or a pinned reproduction rate, see Section 3).

## 3. Non-Deterministic Bugs: Raise the Reproduction Rate

The target is a higher reproduction rate, not a perfectly clean repro. A 50% reproduction rate is debuggable; 1% is not, so keep raising it.
- Loop the trigger 100 times and count failures.
- Parallelise and add load to widen contention.
- Force collisions with barrier synchronisation (`Task.WhenAll`, `CountdownEvent`, `Barrier`) so racing operations start together.
- Narrow timing windows or inject delays at the suspected interleaving point.

```powershell
$fail = 0
1..100 | ForEach-Object { dotnet test --no-build --filter "FullyQualifiedName~StockReserveRepro" *> $null; if ($LASTEXITCODE -ne 0) { $fail++ } }
"Reproduction rate: $fail / 100"
```

**Done when** the measured reproduction rate is recorded and high enough to distinguish a fix (a drop to 0 / 100) from noise.

## 4. When a Loop Cannot Be Built

Stop and say so explicitly. List every technique you tried and why it failed, then ask the user for one of:
1. Access to the environment that reproduces the bug.
2. A redacted captured artifact: HAR file, log dump, memory dump, deadlock graph, or screen recording with timestamps.
3. Permission to add temporary production instrumentation tagged with the session prefix (for example `[DEBUG-a4f2]`).

Hypothesising resumes only after the user supplies one of these and a loop exists.
