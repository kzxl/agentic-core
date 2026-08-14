---
desc: High-performance data access, async queueing, and UI non-blocking guidelines
rules: [R_CS, R_WPF, R_DB]
---
# ⚡ Performance & Data Access Guidelines

## 1. Eliminate N+1 Loop Queries
- **Anti-pattern:** Executing SQL/LINQ queries inside grid custom column renderers or row loops.
- **Rule:** Extract all IDs in one batch &rarr; Execute a single async lookup &rarr; Pass mapping dictionary (e.g. `Dictionary<int, string>`) to the loop in memory (pure CPU-bound).

## 2. Eliminate UI-Thread Blocking
- **Anti-pattern:** Calling `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on asynchronous Tasks.
- **Rule:** Use `async/await` end-to-end. WinForms/WPF event handlers use `async void btn_Click` with top-level `try/catch`.
- **Async Queue:** Wrap heavy background I/O inside central worker queues: `_queue.Enqueue(() => { ... })`.

## 3. Safe Connection & Transaction Scoping
```csharp
public Task<DataDTO> ApproveAsync(int id, int userId)
{
    return _queue.Enqueue(() =>
    {
        using (var db = AppDataContext.New())
        {
            // Execute atomic transaction inside queue delegate
        }
    });
}
```

## 4. DTO Collections over Untyped DataTables
- **Rule:** Never pass untyped `DataTable` across layers. Map database results to strongly-typed `List<T_DTO>`.
- **UI Binding:** For DevExpress GridControl, bind explicit `BindingList<T>` without 2-way `BindingSource` hazards.
