---
name: CsharpCancellationTokenPropagation
desc: End-to-end propagation of CancellationToken through ASP.NET Core Web API, Application Services, and Dapper/EF Core
rules: [R_CS, R_API]
category: CSharp
---
# ⏳ C# CancellationToken Propagation Pattern

**Goal:** Allow database queries and long-running background calculations to terminate immediately when an HTTP request is aborted by the client (browser tab closed, timeout, user navigation), freeing up server threads and database connections.

---

## 1. End-to-End Propagation Flow

```csharp
// 1. Controller Layer: Receive token from ASP.NET runtime
[HttpGet("stock-summary")]
public async Task<IActionResult> GetStockSummary(
    [FromQuery] StockSummaryFilterDTO filter,
    CancellationToken cancellationToken)
{
    var result = await _inventoryService.GetStockSummaryAsync(filter, cancellationToken);
    return Ok(result);
}

// 2. Service Layer: Pass token to repositories and check for cancellation
public async Task<List<StockSummaryDTO>> GetStockSummaryAsync(
    StockSummaryFilterDTO filter,
    CancellationToken cancellationToken = default)
{
    cancellationToken.ThrowIfCancellationRequested();
    return await _repository.QueryStockSummaryAsync(filter, cancellationToken);
}

// 3. Data Access Layer (Dapper / SQL): Pass CommandDefinition with CancellationToken
public async Task<List<StockSummaryDTO>> QueryStockSummaryAsync(
    StockSummaryFilterDTO filter,
    CancellationToken cancellationToken)
{
    const string sql = "SELECT * FROM StockSummaries WHERE WarehouseId = @WarehouseId";
    
    using (var connection = CreateConnection())
    {
        var command = new CommandDefinition(
            sql,
            new { filter.WarehouseId },
            cancellationToken: cancellationToken
        );

        var items = await connection.QueryAsync<StockSummaryDTO>(command);
        return items.AsList();
    }
}
```

---

## 2. Best Practices
- Every asynchronous method signature taking `Task` MUST accept `CancellationToken cancellationToken = default` as its last parameter.
- Pass `CommandDefinition` when using Dapper to propagate tokens directly to the SQL Server connection.
