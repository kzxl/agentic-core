---
desc: C# WinForms (.NET Framework 4.6.2) Standards — Enterprise Desktop
rules: [R_CS, R_UNIVERSE, R_WPF]
source: Universe Architecture v4.0 — Section 3.1
---
# 🖥️ C# WinForms Desktop Standards

## 1. Architecture & Syntax
- **Runtime:** .NET Framework 4.6.2 / C# 7.3 syntax.
- **Namespaces:** Block namespaces (`namespace MyDomain.Features { ... }`).
- **Base Components:** `BaseForm` + `RunAfterShown(async () => await LoadData())` in Constructor (STRICTLY NO `Form_Load`).
- **Dependency Injection:** Autofac assembly scanning for `*AppService` and `*Controller`.

## 2. View Layer (PopulateControls / CollectData)
- **STRICTLY NO `BindingSource`:** Prevents hidden memory leaks and unexpected mutations.
- **Explicit 1-Way Mapping:** `PopulateControls(modelDTO)` (Model &rarr; UI) and `CollectData()` (UI &rarr; SaveDTO).
- **Zero Business Logic:** No direct DB queries, no file IO, no `ActionLogHelper` in Views.

## 3. Controller & Service Separation
- **Controller:** Thin pass-through between View and Service. No `try/catch` or complex data shaping.
- **Service:** 100% business logic, transaction boundaries, and DB access.
- **DTO Scoping:** Features define local DTOs in `DTOs/` folder.

## 4. File Layout
```text
Features/{Domain}/{Feature}/
├── Controller/
│   ├── {Feature}Controller.cs
│   └── {Feature}Controller.{Action}.cs  (partial)
├── Service/
│   ├── I{Feature}AppService.cs
│   └── {Feature}AppService.cs
├── View/
│   ├── frm{Feature}.cs
│   └── uc{Feature}List.cs
└── DTOs/
    └── {Feature}DTO.cs
```
