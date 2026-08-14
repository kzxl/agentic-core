---
desc: Desktop Application (WPF / WinForms) Standards
rules: [R_WPF, R_CS]
---
# 🖥️ Desktop Application (WPF & WinForms) Standards

## 1. UI Patterns
- **WPF MVVM:** Strict separation. Views contain zero code-behind logic. Data binding + `RelayCommand` only.
- **WinForms BaseForm:** `BaseForm` + `RunAfterShown`. Separate `PopulateControls()` and `CollectData()`. Strictly NO `BindingSource`.

## 2. Naming Conventions
- `XViewModel`, `XPanel` (WPF UserControl), `ucX` (WinForms UserControl).

## 3. Threading & Async Rules
- **UI Thread Dispatching:** Use `Dispatcher.BeginInvoke()` for UI updates from background threads.
- **Deadlock Prevention:** NEVER call `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on Tasks. Always use `async/await` end-to-end.
