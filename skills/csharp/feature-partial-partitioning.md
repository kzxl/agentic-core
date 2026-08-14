---
name: CsharpFeaturePartialPartitioning
desc: 1-to-1 partial class partitioning standard across DTOs, Services, and Controllers (Action, Query, Lookup, Utils, Validator)
rules: [R_CS, R_API]
category: CSharp
---
# 📑 C# Feature 1-to-1 Partial Class Partitioning Standard

**Goal:** Break large monolithic classes into maintainable, focused partial class files where DTOs, Services, and Controllers mirror each other 1-to-1 by functional responsibility.

---

## 1. The 1-to-1 Mapping Matrix

| Responsibility Group | Suffix | DTO File | Service Partial File | Controller Partial File |
| :--- | :--- | :--- | :--- | :--- |
| **Mutations / State Change** | `.Action` | `<Feature>ActionDTO.cs` | `<Feature>AppService.Action.cs` | `<Feature>Controller.Action.cs` |
| **Queries / Reads** | `.Query` | `<Feature>QueryDTO.cs` | `<Feature>AppService.Query.cs` | `<Feature>Controller.Query.cs` |
| **Dropdown Lookups** | `.Lookup` | `<Feature>LookupDTO.cs` | `<Feature>AppService.Lookup.cs` | `<Feature>Controller.Lookup.cs` |
| **Formulas & Numbering** | `.Utils` | `<Feature>UtilsDTO.cs` | `<Feature>AppService.Utils.cs` | `<Feature>Controller.Utils.cs` |
| **Business Constraints** | `.Validator` | (Included in Action) | `<Feature>AppService.Validator.cs` | `<Feature>Controller.Validator.cs` |

---

## 2. Service Interface Section Grouping

The root interface `I<Feature>AppService.cs` groups method declarations using standardized section banners:

```csharp
public interface ISemiProductStockReturnAppService
{
    // ── Query ─────────────────────────────────────────────────────────
    Task<List<SemiProductStockReturnGridItemDTO>> GetListAsync(StockReturnFilterDTO filter);
    Task<SemiProductStockReturnDTO> GetByIdAsync(int id);

    // ── Action ────────────────────────────────────────────────────────
    Task<int> CreateAsync(SemiProductStockReturnActionDTO dto);
    Task UpdateAsync(int id, SemiProductStockReturnActionDTO dto);
    Task DeleteAsync(int id);

    // ── Approval ──────────────────────────────────────────────────────
    Task ApproveAsync(int id, string reason);
    Task RejectAsync(int id, string reason);

    // ── Lookups & Utils ───────────────────────────────────────────────
    Task<StockReturnLookupDTO> GetLookupsAsync();
    Task<string> GenerateDocNoAsync(DateTime docDate);
}
```

---

## 3. Benefits
- **File Length Strict Limit:** Every partial file stays strictly between 50 to 200 lines.
- **Instant Navigability:** Developers and AI agents know immediately which file to open based on the operation type.
- **Git Merge Conflict Reduction:** Team members working on queries vs actions touch completely separate files.
