---
name: CsharpHybridDbScopePattern
desc: Concrete C# implementation of the DbScope struct and Dual-Constructor service pattern for hybrid Desktop & WebAPI applications.
rules: [R_CS, R_API, R_DB]
category: CSharp
---
# 🔌 C# Hybrid `DbScope` & Dual-Constructor Service Pattern

**Goal:** Enable Application Services to execute identically across stateful WinForms desktop clients (short-lived per-operation `DbContext`/`SqlConnection`) and stateless ASP.NET Core WebAPIs (DI-scoped unit-of-work) with zero connection leaks or captive dependency bugs.

---

## 1. Quantitative Lifecycle Invariants & Safety Thresholds
| Lifecycle Dimension | WinForms Desktop Mode | ASP.NET Core WebAPI Mode |
| :--- | :--- | :--- |
| **Service Instantiation** | Parameterless `new XAppService()` or transient factory | DI Container `AddScoped<IXAppService, XAppService>()` |
| **`AppDbContext` Ownership** | Created per method via `DbScope` (`_ownsContext = true`) | Injected per HTTP request (`_ownsContext = false`) |
| **Disposal Responsibility** | `DbScope.Dispose()` immediately closes connection | DI Request Scope disposes at end of HTTP pipeline |
| **Max Connection Hold Time** | Duration of single method call ($\le 200\text{ ms}$) | Duration of HTTP request ($\le 500\text{ ms}$) |
| **Long-Lived Field Storage** | $0$ `DbScope` fields (enforced by `readonly ref struct` / `IDisposable`) | $0$ Singleton services holding `AppDbContext` |

---

## 2. The Hybrid `DbScope` Implementation (`IDisposable` / `IAsyncDisposable`)

To support both synchronous and `async/await` methods in C#, implement `DbScope` as a lightweight `readonly struct` implementing `IDisposable` and `IAsyncDisposable` that tracks ownership via a boolean flag:

```csharp
// ❌ BAD: Disposing an injected DbContext inside a nested service call crashes downstream WebAPI middlewares!
public async Task<OrderDTO> GetOrderBadAsync(int id)
{
    using var db = _injectedDb ?? AppDbContext.New(); // BUG: Disposes _injectedDb prematurely!
    return await db.Orders.FindAsync(id);
}

// ✅ GOOD: Ownership-aware DbScope disposes ONLY when it created the context itself
public readonly struct DbScope : IDisposable, IAsyncDisposable
{
    private readonly bool _ownsContext;
    public AppDbContext Db { get; }

    public DbScope(AppDbContext? injectedContext = null)
    {
        if (injectedContext is not null)
        {
            Db = injectedContext;
            _ownsContext = false;
        }
        else
        {
            Db = AppDbContext.CreateShortLived();
            _ownsContext = true;
        }
    }

    public void Dispose()
    {
        if (_ownsContext) Db?.Dispose();
    }

    public ValueTask DisposeAsync()
    {
        return _ownsContext && Db is not null ? Db.DisposeAsync() : ValueTask.CompletedTask;
    }
}
```

---

## 3. Dual-Constructor Application Service & Nested Transaction Participation

Pass `scope.Db` into downstream services so nested multi-service operations share one connection and transaction:

```csharp
public partial class StockReturnAppService : IStockReturnAppService
{
    private readonly AppDbContext? _injectedDb;

    // 1. Desktop WinForms Constructor: Creates short-lived context per operation via DbScope
    public StockReturnAppService() => _injectedDb = null;

    // 2. WebAPI DI & Shared-Transaction Constructor: Reuses caller/request context
    public StockReturnAppService(AppDbContext db)
    {
        ArgumentNullException.ThrowIfNull(db);
        _injectedDb = db;
    }

    public async Task<StockReturnDetailDTO?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        await using var scope = new DbScope(_injectedDb);
        return await scope.Db.StockReturns
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => x.ToDetailDTO())
            .FirstOrDefaultAsync(ct);
    }

    public async Task ApproveReturnAsync(int returnId, int userId, CancellationToken ct = default)
    {
        await using var scope = new DbScope(_injectedDb);
        await using var tx = await scope.Db.Database.BeginTransactionAsync(ct);

        var entity = await scope.Db.StockReturns.FirstOrDefaultAsync(x => x.Id == returnId, ct)
            ?? throw new KeyNotFoundException($"StockReturn {returnId} not found.");

        entity.MarkApproved(userId);
        var ledgerService = new InventoryLedgerAppService(scope.Db);
        await ledgerService.PostInboundReturnAsync(entity, ct);

        await scope.Db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }
}
```

---

## 4. Strict Architectural Prohibitions
- **Never Register `AppDbContext` as Form-Scoped in WinForms:** Long-lived desktop forms accumulate tracked entities in `ChangeTracker`, causing stale reads and memory leaks.
- **Always Use `AsNoTracking()` on Read Queries:** Disable change tracking on read projections to cut materialization latency by ~40%.
