---
name: bugfix-investigation-fix-patterns
description: Fix and regression-test detail for bug diagnosis. Read when choosing a test runner for the feedback loop, judging whether a seam is correct for a regression test, proving a forced mutation landed, or choosing a root-cause fix over symptom masking.
desc: Correct-seam criteria, forced-mutation proof, root-cause vs symptom-masking fix patterns, and test runner commands for bugfix-investigation Phases 1 and 5.
rules: [R_CORE, R_TDD, R_PROOF]
---
# Fix Patterns and Regression Seams Reference

Read this from [`../SKILL.md`](../SKILL.md) Phase 1 or 5. Incorporates practices adapted from mattpocock/skills (MIT).

## Test Runners for a Test-Based Loop

```bash
dotnet test --filter "FullyQualifiedName~<BugReproTest>"   # C# .NET
node --test tests/<repro>.test.js                          # Node.js
pytest -k "<test>" | cargo test <test> | go test -run <T>  # Python / Rust / Go
```

## Correct Seam (Phase 5)

A correct seam exercises the real bug pattern as it occurs at the call site. For seam vocabulary, read [`skills/codebase-design/SKILL.md`](../../codebase-design/SKILL.md).

| Seam | Verdict |
| :--- | :--- |
| Test drives the same caller chain and inputs that triggered the bug | Correct |
| Single-caller unit test for a bug that needs multiple concurrent callers | Too shallow: false confidence |
| Unit test that cannot replicate the triggering chain (transaction, lifecycle, I/O ordering) | Too shallow: false confidence |

If no correct seam exists, the codebase architecture prevents locking the bug down. Record that as an architectural finding in the final report instead of writing a misleading test.

## Forced-Mutation Proof

When you force red by mutating code or a fixture, prove the mutation landed before trusting the red: `git diff -- <file>` (or diff against a pristine copy) shows the intended change, and reverting it turns the test green.

## Root-Cause Fix vs Symptom Masking

| Defect Category | Symptom Masking (rejected) | Root-Cause Invariant Fix (required) |
| :--- | :--- | :--- |
| **Null / `DBNull` Crash** | Wrapping 200 lines in `try { ... } catch {}` and swallowing exceptions. | Validating boundary input at DTO/Mapper entry (`val == DBNull.Value ? null : ...`). |
| **UI Freeze / Deadlock** | Adding `Thread.Sleep(500)` or `Application.DoEvents()` to mask races. | Replacing `.Result`/`.Wait()` with `async/await` and `RunAfterShown` lifecycle. |
| **SQL Concurrency** | Retrying a corrupted non-transactional write 3 times in a loop. | Enforcing canonical lock ordering with `UPDLOCK, ROWLOCK` inside a transaction. |
| **Memory / Event Leak** | Forcing `GC.Collect()` on form close. | Unsubscribing events (`-=`) and cancelling `CancellationTokenSource` in `Dispose`. |
