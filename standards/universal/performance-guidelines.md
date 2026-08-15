---
desc: High-performance data access, anti-N+1, and UI non-blocking guidelines
rules: [R_CORE, R_DB]
---
# ⚡ Performance & Data Access Guidelines

## 1. Eliminate N+1 Loop Queries
- **Anti-pattern:** Executing SQL/LINQ/ORM queries inside grid row loops or render callbacks.
- **Rule:** Batch all IDs &rarr; Single async query &rarr; Build in-memory lookup dictionary (e.g. `Dictionary<int, string>`).

## 2. Eliminate UI-Thread Blocking
- **Deadlock Anti-pattern:** Calling `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on Tasks.
- **Rule:** Use `async/await` end-to-end. WinForms/WPF event handlers use `async void btn_Click` with top-level `try/catch`.
- **Async Queue:** Wrap background I/O inside central worker queues: `_queue.Enqueue(() => { ... })`.

## 3. Strongly-Typed Collections
- **Rule:** Never pass untyped `DataTable` across layers. Map database results to strongly-typed `List<T_DTO>`.
- **UI Binding:** For DevExpress GridControl, bind explicit `BindingList<T>` without 2-way `BindingSource` hazards.
