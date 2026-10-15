---
desc: C# WinForms Enterprise Desktop Standards — Lifecycle, DevExpress Grid & Crash Defense
rules: [R_CS, R_WPF, R_UNIVERSE]
---
# 🖥️ C# WinForms Enterprise Desktop Standards

## 1. Quantitative Invariants & Operational Thresholds
| Metric / Constraint | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **`BindingSource` Components** | $0$ instances across all Forms/UserControls | Explicit 1-way `PopulateControls` / `CollectData` mapping |
| **`Form_Load` Heavy I/O** | $0$ synchronous or blocking DB calls | `BaseForm.RunAfterShown(async () => ...)` deferred initialization |
| **Grid Repaint Batching** | $100\%$ of multi-row mutations wrapped | `gvMain.BeginUpdate()` / `gvMain.EndUpdate()` in `try/finally` |
| **Unhandled `async void` Crashes** | $0$ unguarded UI event handlers | Mandatory `try/catch` or `SafeInvokeAsync` wrapper |
| **GDI+ Handle & Event Leaks** | $\le 250$ GDI objects per Form lifecycle | Deterministic disposal of `Font`, `Brush`, `Timer`, and event hooks |

---

## 2. `BaseForm` / `XtraForm` Lifecycle (`RunAfterShown` Initialization)
- **Strict Prohibition of `Form_Load` Blocking:** Executing DB queries inside `Form_Load` blocks the Win32 message pump before `WM_PAINT`, freezing the MDI shell.
- **Deferred Async Initialization:** Inherit from `BaseForm` / `XtraBaseForm` and register startup I/O via `RunAfterShown` in the constructor so the window renders immediately.

```csharp
// ❌ BAD: Blocking Form_Load freezes window painting and risks deadlock
private void frmInventory_Load(object sender, EventArgs e)
{
    gcMain.DataSource = _inventoryService.GetStockListAsync().Result; // Deadlock & frozen UI!
}

// ✅ GOOD: Non-blocking RunAfterShown lifecycle with CancellationToken
public partial class frmInventory : BaseForm
{
    private readonly IInventoryController _controller;

    public frmInventory(IInventoryController controller)
    {
        InitializeComponent();
        _controller = controller;
        RunAfterShown(async ct =>
        {
            lkeWarehouse.Properties.DataSource = await _controller.GetWarehouseLookupsAsync(ct);
        });
    }
}
```

---

## 3. Prohibition of `BindingSource` & Explicit 1-Way Mapping
- **Why `BindingSource` Is Banned:** Two-way `BindingSource` currency managers trigger cascading `PositionChanged` side effects during sorting/filtering, mutate DTOs unexpectedly, and leak memory via strong control references.
- **Deterministic 1-Way Flow:** Use explicit `PopulateControls(model)` (Model $\to$ UI) and `CollectData()` (UI $\to$ `SaveRequestDTO`).

```csharp
// ✅ GOOD: Explicit 1-way mapping without BindingSource cursor mutations
private void PopulateControls(OrderDetailDTO model)
{
    txtOrderNo.Text = model.OrderNo;
    dteOrderDate.DateTime = model.OrderDate;
    lkeCustomer.EditValue = model.CustomerId;
    spnTotalAmount.Value = model.TotalAmount;
}

private OrderSaveRequest CollectData() => new()
{
    OrderNo = txtOrderNo.Text.Trim(),
    OrderDate = dteOrderDate.DateTime,
    CustomerId = Convert.ToInt32(lkeCustomer.EditValue),
    TotalAmount = spnTotalAmount.Value
};
```

---

## 4. DevExpress Grid Batching & `SafeInvoke` Async Event Boundary
- **Grid Batching (`BeginUpdate` / `EndUpdate`):** Wrap multi-row grid mutations in `gvMain.BeginUpdate()` and `finally { gvMain.EndUpdate(); }` to prevent $O(N)$ visual recalculations.
- **Zero Queries in `CustomUnboundColumnData`:** Never run SQL or $O(N)$ LINQ scans inside `CustomUnboundColumnData` or `RowCellStyle`; pre-index lookups in an $O(1)$ `Dictionary<int, string>`.
- **Crash-Proof Event Boundary:** Wrap every `async void` handler in `try/catch` (or `SafeInvokeAsync`), and marshal cross-thread UI updates via `InvokeIfRequired`.

```csharp
// ❌ BAD: Unguarded async void crashes the application process on exception
private async void btnSave_Click(object sender, EventArgs e)
{
    await _controller.SaveOrderAsync(CollectData());
}

// ✅ GOOD: Guarded async boundary + re-entrancy lock + BeginUpdate batching
private async void btnSave_Click(object sender, EventArgs e)
{
    btnSave.Enabled = false;
    gvMain.BeginUpdate();
    try
    {
        gcMain.DataSource = await _controller.SaveOrderAsync(CollectData(), FormCancellationToken);
    }
    catch (OperationCanceledException) { /* Form closed */ }
    catch (Exception ex) { MsgBoxHelper.ShowError(ex); }
    finally
    {
        gvMain.EndUpdate();
        if (!IsDisposed) btnSave.Enabled = true;
    }
}
```

---

## 5. Deterministic Resource & GDI+ Handle Disposal
- **GDI+ & Timer Cleanup:** Custom `Font`, `Pen`, `Brush`, `Bitmap`, and `Timer` instances allocate unmanaged Win32 handles ($10,000$ process limit). Dispose all GDI objects and unhook external event subscriptions in `OnFormClosed` or `Dispose(bool disposing)`.

