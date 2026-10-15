---
name: AgenticAdversarialCodeReview
desc: Self-critique and adversarial code review protocol for AI agents before presenting completed work
rules: [R_CORE]
category: Agentic
---
# 🔍 Agentic Adversarial Code Review Protocol

**Goal:** Operate as a hostile, zero-trust principal code auditor against candidate diffs to trap concurrency races, N+1 queries, memory leaks, security boundary bypasses, and negative Net Engineering Value (`NEV <= 0`) before task completion.

---

## 1. Pre-Commit Adversarial Audit Matrix & Quantitative Gates
| Audit Dimension | Mandatory Invariant | Blocker Trigger (`P0` / `P1`) |
| :--- | :--- | :--- |
| **Net Engineering Value (`R_NEV`)** | $\text{NEV} > 0$; LOC inflation $\le +30\%$ | Speculative single-impl interfaces or wrapper bloat |
| **Concurrency & Race Safety** | $0$ unsynchronized shared mutations or TOCTOU gaps | Check-then-act without atomic lock / DB `UPDLOCK` |
| **I/O & Memory Efficiency** | $0$ N+1 loops; $100\%$ `IDisposable` / `AbortController` cleanup | SQL/HTTP call inside loop or unfreed event/stream |
| **Security Boundary** | $100\%$ parameterized SQL & RBAC/ownership check | String-interpolated SQL or missing tenant/user ID filter |
| **Backward Compatibility** | $0$ breaking public API / DTO contract changes | Renamed JSON property or removed method overload |

---

## 2. The 5-Stage Adversarial Audit Protocol

### Stage 1: Net Engineering Value (`NEV > 0`) Calculation
Evaluate whether the diff achieves a strict Pareto improvement:
$$\text{NEV} = (\Delta \text{Correctness} + \Delta \text{Performance}) - (\Delta \text{LOC Bloat} + \Delta \text{Indirection Depth})$$
- Reject any refactoring that introduces pass-through adapter classes, increases cyclomatic complexity, or inflates line count by $> 30\%$ without fixing a verified bug or improving latency.

### Stage 2: Concurrency, TOCTOU & Re-Entrancy Check
- **Time-of-Check to Time-of-Use (TOCTOU):** Verify that balance/stock checks and subsequent deductions occur inside a single atomic SQL statement or `UPDLOCK` transaction, never as separate read-then-write application calls.
- **UI Re-Entrancy:** Confirm button click and mutation handlers disable duplicate triggers or abort prior in-flight requests.

### Stage 3: N+1 Query & Resource Leak Inspection
- Scan every `for`, `foreach`, `.map()`, and `.Select()` block in the diff: if it awaits a database query, network call, or file read, flag an immediate **`P0` N+1 Blocker**.
- Verify that every `SqlConnection`, `FileStream`, `Timer`, `GCHandle`, and DOM listener has a deterministic `using` or cleanup path.

### Stage 4: Security Boundary & Tenant Isolation Audit
- Confirm all queries filter by the authenticated caller's `TenantId` / `UserId` to prevent Broken Object Level Authorization (BOLA/IDOR).
- Verify zero credentials, JWTs, or stack traces leak into API error responses.

---

## 3. Code Comparison: TOCTOU Race & N+1 Defect vs Adversarial Remediation

```csharp
// ❌ BAD: Fails Adversarial Audit (P0 TOCTOU Race Condition + P0 N+1 Query inside loop + Missing Tenant Check)
public async Task ApproveVouchersBadAsync(List<int> voucherIds)
{
    foreach (var id in voucherIds)
    {
        var v = await _db.QuerySingleAsync<Voucher>($"SELECT * FROM Vouchers WHERE Id = {id}"); // SQLi + N+1!
        if (v.Status == "PENDING") // TOCTOU Race: two concurrent requests both read "PENDING"!
        {
            await _db.ExecuteAsync("UPDATE Vouchers SET Status = 'APPROVED' WHERE Id = @Id", new { Id = id });
        }
    }
}

// ✅ GOOD: Passes Adversarial Audit (Single atomic set-based update, parameterized, tenant-scoped, idempotent)
public async Task<int> ApproveVouchersGoodAsync(
    IReadOnlyCollection<int> voucherIds,
    int tenantId,
    CancellationToken ct)
{
    if (voucherIds.Count == 0) return 0;

    const string sql = @"
        UPDATE tb_voucher
        SET Status = 'APPROVED',
            ApprovedAtUtc = SYSUTCDATETIME()
        WHERE TenantId = @TenantId
          AND Id IN @Ids
          AND Status = 'PENDING';";

    var cmd = new CommandDefinition(sql, new { TenantId = tenantId, Ids = voucherIds }, cancellationToken: ct);
    return await _db.ExecuteAsync(cmd);
}
```

---

## 4. Structured Review Verdict Output
- **`[APPROVE]`:** $0$ `P0`/`P1` defects, $\text{NEV} > 0$, compiler and test suite verified green.
- **`[REJECT & REMEDIATE]`:** Any `P0` (security/crash/corruption) or `P1` (N+1/leak/regression) finding detected; fix immediately before reporting completion.

