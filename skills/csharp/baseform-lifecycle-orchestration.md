---
name: CsharpBaseFormLifecycleOrchestration
desc: Standardized lifecycle pattern for WinForms BaseForm (Constructor, RunAfterShown, PopulateControls, CollectData) with zero UI thread freeze
rules: [R_CS, R_WPF]
category: CSharp
---
# 🖥️ C# WinForms BaseForm Lifecycle & Data Binding Pattern

**Goal:** Enforce a predictable, asynchronous lifecycle for enterprise WinForms without using legacy `BindingSource` or blocking `Form_Load`.

---

## 1. Standard Form Lifecycle

```
[Constructor] -> (Initialize UI components, Wire RunAfterShown)
      |
      v
[RunAfterShown] -> (Async background data load via Task.Run/await, Populate Lookups)
      |
      v
[PopulateControls] -> (1-way mapping: Model DTO -> UI Controls)
      | (User edits form)
      v
[CollectData] -> (1-way mapping: UI Controls -> Request DTO with Validation)
      |
      v
[Controller / Service] -> (Execute Database Transaction)
```

---

## 2. BaseForm Implementation Template

```csharp
public partial class frmStockReturnDetail : BaseForm
{
    private readonly ISemiProductStockReturnAppService _service;
    private SemiProductStockReturnDTO _currentEntity;

    public frmStockReturnDetail(ISemiProductStockReturnAppService service)
    {
        InitializeComponent();
        _service = service ?? throw new ArgumentNullException(nameof(service));

        // STRICT RULE: Defer heavy operations to RunAfterShown, NEVER in Form_Load
        RunAfterShown = async () => await InitializeDataAsync();
    }

    private async Task InitializeDataAsync()
    {
        try
        {
            ShowLoading(true);
            var lookups = await _service.GetLookupsAsync();
            if (IsDisposed) return; // Prevent ObjectDisposedException if user closes form early

            cboWarehouse.Properties.DataSource = lookups.Warehouses;

            if (_currentEntity != null)
            {
                PopulateControls(_currentEntity);
            }
        }
        catch (Exception ex)
        {
            ex.ShowError();
        }
        finally
        {
            if (!IsDisposed)
            {
                ShowLoading(false);
            }
        }
    }

    public void PopulateControls(SemiProductStockReturnDTO model)
    {
        _currentEntity = model;
        txtDocNo.Text = model.DocNo;
        dtDocDate.DateTime = model.DocDate;
        cboWarehouse.EditValue = model.WarehouseId;
    }

    public SemiProductStockReturnActionDTO CollectData()
    {
        return new SemiProductStockReturnActionDTO
        {
            DocNo = txtDocNo.Text.Trim(),
            DocDate = dtDocDate.DateTime,
            WarehouseId = cboWarehouse.EditValue == null || cboWarehouse.EditValue == DBNull.Value 
                ? (int?)null 
                : Convert.ToInt32(cboWarehouse.EditValue)
        };
    }
}
```

---

## 3. Strict Rules
- **NO `BindingSource`:** Always use explicit 1-way mapping via `PopulateControls` and `CollectData`.
- **Async Void Safety:** Event handlers declared as `async void` MUST wrap the entire body in `try-catch` calling `ex.ShowError()` to prevent unhandled UI thread termination.
