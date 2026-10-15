---
name: bugfix-investigation
description: Systematic 5-step scientific bug reproduction, isolation, root-cause fix, regression testing, and post-harvest workflow.
desc: Systematic 5-step scientific bug reproduction, isolation, root-cause fix, regression testing, and post-harvest workflow.
rules: [R_CORE, R_TDD, R_PROOF, R_RES_MEM]
---

# 🔬 Systematic Bugfix & Root-Cause Investigation Workflow

**Goal:** Diagnose and resolve production defects, race conditions, memory leaks, SQL deadlocks, and UI crashes using the 5-step scientific method (`DBG`), falsifiable hypotheses (`H0`/`H1`), and deterministic reproduction tests (`R_TDD`, `R_PROOF`).

---

## 1. The 5-Step Scientific Debugging Pipeline

```text
[1. Symptom & PRE-Fetch] ──► [2. Failing Repro Test (Red)] ──► [3. Hypothesis Probe (H0/H1)]
                                                                            │
[5. Full Suite, Commit & Harvest] ◄── [4. Blast-Radius Scan (`rg`) & Root-Cause Fix (Green)]
```

---

## 2. Step-by-Step Investigation Protocol

### Step 1: Symptom Normalization & Past Incident PRE-Fetch (`R_RES_MEM`)
1. **Normalize Symptom (`NORM`):** `[NORM] FIX @<Domain>.<Feature> | <Exception / Input State> | [DBG, BLAST, TDD]`
2. **Query Historical Incident Memory:**
   // turbo
   ```bash
   node E:\16. AgentOption\tools\brain.js pre "<Exact Error Message or Exception>" --tags=<domain>,bug
   ```

### Step 2: Deterministic Reproduction & Epistemic Gate (`R_EPISTEMIC`, `R_TDD`)
1. **Epistemic Uncertainty Gate:** When codebase familiarity is low or the defect is intermittent (race condition, GC finalizer, network jitter), **strictly forbid** modifying production logic until diagnostic instrumentation or a reproduction test confirms the failure path.
2. **Write Reproduction Test (Red Phase):** Feed the exact boundary input (`null`, `DBNull.Value`, empty list, concurrent tasks, expired token) that triggers the defect:
   ```bash
   dotnet test --filter "FullyQualifiedName~<BugReproTest>"   # C# .NET
   node --test tests/<repro>.test.js                          # Node.js
   pytest -k "<test>" | cargo test <test> | go test -run <T>  # Python / Rust / Go
   ```

### Step 3: Formulate Falsifiable Hypotheses (`H0` vs `H1`)
Log an explicit hypothesis matrix (`R_STATE`) and trace data flow backward from the crash site to the first corrupted state boundary:

| ID | Postulated Mechanism | Falsification / Verification Probe | Verdict |
| :--- | :--- | :--- | :---: |
| **$H_1$** | `CommitStockAsync` deadlocks because `StockLedger` is locked before `WarehouseBalance` (reverse order vs `ReserveStockAsync`). | Compare SQL lock acquisition order across both methods and inspect deadlock graph. | **CONFIRMED** |
| **$H_0$** | Timeout is caused by missing index on `StockLedger.LotNumber`. | Execution plan confirms `IX_StockLedger_LotNumber` index seek in $< 1\text{ms}$. | **REFUTED** |

> **2-Strike Pivot Rule (`R_DEAD_LOOP`):** If 2 consecutive fix attempts fail to turn the reproduction test Green, immediately `git checkout -- <file>`, mark the hypothesis `REFUTED`, and re-instrument the call chain. Never stack speculative patches on top of a failed fix.

---

### Step 4: Root-Cause Invariant Fix & Blast-Radius Scan (`BLAST`)
1. **Blast-Radius Caller Scan:** Before changing any method signature, shared query, or DTO property, grep all callers:
   // turbo
   ```bash
   rg "\b<TargetMethodOrProperty>\b"
   ```
2. **Enforce Root-Cause Fix over Symptom Suppression:**

| Defect Category | ❌ BAD: Symptom Masking (Forbidden) | ✅ GOOD: Root-Cause Invariant Fix (Mandatory) |
| :--- | :--- | :--- |
| **Null / `DBNull` Crash** | Wrapping 200 lines in `try { ... } catch {}` and swallowing exceptions. | Validating boundary input at DTO/Mapper entry (`val == DBNull.Value ? null : ...`). |
| **UI Freeze / Deadlock** | Adding `Thread.Sleep(500)` or `Application.DoEvents()` to mask races. | Replacing `.Result`/`.Wait()` with `async/await` and `RunAfterShown` lifecycle. |
| **SQL Concurrency** | Retrying a corrupted non-transactional write 3 times in a loop. | Enforcing canonical lock ordering with `UPDLOCK, ROWLOCK` inside a transaction. |
| **Memory / Event Leak** | Forcing `GC.Collect()` on form close. | Unsubscribing events (`-=`) and cancelling `CancellationTokenSource` in `Dispose`. |

---

### Step 5: Regression Proof, Atomic Commit & POST-Harvest
1. **Verify Red $\to$ Green Transition:** Re-run the reproduction test and full module test suite (`0` errors, `0` warnings).
2. **Atomic Commit (`R_GIT`) & POST-Harvest (`R_RES_MEM`):**
   ```bash
   node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "fix(<domain>): resolve <symptom> by enforcing <invariant>" <files...>
   node E:\16. AgentOption\tools\brain.js post "[Symptom: <Error>] | [Root Cause: <Broken Invariant>] | [Fix: <Solution & Repro Test>]" --tags=<domain>,bug
   ```


