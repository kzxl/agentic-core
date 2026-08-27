---
desc: Comprehensive C# WPF Desktop UI Standards — Fluent Design, Dark/Light Themes, Compact Density & Modern Controls
rules: [R_WPF, R_CORE]
---
# 🎨 C# WPF Desktop UI & Theming Standards

## 1. Visual Hierarchy & Color Palette Tokens (Design Tokens)

All colors and brushes must strictly adhere to the layered token hierarchy. Hardcoded ad-hoc hex values and unmapped `SystemColors` are strictly prohibited.

| Token Name | Dark Value | Light Value | Role & Usage Description |
| :--- | :--- | :--- | :--- |
| **`BgDark`** / `BgPrimary` | `#11131F` | `#F8F9FC` | Primary window background canvas |
| **`BgCard`** / `BgSurface` | `#181A28` | `#FFFFFF` | Container cards, toolbars, grouped panels |
| **`BgInput`** | `#1D2034` | `#F1F3F9` | Input surfaces: TextBox, ComboBox, ListBox |
| **`BgHover`** | `#262A44` | `#E8EDF8` | Hover state for buttons, list items, and interactive rows |
| **`BgActive`** | `#32385C` | `#D9E2F5` | Pressed and selected states |
| **`BorderDefault`** | `#2E344E` | `#DCE1EE` | Standard boundary stroke separating cards and controls |
| **`BorderSubtle`** | `#23273C` | `#EAEFF8` | Subtle interior dividers and nested section borders |
| **`PrimaryAccent`** | `#818CF8` | `#4F46E5` | Brand accent: CTA buttons, active tabs, focus rings |
| **`PrimaryAccentDark`**| `#6366F1` | `#4338CA` | Gradient end / pressed state for primary action buttons |
| **`SecondaryAccent`**| `#A78BFA` | `#7C3AED` | Secondary highlight, badges, notification pips |
| **`TextPrimary`** | `#F1F5F9` | `#0F172A` | Primary labels, headers, data content (100% opacity) |
| **`TextSecondary`** | `#94A3B8` | `#475569` | Secondary captions, descriptive helper text (~70% opacity) |
| **`TextMuted`** | `#64748B` | `#94A3B8` | Placeholders, hotkey shortcuts, timestamps (~45% opacity) |
| **`SuccessAccent`** | `#A6E3A1` | `#16A34A` | Positive state, completed operation, saved status |
| **`DangerAccent`** | `#F38BA8` | `#DC2626` | Error indicators, critical alerts, destructive actions |
| **`WarningAccent`** | `#F9E2AF` | `#D97706` | Pending state, caution banner, attention needed |

---

## 2. Density & Sizing Standards

Select either Compact or Standard density based on application domain:

### A. Compact Density (Desktop Utilities, Developer Tools, ERP Data-Heavy Views)
* **Button Height:** `26 – 28px` (Padding: `8,3` to `10,4`, FontSize: `11.5 – 12px`)
* **ComboBox / TextBox:** `28 – 30px` (Padding: `8,4`, FontSize: `12 – 12.5px`)
* **CornerRadius:** `4px` (Child elements), `6 – 8px` (Cards), `10 – 12px` (Popups)
* **Slim ScrollBar:** Width `5px`, transparent track, rounded subtle thumb.

### B. Standard Density (Admin Portals, Dashboards, Consumer Apps)
* **Button Height:** `34 – 38px` (Padding: `14,7`, FontSize: `13 – 14px`)
* **ComboBox / TextBox:** `36 – 40px` (Padding: `12,8`, FontSize: `14px`)
* **CornerRadius:** `6 – 8px` (Controls), `12 – 14px` (Cards)
* **ScrollBar:** Width `8 – 10px`.

---

## 3. Window Chrome & Extended TitleBar Patterns

* **TitleBar Client Area Integration:**
  * Extend window content into the title bar area (`TitleBar.ExtendViewIntoTitleBar`).
  * Merge branding logos, global search/selectors, and quick action buttons into a single unified top toolbar row.
  * Reclaims `40 – 60px` of vertical screen real estate for modern Fluent/WinUI aesthetic.
* **Elevation & Glassmorphism:**
  * Apply lightweight `DropShadowEffect`: `BlurRadius="16-24"`, `ShadowDepth="2-4"`, `Opacity="0.3-0.45"`, `Color="#FF0B0D14"`.
  * Support translucent backdrops (`#F2181A28`) for floating overlays and quick popup widgets.

---

## 4. Modern Control Templates & UX Patterns

### ① Button Variants
* **`ModernButton`:** Dark card fill `#1F2236`, thin `BorderDefault` stroke, hover transition to `BgHover`, hand cursor.
* **`AccentButton`:** Gradient fill `PrimaryAccent` $\rightarrow$ `PrimaryAccentDark`, semi-bold typography for primary call-to-action.
* **`IconButton`:** Fully transparent background and border by default, revealing subtle hover pill on mouse over.

### ② In-Window Notification (`InfoBar` Pattern)
* Avoid blocking modal `MessageBox.Show()` dialogs during normal workflow unless confirming irreversible deletion.
* Utilize top-pinned in-window **InfoBar Banners** (Severity: `Info`, `Success`, `Warning`, `Error`) with close action or auto-dismiss after 3–5 seconds.

### ③ In-Window Dialog (`ContentDialog` Pattern)
* Prefer dimming backdrop overlays with centered modal UserControls over spawning multiple separate OS-level modal windows.

---

## 5. DevExpress & Third-Party Theme Synchronization
* Synchronize palette tokens with DevExpress via SVG Palette Mapping (`DevExpress.Xpf.Core.ApplicationThemeHelper`).
* Mandate vector icon formats (SVG / Geometry Path / Segoe MDL2 Assets) over static bitmap PNGs to guarantee dynamic theme adaptation.
