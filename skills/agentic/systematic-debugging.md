---
name: AgenticSystematicDebugging
desc: Scientific 5-step debugging methodology (Reproduce, Isolate, Hypothesize, Verify, Prevent) for complex production issues
rules: [R_CORE]
category: Agentic
---
# 🔬 Agentic Systematic Debugging Protocol

**Goal:** Resolve complex production bugs, concurrency race conditions, memory leaks, and state corruption through a deterministic 5-step Scientific Method rather than speculative trial-and-error edits.

---

## 1. Quantitative Debugging Invariants & Thresholds
| Metric / Constraint | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Unverified Code Edits** | $0$ edits before reproduction & hypothesis | Mandatory minimal reproducer or failing test before touching target code |
| **Max Identical Retry Loops** | $\le 1$ attempt per hypothesis | Log falsified hypotheses in Working Memory (`R_STATE`); never repeat failed edits |
| **Bisect / Isolation Granularity** | Pinpoint exact file, line, and state transition | Binary-search pipeline stages ($O(\log N)$ isolation) |
| **Symptom Masking (`catch {}`)** | $0$ silent exception swallowers | Fix root invariant violation; preserve exception causality chain |
| **Regression Guard** | $\ge 1$ automated test asserting exact failure mode | Test must fail (`RED`) before fix and pass (`GREEN`) after fix |

---

## 2. The 5-Step Scientific Root-Cause Isolation Protocol

```text
[1. SYMPTOM CAPTURE]    ──► Record exact stack trace, HTTP payload, SQL params, and environment state
                                │
[2. MINIMAL REPRODUCER] ──► Construct a deterministic failing test or script that triggers the bug 100% of the time
                                │
[3. HYPOTHESIS LOG]     ──► State a falsifiable causal claim ("Line 84 throws NullRef when DiscountTier is null")
                                │
[4. BISECT & INSTRUMENT]──► Halve the execution pipeline or inspect runtime state to prove/falsify the hypothesis
                                │
[5. INVARIANT FIX & TEST]──► Apply minimal root-cause fix, remove temp probes, and lock in regression test
```

### Step 1: Exact Symptom & Telemetry Capture
- Capture the verbatim compiler error, unhandled exception stack trace, HTTP status body, or database deadlock graph (`Error 1205`). Never paraphrase error messages.
- Record boundary inputs (`null`, empty array `[]`, timezone offset, concurrent user count) present at the time of failure.

### Step 2: Minimal Deterministic Reproducer
- Author a standalone unit/integration test (`xUnit`, `pytest`, `vitest`) or CLI reproduction command that triggers the exact defect on demand.
- If a bug is intermittent (race condition), use barrier synchronization (`Task.WhenAll`, `CountdownEvent`) to force deterministic collision.

### Step 3: Falsifiable Hypothesis Log
- Formulate an explicit hypothesis connecting **Trigger Input $\to$ Faulty Code Path $\to$ Observed Failure**.
- Maintain an anti-loop log when investigating multi-factor bugs:
  ```markdown
  - Hypothesis 1: Redis TTL expiration returns null payload -> Falsified (Payload is present, but `unitPrice` is string `"12.50"` instead of number).
  - Hypothesis 2: Unvalidated JSON deserialization coerces numeric string into NaN during tax multiply -> Verified at `InvoiceCalculator.ts:47`.
  ```

### Step 4: Binary Search / Bisect Instrumentation
- For multi-stage pipelines (Middleware $\to$ Validator $\to$ Service $\to$ SQLTrigger $\to$ Serializer), bisect the call graph at the midpoint and inspect intermediate state payloads rather than reading files sequentially.

### Step 5: Root-Cause Fix & Regression Lock
- Fix the underlying invariant violation at the source rather than scattering defensive Band-Aids across downstream consumers.

---

## 3. Code Comparison: Symptom Masking vs Root-Cause Invariant Fix

```csharp
// ❌ BAD: Speculative symptom masking (swallows exception and returns corrupted 0 balance)
public async Task<decimal> GetAvailableCreditAsync(int customerId, CancellationToken ct)
{
    try
    {
        var account = await _repo.GetAccountAsync(customerId, ct);
        return account.CreditLimit - account.CurrentExposure.Value;
    }
    catch (Exception)
    {
        // Masks NullReferenceException when CurrentExposure is null OR when DB times out!
        return 0m;
    }
}

// ✅ GOOD: Root-cause fix addressing nullable domain state while letting transient DB errors surface
public async Task<decimal> GetAvailableCreditAsync(int customerId, CancellationToken ct)
{
    var account = await _repo.GetAccountAsync(customerId, ct)
        ?? throw new CustomerNotFoundException(customerId);

    decimal exposure = account.CurrentExposure ?? 0m;
    return Math.Max(0m, account.CreditLimit - exposure);
}
```

