---
desc: Conformance Testing Standard — Verify module isolation and behavioral parity
rules: [R_UNIVERSE, R_CORE]
---
# 🧪 Universal Conformance & Behavioral Parity Testing Standard

## 1. Conformance Verification Matrix & Quantitative Gates
| Verification Gate | Mandatory Metric / Invariant | Failure Consequence |
| :--- | :--- | :--- |
| **Behavioral Parity (Refactoring)** | $100\%$ identical output & state delta across golden inputs | Immediate rollback of refactoring (`R_NEV`) |
| **Module Deletion Independence** | Host compiles (`exit code 0`) when any single feature folder is removed | Architecture violation (`R_UNIVERSE` hard fail) |
| **Data Sovereignty (`rg` Audit)** | $0$ cross-module SQL table or internal DTO references | Reject PR; route via `IEventBus` or Contract |
| **Boundary & Fault Injection** | $100\%$ deterministic handling of `null`, empty, timeout, & cancellation | Block release until edge cases pass |
| **Test Determinism** | $0$ flaky tests across $10$ consecutive parallel runs (`--repeat 10`) | Quarantine and eliminate clock/network coupling |

---

## 2. Behavioral Parity & Golden Characterization Testing
- **Refactoring Invariant:** Before decomposing a legacy service, controller, or calculation kernel, capture its exact input-to-output behavior using a **Characterization / Golden Snapshot Test**.
- **Shadow Parity Verification:** Run both the legacy implementation and the refactored implementation against the same deterministic corpus (normal records, zero-quantity rows, rounding boundaries, null optionals) and assert deep structural equality plus zero performance regression.

```csharp
// ❌ BAD: Refactoring complex pricing logic and only testing a single happy-path scalar
[Fact]
public void CalculateInvoice_ReturnsPositiveTotal()
{
    var result = _newPricingService.Calculate(SampleInvoice());
    Assert.True(result.GrandTotal > 0); // Misses rounding drift, tax tiers, and discount edge cases!
}

// ✅ GOOD: Deterministic Golden Parity Test comparing legacy vs refactored outputs across boundary corpus
[Theory]
[MemberData(nameof(PricingGoldenCorpus.GetTestCases), MemberType = typeof(PricingGoldenCorpus))]
public void CalculateInvoice_MatchesLegacyGoldenBehavior(InvoiceInput input)
{
    var expected = _legacyPricingEngine.Calculate(input);
    var actual = _refactoredPricingEngine.Calculate(input);

    Assert.Equal(expected.Subtotal, actual.Subtotal);
    Assert.Equal(expected.TaxAmount, actual.TaxAmount);
    Assert.Equal(expected.DiscountAmount, actual.DiscountAmount);
    Assert.Equal(expected.GrandTotal, actual.GrandTotal);
    Assert.Equal(expected.AppliedRuleCodes, actual.AppliedRuleCodes);
}
```

---

## 3. Module Deletion Compilation Independence (`R_UNIVERSE`)
- **Zero Direct Coupling Rule:** In a Universe Plugin / Folder-per-Feature architecture, every feature module under `Features/<ModuleName>/` must be self-contained. Deleting or renaming any single module directory MUST NOT break host compilation.
- **EventBus & Contract Conformance:** Verify that:
  1. **Registry Core:** Registering a module capability and dispatching a command yields the expected contract output; unregistering returns a clean `CapabilityNotFound` result without throwing unhandled null exceptions.
  2. **EventBus Lifecycle:** Subscribing a handler receives published events; unsubscribing guarantees $0$ subsequent invocations and $0$ leaked delegate references.

```powershell
# Automated CI Module Isolation Gate (PowerShell)
$features = Get-ChildItem "Features/" -Directory
foreach ($f in $features) {
    $backup = "$($f.FullName).bak"
    Rename-Item $f.FullName $backup
    try {
        $output = dotnet build --no-restore 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "MODULE ISOLATION FAILURE: Deleting '$($f.Name)' broke host compilation!`n$output"
        }
    }
    finally {
        if (Test-Path $backup) { Rename-Item $backup $f.FullName }
    }
}
```

---

## 4. Data Sovereignty & Boundary Fault-Injection Testing
- **Static Sovereignty Gate:** Enforce zero cross-module table access in CI using `ripgrep`:
  ```powershell
  # Verify Sales module never queries Inventory tables directly (must return 0 matches)
  rg "tb_inventory_" Features/Sales/ --type cs
  if ($LASTEXITCODE -eq 0) { Write-Error "DATA SOVEREIGNTY VIOLATION DETECTED" }
  ```
- **Deterministic Boundary & Fault Injection:** Every service contract test suite MUST include explicit assertions for:
  1. **Boundary Cardinalities:** Empty collection (`[]`), single element (`[1]`), exact batch boundary (`1000`), and off-by-one (`1001`).
  2. **Numeric Extremes:** `0`, `-1`, `decimal.MaxValue`, `NaN`/`Infinity` (for floating-point kernels), and currency half-even rounding (`MidpointRounding.ToEven`).
  3. **Fault & Cancellation Injection:** Pre-canceled `CancellationToken(canceled: true)`, simulated transient DB deadlock (`SqlException` error `1205`), and downstream timeout recovery.

