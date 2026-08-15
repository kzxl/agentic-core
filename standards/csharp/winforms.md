---
desc: C# WinForms Enterprise Desktop Standards — Lifecycle, DevExpress Grid & Crash Defense
rules: [R_CS, R_WPF, R_UNIVERSE]
---
# 🖥️ C# WinForms Enterprise Standards

## 1. Lifecycle & Base Architecture
- **BaseForm Pattern:** `BaseForm` + `RunAfterShown(async () => await LoadDataAsync())` in Constructor (STRICTLY NO `Form_Load`).
- **Autofac DI:** Scan assemblies for `*AppService` and `*Controller`.

## 2. View Data Flow & Crash Defense
- **STRICTLY NO `BindingSource`:** Prevents memory leaks and uncontrolled cursor mutations.
- **Explicit 1-Way Flow:** `PopulateControls(modelDTO)` (Model &rarr; UI) and `CollectData()` (UI &rarr; SaveDTO).
- **Mandatory Async Void Try/Catch:**
  ```csharp
  private async void btnSave_Click(object sender, EventArgs e) {
      try { await _controller.SaveAsync(CollectData()); }
      catch (Exception ex) { MsgBoxHelper.ShowError(ex); }
  }
  ```
- **Thread Marshaling:** Use `this.InvokeIfRequired(() => { ... })` for background updates.

## 3. DevExpress Grid & Memory
- Wrap multi-row operations in `gvMain.BeginUpdate()` / `gvMain.EndUpdate()`.
- Zero DB/LINQ queries inside `CustomUnboundColumnData` (use pre-fetched in-memory dictionaries).
- Unhook all event subscriptions in `FormClosed` / `Dispose`.
