---
name: winforms-ui
description: Use when building or reviewing WinForms or DevExpress desktop UI - XtraForm/BaseForm lifecycle, skins and palettes, GridControl/GridView density and zebra settings, Ribbon/BarManager toolbars, status badges, AlertControl feedback, or custom painting colors.
desc: Comprehensive C# WinForms Desktop UI & UX Standards — DevExpress Skinning, High-Density GridControl, Ribbon/BarManager & In-Window Telemetry
rules: [R_CS, R_WPF, R_UI, R_ANTI_SLOP]
---

# C# WinForms Enterprise Desktop UI & UX Standards

This standard establishes mandatory visual, ergonomic, and component engineering guidelines for WinForms desktop enterprise applications across the AgentOption ecosystem. It specializes the [Universal Software UI/UX Design System](file:///E:/16.%20AgentOption/standards/universal/ui-ux-design-system.md) for Windows Forms, DevExpress (`XtraForm`, `GridControl`, `RibbonControl`), and native .NET controls. Visual laws come from the [Anti-AI-Slop Standard](file:///E:/16.%20AgentOption/standards/universal/ui-anti-ai-slop-standard.md) (cited by AS ID); values come from [tokens.md](file:///E:/16.%20AgentOption/skills/ui-design-system/references/tokens.md).

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

All WinForms applications synchronize their appearance with the design tokens. Skin registration in `Program.cs`:

```csharp
DevExpress.UserSkins.BonusSkins.Register();
DevExpress.Skins.SkinManager.EnableFormSkins();
DevExpress.LookAndFeel.UserLookAndFeel.Default.SetSkinStyle(
    DevExpress.LookAndFeel.SkinStyle.WXI
);
```

### Palette Token Synchronization
- **Dark Mode:** `WXI` skin with the dark neutrals from tokens.md (`BgCanvas` base, `BrandPrimary` accent).
- **Light Mode:** `WXI` skin with the light neutrals from tokens.md (`BgCanvas` base, `BrandPrimary` accent).
- **Central theme class:** All dynamic drawing, custom painting (`CustomDrawCell`), and row formatting reference a central `EnterpriseTheme` constant class whose values mirror tokens.md (see [platform-mapping.md](file:///E:/16.%20AgentOption/skills/ui-design-system/references/platform-mapping.md)).

---

## 3. DevExpress GridControl: The Enterprise Workhorse

The data grid is the operational center of ERP and utility desktop software. Implement standard ergonomic settings:

```csharp
public static void ConfigureEnterpriseGrid(DevExpress.XtraGrid.Views.Grid.GridView gv)
{
    gv.RowHeight = 28;
    gv.ColumnPanelRowHeight = 30;
    gv.Appearance.Row.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
    gv.Appearance.HeaderPanel.Font = new Font("Segoe UI Semibold", 9.5f, FontStyle.Regular);

    gv.OptionsView.EnableAppearanceEvenRow = false;
    gv.OptionsView.EnableAppearanceOddRow = false;
    gv.OptionsView.ShowHorizontalLines = DevExpress.Utils.DefaultBoolean.True;
    gv.OptionsView.ShowVerticalLines = DevExpress.Utils.DefaultBoolean.False;

    gv.OptionsSelection.EnableAppearanceFocusedCell = false;
    gv.OptionsBehavior.Editable = false;
    gv.OptionsSelection.MultiSelect = true;
    gv.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.RowSelect;

    gv.OptionsView.ShowAutoFilterRow = true;
    gv.OptionsFind.AlwaysVisible = false;
}
```

- **Read-only by default:** edits happen in an explicit form or drawer.
- **Filtering:** the auto-filter row is the instant search header; the find panel stays hidden unless the user toggles it.
- **Zebra (AS-07):** `EnableAppearanceEvenRow = true` is allowed only through the opt-in helper (`ApplyZebraOptIn` in platform-mapping.md): read-only grid, >= 8 visible columns, `EvenRow.BackColor = BgElevated`.

### Column Formatting Standards
- **Monetary & Numeric Values:** Set `DisplayFormat.FormatType = FormatType.Numeric` with `DisplayFormat.FormatString = "{0:N0}"` or `"{0:N2}"`. Align **Far (Right)**.
- **Dates & Timestamps:** Align **Center** with format `"{0:yyyy-MM-dd HH:mm}"`.
- **Status Columns:** Use `RepositoryItemImageComboBox` or custom badge drawing with `--radius-sm` corners and the `-fg/-bg/-border` state tokens (AS-01, AS-04). Never render raw status integer IDs.

---

## 4. Anti-Slop Mapping (DevExpress)

| AS ID | DevExpress / WinForms application |
| :--- | :--- |
| AS-01 | Skin palette accent = `BrandPrimary`; state colors from `EnterpriseTheme` `-Fg/-Solid/-Bg` members |
| AS-02 | Keep skin defaults for shadows; custom-painted text has no shadow or glow effect |
| AS-03 | No looping timers that animate idle controls; `MarqueeProgressBarControl` only while I/O is active |
| AS-04 | Custom-drawn chips and badges use the radius tokens; no capsule shapes on data |
| AS-05 | `SvgImage` icons, 16px, on ribbon/bar items and navigation only; captions use words |
| AS-06 | Flat `BackColor` from tokens; no `LinearGradientBrush` on panels or progress fills |
| AS-07 | `RowHeight` within the desktop band (default 28); dividers via `ShowHorizontalLines` |
| AS-09 | Keep `FocusRectStyle` visible; do not disable the native focus cue |
| AS-11 | Verb-first captions; `AlertControl` text states cause + action |
| AS-C1..C5 | Code samples carry no narrating comments; obsolete handlers are deleted, not commented out |

---

## 5. Toolbar & Ribbon Ergonomics

- **Ribbon Layout:** Limit ribbon categories to primary business workflows (e.g., *Home*, *Inventory*, *Reports*). Do not create a separate ribbon tab for 1 or 2 buttons.
- **Action Verbs (R_UI, AS-11):** Every button label **MUST** begin with an action verb (*Lưu*, *Duyệt*, *Xuất Excel*, *Hủy bỏ*). Strictly forbid generic labels (*OK*, *Chạy*).
- **Icon Sizing (AS-05):** 16px SVG icons (`DevExpress.Utils.Svg.SvgImage`) by default. The ribbon's large-button glyph size is reserved for the one primary CTA of a page group (Save, Approve). SVG guarantees crisp rendering across 100%, 125%, 150%, and 200% DPI.

---

## 6. In-Window Feedback & Alerting Policy

1. **No Blocking Message Boxes for Normal Flows:**
   - Saving or updating a record **MUST NEVER** invoke `XtraMessageBox.Show("Saved successfully")`.
   - Use in-window status strip or `DevExpress.XtraBars.Alerter.AlertControl` pinned to bottom-right that auto-dismisses after 3 seconds.
2. **Modal Confirmations Strictly for Irreversible Actions:**
   - Deactivating master records or voiding posted ledger entries requires a modal dialog stating the exact count:
     > *"Bạn có chắc chắn muốn ngừng sử dụng **12** mặt hàng đã chọn?"*
     > Button: `[ Ngừng sử dụng 12 mặt hàng ]`, never `[ OK ]`.
