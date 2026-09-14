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

### ① The 60-30-10 Spatial Balance Rule
* **60% Dominant Canvas (Neutral Background):** Low-contrast foundation providing visual rest.
* **30% Structural Surfaces (Cards, Panels, Text):** Container surfaces, dividers, primary data labels.
* **10% Intentional Accent (Focal Points):** Reserved exclusively for Primary Call-to-Action (CTA) buttons, active tabs, status pips, and key focus rings.

### ② Surface Elevation & Layering (Dark vs Light)
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
