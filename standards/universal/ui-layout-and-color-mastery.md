---
desc: Comprehensive UI Layout, Spatial Geometry, and Color Theory Mastery Guide for Software Applications
rules: [R_CORE, R_UI]
---
# 📐 UI Layout & Color Theory Mastery Guide

This guide provides the mathematical, psychological, and spatial foundations for constructing balanced, visually ergonomic, and functional software user interfaces across Desktop, Web, and Mobile.

---

## 1. The Science & Mathematics of Color in Software

### ① The HSL/HSB Color Model over Hex/RGB
Designing UI with raw Hex (`#RRGGBB`) leads to inconsistent visual weights and poor contrast. Always calculate palettes using **HSL** (Hue, Saturation, Lightness):

```
Color = H (0° - 360°) | S (0% - 100%) | L (0% - 100%)
```

* **Hue ($H$):** The pure color identity (e.g. `220°` = Blue, `150°` = Green, `0°` = Red).
* **Saturation ($S$):** The color intensity. Enterprise software canvases use low saturation (`5% - 15%`) for structural elements to prevent visual fatigue.
* **Lightness ($L$):** The perceived luminance. Used to establish contrast and elevation.

### ② Hue-Shifting (Natural Light in Digital UI)
* **The Rookie Mistake:** Adjusting only Lightness (making colors look washed out or like muddy brown when darkened).
* **The Professional Rule (Hue Shifting):**
  * As a color gets **lighter / highlighted**, shift its Hue slightly toward **Warmth / Yellow** (`~60°`).
  * As a color gets **darker / shadowed**, shift its Hue slightly toward **Coolness / Deep Blue** (`~240°`).

```
Light Highlight (L=85%): Shift Hue toward Yellow (215° -> 200°)
Base Accent     (L=55%): Base Hue (215°)
Dark Shadow     (L=25%): Shift Hue toward Navy   (215° -> 230°)
```

### ③ Tinted Neutrals vs "Dead Gray"
* **"Dead Gray" (`#222222`, `#888888`, `#E0E0E0`):** Pure grayscale with zero saturation ($S=0\%$). It looks lifeless, cold, and uninviting.
* **"Living Slate / Tinted Neutrals":** Introduce **`3% – 8%` of subtle blue, indigo, or warm slate saturation** into gray surfaces:
  * *Dark Mode Canvas:* Rather than `#121212`, use `#0F111A` ($H=228^\circ, S=26\%, L=8\%$) or `#131722`.
  * *Light Mode Canvas:* Rather than `#F0F0F0`, use `#F8F9FC` ($H=225^\circ, S=40\%, L=98\%$).
  * This creates depth, cohesive harmony, and a modern premium atmosphere.

### ④ The 60-30-10 Spatial Color Balance

```
┌─────────────────────────────────────────────────────────────┐
│ 60% NEUTRAL CANVAS (BgCanvas: #0F111A / #F8F9FC)            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 30% STRUCTURAL SURFACES (BgSurface: #181A26 / #FFFFFF)  │ │
│ │ ┌───────────────────────┐   ┌─────────────────────────┐ │ │
│ │ │ Primary Data Text     │   │ Secondary Label         │ │ │
│ │ │ (TextPrimary: 100%)   │   │ (TextSecondary: 70%)    │ │ │
│ │ └───────────────────────┘   └─────────────────────────┘ │ │
│ │                                                         │ │
│ │               ┌───────────────────────┐                 │ │
│ │               │ 10% ACCENT (CTA Button)               │ │ │
│ │               │ (PrimaryAccent)       │                 │ │
│ │               └───────────────────────┘                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

* **60% Dominant Base:** Keeps the eyes relaxed during 8-hour workdays.
* **30% Structure:** Cards, table row alternations, dividers, and typography.
* **10% Accent:** The single focal point commanding user attention (Primary CTA, Active filter, Status indicator).

### ⑤ Deterministic State Generation Math
Do not manually pick random colors for interactive states. Use deterministic mathematical offsets from the base token:

| Component State | Dark Mode Adjustment | Light Mode Adjustment |
| :--- | :--- | :--- |
| **`Normal`** | Base token (`L`, `S`) | Base token (`L`, `S`) |
| **`Hover`** | $L + 6\%$, $S + 2\%$ | $L - 5\%$, $S + 3\%$ |
| **`Pressed / Active`**| $L - 8\%$, $S + 5\%$ | $L - 10\%$, $S + 5\%$ |
| **`Focus-Visible`** | 2px solid ring, $2\text{px}$ offset | 2px solid ring, $2\text{px}$ offset |
| **`Disabled`** | Opacity clamped to $35\% - 40\%$, cursor `not-allowed` | Opacity clamped to $35\% - 40\%$, cursor `not-allowed` |

---

## 2. Layout, Spatial Geometry & Eye-Tracking

### ① The 4px / 8px Spatial Grid (Visual Rhythm)
Human vision processes structured intervals significantly faster than arbitrary spacing. All margins, paddings, gaps, and heights **MUST** be multiples of **`4px`** or **`8px`**:

```
Spacing Scale: [ 4px | 8px | 12px | 16px | 20px | 24px | 32px | 40px | 48px | 64px ]
```

* **Micro Spacing (`4px, 8px`):** Distance between an icon and its label, padding within a badge, gap between stacked fields.
* **Component Spacing (`12px, 16px, 20px`):** Internal padding of a card, gap between form inputs, button horizontal padding.
* **Macro Spacing (`24px, 32px, 48px`):** Distance between independent sections, page margins, dialog padding.

### ② Gestalt Principles in Software Layout

```
A. Law of Proximity                     B. Law of Common Region
Related items must be close together:   Containers group information:

┌─────────────────┐                     ┌───────────────────────────────┐
│ Label           │                     │ CARD / CONTAINER              │
│ [ Input Field ] │ <- Gap: 4px         │ ┌───────────────────────────┐ │
│                 │                     │ │ Section 1                 │ │
│ Subtext hint    │ <- Gap: 4px         │ └───────────────────────────┘ │
└─────────────────┘                     │ ┌───────────────────────────┐ │
(Next field is 16px away)               │ │ Section 2                 │ │
                                        │ └───────────────────────────┘ │
                                        └───────────────────────────────┘
```

* **Law of Proximity:** The space between a label and its input (`4px`) must be significantly smaller than the space between two separate input groups (`16px`). Otherwise, users struggle to associate which label belongs to which control.
* **Law of Common Region:** Wrap related sets of controls into distinct cards or bordered surfaces (`BgSurface` + `BorderDefault`). Avoid drawing too many nested boxes (maximum 2 levels of visual nesting).

### ③ Eye-Scanning Topologies

#### A. The F-Pattern (Data Inspection & Forms)
* Used in document entry, invoice forms, and master-detail views.
* Eyes scan horizontally across the top header, drop down, scan a shorter horizontal band, and scan down the left edge.
* **Layout Rule:** Place primary identifiers (Document No, Status, Date) along the top left. Left-align form field labels for rapid downward scanning.

#### B. The Z-Pattern (Dashboards & Landing Overviews)
* Used in high-level executive dashboards and status overviews.
* Eyes sweep top-left (Brand/Overview) $\rightarrow$ top-right (Actions/User Profile) $\rightarrow$ diagonal cross to bottom-left (Charts/Metrics) $\rightarrow$ bottom-right (Final CTA).
* **Layout Rule:** Place global filters top-left, primary actions top-right or bottom-right.

#### C. The Layer-Cake Pattern (Data Grids & Lists)
* Users scan alternating horizontal table rows like layers of a cake.
* **Layout Rule:** Use zebra striping with subtle contrast (`BgElevated`), clear active row highlights, and right-aligned numbers to guide horizontal scanning across columns.

---

## 3. Enterprise Layout Architecture Topologies

### ① The 1-Pane Architecture (Focused Task / Wizard / Modal)
* **Usage:** Single-purpose operations: Login, Add Customer wizard, Export settings modal.
* **Rule:** Max container width $480\text{px} - 680\text{px}$ centered on canvas. Do not stretch single-column form inputs across a 1920px screen (causes severe horizontal neck strain).

### ② The 2-Pane Architecture (Master-Detail / Settings)
* **Usage:** Master entity list on the left, full record detail/editor on the right (e.g. ZeroWall Sources tab, Product Catalog).
* **Split Ratio:**
  * Left Master Pane: Fixed width $280\text{px} - 360\text{px}$ (search + entity cards).
  * Right Detail Pane: Flexible `*` width (inputs, configurations, action bar).

```
┌─────────────────┬───────────────────────────────────────────┐
│ SEARCH & LIST   │ RECORD DETAILS & EDIT FORM                │
│ [ 🔍 Search ]   │ Header: Product SKU #1092                 │
│ ┌─────────────┐ │ ┌───────────────┐  ┌────────────────────┐ │
│ │ Item A      │ │ │ Price: 15.00  │  │ Stock: 250         │ │
│ ├─────────────┤ │ └───────────────┘  └────────────────────┘ │
│ │ Item B (Sel)│ │ Description: ...                          │
│ ├─────────────┤ │                                           │
│ │ Item C      │ │               [ Cancel ] [ Save & Apply ] │
│ └─────────────┘ │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

### ③ The 3-Pane Architecture (ERP Explorer / Complex Workbenches)
* **Usage:** Category Tree on the left, Data Table in the middle, Inspector / Action summary on the right.
* **Layout Rule:** Left and right panes must be collapsible to maximize the central data grid when users need 10+ columns visible simultaneously.

---

## 4. Typography & Readability Geometry

### ① The Line-Length Rule (The Measure)
* For prose, long notes, and instructions: restrict line width to **45 to 75 characters** (`~450px – 650px`).
* Stretching paragraph text across full wide-screen monitors drops reading comprehension and makes eyes lose track of the next line.

### ② Line-Height (Leading) Ratios
* **Headings (`H1, H2`):** Tight line height `1.15 – 1.25` (prevents multi-line headers from fragmenting).
* **Body / Form Instructions:** Relaxed line height `1.45 – 1.55` (ensures comfortable breathing room between lines).
* **Single-Line Data Grids / Inputs:** Line height clamped to `1.0` or explicit vertical alignment centering.

---

## 5. Visual Anti-Patterns Checklist

| Anti-Pattern | Why It Fails | The Architectural Fix |
| :--- | :--- | :--- |
| **"Rainbow UI"** | Using red, green, purple, yellow, and blue simultaneously on one view. | Stick strictly to the 60-30-10 rule. Keep 90% neutral; reserve color for actionable states. |
| **"Pure Black / White"** | `#000000` background with `#FFFFFF` text causes blinding contrast & halation. | Use Tinted Slate `#0F111A` and high-contrast light slate `#F1F5F9`. |
| **"Wall-to-Wall Inputs"** | Stretching a text box to 100% of a 1920px screen width. | Clamp input `MaxWidth` to `320px – 480px` or use a structured 2-to-3 column grid. |
| **"Bilingual Clutter"** | Concatting translations: `Lưu (Save)`. | Select one active language globally. Move secondary translations to tooltips if necessary. |
| **"Unlabeled Icon Buttons"** | Showing 15 mystery icons in a toolbar with zero text labels. | Accompany critical buttons with text labels. Obvious utility icons must have tooltips. |
| **"Sudden Window Hiding"**| Closing or minimizing window when user clicks "Save". | Keep window stationary. Show in-window toast banner confirming completion. |
