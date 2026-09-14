---
desc: Universal Software UI/UX Design System — Cognitive Ergonomics, Color Theory, Typography, Component Hierarchy, Density Modes & Subsystem Inheritance
rules: [R_CORE, R_UI]
---
# 🎨 Universal Software UI/UX Design System

This standard establishes the universal foundation for user interface (UI) and user experience (UX) engineering across all software applications in the AgentOption ecosystem (Desktop WPF/WinForms, Web, and Mobile). Subsystems specialize and map these core tenets to framework-specific controls.

---

## 1. Core Cognitive Ergonomics & UX Principles

### ① Cognitive Load Reduction & Hick's Law
* **Progressive Disclosure:** Expose only critical operational controls on the primary canvas. Defer advanced, administrative, or debug parameters to expandable panels, tabs, or settings drawers.
* **Option Clamping:** Avoid presenting more than 5–7 choices simultaneously in a single group. If choices exceed 7, provide categorization, search filtering, or preset chips.

### ② Action-Oriented Verbs (Button Naming Rule)
* All actionable buttons **MUST** begin with a concise, imperative verb describing the exact operation (e.g., *Save*, *Apply*, *Export*, *Preview*, *Clear*, *Connect*).
* **Prohibition:** Never use generic or vague labels (e.g., *OK*, *Submit*, *Go*, *Click Here*).
* **Label Length:** Keep button labels strictly between **1 to 3 words** (`<= 20 characters`). Never place full descriptive sentences or explanations inside a button body.

### ③ Non-Intrusive Workflow & Safe State Persistence
* **No Sudden Window Minimization:** Saving or applying configuration **MUST NEVER** automatically minimize, hide, or close the main application window. Users must retain spatial continuity and manually decide when to dismiss windows.
* **Non-Blocking Feedback:** Affirmative operations (save, refresh, cache cleanup) must deliver non-modal in-window feedback (Toast, InfoBar) and immediately release the interaction loop. Modal dialogs are strictly reserved for destructive or irreversible actions.

### ④ Localization Clarity (Single Active Language Principle)
* **Single Active Language:** An application must display exactly one active language at a time (e.g., 100% Vietnamese or 100% English).
* **Anti-Concatenation Prohibition:** **NEVER** concatenate multiple languages into a single control label using parentheses (e.g., ❌ `Lưu & Áp dụng (Save & Apply)`, ❌ `Đổi ảnh (Change Now)`). This practice doubles cognitive processing time, creates visual clutter, and breaks responsive button widths.
* If a bilingual mode is offered, secondary translations may only appear in helper tooltips, never in primary button text or navigation tabs.

---

## 2. Color Theory & Design Token Architecture

### ① The 5-Tier Token & State Architecture
A raw color palette is NOT a design system. Enterprise interfaces require a 5-tier abstraction pipeline translating raw colors into functional, stateful, and business-safe workflows:

```
[ Tier 1: Primitive Palette ] -> Raw hex values (#2563EB, #16A34A, #DC2626)
            ↓
[ Tier 2: Semantic Tokens   ] -> Purpose-mapped tokens (BgCanvas, PrimaryAccent, Danger)
            ↓
[ Tier 3: Component Tokens  ] -> Scoped control variables (Button.Primary.Bg, Input.Border)
            ↓
[ Tier 4: Component States  ] -> Interactive lifecycle (Normal, Hover, Pressed, Focus, Disabled, Loading)
            ↓
[ Tier 5: Business UX Rules ] -> Mission-critical rules (Permission gating, ledger delete defense, batch limits)
```

Without Tiers 4 & 5, visual mockups look modern but break catastrophically in enterprise production.

### ② The 60-30-10 Spatial Balance Rule
* **60% Dominant Canvas (Neutral Background):** Low-contrast foundation providing visual rest.
* **30% Structural Surfaces (Cards, Panels, Text):** Container surfaces, dividers, primary data labels.
* **10% Intentional Accent (Focal Points):** Reserved exclusively for Primary Call-to-Action (CTA) buttons, active tabs, status pips, and key focus rings.

### ③ Surface Elevation & Layering (Dark vs Light)
* **Dark Mode Canvas:** Avoid pure black (`#000000`), which causes eye fatigue and extreme contrast halation against white text. Use layered Obsidian tones with subtle blue/slate undertones:
  * *Base Canvas:* `#0F111A` (Deep canvas)
  * *Card / Surface:* `#181A26` (Elevated content container)
  * *Nested Input / Active:* `#1F2233` (Inset controls and selected items)
  * *Hover State:* `#2A2E45` (Interactive highlight)
* **Light Mode Canvas:** Use off-white, cool gray canvases to mitigate glare:
  * *Base Canvas:* `#F8F9FC`
  * *Card / Surface:* `#FFFFFF`
  * *Nested Input:* `#F1F3F9`
  * *Hover State:* `#E8EDF8`

### ③ Saturation Management & Eye Fatigue
* Large surface areas (windows, toolbars, grids) **MUST** remain neutral and desaturated.
* High-saturation hues are strictly restricted to small visual footprints ($<5\%$ of screen area): status indicators, notification badges, active icons, and primary CTA buttons.

### ④ Universal Design Token Matrix

| Token Name | Dark Hex | Light Hex | Semantic Role & Visual Guidance |
| :--- | :--- | :--- | :--- |
| **`BgCanvas`** | `#0F111A` | `#F8F9FC` | Outermost application canvas and window background |
| **`BgSurface`** | `#181A26` | `#FFFFFF` | Grouping containers, cards, tables, top toolbars |
| **`BgElevated`** | `#1F2233` | `#F1F3F9` | Text boxes, dropdown lists, nested sub-sections |
| **`BgHover`** | `#262A3D` | `#E8EDF8` | Mouse hover feedback for interactive rows & buttons |
| **`BgActive`** | `#313752` | `#D9E2F5` | Pressed buttons, actively selected list rows |
| **`BorderDefault`** | `#2B3046` | `#DCE1EE` | Primary bounding strokes for cards and inputs |
| **`BorderSubtle`** | `#202436` | `#EAEFF8` | Interior card dividers, table row separator lines |
| **`PrimaryAccent`** | `#818CF8` | `#4F46E5` | Brand CTA button fill, active tab highlight, focus ring |
| **`PrimaryAccentDark`** | `#6366F1` | `#4338CA` | Pressed state or gradient end for primary actions |
| **`SecondaryAccent`**| `#A78BFA` | `#7C3AED` | Informational pips, highlight chips, category badges |
| **`TextPrimary`** | `#F1F5F9` | `#0F172A` | Primary data, headers, form field values (100% opacity) |
| **`TextSecondary`** | `#94A3B8` | `#475569` | Helper descriptions, form labels (~70% opacity) |
| **`TextMuted`** | `#64748B` | `#94A3B8` | Disabled state, hotkey hints, timestamps (~50% opacity) |
| **`Success`** | `#34D399` | `#10B981` | Positive states, active connection, saved confirmation |
| **`Danger`** | `#F87171` | `#EF4444` | Destructive action, hardware fault, validation error |
| **`Warning`** | `#FBBF24` | `#F59E0B` | Cautionary state, pending background sync, retry limit |
| **`Info`** | `#38BDF8` | `#0284C7` | Informational tips, neutral live telemetry |

### ⑤ Contrast & Accessibility Compliance
* **Text Contrast:** Body text (`TextPrimary`) must maintain a minimum contrast ratio of **4.5:1** against its enclosing surface (WCAG 2.1 Level AA).
* **UI Controls & Boundaries:** Input borders and interactive icons must maintain at least **3.0:1** contrast against adjacent backgrounds.

---

## 3. Typography & Information Hierarchy

### ① Standard Type Scale

| Level | Size | Weight | Role | Casing Rule |
| :--- | :--- | :--- | :--- | :--- |
| **H1 — Window Title** | `18 – 20px` | Bold (`700`) | Application title, main modal title | Title Case |
| **H2 — Section Header** | `14 – 15px` | SemiBold (`600`) | Card grouping titles, major tab headers | Sentence Case |
| **H3 — Sub-Section** | `13 – 13.5px` | SemiBold (`600`) | Sub-groupings, table column headers | Sentence Case |
| **Body — Primary** | `12.5 – 13px` | Regular (`400`) | Primary form fields, table cell values | Natural |
| **Caption — Secondary**| `11.5 – 12px` | Regular (`400`) | Helper instructions, secondary metrics | Sentence Case |
| **Microcopy / Badge** | `10 – 11px` | Bold (`700`) | Status badges, version chips, timestamps | Upper / Sentence |

### ② Casing Standards
* **Sentence Case Default:** All labels, section headers, instructions, and error messages **MUST** use Sentence case (capitalize only the first letter and proper nouns).
* **ALL-CAPS Prohibition:** Avoid full uppercase strings (`SELECT WALLPAPER SOURCE`, `ERROR OCCURRED`). All-caps diminishes word-shape recognition and conveys visual hostility.

---

## 4. Component Ergonomics & Interaction Standards

### ① Button Hierarchy Matrix

```
[ Primary CTA (AccentButton) ]  -> Max 1 per view (Save, Start, Confirm)
[ Secondary (ModernButton)  ]  -> Multiple allowed (Preview, Browse, Export)
[ Ghost / Icon Button       ]  -> Toolbars, inline grid actions (Edit, Copy, Close)
[ Destructive (DangerButton)]  -> Clear Blacklist, Delete Account, Wipe Data
```

* **Exclusivity:** Exactly **one** `Primary CTA` per visual region. Competing primary buttons confuse the visual path.
* **Placement:** Primary CTA buttons are positioned on the bottom-right in Western reading layouts (or top-right in toolbars). Cancel/Dismiss buttons sit to the left of the Primary CTA.

### ② Feedback & Notification Tier

```
Severity: Low  ──────────────> Medium ──────────────> Critical / Destructive
Pattern:  In-Window Toast      Top InfoBar Banner     Modal Dialog (ContentDialog)
Usage:    "Saved successfully" "Offline mode active"  "Permanently delete all files?"
```

* **Tier 1: In-Window Toast (Auto-dismiss 3–5s):** Used for non-blocking success confirmations. Disappears automatically without requiring user clicks.
* **Tier 2: In-Window InfoBar Banner (Persistent with Close 'X'):** Used for state conditions (e.g. license expiring, hardware disconnected).
* **Tier 3: Modal Dialog (Centered Backdrop Dim):** Strictly required when an action cannot be undone or will result in data loss.

---

## 5. Density Modes & 4/8px Spatial Grid

All paddings, margins, gutters, and control heights **MUST** align with the **4px / 8px spatial rhythm** (`4, 8, 12, 16, 20, 24, 32, 40, 48px`).

### ① Compact Density (Utilities, ERP, Developer Tools)
* **Target:** Screen real-estate optimization, high information density, desktop mice with sub-pixel precision.
* **Button Height:** `28 – 32px` | **Padding:** `10,4` to `12,6` | **Font:** `12px`
* **Input / Dropdown:** `28 – 30px` | **Padding:** `8,4`
* **Card Padding:** `12 – 16px` | **Corner Radius:** `6px`

### ② Standard Density (Consumer Portals, Dashboards, Mobile/Touch)
* **Target:** Touch-friendly targets (minimum $44 \times 44\text{px}$ touch target), relaxed scannability.
* **Button Height:** `36 – 40px` | **Padding:** `16,8` to `20,10` | **Font:** `13.5 – 14px`
* **Input / Dropdown:** `36 – 40px` | **Padding:** `12,8`
* **Card Padding:** `20 – 24px` | **Corner Radius:** `10 – 12px`

---

## 6. Subsystem Inheritance & Mapping Matrix

Framework-specific standards inherit tokens directly from this universal design system:

| Universal Token | WPF (`wpf-ui.md`) | WinForms (`winforms.md`) | Android Compose (`compose-ui-ux.md`) | Web CSS |
| :--- | :--- | :--- | :--- | :--- |
| **`BgCanvas`** | `{DynamicResource BrushBgDark}` | `SkinColor.Canvas` | `colorScheme.background` | `var(--bg-canvas)` |
| **`BgSurface`** | `{DynamicResource BrushBgCard}` | `SkinColor.Surface` | `colorScheme.surface` | `var(--bg-surface)` |
| **`BgElevated`** | `{DynamicResource BrushBgCardElevated}` | `SkinColor.Control` | `colorScheme.surfaceVariant` | `var(--bg-elevated)` |
| **`BorderDefault`** | `{DynamicResource BrushBorderDefault}` | `SkinColor.Border` | `colorScheme.outline` | `var(--border-default)` |
| **`PrimaryAccent`** | `{DynamicResource BrushPrimaryAccent}` | `SkinColor.Primary` | `colorScheme.primary` | `var(--primary-accent)` |
| **`TextPrimary`** | `{DynamicResource BrushTextPrimary}` | `SkinColor.Text` | `colorScheme.onSurface` | `var(--text-primary)` |
| **`TextSecondary`** | `{DynamicResource BrushTextSecondary}` | `SkinColor.TextMuted` | `colorScheme.onSurfaceVariant` | `var(--text-secondary)`|
| **`Success`** | `{DynamicResource BrushSuccessAccent}` | `SkinColor.Success` | `CustomGreen` | `var(--success)` |
| **`Danger`** | `{DynamicResource BrushDangerAccent}` | `SkinColor.Danger` | `colorScheme.error` | `var(--danger)` |

---

## 7. Multi-Platform Expansion Architecture

When extending this universal design system into specific client platforms, follow these platform-native architectural patterns:

### ① WinForms Subsystem (Enterprise Desktop & ERP)
* **Design Token Implementation:** Map universal tokens to DevExpress SVG Palettes (`SvgPalette`) or a central `ThemeColors` static class.
* **Layout Structure:**
  * Top Ribbon or ToolBar (`barManager`): Action verbs only (`Lưu`, `Duyệt`, `Xuất Excel`), avoiding redundant labels.
  * Main Data Grid (`GridControl` / `GridView`): Compact density (`RowHeight = 26–28px`), alternate row background using `BgElevated`, cell typography `12px Segoe UI`.
  * Bottom Status Bar: In-window progress display (`barEditItemProgressBar`, `barStaticItem`) for long-running I/O tasks instead of blocking UI message boxes.
* **Modal Dialog Policy:** Standard Form save operations must use in-form status alerts; never spawn `XtraMessageBox.Show("Saved successfully")` that steals user focus.

### ② Web Subsystem (Responsive SPA / PWA / Dashboards)
* **Design Token Implementation:** Export universal tokens to CSS Custom Properties under `:root` and `[data-theme="dark"]`:
  ```css
  :root {
    --bg-canvas: #0F111A;
    --bg-surface: #181A26;
    --bg-elevated: #1F2233;
    --primary-accent: #818CF8;
    --text-primary: #F1F5F9;
    --radius-control: 6px;
  }
  ```
* **Responsive Breakpoints & Layout Adapters:**
  * **Desktop ($\ge 1024\text{px}$):** Persistent sidebar navigation, multi-column card grids, compact data tables.
  * **Tablet ($768\text{px} - 1023\text{px}$):** Collapsible drawer navigation, flexible 2-column form layouts.
  * **Mobile ($< 768\text{px}$):** Single-column stacked layout, bottom sticky CTA bar, full-bleed cards.
* **Accessibility (WCAG 2.1 AA):**
  * Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`).
  * Visible focus indicators: `:focus-visible { outline: 2px solid var(--primary-accent); outline-offset: 2px; }`.
  * Support system color scheme preference: `@media (prefers-color-scheme: dark)` with manual user override persisted in `localStorage`.

### ③ Mobile Subsystem (Android Jetpack Compose & iOS / Flutter)
* **Thumb Zone Ergonomics:**
  * Place primary action buttons (Floating Action Button, Sticky Bottom Bar) within the lower 33% "Natural Thumb Reach Zone".
  * Avoid placing primary interactive targets in upper corners where single-handed reach fails on modern large screens.
* **Touch Target Standards:**
  * Minimum touch target size: **$48 \times 48\text{dp}$** (even if visual icon is $24\text{dp}$, add touch padding).
  * Minimum interactive element spacing: **$8\text{dp}$** between adjacent targets to eliminate accidental misclicks.
* **Gesture & Physics Feedback:**
  * Integrate spring physics for animated reveals and sheet dismissals (`Spring.DampingRatioMediumBouncy`).
  * Subtle haptic feedback (`HapticFeedbackType.LongPress` / `HapticFeedbackType.TextHandleMove`) on primary status toggles.
* **System Edge-to-Edge:** Respect OS navigation bars and camera cutouts using `WindowInsets.safeDrawing`.

---

## 8. Enterprise Business UX & Data Integrity Standards (ERP & Mission-Critical Systems)

Enterprise Resource Planning (ERP), inventory, financial, and manufacturing software require strict adherence to business-logic UX rules that supersede mere visual styling:

### ① Lifecycle Safety: "Deactivate / Discontinue" vs "Hard Delete"
* **Foreign Key & Transaction Ledger Protection:**
  * If a record (Customer, Item, Warehouse, Account) is referenced by any historical transaction, journal, or audit log, **HARD DELETION IS STRICTLY FORBIDDEN**.
  * The UI **MUST NOT** render a destructive `[ Delete ]` button. Instead, provide `[ Deactivate ]` (`Ngừng sử dụng`) or `[ Archive ]`.
  * The record state must transition to `Inactive` / `Archived`, preventing selection in new transactions while preserving historical audit trail integrity.
* **Blast-Radius Batch Confirmation:**
  * If the user selects multiple rows for deletion or batch processing, the confirmation dialog **MUST** explicitly state the count and blast radius:
    > *"Are you sure you want to delete **1,253** selected items? This action cannot be undone."*
  * Destructive action buttons in confirmation dialogs must be labeled with the specific action verb (`[ Delete 1,253 Items ]`), never a vague `[ OK ]`.

### ② Data Grid Interaction Grammar (The Enterprise Workhorse)
Enterprise data grids (`GridControl`, `DataGrid`, `Table`) are high-density, keyboard-first environments. Applications **MUST** implement standard interaction grammar:

| Key / Gesture | Required Interaction Behavior |
| :--- | :--- |
| **`Single Click`** | Selects the active row or cell without triggering edits or navigation. |
| **`Double Click`** | Opens detail view / edit form, or drills down into transaction hierarchy. |
| **`Enter`** | Commits the active cell editor and advances focus to the next editable cell (or opens row detail if not editing). |
| **`F2`** | Enters in-place cell editing mode for the focused column. |
| **`Esc`** | Cancels in-place cell editing and reverts changes to original value. If not editing, clears row selection. |
| **`Ctrl + C`** | If a cell is focused: copies raw cell text. If full rows are selected: copies rows formatted as TSV/CSV. |
| **`Ctrl + F`** | Immediately moves keyboard focus to the grid's filter row or quick-search bar. |
| **`Arrow Keys`** | Seamlessly navigates focus between cells and rows across virtualization boundaries. |

* **Data Virtualization Mandate:** For datasets with $>1,000$ potential records, grids **MUST** employ windowed UI virtualization or server-side paging. Never load 40,000 records into memory or render un-virtualized visual trees.
* **In-Flight Mutation Defense:** If a user clicks Refresh, navigates away, or switches tabs while rows contain uncommitted edits, the system **MUST** present an unsaved changes prompt: *"You have unsaved changes. Discard changes or Save before proceeding?"*.

### ③ Form Field State Ergonomics
Form controls must cleanly reflect 6 distinct states through visual cues without relying solely on color:

```
[ Normal   ] -> Subtle border, standard placeholder.
[ Focused  ] -> 2px PrimaryAccent glow/outline, clear cursor indication.
[ Required ] -> Subtle red asterisk (*) adjacent to label + aria-required indicator.
[ ReadOnly ] -> Crisp readable text, copyable, tab-skipped, neutral surface (NOT dimmed).
[ Disabled ] -> Dimmed (40% opacity), non-focusable, non-interactive, cursor not-allowed.
[ Error    ] -> 1.5px Danger border + inline error icon and message positioned directly beneath the input.
```

* **ReadOnly vs Disabled Distinction:**
  * `ReadOnly`: The user is permitted to read and copy data, but not modify it (e.g. Doc Number, Approved Date). Content remains high contrast.
  * `Disabled`: The control is currently inapplicable or forbidden by state. Content is low contrast.

### ④ Permission-Driven UI Degradation (RBAC UX)
* **Preserve Spatial Muscle Memory:** If a user lacks edit permission for a document or record, the form controls **MUST degrade to `ReadOnly`**, NOT disappear entirely. Hiding controls breaks spatial memory and causes jarring visual jumps when switching accounts.
* **Complete Hiding:** Only hide navigation menus or top-level tabs if the user has zero read/view permission for that entire module.
* **Action Button Disabling:** Buttons for unauthorized actions (e.g. `[ Approve ]`, `[ Post Ledger ]`) should either be disabled with an informative permission tooltip (*"Requires Manager approval rights"*) or cleanly omitted from the action bar.

### ⑤ Numeric, Currency & Temporal Formatting Standards
* **Numeric Right-Alignment:** All numeric values (Quantities, Rates, Prices, Amounts) **MUST** be right-aligned in grids and inputs to facilitate rapid visual column scanning.
* **Tabular Figures (`tnum`):** Numbers must render in monospace or tabular figure fonts where all digits have identical character width.
* **Thousand Separators:** Always format numbers $>999$ with standard separators (e.g., `1,250,000.00`).
* **Negative Value Visibility:** Negative balances must be prominently distinguished using a bold minus sign or accounting parentheses in red (e.g., `(15,000.00)`).
* **Decimal Clamping:**
  * Quantity: 0 to 3 decimals based on unit of measure (e.g. `10 pcs`, `12.500 kg`).
  * Unit Price: 2 to 4 decimals for precision costing.
  * Total / Amount: Clamped to currency standard (e.g. 0 decimals for VND, 2 decimals for USD).
* **Temporal Precision:** Explicit datetime formatting based on cultural context (`dd/MM/yyyy` for VN, `yyyy-MM-dd` for ISO), displaying timezone offsets for multi-region systems.

### ⑥ Network Resilience & Optimistic UI Rollback
* **In-Flight Action Lock:** Disable action buttons and display a localized spinner during async network calls to prevent double-submission (e.g., creating duplicate invoices).
* **Optimistic UI Rollback:** If an action optimistically updates UI state before API response, the system must automatically revert to the exact previous snapshot and display a non-modal Error Toast if the request fails.
* **Offline Indication:** If API connectivity drops, display a non-blocking top banner (*"Offline — Reconnecting..."*) while preserving user inputs in local memory/cache. Never wipe form inputs on network dropouts.

