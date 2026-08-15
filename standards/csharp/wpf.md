---
desc: C# WPF Desktop MVVM Standards — Data Binding, Commands & Thread Safety
rules: [R_WPF, R_CS]
---
# 🖥️ C# WPF Desktop MVVM Standards

## 1. MVVM Strict Separation
- **View:** Pure XAML + zero code-behind logic. Data binding + `ICommand` only.
- **ViewModel:** Exposes `ObservableCollection<T>`, `RelayCommand` / `AsyncRelayCommand`, and UI state properties.
- **Naming:** `XViewModel`, `XView`, `XPanel` (UserControl).

## 2. Threading & Dispatcher
- Background UI updates MUST use `Application.Current.Dispatcher.BeginInvoke()`.
- NEVER call `.Result` or `.Wait()`. Use `async/await` end-to-end.
