---
name: AgenticBlastRadiusAnalysis
desc: Pre-edit blast-radius grep analysis for shared classes, contracts, and core methods to prevent cascading regressions
rules: [R_CORE]
category: Agentic
---
# 💥 Agentic Blast-Radius Analysis Protocol

**Goal:** Quantify and contain the transitive dependency blast radius before modifying any shared method, interface, DTO contract, or database column, eliminating "fix one caller, break ten downstream consumers" regressions.

---

## 1. 3-Tier Modification Risk Classification Matrix
Before editing any symbol, classify its blast radius into one of three deterministic tiers:

| Risk Tier | Scope & Caller Count | Architectural Constraint | Mandatory Verification Gate |
| :--- | :--- | :--- | :--- |
| **Tier 1: Local Scope** | `private` method or internal helper with $1\text{–}2$ callers in the same feature folder | Safe to refactor signature or inline directly | Compile & run feature unit tests |
| **Tier 2: Cross-Module Shared** | $3\text{–}9$ callers across multiple services or UI views | **Preserve method signature & return contract**; fix logic internally | Audit every caller line via `rg`; run full test suite |
| **Tier 3: Public Contract / Schema** | $\ge 10$ callers, public REST DTO, `IEventBus` event, or SQL table column | **Additive-Only Evolution** (Overload / Optional param with default value) | Zero breaking change; dual-read/write migration |

---

## 2. Step-by-Step Pre-Edit Caller Discovery (`ripgrep` Protocol)

Execute a 3-pass `rg` scan before modifying any non-private symbol:

```powershell
# Pass 1: Direct symbol invocations, interface implementations, and reflection/nameof references (C#)
rg "(\bCalculateTaxAsync\b|nameof\(CalculateTaxAsync\))" --type cs

# Pass 2: TypeScript / React imports, prop bindings, and dynamic property accesses
rg "(\buseInventoryQuery\b|'useInventoryQuery'|\"useInventoryQuery\")" --type ts --type tsx

# Pass 3: Database column, stored procedure, or JSON wire-contract key across all tiers
rg "\bunit_discount_rate\b" --type sql --type cs --type ts
```

### Transitive Consumer Verification Checklist
For every caller discovered in Passes 1–3, verify:
1. **Nullability Contract:** Does the caller assume the return value is never `null` or empty?
2. **Exception Contract:** Does throwing a new exception type bypass caller `catch` blocks?
3. **Behavioral Ordering:** Does changing sort order or rounding precision break downstream pagination or financial reconciliation?
4. **Serialization Parity:** Are JSON field names (`[JsonPropertyName]`) and enum integer/string representations preserved?

---

## 3. Code Comparison: Breaking Signature Change vs Additive Overload Evolution

```csharp
// ❌ BAD: Tier 3 Breaking Change — Adding a required parameter breaks 24 existing callers across 6 modules
public interface IInvoiceTaxCalculator
{
    // Every existing caller of CalculateTax(amount, stateCode) now fails to compile!
    decimal CalculateTax(decimal subtotal, string stateCode, bool includeMunicipalSurcharge);
}

// ✅ GOOD: Additive Evolution — Preserve existing contract and introduce an explicit overload / default parameter
public interface IInvoiceTaxCalculator
{
    // Existing 24 callers continue compiling and executing with 100% behavioral parity
    decimal CalculateTax(decimal subtotal, string stateCode);

    // New callers opt into extended surcharge calculation explicitly
    decimal CalculateTax(decimal subtotal, string stateCode, TaxCalculationOptions options);
}

public sealed class InvoiceTaxCalculator : IInvoiceTaxCalculator
{
    public decimal CalculateTax(decimal subtotal, string stateCode)
        => CalculateTax(subtotal, stateCode, TaxCalculationOptions.Default);

    public decimal CalculateTax(decimal subtotal, string stateCode, TaxCalculationOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        decimal baseTax = ComputeStateTax(subtotal, stateCode);
        return options.IncludeMunicipalSurcharge
            ? baseTax + ComputeMunicipalSurcharge(subtotal, stateCode)
            : baseTax;
    }
}
```

---

## 4. The 3 Immutable Blast-Radius Invariants
1. **Fix-at-Root Over Caller Scattering:** A single defensive normalization inside the shared utility is strictly superior to copy-pasting `if (x != null)` across 12 caller sites.
2. **Dead-Code Pruning (`0` Callers):** If `rg` confirms $0$ code, reflection, or external route references, delete the dead symbol rather than maintaining unused code.
3. **Full-Solution Build Proof:** Any edit to a Tier 2 or Tier 3 symbol MUST be followed immediately by a full solution build (`dotnet build` / `tsc --noEmit`) with $0$ errors.

