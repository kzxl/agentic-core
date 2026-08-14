---
name: FolderPerFeatureArchitecture
desc: Universal Folder-per-Feature architecture with localized DTOs, Constants, and 1-to-1 Partial Class partitioning
rules: [R_CORE, R_API, R_CS]
category: Architecture
---
# 🗂️ Universal Folder-per-Feature Architecture Blueprint

**Goal:** Group all code related to a single business capability (Views, Controllers, Services, DTOs, Constants) within a single feature directory, maximizing cohesion, eliminating shared DTO spaghetti, and enabling instant deletion or extraction of modules.

---

## 1. Feature Directory Layout

```text
Features/<FeatureName>/
├── I<Feature>AppService.cs          # Public Service Interface at feature root
├── Constants/
│   └── <Feature>Constants.cs        # FeatureRuleCode, PermissionTag, ApiRoutes, Enums
├── DTOs/                            # Localized DTOs strictly scoped to this feature
│   ├── <Feature>GridItemDTO.cs      # Lightweight model for grid/list tables
│   ├── <Feature>DetailDTO.cs        # Comprehensive entity details
│   ├── <Feature>ActionDTO.cs        # Mutation request (Insert, Update, Approve)
│   ├── <Feature>LookupDTO.cs        # Key-Value pairs for dropdown selectors
│   └── <Feature>ReportDTO.cs        # Export and printable layout DTO
├── Services/                        # 1-to-1 Partial Service Implementations
│   ├── <Feature>AppService.cs       # Core constructor & dependency wiring
│   ├── <Feature>AppService.Action.cs# Data mutations (Create, Update, Delete, Approve)
│   ├── <Feature>AppService.Query.cs # Read-only queries, pagination, and details
│   ├── <Feature>AppService.Lookup.cs# Dropdown lookup queries
│   ├── <Feature>AppService.Utils.cs # Formula calculation & document numbering
│   └── <Feature>AppService.Validator.cs # Business rule validation
├── Controllers/                     # Feature Controller (WebAPI or Thin Client)
│   ├── <Feature>Controller.cs
│   ├── <Feature>Controller.Action.cs
│   └── <Feature>Controller.Query.cs
└── View/                            # UI Components (UserControl / Form / React Views)
    ├── uc<Feature>.cs / .jsx
    └── frm<Feature>_Detail.cs / .jsx
```

---

## 2. Universal Standards

### A. DTO Localization Rule
- **Zero Global DTO Bloat:** DTOs belong strictly inside the feature's `DTOs/` folder.
- If two features need the exact same data, use a shared contract in `Shared/DTOs/` or define a local Projection DTO.

### B. Constants & Permission Tag Inheritance
```csharp
public static class StockReturnConstants
{
    public const string FeatureRuleCode = "Inventory.StockReturn";
    public const string PermissionTag = $"{FeatureRuleCode}**";
    public const string ApiRoute = "api/v1/stock-returns";
}
```

### C. 1-to-1 Partial Partitioning Standard
Keep each source file strictly under 150-250 lines by partitioning methods into focused partial files:
- **`*.Action.*`**: State modifications (POST, PUT, DELETE, Approval).
- **`*.Query.*`**: Read operations (GET list, GET by ID, Search).
- **`*.Lookup.*`**: Dropdown lookups (GET /lookup).
- **`*.Validator.*`**: Input integrity and constraint checks.
