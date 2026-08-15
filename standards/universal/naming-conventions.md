---
desc: Universal multi-language casing, DTO and UI control naming rules
rules: [R_CORE]
---
# 🏷️ Universal Naming Conventions

## 1. Symbol Casing Rules
| Element | Convention | Example |
| :--- | :--- | :--- |
| **Classes / Structs / Records** | `PascalCase` | `InspectionService`, `ProductController` |
| **Interfaces** | `IPascalCase` | `IInspectionService`, `IAuthManager` |
| **Methods / Functions** | `PascalCase` | `GetOrderById`, `ApproveRequestAsync` |
| **Async Methods** | `*Async` suffix | `SaveDataAsync`, `QueryListAsync` |
| **Properties** | `PascalCase` | `FirstName`, `DateOfBirth`, `IsActive` |
| **Variables / Parameters** | `camelCase` | `orderId`, `userName`, `isActive` |
| **Private Fields** | `_camelCase` | `_orderRepository`, `_currentUser` |
| **Constants** | `PascalCase` in static class | `Status.Pending`, `Status.Approved` |

## 2. DTO Naming Standards
- **List / Table Grid:** `<Feature>GridItemDTO` or `<Feature>ListDTO`
- **Detail View:** `<Feature>DetailDTO`
- **Mutations (Insert / Update):** `<Feature>SaveRequest` or `<Feature>ActionDTO`
- **Dropdown Lookup:** `<Feature>LookupDTO` (Key-Value pairs)
- **Print / Report:** `<Feature>ReportDTO`

## 3. UI Control Prefixes (Desktop)
- **Button:** `btnSave`, `btnApprove`, `btnCancel`
- **TextBox / TextEdit:** `txtUsername`, `txtDocNo`
- **GridControl / GridView:** `gcMain`, `gvMain`, `gcDetails`
- **ComboBox / LookUpEdit:** `cboWarehouse`, `lkeDepartment`
