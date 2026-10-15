---
name: AgenticLazyMinimalismProtocol
desc: Ponytail Minimalist Decision Ladder — YAGNI, standard library first, zero unrequested abstractions, and shortest working diff
rules: [R_CORE]
category: Agentic
---
# 🧘 Agentic Lazy Minimalism Protocol (Ponytail Decision Ladder)

**Goal:** Eradicate architectural over-engineering, speculative ceremony, and dependency bloat by enforcing the 7-Rung Ponytail Decision Ladder, standard-library reuse (`R_REUSE`), and minimum viable diff size while preserving 100% production safety.

---

## 1. Quantitative Minimalism & Anti-Bloat Invariants
| Minimalism Dimension | Mandatory Threshold | Violation Trigger |
| :--- | :--- | :--- |
| **Single-Implementation Interfaces** | $0$ speculative interfaces (unless required by DI/test boundary) | `IFooFactory`, `IAbstractHelperProvider` with 1 class |
| **Pass-Through Wrapper Layers** | $0$ zero-logic delegation classes | Class that only forwards arguments to another service |
| **External Package Additions** | $0$ new packages for $< 50$ LOC standard-library tasks | Adding `lodash`/`moment` when native `Array`/`Intl` suffices |
| **Diff Line Budget** | Minimum viable LOC to solve root cause | Unsolicited formatting or rewriting unrelated functions |
| **Nesting Depth Ceiling** | $\le 3$ indentation levels per method | Guard clauses (`if (!valid) return;`) over arrow anti-pattern |

---

## 2. The 7-Rung Ponytail Decision Ladder

Climb sequentially from Rung 1 to Rung 7 before writing a single line of code. **Stop at the lowest rung that completely solves the problem:**

```text
Rung 1: [YAGNI Gate]         ──► Does this feature/config need to exist at all? If speculative -> DELETE/SKIP.
Rung 2: [Codebase Reuse]     ──► Does a helper, extension, or DTO already exist in `Common/` or `Shared/`? -> REUSE IT.
Rung 3: [Standard Library]   ──► Does the runtime stdlib solve it (`Span<T>`, `LINQ`, `crypto.randomUUID`, `Intl`)? -> USE STDLIB.
Rung 4: [Platform Native]    ──► Can a SQL constraint (`UNIQUE`, `CHECK`), CSS rule, or HTML5 attribute enforce it? -> USE NATIVE.
Rung 5: [Installed Package]  ──► Does an already-installed library (`Dapper`, `Zod`, `CommunityToolkit`) cover it? -> USE EXISTING.
Rung 6: [Declarative 1-Liner]──► Can a pure expression or pattern match replace a multi-class hierarchy? -> WRITE EXPRESSION.
Rung 7: [Minimal Custom Code]──► Write the smallest, self-contained, strongly-typed production implementation.
```

---

## 3. Code Comparison: Ceremonial Over-Engineering vs Ponytail Minimalism

```csharp
// ❌ BAD: 45 lines of speculative Strategy + Factory + Interface ceremony for 3 static tax rates
public interface IShippingCostCalculationStrategy
{
    decimal Calculate(decimal weightKg);
}
public class StandardShippingStrategy : IShippingCostCalculationStrategy
{
    public decimal Calculate(decimal weightKg) => weightKg * 1.50m;
}
public class ExpressShippingStrategy : IShippingCostCalculationStrategy
{
    public decimal Calculate(decimal weightKg) => weightKg * 3.25m + 10.00m;
}
public static class ShippingStrategyFactory
{
    public static IShippingCostCalculationStrategy Create(ShippingTier tier) => tier switch
    {
        ShippingTier.Standard => new StandardShippingStrategy(),
        ShippingTier.Express  => new ExpressShippingStrategy(),
        _ => throw new NotSupportedException()
    };
}

// ✅ GOOD: Rung 6 Declarative Pattern Matching — 0 heap allocations, 10 lines, 100% exhaustive and testable
public static decimal CalculateShippingCost(ShippingTier tier, decimal weightKg)
{
    ArgumentOutOfRangeException.ThrowIfNegative(weightKg);
    return tier switch
    {
        ShippingTier.Pickup   => 0.00m,
        ShippingTier.Standard => Math.Round(weightKg * 1.50m, 2, MidpointRounding.ToEven),
        ShippingTier.Express  => Math.Round(weightKg * 3.25m + 10.00m, 2, MidpointRounding.ToEven),
        _ => throw new ArgumentOutOfRangeException(nameof(tier), tier, "Unsupported shipping tier.")
    };
}
```

---

## 4. "Lazy $\neq$ Negligent" Non-Negotiable Safety Floor
Minimalism strips **accidental complexity** (ceremony, wrappers, dead flags), NEVER **essential safety**:
- Never omit parameter validation (`ArgumentNullException.ThrowIfNull`), parameterized SQL, `CancellationToken` forwarding, or `IDisposable` cleanup in the name of brevity.
- When reviewing code for minimalism, tag actionable reductions using:
  - `delete:` Remove dead code, unused parameters, or unreferenced feature flags.
  - `stdlib:` Replace custom string/date/collection helpers with built-in runtime APIs (`R_REUSE`).
  - `native:` Push validation or uniqueness guarantees down to SQL constraints or Zod schemas.
  - `shrink:` Collapse nested `if/else` trees into flat guard clauses or switch expressions.

