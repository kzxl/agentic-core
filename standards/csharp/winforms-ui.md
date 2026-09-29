---
desc: Comprehensive C# WinForms Desktop UI & UX Standards — DevExpress Skinning, High-Density GridControl, Ribbon/BarManager & In-Window Telemetry
rules: [R_CS, R_WPF, R_UI]
---

# 🖥️ C# WinForms Enterprise Desktop UI & UX Standards

This standard establishes mandatory visual, ergonomic, and component engineering guidelines for WinForms desktop enterprise applications across the AgentOption ecosystem. It specializes the [Universal Software UI/UX Design System](file:///E:/16.%20AgentOption/standards/universal/ui-ux-design-system.md) for Windows Forms, DevExpress (`XtraForm`, `GridControl`, `RibbonControl`), and native .NET controls.

---

## 1. Lifecycle & View Architecture

1. **BaseForm & RunAfterShown:** All forms **MUST** inherit from `BaseForm` (or `BaseUserControl`) and initialize asynchronous data loading inside `RunAfterShown(async () => await LoadDataAsync())`. Strictly forbid data loading in `Form_Load` to prevent UI freezing.
2. **Explicit 1-Way Data Binding:** Strictly forbid `BindingSource`. Use explicit 1-way mapping: `PopulateControls(modelDTO)` for loading and `CollectData()` for extracting inputs into DTOs.
3. **High-DPI Awareness:** Enable Per-Monitor v2 DPI awareness in `app.manifest`:
   ```xml
   <application xmlns="urn:schemas-microsoft-com:asm.v3">
     <windowsSettings>
       <dpiAwareness xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">PerMonitorV2</dpiAwareness>
     </windowsSettings>
   </application>
   ```

---

## 2. DevExpress Skinning & Palette Synchronization

All WinForms applications must synchronize their appearance with the Living Slate design tokens:

```csharp
// Program.cs Initialization
DevExpress.UserSkins.BonusSkins.Register();
DevExpress.Skins.SkinManager.EnableFormSkins();
DevExpress.LookAndFeel.UserLookAndFeel.Default.SetSkinStyle(
    DevExpress.LookAndFeel.SkinStyle.WXI
);
```

### Palette Token Synchronization
- **Dark Mode:** `WXI` skin with Obsidian/Dark Slate palette (`#0F111A` base, `#818CF8` accent).
- **Light Mode:** `WXI` skin with Crisp Off-White palette (`#F8F9FC` base, `#4F46E5` accent).
- **No Hardcoded Hex Values:** All dynamic drawing, custom painting (`CustomDrawCell`), or row formatting must reference a central `EnterpriseTheme` constant class.

---

## 3. DevExpress GridControl: The Enterprise Workhorse

The data grid is the operational center of ERP and utility desktop software. Implement standard ergonomic settings:

```csharp
public static void ConfigureEnterpriseGrid(DevExpress.XtraGrid.Views.Grid.GridView gv)
{
    // 1. Density & Heights
    gv.RowHeight = 28;
    gv.ColumnPanelRowHeight = 30;
    gv.Appearance.Row.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
    gv.Appearance.HeaderPanel.Font = new Font("Segoe UI Semibold", 9.5f, FontStyle.Bold);

    // 2. Anti-AI-Slop & Dividers
    // Prohibit alternating zebra stripes; rely on subtle horizontal lines
    gv.OptionsView.EnableAppearanceEvenRow = false;
    gv.OptionsView.EnableAppearanceOddRow = false;
    gv.OptionsView.ShowHorizontalLines = DevExpress.Utils.DefaultBoolean.True;
    gv.OptionsView.ShowVerticalLines = DevExpress.Utils.DefaultBoolean.False;

    // 3. Selection & Editing
    gv.OptionsSelection.EnableAppearanceFocusedCell = false;
    gv.OptionsBehavior.Editable = false; // Read-only grid; edit via explicit form/drawer
    gv.OptionsSelection.MultiSelect = true;
    gv.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.RowSelect;

    // 4. Performance & Memory
    gv.OptionsView.ShowAutoFilterRow = true; // Instant search header
    gv.OptionsFind.AlwaysVisible = false;    // Suppress heavy find panel unless explicitly toggled
}
```

### Column Formatting Standards
- **Monetary & Numeric Values:** Set `DisplayFormat.FormatType = FormatType.Numeric` with `DisplayFormat.FormatString = "{0:N0}"` or `"{0:N2}"`. Align **Far (Right)**.
- **Dates & Timestamps:** Align **Center** with format `"{0:yyyy-MM-dd HH:mm}"`.
- **Status Columns:** Use `RepositoryItemImageComboBox` or custom badge drawing with rectangular $3\text{px}$ radius. Never render raw status integer IDs.

---

## 4. Toolbar & Ribbon Ergonomics

- **Ribbon Layout:** Limit ribbon categories to primary business workflows (e.g., *Home*, *Inventory*, *Reports*). Do not create a separate ribbon tab for 1 or 2 buttons.
- **Action Verbs (R_UI):** Every button label **MUST** begin with an action verb (*Lưu*, *Duyệt*, *Xuất Excel*, *Hủy bỏ*). Strictly forbid generic labels (*OK*, *Chạy*).
- **Icon Sizing:** Large icons $32\times 32\text{px}$ for Primary CTA (Save, Approve); small icons $16\times 16\text{px}$ for secondary options. Use SVG vector icons (`DevExpress.Utils.Svg.SvgImage`) to guarantee crisp rendering across 100%, 125%, 150%, and 200% DPI.

---

## 5. In-Window Feedback & Alerting Policy

1. **No Blocking Message Boxes for Normal Flows:**
   - Saving or updating a record **MUST NEVER** invoke `XtraMessageBox.Show("Saved successfully")`.
   - Use in-window status strip or `DevExpress.XtraBars.Alerter.AlertControl` pinned to bottom-right that auto-dismisses after 3 seconds.
2. **Modal Confirmations Strictly for Irreversible Actions:**
   - Deactivating master records or voiding posted ledger entries requires a modal dialog stating the exact count:
     > *"Bạn có chắc chắn muốn ngừng sử dụng **12** mặt hàng đã chọn?"*
     > Button: `[ Ngừng sử dụng 12 mặt hàng ]`, never `[ OK ]`.
