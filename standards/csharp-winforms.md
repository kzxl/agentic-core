---
desc: C# WinForms (.NET Framework 4.6.2) Standards — Enterprise Desktop & DevExpress Optimization
rules: [R_CS, R_UNIVERSE, R_WPF, R_DB]
source: Universe Architecture v4.0 — Section 3.1
---
# 🖥️ C# WinForms Enterprise Desktop Standards

## 1. Architecture & Base Lifecycle
- **Runtime:** .NET Framework 4.6.2 / C# 7.3 syntax (Block namespaces: `namespace Domain.Features { ... }`).
- **Base Lifecycle:** `BaseForm` + `RunAfterShown(async () => await LoadDataAsync())` in Constructor (STRICTLY NO `Form_Load`).
- **Dependency Injection:** Autofac assembly scanning for `*AppService` and `*Controller`.

## 2. View Layer & Crash Prevention
- **STRICTLY NO `BindingSource`:** Prevents memory leaks, ghost rows, and unmanaged cursor mutations.
- **Explicit 1-Way Data Flow:** `PopulateControls(modelDTO)` (Model &rarr; UI) and `CollectData()` (UI &rarr; SaveDTO).
- **Async Void Safety (Mandatory):** All `async void btn_Click` event handlers MUST wrap entire body in `try/catch`:
  ```csharp
  private async void btnSave_Click(object sender, EventArgs e)
  {
      try { await _controller.SaveAsync(CollectData()); }
      catch (Exception ex) { MsgBoxHelper.ShowError(ex); }
  }
  ```
- **UI Thread Marshaling:** Cross-thread UI updates must use `this.InvokeIfRequired(() => { ... })`.

## 3. DevExpress Grid & Memory Optimization
- **Batch Grid Updates:** Wrap multi-row insertions in `gvMain.BeginUpdate()` / `gvMain.EndUpdate()`.
- **Zero I/O in Custom Renderers:** Never call DB/LINQ queries inside `CustomUnboundColumnData` or `RowCellStyle`. Use pre-fetched lookup Dictionaries in memory.
- **Memory Leak Prevention:** Unhook all external event subscriptions (`EventBus.Unsubscribe`) in `Form_FormClosed` or `Dispose(bool disposing)`. Never capture `this` form in static lambdas.

## 4. Controller & Service Separation
- **Controller:** Thin pass-through between View and Service. No `try/catch` or complex data shaping.
- **Service:** 100% business logic, transaction boundaries, and DB access.
- **DTO Scoping:** Features define local DTOs in `DTOs/` folder.

## 5. File Layout
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

