---
name: CsharpCancellationTokenPropagation
desc: End-to-end propagation of CancellationToken through ASP.NET Core Web API, Application Services, and Dapper/EF Core
rules: [R_CS, R_API]
category: CSharp
---
# ⏳ C# End-to-End CancellationToken Propagation Protocol

**Goal:** Guarantee immediate, cooperative termination of database queries, outbound HTTP requests, and CPU loops when a client disconnects, a desktop form closes, or an SLA timeout expires, preventing thread-pool and connection-pool exhaustion.

---

## 1. Quantitative Cancellation Invariants & Thresholds
| Cancellation Layer | Mandatory Contract | Violation Consequence |
| :--- | :--- | :--- |
| **Async Method Signatures** | $100\%$ of `*Async` methods accept `CancellationToken ct = default` as final param | Compiler warning `CA1068` / broken cancellation chain |
| **Dapper SQL Execution** | $100\%$ wrapped in `new CommandDefinition(..., cancellationToken: ct)` | Orphaned SQL queries continue burning DB CPU after client aborts |
| **EF Core / HttpClient Calls** | Pass `ct` to `ToListAsync(ct)`, `SaveChangesAsync(ct)`, `GetAsync(url, ct)` | Socket & connection pool starvation under load spikes |
| **Compute Loops ($> 1,000$ iter)** | Call `ct.ThrowIfCancellationRequested()` every $256\text{–}1,000$ iterations | Unresponsive background workers |
| **`OperationCanceledException`** | Never log client-initiated cancellation as `LogError` (`500`) | False-positive PagerDuty alerts; map to HTTP `499` / silent UI abort |

---

## 2. End-to-End Propagation & Linked Timeout Architecture

```text
[ASP.NET RequestAborted / WinForms FormClosed Token]
                         │
                         ▼
[Linked SLA Timeout: CancellationTokenSource.CreateLinkedTokenSource(callerCt)]
                         │
                         ▼
[Application Service: ct.ThrowIfCancellationRequested()]
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
[Dapper CommandDefinition(ct)]   [HttpClient.SendAsync(req, ct)]
```

### Composing Caller Cancellation with Hard SLA Timeouts
Never rely solely on the client's `HttpContext.RequestAborted` token if a downstream dependency hangs indefinitely. Combine the caller token with an explicit SLA timeout using `CreateLinkedTokenSource`:

```csharp
// ❌ BAD: Drops CancellationToken at repository boundary and swallows OperationCanceledException as a 500 error
[HttpGet("valuation")]
public async Task<IActionResult> GetValuationBad(int warehouseId) // Missing CancellationToken parameter!
{
    try
    {
        // Dapper QueryAsync without CommandDefinition ignores cancellation!
        var rows = await _db.QueryAsync<ValuationDTO>(
            "EXEC sp_HeavyStockValuation @WarehouseId", new { WarehouseId = warehouseId });
        return Ok(rows);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Valuation failed"); // Logs noisy errors when user simply closes browser tab!
        return StatusCode(500);
    }
}

// ✅ GOOD: End-to-end token threading + Linked SLA Timeout + Dapper CommandDefinition + clean 499 handling
[HttpGet("valuation")]
public async Task<ActionResult<IReadOnlyList<ValuationDTO>>> GetValuationGoodAsync(
    [FromQuery] int warehouseId,
    CancellationToken requestAborted)
{
    using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(requestAborted);
    timeoutCts.CancelAfter(TimeSpan.FromSeconds(15)); // Hard 15s SLA ceiling

    try
    {
        var result = await _inventoryService.ComputeValuationAsync(warehouseId, timeoutCts.Token);
        return Ok(result);
    }
    catch (OperationCanceledException) when (requestAborted.IsCancellationRequested)
    {
        _logger.LogDebug("Client aborted valuation request for WarehouseId={WarehouseId}", warehouseId);
        return StatusCode(499); // Client Closed Request (non-error)
    }
    catch (OperationCanceledException)
    {
        _logger.LogWarning("Valuation SLA timeout (15s) exceeded for WarehouseId={WarehouseId}", warehouseId);
        return StatusCode(StatusCodes.Status504GatewayTimeout);
    }
}
```

---

## 3. Data Access & Non-Cancellable Critical Commit Sections
1. **Dapper `CommandDefinition`:** Always construct `new CommandDefinition(sql, parameters, transaction, commandTimeout, CommandType.Text, CommandFlags.Buffered, cancellationToken: ct)` and pass it to `QueryAsync`, `QueryFirstOrDefaultAsync`, `ExecuteAsync`, or `QueryMultipleAsync`.
2. **Protecting Post-Payment / Audit Commits:** Once an external non-reversible side effect (e.g., payment gateway capture) succeeds, pass `CancellationToken.None` to the final local audit/ledger `CommitAsync(CancellationToken.None)` so a last-millisecond client disconnect cannot leave the local ledger out of sync.

