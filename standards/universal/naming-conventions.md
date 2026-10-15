---
desc: Universal multi-language casing, DTO and UI control naming rules
rules: [R_CORE]
---
# 🏷️ Universal Cross-Language Naming Conventions Standard

## 1. Cross-Language Identifier Casing Matrix
All symbols across polyglot repositories MUST strictly conform to the casing matrix below. Mixing language idioms (e.g., `snake_case` methods in C# or `PascalCase` variables in Rust/Python) is prohibited:

| Construct / Symbol | C# / .NET | TypeScript / React | Python 3.10+ | Rust / C11 |
| :--- | :--- | :--- | :--- | :--- |
| **Classes / Structs / Types** | `PascalCase` | `PascalCase` | `PascalCase` | `PascalCase` / `snake_t` (C) |
| **Interfaces / Traits** | `IPascalCase` | `PascalCase` (no `I`) | `PascalCase` (`Protocol`) | `PascalCase` |
| **Public Methods / Functions** | `PascalCase` | `camelCase` | `snake_case` | `snake_case` |
| **Async Functions / Methods** | `*Async` (`SaveAsync`) | `camelCase` | `snake_case` | `snake_case` |
| **Properties / Struct Fields** | `PascalCase` | `camelCase` | `snake_case` | `snake_case` |
| **Local Variables & Params** | `camelCase` | `camelCase` | `snake_case` | `snake_case` |
| **Private Instance Fields** | `_camelCase` | `#camelCase` / `camelCase` | `_snake_case` | `snake_case` |
| **Compile-Time Constants** | `PascalCase` | `SCREAMING_SNAKE` | `SCREAMING_SNAKE` | `SCREAMING_SNAKE` |
| **Files & Directories** | `PascalCase.cs` | `kebab-case.ts` / `Pascal.tsx` | `snake_case.py` | `snake_case.rs` |

---

## 2. Semantic Precision & Banned Vague Identifiers
- **Zero Ambiguity Rule:** Identifiers must express domain intent, unit of measure, and lifecycle state. Single-letter names are prohibited outside $\le 5$-line numeric loop indices (`i`, `j`) or standard coordinates (`x`, `y`).
- **Strictly Banned Tokens:** Never name variables, parameters, or classes `data`, `info`, `temp`, `tmp`, `val`, `obj`, `ret`, `flag`, `helper`, `manager2`, or `handle2`.
- **Boolean Predicate Prefixes:** Every `bool` variable, property, or function returning a boolean MUST begin with an auxiliary modal prefix:
  - `Is*` (`IsAuthorized`, `IsDisposed`, `IsVirtualizing`)
  - `Has*` (`HasPendingChanges`, `HasUncommittedLines`)
  - `Can*` (`CanApproveOrder`, `CanRetry`)
  - `Should*` (`ShouldInvalidateCache`, `ShouldCompressPayload`)
- **Unit-Suffixed Configuration Constants:** Any numeric constant or configuration property representing time, byte size, rate, or capacity MUST append its explicit physical unit (`TimeoutMs`, `RetryDelaySeconds`, `MaxPayloadBytes`, `BatchSizeLimit`).

```csharp
// ❌ BAD: Vague identifiers, unitless magic numbers, and missing Async/boolean conventions
public class DataHelper
{
    public const int Timeout = 30; // 30 milliseconds, seconds, or minutes?
    public bool Flag { get; set; } // What does true mean?
    public async Task<List<Order>> Process(List<Order> data, int val) { ... }
}

// ✅ GOOD: Domain-precise identifiers, explicit physical units, boolean prefix, and *Async contract
public sealed class OrderFulfillmentValidator
{
    public const int LockAcquisitionTimeoutMs = 30_000;
    public const int MaxBatchLineCount = 500;

    public bool IsEligibleForExpressDispatch { get; init; }

    public async Task<IReadOnlyList<ValidatedOrderDTO>> ValidatePendingOrdersAsync(
        IReadOnlyList<PendingOrderDTO> pendingOrders,
        int warehouseId,
        CancellationToken cancellationToken) { ... }
}
```

---

## 3. Enterprise DTO & Contract Suffix Taxonomy
Never share a single mutable entity class across database persistence, grid listing, and mutation payloads. Suffix DTOs by their exact directional role:
- **List / Table Row Projection:** `<Feature>GridItemDTO` or `<Feature>ListItemDTO` (lightweight flat projection for table views).
- **Full Detail View:** `<Feature>DetailDTO` (complete aggregate read model for editor forms).
- **Write / Command Payload:** `<Feature>CreateRequest`, `<Feature>UpdateRequest`, or `<Feature>SaveRequest`.
- **Lightweight Key-Value Dropdown:** `<Feature>LookupDTO` (`Id`, `Code`, `DisplayName`).
- **Print / Export Model:** `<Feature>ReportDTO`.

---

## 4. Desktop UI Control Prefixes (WinForms / WPF XAML)
When naming interactive controls in desktop views, use deterministic 3-letter prefixes so event handlers (`btnApprove_Click`, `lkeWarehouse_EditValueChanged`) are immediately self-documenting:
- **Buttons:** `btnSave`, `btnApprove`, `btnReject`, `btnExportExcel`
- **Text Inputs:** `txtDocumentNo`, `txtCustomerCode`, `mmeRemarks` (`MemoEdit`)
- **Numeric & Date Inputs:** `spnQuantity` (`SpinEdit`), `dtePostingDate` (`DateEdit`)
- **Selectors & Lookups:** `cboStatus` (`ComboBox`), `lkeWarehouse` (`LookUpEdit`), `slkProduct` (`SearchLookUpEdit`)
- **Grids & Containers:** `gcOrders` (`GridControl`), `gvOrders` (`GridView`), `grpFilterHeader` (`GroupControl`)

