# 🧩 Cross-Platform Component Specifications & Ergonomics

This reference defines the structural anatomy, behavioral invariants, and visual states for core UI components across desktop, web, and mobile enterprise applications.

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
| **`Primary CTA`** | `PrimaryAccent` (`#818CF8` / `#4F46E5`) | None | `#FFFFFF` | `4px` | The singular forward-moving goal of the screen. |
| **`Modern Default`** | `BgElevated` (`#1F2233` / `#F1F3F9`) | `1px solid BorderDefault` | `TextPrimary` | `4px` | Secondary workflows, cancel buttons, modal dismissals. |
| **`Ghost / Icon`** | `Transparent` (hover: `BgHover`) | None | `TextSecondary` | `3px` | Header actions, table cell buttons, search clear. |
| **`Destructive`** | `Transparent` (hover: `rgba(248,113,113,0.12)`)| `1px solid Danger` | `Danger` (`#F87171` / `#EF4444`) | `4px` | Critical deletions, irreversible cancellations. |

### 1.2 Action Verb Naming Law (R_UI)
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
| **Corner Radius** | `3 – 4px` | `6px` |

### 2.2 Input States & Behavioral Invariants
- **Normal:** Background `BgElevated`, border `1px solid BorderDefault`, text `TextPrimary`.
- **Hover:** Border transitions to `BorderLight` (`#3E4663` dark / `#BAC5DD` light) in `150ms`.
- **Focus:** Border transitions to `PrimaryAccent` (`#818CF8`). Glow/drop-shadow is strictly forbidden; a crisp `1px` or `2px` stroke provides sufficient focus indication.
- **Error / Invalid:** Border becomes `Danger` (`#F87171`). Helper text below the input renders in `Danger` at caption size (`11px`).
- **Disabled:** Background `BgCanvas`, border `BorderSubtle`, text `TextMuted` (opacity $\sim 40\%$).

---

## 3. ENTERPRISE DATA GRIDS (THE ENTERPRISE WORKHORSE)

Enterprise data grids (`GridControl`, `DataGrid`, `Table`) are high-density, keyboard-driven workspaces where operators spend hours processing tabular data.

### 3.1 Grid Visual Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ CODE       NAME                 CATEGORY     QTY      STATUS   ACTIONS │ <- Header (Micro, 11px)
├────────────────────────────────────────────────────────────────────────┤
│ PRD-001    Centrifugal Pump     Machinery    1,420    ACTIVE     [...] │ <- Row 1 (26–28px, Tabular)
├────────────────────────────────────────────────────────────────────────┤
│ PRD-002    Pressure Sensor      Electronics     85    WARNING    [...] │ <- Row 2 (Divider separation)
└────────────────────────────────────────────────────────────────────────┘
```

- **Row Height:** Strictly clamped to **`26 – 28px`** in compact desktop views (`36 – 40px` in standard web views).
- **Divider Separation over Zebra Stripes:** Never use alternating dark/light row striping (`zebra striping`), which creates visual noise across 50+ rows. Use subtle `1px solid BorderSubtle` horizontal dividers.
- **Column Header:** Font size `10.5 – 11.5px`, SemiBold (`600`), text color `TextSecondary`. Subtle bottom border `BorderDefault`.
- **Numeric Alignment:** All quantities, currencies, and percentages **MUST be right-aligned** and formatted with tabular lining numbers.
- **Text Alignment:** Names and descriptions are left-aligned. Status badges and action buttons are centered.

### 3.2 Keyboard & Interaction Grammar
- **Single Click:** Selects the row or cell. Does not enter edit mode or trigger destructive actions.
- **Double Click / Enter Key:** Opens the detail view or launches an explicit edit form.
- **Up / Down Arrow Keys:** Navigates active row smoothly without full-page scrolling jumps.
- **Search Filtering:** Dedicated top-right search box filtering data in real-time ($< 200\text{ms}$ debounce).

---

## 4. IN-WINDOW NOTIFICATIONS & WORKFLOW FEEDBACK

Desktop and business applications must prioritize spatial continuity. Saving data should never disrupt the operator's view.

```
Severity: Low  ──────────────> Medium ──────────────> Critical / Destructive
Pattern:  In-Window Toast      Top InfoBar Banner     Modal Dialog (ContentDialog)
Usage:    "Saved successfully" "Offline mode active"  "Deactivate 1,253 selected items?"
```

### 4.1 Tier 1: In-Window Toast (Non-Blocking Confirmation)
- **Visuals:** Background `BgSurface`, border `1px solid BorderDefault`, left accent bar `4px solid Success`.
- **Behavior:** Anchored to bottom-right or top-right of window. Auto-dismisses after **3 to 5 seconds**.
- **Rule:** Never spawn modal `MessageBox.Show("Saved successfully")` that forces the user to click "OK".

### 4.2 Tier 2: Top InfoBar Banner (Persistent Environmental Alert)
- **Visuals:** Full-width strip pinned directly below the toolbar or header.
- **Severities:** `Info` (blue pip), `Warning` (amber pip), `Danger` (red pip).
- **Behavior:** Persists until the underlying condition resolves or user clicks the right-aligned `[×]` button.

### 4.3 Tier 3: Modal Dialog (ContentDialog)
- **Backdrop:** Translucent dimming overlay (`rgba(15, 17, 26, 0.7)`).
- **Rule:** Reserved exclusively for destructive, irreversible operations or authentication gates.
- **Confirmation Copy Law:** Confirmation dialogs **MUST** state the specific blast radius:
  > *"Are you sure you want to deactivate **42** selected supplier accounts?"*
  > Button label: `[ Deactivate 42 Accounts ]`, never `[ OK ]`.

---

## 5. STATUS BADGES & CHIPS

- **Rectangular Geometric Rhythm:** Corner radius **`3 – 4px`** (never 9999px pills).
- **Desaturated Surface Fill:** Background uses $10–15\%$ opacity tint of semantic color.
- **1px Border:** Stroke uses $30–40\%$ opacity tint of semantic color.
- **Typography:** Micro size `10.5 – 11.5px`, SemiBold, uppercase or sentence case.

```
[  ACTIVE  ]  -> Bg: rgba(52, 211, 153, 0.12), Border: rgba(52, 211, 153, 0.4), Text: #34D399
[  PENDING ]  -> Bg: rgba(251, 191, 36, 0.12), Border: rgba(251, 191, 36, 0.4), Text: #FBBF24
[  FAILED  ]  -> Bg: rgba(248, 113, 113, 0.12), Border: rgba(248, 113, 113, 0.4), Text: #F87171
```

---

## 6. SEGMENTED CONTROLS & MECHANICAL SWITCHES

- **Container:** Background `BgElevated`, border `1px solid BorderDefault`, corner radius `4px`.
- **Active Segment:** Background `PrimaryAccent` (or inverted `TextPrimary`), text `#FFFFFF` (or `BgCanvas`).
- **Inactive Segment:** Transparent background, text `TextSecondary`, subtle hover brightening.
- **Transition:** Snappy `150 – 200ms ease-out` sliding or fading.
