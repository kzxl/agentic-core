---
name: wpf-ui
description: Use when building or reviewing WPF desktop UI - XAML resource dictionaries and brushes, dark/light themes, compact density, control templates (buttons, inputs, scrollbars), window chrome, shadows, storyboards, InfoBar/ContentDialog patterns, or DevExpress WPF theme sync.
desc: Comprehensive C# WPF Desktop UI Standards — Fluent Design, Dark/Light Themes, Compact Density & Modern Controls
rules: [R_WPF, R_CORE, R_ANTI_SLOP]
---
# C# WPF Desktop UI & Theming Standards

This standard specializes the [Universal Software UI/UX Design System](file:///E:/16.%20AgentOption/standards/universal/ui-ux-design-system.md) for C# WPF Desktop applications. All core ergonomics, color theory, density modes, and action verb naming rules apply directly. Visual laws come from the [Anti-AI-Slop Standard](file:///E:/16.%20AgentOption/standards/universal/ui-anti-ai-slop-standard.md) (cited by AS ID); values come from [tokens.md](file:///E:/16.%20AgentOption/skills/ui-design-system/references/tokens.md).

## 1. Visual Hierarchy & Color Palette Tokens (Design Tokens)

All colors and brushes are `SolidColorBrush` resources keyed by token name, with values taken from tokens.md. Ad-hoc hex literals in views and unmapped `SystemColors` are prohibited. Reference brushes with `{DynamicResource ...}` so theme switching works.

| Token (tokens.md) | Brush Key | Role & Usage Description |
| :--- | :--- | :--- |
| `--bg-canvas` | `BrushBgCanvas` | Primary window background canvas |
| `--bg-surface` | `BrushBgSurface` | Container cards, toolbars, grouped panels |
| `--bg-elevated` | `BrushBgElevated` | Input surfaces: TextBox, ComboBox, ListBox |
| `--bg-hover` | `BrushBgHover` | Hover state for buttons, list items, and interactive rows |
| `--border-default` | `BrushBorderDefault` | Standard boundary stroke separating cards and controls |
| `--border-subtle` | `BrushBorderSubtle` | Subtle interior dividers and nested section borders |
| `--border-strong` | `BrushBorderStrong` | Hovered and active boundaries |
| `--border-input` | `BrushBorderInput` | TextBox, ComboBox, CheckBox, and grid-editor boundaries (AS-08, >= 3:1) |
| `--brand-primary` | `BrushBrandPrimary` | The one brand accent: CTA buttons, active tabs, focus visuals (AS-01) |
| `--brand-primary-hover` | `BrushBrandPrimaryHover` | Hover state of the brand accent |
| `--text-primary` | `BrushTextPrimary` | Primary labels, headers, data content |
| `--text-secondary` | `BrushTextSecondary` | Secondary captions, descriptive helper text |
| `--text-muted` | `BrushTextMuted` | Placeholders, hotkey shortcuts, timestamps |
| `--{state}-fg/-solid/-bg/-border` | `BrushSuccessFg`, `BrushDangerSolid`, ... | Semantic states `success`, `warning`, `danger`, `info` |

---

## 2. Density & Sizing Standards

Select either Compact or Standard density based on application domain:

### A. Compact Density (Desktop Utilities, Developer Tools, ERP Data-Heavy Views)
* **Button Height:** `26 – 28px` (Padding: `8,3` to `10,4`, FontSize: `11.5 – 12px`)
* **ComboBox / TextBox:** `28 – 30px` (Padding: `8,4`, FontSize: `12 – 12.5px`)
* **DataGrid RowHeight:** desktop band 24-28px, default 28 (AS-07). Zebra off by default (`AlternationCount` unset); opt-in only for read-only grids with >= 8 visible columns using `BrushBgElevated`.
* **CornerRadius (AS-04):** `--radius-md` (controls), `--radius-lg` (cards, popups), `--radius-sm` (chips).
* **Slim ScrollBar:** Width `5px`, transparent track, subtle thumb with `--radius-xs` corners.

### B. Standard Density (Admin Portals, Dashboards, Consumer Apps)
* **Button Height:** `34 – 38px` (Padding: `14,7`, FontSize: `13 – 14px`)
* **ComboBox / TextBox:** `36 – 40px` (Padding: `12,8`, FontSize: `14px`)
* **CornerRadius (AS-04):** `--radius-md` (controls), `--radius-lg` (cards).
* **ScrollBar:** Width `8 – 10px`.

---

## 3. Window Chrome & Extended TitleBar Patterns

* **TitleBar Client Area Integration:**
  * Extend window content into the title bar area (`TitleBar.ExtendViewIntoTitleBar`).
  * Merge branding logos, global search/selectors, and quick action buttons into a single unified top toolbar row.
  * Reclaims `40 – 60px` of vertical screen real estate for modern Fluent/WinUI aesthetic.
* **Elevation (AS-02, AS-08):**
  * Cards use `--elevation-0` (1px `BrushBorderDefault`, no effect).
  * Floating overlays (popups, flyouts, dialogs) encode `--elevation-overlay` as a neutral black `DropShadowEffect`; never a colored shadow.
  * Overlay surfaces stay >= 90% opaque; no blur-based legibility.

---

## 4. Modern Control Templates & UX Patterns

### ① Button Variants
* **`ModernButton`:** `BrushBgSurface` fill, 1px `BrushBorderStrong` stroke, hover transition to `BrushBgElevated`, hand cursor.
* **`AccentButton`:** Flat `BrushBrandPrimary` fill (AS-06), hover `BrushBrandPrimaryHover`, semi-bold typography for the primary call-to-action.
* **`IconButton`:** Transparent background and border by default; hover reveals `BrushBgHover` with `--radius-md` corners.

### ② Focus & Motion
* **Focus (AS-09):** keep the default `FocusVisualStyle` or replace it with a visible 2px `BrushBrandPrimary` outline; never set it to `{x:Null}` alone.
* **Motion (AS-03):** `Storyboard` durations come from the motion tokens, animate `Opacity` and `RenderTransform` only, run once per state change, and are skipped when `SystemParameters.ClientAreaAnimation` is `false`. Indeterminate `ProgressBar` only while I/O is active.

### ③ In-Window Notification (`InfoBar` Pattern)
* Avoid blocking modal `MessageBox.Show()` dialogs during normal workflow unless confirming irreversible deletion.
* Utilize top-pinned in-window **InfoBar Banners** (Severity: `Info`, `Success`, `Warning`, `Error`) with close action or auto-dismiss after 3–5 seconds, colored with the state `-bg/-border/-fg` brushes.

### ④ In-Window Dialog (`ContentDialog` Pattern)
* Prefer dimming backdrop overlays with centered modal UserControls over spawning multiple separate OS-level modal windows.

---

## 5. DevExpress & Third-Party Theme Synchronization
* Synchronize palette tokens with DevExpress via SVG Palette Mapping (`DevExpress.Xpf.Core.ApplicationThemeHelper`).
* Mandate vector icon formats (SVG / Geometry Path / Segoe MDL2 Assets) over static bitmap PNGs to guarantee dynamic theme adaptation; icons are 16px on navigation and action bars (AS-05).
