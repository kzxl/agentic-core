---
name: CsharpHybridDbScopePattern
desc: Concrete C# implementation of the DbScope struct and Dual-Constructor service pattern for hybrid Desktop & WebAPI applications
rules: [R_CS, R_API, R_DB]
category: CSharp
---
# 🔌 C# Hybrid DbScope Implementation Pattern

**Goal:** Implement the `DbScope` helper struct and dual-constructor service pattern in C# to support seamless execution across WinForms desktop clients and ASP.NET Web APIs.

---

## 1. DbScope Helper Struct

```csharp
public struct DbScope : IDisposable
{
    private readonly bool _ownsContext;
    public AppDbContext Db { get; }

    public DbScope(AppDbContext injectedContext = null)
    {
        if (injectedContext != null)
        {
            // Web API mode: Reuse injected per-request context
            Db = injectedContext;
            _ownsContext = false;
        }
        else
        {
            // Desktop WinForms mode: Create fresh short-lived context
            Db = AppDbContext.New();
            _ownsContext = true;
        }
    }

    public void Dispose()
    {
        if (_ownsContext && Db != null)
        {
            Db.Dispose();
        }
    }
}
```

---

## 2. Dual-Constructor Application Service

```csharp
public partial class StockReturnAppService : IStockReturnAppService
{
    private readonly AppDbContext _db;

    // 1. Parameterless Constructor: Used by WinForms Client & Local Tests
    public StockReturnAppService()
    {
        _db = null;
    }

    // 2. Injected Constructor: Used by Web API / DI Container
    public StockReturnAppService(AppDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<StockReturnDTO> GetByIdAsync(int id)
    {
        using (var scope = new DbScope(_db))
        {
            var db = scope.Db;
            var entity = await db.StockReturns
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null) return null;
            return entity.ToDTO();
        }
    }
}
```

---

## 3. Strict Rules
- NEVER store `DbScope` in a class-level field; always instantiate with `using (var scope = new DbScope(_db))`.
- WinForms client `Program.cs` must NEVER register `AppDbContext` as a long-lived singleton in the DI container.
