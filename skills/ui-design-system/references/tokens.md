# 🎨 Universal Design Tokens (Single Source of Truth)

This reference documents the canonical design tokens for the AgentOption multi-platform ecosystem. All framework-specific style sheets, resource dictionaries, and theme configurations must derive directly from these token values.

---

## 1. TYPOGRAPHY TOKENS

### 1.1 Platform Font Stacks

| Target Platform | Primary UI Font | Monospace / Tabular Font | Fallback Stack |
| :--- | :--- | :--- | :--- |
| **Desktop (WinForms / WPF)** | `"Segoe UI Variable"`, `"Segoe UI"` | `"Cascadia Code"`, `"Consolas"` | `Tahoma, Arial, sans-serif` |
| **Web (React / CSS / Tailwind)**| `"Inter"`, `system-ui` | `"JetBrains Mono"`, `"Fira Code"` | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| **Mobile (Android Compose)** | `"Roboto"`, `"Inter"` | `"Roboto Mono"` | `system-ui` |
| **Mobile (iOS / SwiftUI)** | `"SF Pro Text"`, `"SF Pro"` | `"SF Mono"` | `Helvetica Neue, sans-serif` |

### 1.2 Type Scale

| Token Name | Desktop Font Size | Web Font Size | Weight | Line Height | Letter Spacing | Semantic Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`--type-display`** | `20 – 24px` | `28 – 36px` | Bold (`700`) | 1.1 | -0.02em | Hero view titles, primary KPI numbers |
| **`--type-h1`** | `16 – 18px` | `20 – 24px` | SemiBold (`600`) | 1.2 | -0.01em | Window titles, major card headers |
| **`--type-h2`** | `14 – 15px` | `16 – 18px` | SemiBold (`600`) | 1.25 | 0 | Grouping subtitles, modal headers |
| **`--type-body`** | `12.5 – 13px` | `14px` | Regular (`400`) | 1.4 | 0 | Primary form fields, table cell data |
| **`--type-caption`** | `11.5 – 12px` | `12 – 13px` | Regular (`400`) | 1.35 | +0.01em | Form helper text, secondary descriptions |
| **`--type-micro`** | `10 – 11px` | `11px` | SemiBold (`600`) | 1.2 | +0.04em | Grid column headers, status badges, timestamps |

### 1.3 Typographic Rules
1. **Tabular Figures Mandatory:** Any field displaying currency, inventory counts, percentages, timestamps, or ledger account codes **MUST** use tabular lining numbers (`font-variant-numeric: tabular-nums`).
2. **Casing Discipline:** Section headers, form labels, and instructions **MUST** use Sentence case. ALL-CAPS is reserved strictly for micro-labels, column header tickers, and status badges.
3. **Weight Economy:** Never mix more than 2 font weights on a single card or view. Use opacity (`TextPrimary` vs. `TextSecondary`) to distinguish hierarchy before reaching for bold weights.

---

## 2. COLOR SYSTEM (LIVING SLATE & TINTED NEUTRALS)

### 2.1 Universal Matrix (Dark & Light Modes)

```
[ Canvas: 60% ] ──────> [ Surfaces: 30% ] ──────> [ Accents: 10% ]
BgCanvas                BgSurface, BgElevated     PrimaryAccent, Success, Danger
```

| Token Name | Dark Mode Hex | Light Mode Hex | Contrast (Dark/Light) | Semantic Role & Guidance |
| :--- | :--- | :--- | :--- | :--- |
| **`BgCanvas`** | `#0F111A` | `#F8F9FC` | Baseline | Outermost window canvas and page viewport |
| **`BgSurface`** | `#181A26` | `#FFFFFF` | 1.3:1 / 1.1:1 | Primary container card, sidebar panel, grid background |
| **`BgElevated`** | `#1F2233` | `#F1F3F9` | 1.6:1 / 1.2:1 | Text boxes, dropdown lists, nested panels |
| **`BgHover`** | `#262A3D` | `#E8EDF8` | 1.9:1 / 1.3:1 | Hover state for interactive rows, buttons, menu items |
| **`BgActive`** | `#313752` | `#D9E2F5` | 2.3:1 / 1.5:1 | Pressed state, actively selected grid row |
| **`BorderDefault`** | `#2B3046` | `#DCE1EE` | Structural | Card boundary stroke, control outline (1px) |
| **`BorderSubtle`** | `#202436` | `#EAEFF8` | Divider | Table horizontal gridlines, interior section dividers |
| **`BorderLight`** | `#3E4663` | `#BAC5DD` | Focus/Hover | Hovered input border, non-critical focus stroke |
| **`TextPrimary`** | `#F1F5F9` | `#0F172A` | 16.5:1 / 16.8:1 | Primary data values, labels, headers (WCAG AAA) |
| **`TextSecondary`**| `#94A3B8` | `#475569` | 6.5:1 / 7.2:1 | Descriptive captions, field labels (WCAG AA) |
| **`TextMuted`** | `#64748B` | `#94A3B8` | 3.8:1 / 3.5:1 | Placeholders, hotkey shortcuts, timestamps |

---

### 2.2 Functional Accent & Semantic Status Palette

Semantic colors are desaturated by $\ge 30\%$ to eliminate eye fatigue in high-density software:

| Token Name | Dark Hex | Light Hex | Semantic Role & Visual Guidance |
| :--- | :--- | :--- | :--- |
| **`PrimaryAccent`** | `#818CF8` | `#4F46E5` | Primary CTA button fill, active tab indicator, primary focus ring |
| **`PrimaryAccentDark`**| `#6366F1`| `#4338CA` | Pressed button state, active header highlight |
| **`SecondaryAccent`**| `#A78BFA` | `#7C3AED` | Highlight chips, informational count badges, active filters |
| **`Success`** | `#34D399` | `#10B981` | Completed operations, active connection, valid input, positive balance |
| **`Danger`** | `#F87171` | `#EF4444` | Errors, validation failures, destructive actions, negative inventory |
| **`Warning`** | `#FBBF24` | `#F59E0B` | Pending tasks, caution warnings, offline sync delay |
| **`Info`** | `#38BDF8` | `#0284C7` | Informational callouts, live telemetry pips, helper notes |

---

## 3. SPACING & LAYOUT TOKENS

All paddings, margins, gutters, and control heights align with the **4px / 8px spatial grid**:

| Token Name | Pixel Value | Semantic Application |
| :--- | :--- | :--- |
| **`--space-2xs`** | `2px` | Optical icon-to-text fine adjustment, border offsets |
| **`--space-xs`** | `4px` | Gap between icon and label, micro badge padding |
| **`--space-sm`** | `8px` | Standard button and input vertical padding, item gaps in chips |
| **`--space-md`** | `12px` | Horizontal padding in text boxes, compact card margins |
| **`--space-lg`** | `16px` | Standard card internal padding, toolbar gutter, form row spacing |
| **`--space-xl`** | `24px` | Major section gap, header-to-table vertical margin |
| **`--space-2xl`** | `32px` | Outer window margins in standard desktop applications |
| **`--space-3xl`** | `48px` | Outer page margins in wide web dashboards |

---

## 4. CORNER RADIUS TOKENS

Enterprise software favors structured, rectangular forms over stadium pills:

| Token Name | Pixel Value | Target Elements | Rationale |
| :--- | :--- | :--- | :--- |
| **`--radius-none`** | `0px` | Data grid cells, splitters, tab strips | Pure precision alignment |
| **`--radius-compact`**| `3 – 4px` | TextBoxes, ComboBoxes, Buttons, Grid Status Chips | Crisp, dense desktop aesthetic |
| **`--radius-card`** | `6 – 8px` | Container cards, toolbars, docked panels | Subtle softening without wasting space |
| **`--radius-modal`** | `10 – 12px`| Center-screen modal dialogs, flyout popups | Distinct elevation boundary |
| **`--radius-pill`** | `9999px` | User avatars, notification badges ONLY | **STRICTLY FORBIDDEN** on grid tags & buttons |

---

## 5. ELEVATION & SHADOW TOKENS

- **Zero Decorative Shadows:** Never apply colored, blurry, or glowing drop-shadows to static cards or buttons.
- **Structural Elevation Only:**
  - **Flat Surface (`Elevation-0`):** `box-shadow: none; border: 1px solid var(--border-default)` (Standard cards).
  - **Hover Surface (`Elevation-1`):** `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25)` (Clickable cards).
  - **Floating Popup (`Elevation-2`):** `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); border: 1px solid var(--border-default)` (Modals, flyouts, tooltips).
