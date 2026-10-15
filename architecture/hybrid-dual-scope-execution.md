---
name: HybridDualScopeExecutionArchitecture
desc: Hybrid DbScope pattern enabling the same core business service layer to run seamlessly across both Desktop clients and Web API
rules: [R_CORE, R_API, R_CS]
category: Architecture
---
# 🔄 Hybrid Dual-Scope Execution Architecture (Desktop & Web API)

**Goal:** Share 100% of the core domain and application service layer across stateful Desktop Clients (WinForms/WPF) and stateless Web APIs (ASP.NET Core) without exhausting database connection pools on desktop or breaking request-scoped transactions on web (`[R_CORE, R_API, R_CS]`).

---

## 1. Dual-Runtime Execution Invariants

| Execution Metric / Invariant | Desktop Client (WinForms / WPF) | Web API Host (ASP.NET Core) | Shared Service Contract |
| :--- | :--- | :--- | :--- |
| **Service DI Lifetime** | `Transient` or Form-bound instance | `Scoped` (Per HTTP Request) | Zero UI-thread or `HttpContext` coupling |
| **DbContext Lifetime** | Per-method (`10ms - 250ms` max) | Per-request (`Scoped` Unit-of-Work) | Controlled via `DbScope<TContext>` struct |
| **Connection Pool Lease** | Acquired on `new DbScope()`, closed on `Dispose()` | Acquired once per request, disposed by DI | Max idle lease `< 500ms` |
| **Nested Service Calls** | Joins ambient `AsyncLocal` scope or opens transient | Shares injected `Scoped` `DbContext` | Deterministic single `SaveChangesAsync` |

### Core Architectural Rules
1. **Zero Long-Lived Desktop `DbContext`:** Binding an EF Core `DbContext` to a WinForms `Form` or WPF `ViewModel` lifetime bloats change-tracking RAM and leaks TCP sockets. Desktop operations MUST open and dispose `DbContext` per unit of work.
2. **Ambient Scope Joining:** Nested calls (`OrderService` $\rightarrow$ `InventoryService`) MUST share the same `DbContext` and transaction across both Desktop (`AsyncLocal`) and Web API (`Scoped` DI).
3. **Ownership-Aware Disposal (`_ownsContext`):** Only the root transient creator disposes the `DbContext`; joined ambient scopes and Web API DI-injected contexts skip disposal inside inner `using` blocks.

---

## 2. Failure Modes & Anti-Patterns

- **Premature Inner Disposal in Web API:** Wrapping an injected `_dbContext` in a raw `using (var db = _injectedDb ?? CreateNew())` disposes the Web API's scoped `DbContext` inside the first helper method (`ObjectDisposedException`).
- **Torn Desktop Transactions:** Instantiating `new AppDbContext()` per repository method without ambient joining commits partial writes across separate connections.

---

## 3. Production Implementation: Ownership-Aware `DbScope<TContext>`

```csharp
// ❌ BAD: Disposes WebAPI Scoped DbContext early & breaks nested Desktop transactions!
public async Task ApproveBadAsync(long orderId, CancellationToken ct)
{
    using var db = _injectedDb ?? new AppDbContext();
    var order = await db.Orders.FindAsync([orderId], ct);
    order!.Approve();
    await db.SaveChangesAsync(ct);
}

// ✅ GOOD: Allocation-free struct joining WebAPI Scoped DI or Desktop AsyncLocal ambient scope
public readonly struct DbScope<TContext> : IAsyncDisposable, IDisposable where TContext : DbContext
{
    private static readonly AsyncLocal<TContext?> Ambient = new();
    private readonly bool _ownsContext;
    public TContext Db { get; }

    public DbScope(TContext? injected, Func<TContext> factory)
    {
        if (injected is not null) { Db = injected; _ownsContext = false; }
        else if (Ambient.Value is not null) { Db = Ambient.Value; _ownsContext = false; }
        else { Db = factory(); Ambient.Value = Db; _ownsContext = true; }
    }

    public void Dispose()
    {
        if (!_ownsContext) return;
        Ambient.Value = null;
        Db.Dispose();
    }

    public ValueTask DisposeAsync()
    {
        if (!_ownsContext) return ValueTask.CompletedTask;
        Ambient.Value = null;
        return Db.DisposeAsync();
    }
}

public sealed class OrderApplicationService(InventoryApplicationService inventory, AppDbContext? scopedDb = null)
{
    public async Task ApproveOrderAsync(long orderId, CancellationToken ct = default)
    {
        await using var scope = new DbScope<AppDbContext>(scopedDb, static () => AppDbContextFactory.Create());
        var order = await scope.Db.Orders.FirstOrDefaultAsync(x => x.Id == orderId, ct)
            ?? throw new KeyNotFoundException($"Order {orderId} not found.");

        order.Approve();
        // Automatically joins scope.Db via Ambient on Desktop or scopedDb on WebAPI
        await inventory.ReserveOrderLinesAsync(orderId, ct);
        await scope.Db.SaveChangesAsync(ct);
    }
}
```
