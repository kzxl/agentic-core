---
name: SolidAndSeparationOfConcerns
desc: Pragmatic SOLID principles, strict layer boundary matrix, and 1-to-1 feature partitioning blueprint
rules: [R_CORE, R_API, R_CS, R_UNIVERSE]
category: Architecture
---
# 📐 Pragmatic SOLID & Separation of Concerns (SoC) Blueprint

**Goal:** Eliminate God classes, prevent layer bleeding, and establish crisp responsibility boundaries where every class has a single reason to change and modules can be deleted without breaking the build.

---

## 1. Pragmatic SOLID Matrix

| Principle | Architectural Rule | Practical Implementation Pattern | Anti-Pattern to Eliminate |
| :--- | :--- | :--- | :--- |
| **S - Single Responsibility** | 1 class = 1 single reason to change. Partition by concerns. | 1-to-1 partial classes: `*.Action.cs`, `*.Query.cs`, `*.Validator.cs`. | 2,000-line God Service mixing DB queries, Excel exports, and validation. |
| **O - Open/Closed** | Open for extension, closed for modification. | Handler-Dispatcher pattern, Strategy Map, Middleware pipeline. | Massive 50-case `switch(type)` statements requiring edits for new features. |
| **L - Liskov Substitution** | Derived classes/implementations must honor parent contracts. | Implementations never throw `NotImplementedException` on core contract methods. | Dummy subclasses that break when substituted for the interface. |
| **I - Interface Segregation** | Clients should never be forced to depend on methods they don't use. | Segregated interfaces: `IReadOnlyService<T>`, `IMutationService<T>`, `ILookupService`. | Fat interfaces with 40 methods forced upon simple read-only consumers. |
| **D - Dependency Inversion** | Depend on abstractions, never on concrete implementations. | Constructor DI (`IService`, `IDbConnectionFactory`) wired via Autofac / MS DI. | Hardcoded `new AppDataContext()` or `new ConcreteHelper()` inside business logic. |

---

## 2. Separation of Concerns (SoC) Responsibility Matrix

| Layer / Component | Permitted Responsibilities (DO) | STRICTLY FORBIDDEN (DO NOT) |
| :--- | :--- | :--- |
| **View (UI / React / WinForms)** | - Render UI controls & handle user gestures<br>- Explicit 1-way mapping (`PopulateControls` / `CollectData`)<br>- Present error dialogs to user | ❌ Zero direct SQL / DB queries<br>❌ Zero business formula calculations<br>❌ Zero `BindingSource` (use explicit DTO list) |
| **Controller (API / Desktop)** | - Parse HTTP / View parameters<br>- Dispatch request to Feature Service<br>- Map return DTO & HTTP status codes | ❌ Zero business rules or calculations<br>❌ Zero transaction management<br>❌ Zero raw SQL execution |
| **Validator** | - Validate input constraints, ranges, and nullability<br>- Verify business preconditions (e.g. stock sufficiency) | ❌ Zero direct mutations to database<br>❌ Zero UI manipulation |
| **Service (Application Logic)** | - 100% business workflows and business invariants<br>- Manage database Transaction Boundaries (`using var tx = ...`)<br>- Emit domain events / audit logs | ❌ Zero UI elements or HTTP session references<br>❌ Zero direct queries to other features' DB tables |
| **Data Access / Repository** | - Execute parameterized SQL queries & Dapper mappings<br>- Bulk high-throughput batch operations | ❌ Zero UI state<br>❌ Zero cross-feature business orchestration |

---

## 3. Standardized Feature Partitioning Layout

```text
Features/<Domain>/<FeatureName>/
├── I<Feature>AppService.cs              # 1. Pure Public Contract
│
├── Constants/                           # 2. Localized Constants
│   └── <Feature>Constants.cs            # RuleCode, PermissionTag, ApiRoute
│
├── DTOs/                                # 3. Localized Single-Purpose DTOs
│   ├── <Feature>GridItemDTO.cs          # Lightweight list/table model
│   ├── <Feature>DetailDTO.cs            # Full entity detail payload
│   ├── <Feature>SaveRequest.cs          # Input mutation command
│   └── <Feature>LookupDTO.cs            # Dropdown key-value selector
│
├── Services/                            # 4. Single-Responsibility Partials (<250 lines)
│   ├── <Feature>AppService.cs           # Constructor & Dependency Injection
│   ├── <Feature>AppService.Action.cs    # Create, Update, Delete, Approve mutations
│   ├── <Feature>AppService.Query.cs     # GetList, GetById, Search, Pagination
│   ├── <Feature>AppService.Lookup.cs    # Fast cached dropdown queries
│   └── <Feature>AppService.Validator.cs # Pre-condition business validation
│
├── Controllers/                         # 5. Thin Delivery Layer
│   └── <Feature>Controller.cs           # Route binding & Service dispatching
│
└── View/                                # 6. UI Components (Desktop / Web)
    ├── frm<Feature>_Detail.cs / .tsx    # Form detail view
    └── uc<Feature>_List.cs / .tsx       # List grid view
```

---

## 4. Verification Checklist
- [ ] Every source file is strictly under **250 lines**.
- [ ] No circular dependencies between Features.
- [ ] Deleting the entire `Features/<FeatureName>/` folder causes zero build errors in other features.
