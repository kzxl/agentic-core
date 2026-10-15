---
desc: C# WPF Desktop MVVM Standards — Data Binding, Commands & Thread Safety
rules: [R_WPF, R_CS]
---
# 🖥️ C# WPF Desktop MVVM Standards

## 1. Quantitative Invariants & Performance Thresholds
| Metric / Constraint | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Code-Behind Logic (`.xaml.cs`)** | $0$ business or data-access statements | Strict MVVM (`DataContext` binding + `ICommand` / `IAsyncRelayCommand`) |
| **UI Thread Blocking** | $0$ calls to `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` | End-to-end `async/await` + `Dispatcher.InvokeAsync` |
| **Collection Batch Notification** | $\le 1$ `Reset` event per bulk load ($> 50$ items) | `BulkObservableCollection<T>` or instance replacement |
| **ItemsControl Virtualization** | Mandatory for $> 100$ bound items | `VirtualizingStackPanel.IsVirtualizing="True"`, `Recycling` mode |
| **Memory Leak Retention** | $0$ strong static/long-lived event references | Unsubscribe in `Unloaded` / `Dispose()` or use `WeakEventManager` |

---

## 2. Strict MVVM Decoupling & Async Command Contracts
- **Zero Code-Behind Business Logic:** `.xaml.cs` files are restricted to `InitializeComponent()` and view-only focus orchestration. ViewModels MUST NOT reference `System.Windows.Controls`, `Window`, or `MessageBox`; inject `IDialogService` or `INavigationService`.
- **Naming & Commands:** Use `XView`, `XPanel`, and `XViewModel`. Bind actions to `IAsyncRelayCommand` with `CancellationToken` propagation.

---

## 3. `ObservableCollection<T>` Bulk Update Suspension
- **The $O(N)$ Layout Thrashing Hazard:** Calling `ObservableCollection<T>.Add(item)` inside a loop of $5,000$ records fires $5,000$ `CollectionChanged` events, forcing WPF to recompute layout on every row.
- **Invariant:** For batch updates $> 50$ items, use `BulkObservableCollection<T>` to suppress per-item events and emit a single `NotifyCollectionChangedAction.Reset`.

```csharp
// ❌ BAD: 5,000 individual CollectionChanged events freeze the WPF UI thread
public async Task LoadOrdersBadAsync(CancellationToken ct)
{
    Orders.Clear();
    foreach (var dto in await _orderService.GetOpenOrdersAsync(ct))
        Orders.Add(dto); // Fires CollectionChanged + UI layout pass per row!
}

// ✅ GOOD: Single Reset notification via BulkObservableCollection<T>
public sealed class BulkObservableCollection<T> : ObservableCollection<T>
{
    private bool _suppressNotification;

    protected override void OnCollectionChanged(NotifyCollectionChangedEventArgs e)
    {
        if (!_suppressNotification) base.OnCollectionChanged(e);
    }

    public void ReplaceAll(IEnumerable<T> items)
    {
        ArgumentNullException.ThrowIfNull(items);
        _suppressNotification = true;
        try
        {
            Items.Clear();
            foreach (var item in items) Items.Add(item);
        }
        finally
        {
            _suppressNotification = false;
            OnPropertyChanged(new PropertyChangedEventArgs(nameof(Count)));
            OnPropertyChanged(new PropertyChangedEventArgs("Item[]"));
            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }
    }
}
```

---

## 4. UI Virtualization (`VirtualizingStackPanel`)
- **Mandatory XAML Configuration:** Every `DataGrid`, `ListView`, and `ItemsControl` displaying $> 100$ rows MUST enable container recycling. Never wrap a `DataGrid` inside an unbounded `<ScrollViewer>` or `StackPanel`, which gives infinite vertical measure and silently disables virtualization.

```xml
<!-- ❌ BAD: Outer ScrollViewer gives infinite vertical measure, disabling virtualization -->
<ScrollViewer>
    <DataGrid ItemsSource="{Binding Orders}" />
</ScrollViewer>

<!-- ✅ GOOD: Bounded Grid row + Container Recycling + Pixel Virtualization -->
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="*" />
    </Grid.RowDefinitions>
    <DataGrid Grid.Row="1"
              ItemsSource="{Binding Orders, Mode=OneWay}"
              EnableRowVirtualization="True"
              EnableColumnVirtualization="True"
              VirtualizingPanel.IsVirtualizing="True"
              VirtualizingPanel.VirtualizationMode="Recycling"
              VirtualizingPanel.ScrollUnit="Pixel" />
</Grid>
```

---

## 5. Memory Leak Prevention & Background Thread Marshaling
- **Weak Event & Unsubscription Discipline:** Subscribing a child ViewModel to a long-lived event (`_eventBus.Updated += OnUpdated`) without unsubscribing roots the visual tree in Gen 2 heap. Implement `IDisposable` to unhook events or use `WeakEventManager<TEventSource, TEventArgs>`.
- **Binding Leak Defense:** Declare `Mode=OneWay` or `Mode=OneTime` on bindings to non-`INotifyPropertyChanged` properties.
- **Dispatcher Marshaling:** Run heavy I/O on thread-pool workers (`ConfigureAwait(false)`) and marshal UI mutations via `Application.Current.Dispatcher.InvokeAsync(() => ..., DispatcherPriority.Background)`.

