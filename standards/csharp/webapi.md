---
desc: C# WebAPI Enterprise Standards — Vertical Slice, Cancellation & High Throughput
rules: [R_API, R_CS, R_UNIVERSE, R_RES]
---
# 🌐 C# WebAPI Enterprise Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Layer Separation** | `Controller -> Application Service -> Domain -> Repository` | `0` `DbContext`/SQL references inside Controllers |
| **Async Cancellation Propagation** | `100%` of async endpoints & repo methods accept `CancellationToken ct` | Roslyn `CA2016` & `MA0040` analyzers |
| **DI Captive Dependency Tolerance** | `0` `Scoped` or `Transient` services injected into `Singleton` | `ValidateScopes = true` & `ValidateOnBuild = true` |
| **Error Response Envelope** | `100%` RFC 7807 `ProblemDetails` via `IProblemDetailsService` + `IExceptionHandler` | `0` raw stack traces or SQL messages leaked |
| **Entity Exposure at Boundary** | `0` ORM/EF `DbSet` entities serialized in Request/Response payloads | Immutable `sealed record` Request/Response DTOs |

---

## 2. Clean 4-Layer Separation, DTO Isolation & `CancellationToken` Propagation

Controllers act strictly as HTTP transport adapters (`<= 20 lines` per action). Never inject `DbContext` into a Controller, never return EF Core entities directly (which risks circular JSON serialization, over-posting, and lazy-loading N+1 traps), and always thread `CancellationToken ct` from the action signature down to EF Core / Dapper queries so aborted client connections immediately cancel in-flight SQL execution.

```csharp
// ❌ BAD: Controller queries DbContext directly, leaks EF Entity, ignores CancellationToken, blocks on .Result
[ApiController]
[Route("api/v1/orders")]
public class OrdersControllerBad : ControllerBase
{
    private readonly AppDbContext _db; // Layer violation!
    public OrdersControllerBad(AppDbContext db) => _db = db;

    [HttpGet("{id:guid}")]
    public IActionResult GetOrder(Guid id)
    {
        var entity = _db.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id).Result; // Sync-over-async deadlock!
        return Ok(entity); // Exposes internal DB schema & navigation cycles!
    }
}

// ✅ GOOD: Thin Controller, immutable sealed record DTOs, end-to-end CancellationToken, AsNoTracking projection
public sealed record OrderDetailDto(Guid OrderId, string CustomerCode, decimal TotalAmount, DateTimeOffset CreatedAt);

[ApiController]
[Route("api/v1/orders")]
public sealed class OrdersControllerGood(IOrderApplicationService orderService) : ControllerBase
{
    [HttpGet("{id:guid}")]
    [ProducesResponseType<OrderDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        OrderDetailDto? dto = await orderService.GetOrderByIdAsync(id, ct);
        return dto is not null ? Ok(dto) : Problem(statusCode: StatusCodes.Status404NotFound, title: "Order not found");
    }
}
```

---

## 3. DI Lifetime Governance (Preventing Captive Dependencies)

Injecting a `Scoped` service (`DbContext`) into a `Singleton` traps the instance alive for the process lifetime, causing concurrent state corruption. Enable `ValidateScopes = true` and `ValidateOnBuild = true` at startup, and inject `IServiceScopeFactory` inside `BackgroundService` singletons:

```csharp
// ❌ BAD: Singleton BackgroundService directly injects Scoped DbContext -> concurrent state corruption!
public sealed class OutboxWorkerBad(AppDbContext db) : BackgroundService { /* ... */ }

// ✅ GOOD: Inject IServiceScopeFactory to create a fresh AsyncServiceScope per tick
public sealed class OutboxWorkerGood(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));
        while (await timer.WaitForNextTickAsync(stoppingToken).ConfigureAwait(false))
        {
            await using AsyncServiceScope scope = scopeFactory.CreateAsyncScope();
            var processor = scope.ServiceProvider.GetRequiredService<IOutboxBatchProcessor>();
            await processor.ProcessPendingBatchAsync(stoppingToken).ConfigureAwait(false);
        }
    }
}
```

---

## 4. RFC 7807 `IProblemDetailsService` & OWASP API Security

- **Unified Error Boundary:** Register `.AddProblemDetails()` and a global `IExceptionHandler` mapping domain exceptions (`NotFoundException` &rarr; `404`, `ConcurrencyException` &rarr; `409`, `ValidationException` &rarr; `422`) into RFC 7807 JSON payloads with `traceId`.
- **Anti-IDOR & Sovereignty:** Enforce `resource.TenantId == currentUser.TenantId` inside Application Services on every operation, and access cross-module data strictly via service contracts (`R_UNIVERSE`).
