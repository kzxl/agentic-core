---
name: ui-components
description: Use when specifying or reviewing buttons, form inputs, data grids, zebra striping, toasts, InfoBars, modal dialogs, status badges and chips, progress bars, focus states, or segmented controls for desktop, web, or mobile enterprise UI. Component anatomy and states expressed in token names.
desc: Cross-Platform Component Specifications & Ergonomics for Enterprise Applications
rules: [R_CORE, R_UI, R_ANTI_SLOP]
---
# Cross-Platform Component Specifications & Ergonomics

This reference defines the structural anatomy, behavioral invariants, and visual states for core UI components across desktop, web, and mobile enterprise applications. Values come from [tokens.md](tokens.md); laws (AS IDs) come from [ui-anti-ai-slop-standard.md](../../../standards/universal/ui-anti-ai-slop-standard.md).

---

## 1. BUTTONS & ACTION CONTROLS

### 1.1 The 4-Tier Button Matrix

```
[ Tier 1: Primary CTA ]    -> Exactly 1 per visual quadrant (Save, Approve, Post Ledger)
[ Tier 2: Modern Default ] -> Multiple allowed (Preview, Browse, Export, Filter)
[ Tier 3: Ghost / Icon ]   -> Toolbars, row-level quick actions (Edit, Copy, Close)
[ Tier 4: Destructive ]    -> Irreversible actions (Deactivate, Wipe Cache, Cancel Order)
```

| Variant | Background Fill | Border Stroke | Text Color | Corner Radius | When to Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Primary CTA`** | `--brand-primary` (hover: `--brand-primary-hover`) | `1px solid --brand-primary` | white (light mode); dark mode uses the tint pattern in tokens.md §2.1 | `--radius-md` | The singular forward-moving goal of the screen. |
| **`Modern Default`** | `--bg-surface` (hover: `--bg-elevated`) | `1px solid --border-strong` | `--text-primary` | `--radius-md` | Secondary workflows, cancel buttons, modal dismissals. |
| **`Ghost / Icon`** | Transparent (hover: `--bg-hover`) | None | `--text-secondary` | `--radius-md` | Header actions, table cell buttons, search clear. |
| **`Destructive`** | Transparent (hover: `--danger-bg`) | `1px solid --danger-border` | `--danger-fg` | `--radius-md` | Critical deletions, irreversible cancellations. |

Color and border transitions use `--duration-fast` (AS-03 ladder L1).

### 1.2 Action Verb Naming Law (R_UI, AS-11)
- **Mandatory Leading Verb:** Every button label **MUST** begin with an active imperative verb (e.g., *Save Changes*, *Export CSV*, *Approve Voucher*, *Revert Changes*).
- **Strict Prohibition:** Never use vague or lazy labels (*OK*, *Submit*, *Go*, *Execute*, *Click Here*).
- **Length Constraint:** Between **1 to 3 words** (`<= 20 characters`). Never place full descriptive sentences inside a button.

---

## 2. FORM INPUTS & DATA ENTRY

### 2.1 Anatomy & Spatial Sizing

| Sizing Dimension | Compact Desktop (WinForms/WPF) | Standard Web / Touch |
| :--- | :--- | :--- |
| **Control Height** | `26 – 28px` | `36 – 40px` |
| **Internal Padding** | `Horizontal: 8px, Vertical: 3px` | `Horizontal: 12px, Vertical: 8px` |
| **Font Size** | `12 – 12.5px` (`Segoe UI`) | `14px` (`Inter`) |
| **Corner Radius** | `--radius-md` | `--radius-md` |

### 2.2 Input States & Behavioral Invariants
- **Normal:** Background `--bg-elevated` (or `--bg-surface`), border `1px solid --border-input` (AS-08, >= 3:1), text `--text-primary`. Selects, checkboxes, and grid in-place editors use the same boundary.
- **Hover:** Background transitions to `--bg-hover` in `--duration-fast`; the border stays `--border-input`.
- **Focus (AS-09):** Web: `:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px; }`. Desktop: native focus cue stays visible. Focus never uses glow or colored shadow.
- **Error / Invalid:** Border becomes `--danger-fg`. Helper text below the input renders in `--danger-fg` at `--type-caption`, stating cause + action (AS-11).
- **Disabled:** Background `--bg-canvas`, border `--border-subtle`, text `--text-disabled`.

---

## 3. ENTERPRISE DATA GRIDS (THE ENTERPRISE WORKHORSE)

Enterprise data grids (`GridControl`, `DataGrid`, `Table`) are high-density, keyboard-driven workspaces where operators spend hours processing tabular data.

### 3.1 Grid Visual Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ CODE       NAME                 CATEGORY     QTY      STATUS   ACTIONS │ <- Header (--type-micro)
├────────────────────────────────────────────────────────────────────────┤
│ PRD-001    Centrifugal Pump     Machinery    1,420    ACTIVE     [...] │ <- Row 1 (--row-desktop, tabular)
├────────────────────────────────────────────────────────────────────────┤
│ PRD-002    Pressure Sensor      Electronics     85    WARNING    [...] │ <- Row 2 (divider separation)
└────────────────────────────────────────────────────────────────────────┘
```

- **Row Height (AS-07):** Desktop band 24-28px (`--row-desktop`), web band 32-40px (`--row-web`, compact `--row-web-compact`), mobile `--row-mobile`.
- **Dividers, zebra off by default:** Separate rows with `1px solid --border-subtle` horizontal dividers plus `--bg-hover` on hover.
- **Zebra opt-in:** Read-only grids with >= 8 visible columns may tint alternate rows with `--bg-elevated` only. Editable or narrower grids keep dividers.
- **Column Header:** `--type-micro`, SemiBold (`600`), `--text-secondary`, bottom border `--border-default`.
- **Numeric Alignment:** All quantities, currencies, and percentages **MUST be right-aligned** and formatted with tabular lining numbers.
- **Text Alignment:** Names and descriptions are left-aligned. Status badges and action buttons are centered.

### 3.2 Keyboard & Interaction Grammar
- **Single Click:** Selects the row or cell. Does not enter edit mode or trigger destructive actions.
- **Double Click / Enter Key:** Opens the detail view or launches an explicit edit form.
- **Up / Down Arrow Keys:** Navigates active row smoothly without full-page scrolling jumps.
- **Search Filtering:** Dedicated top-right search box filtering data in real-time ($< 200\text{ms}$ debounce).

### 3.3 Empty & Loading States (AS-12)
- **Empty:** one muted line icon (<= 32px, `--text-muted`) + one sentence + an optional primary action.
- **Loading > 300ms:** skeleton rows at the real row height in `--bg-elevated`, static under reduced motion.

---

## 4. IN-WINDOW NOTIFICATIONS & WORKFLOW FEEDBACK

Desktop and business applications must prioritize spatial continuity. Saving data should never disrupt the operator's view.

```
Severity: Low  ──────────────> Medium ──────────────> Critical / Destructive
Pattern:  In-Window Toast      Top InfoBar Banner     Modal Dialog (ContentDialog)
Usage:    "Saved successfully" "Offline mode active"  "Deactivate 1,253 selected items?"
```

### 4.1 Tier 1: In-Window Toast (Non-Blocking Confirmation)
- **Visuals:** Background `--bg-surface`, border `1px solid --border-default`, `--elevation-overlay`, left accent bar `4px solid --success-solid`.
- **Behavior:** Anchored to bottom-right or top-right of window. Enters once (AS-03 ladder L2). Auto-dismisses after **3 to 5 seconds**.
- **Rule:** Never spawn modal `MessageBox.Show("Saved successfully")` that forces the user to click "OK".

### 4.2 Tier 2: Top InfoBar Banner (Persistent Environmental Alert)
- **Visuals:** Full-width strip pinned directly below the toolbar or header, `--{state}-bg` fill, `--{state}-border` bottom border, `--{state}-fg` icon and text.
- **Severities:** `info`, `warning`, `danger`.
- **Behavior:** Persists until the underlying condition resolves or user clicks the right-aligned `[×]` button.

### 4.3 Tier 3: Modal Dialog (ContentDialog)
- **Backdrop:** Neutral black dimming scrim; the dialog itself is opaque `--bg-surface` with `--elevation-overlay` and `--radius-lg` (AS-08: no blur for legibility).
- **Rule:** Reserved exclusively for destructive, irreversible operations or authentication gates.
- **Confirmation Copy Law:** Confirmation dialogs **MUST** state the specific blast radius:
  > *"Are you sure you want to deactivate **42** selected supplier accounts?"*
  > Button label: `[ Deactivate 42 Accounts ]`, never `[ OK ]`.

---

## 5. STATUS BADGES & CHIPS (AS-01, AS-04)

- **Shape:** Rectangular, `--radius-sm` (4px).
- **Fill:** `--{state}-bg`.
- **Border:** `1px solid --{state}-border`.
- **Text:** `--{state}-fg`, `--type-micro`, SemiBold, uppercase or sentence case.

```
[  ACTIVE  ]  -> Bg: --success-bg, Border: --success-border, Text: --success-fg
[  PENDING ]  -> Bg: --warning-bg, Border: --warning-border, Text: --warning-fg
[  FAILED  ]  -> Bg: --danger-bg,  Border: --danger-border,  Text: --danger-fg
```

---

## 6. PROGRESS BARS & METERS (AS-03, AS-06)

- **Track:** `--bg-elevated` fill, `1px solid --border-default`, `--radius-xs`, `overflow: hidden`.
- **Fill:** flat `--brand-primary` (or a semantic `-solid`), full width of the track, scaled with `transform: scaleX(var(--progress))` and `transform-origin: left`.
- **Transition:** `transform var(--duration-data)`, disabled under reduced motion.

---

## 7. SEGMENTED CONTROLS & MECHANICAL SWITCHES

- **Container:** Background `--bg-elevated`, border `1px solid --border-default`, `--radius-md`.
- **Active Segment:** Background `--brand-primary` (or inverted `--text-primary`), text white (or `--bg-canvas`).
- **Inactive Segment:** Transparent background, text `--text-secondary`, hover `--bg-hover`.
- **Transition:** `--duration-fast` on background color, opacity, or transform (AS-03 ladder L1).
