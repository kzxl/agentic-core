---
name: ui-design-tokens
description: Use when you need a concrete color, radius, elevation, motion, spacing, row-height, or typography value for any UI (WinForms, WPF, Web, Mobile), when mapping tokens into a theme file, or when migrating an old palette. Single source of truth for all hex, px, and ms values referenced by the anti-slop standard.
desc: Universal Design Tokens Single Source of Truth (SSoT) across Desktop, Web, and Mobile.
rules: [R_CORE, R_UI, R_ANTI_SLOP]
---
# Universal Design Tokens (Single Source of Truth)

This file is the only place where concrete hex, px, and ms values are defined. Standards, skills, and platform mappings reference these token names; when a value changes, it changes here first. Laws that use these tokens are defined in [ui-anti-ai-slop-standard.md](../../../standards/universal/ui-anti-ai-slop-standard.md).

Naming: CSS custom properties are canonical (`--bg-canvas`). Desktop and mobile themes use the PascalCase form of the same name (`BgCanvas`, `SuccessFg`).

---

## 1. Typography Tokens

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
3. **Weight Economy:** Never mix more than 2 font weights on a single card or view. Use the text tokens (`--text-primary` vs. `--text-secondary`) to distinguish hierarchy before reaching for bold weights.

---

## 2. Color Tokens

Contrast values below are measured with the WCAG 2.1 formula. Text needs >= 4.5:1; non-text UI needs >= 3:1 (AS-08). Decorative dividers and card borders (`--border-subtle`, `--border-default`, `--border-strong`) are exempt from 3:1; form-control boundaries use `--border-input`, which meets 3:1 on every background.

### 2.1 Brand

| Token | Value | Notes |
| :--- | :--- | :--- |
| `--brand-primary` | `#005496` | Mylan/Pluto project default (light mode). Other projects override this one token. White text: 7.75:1 |
| `--brand-primary-hover` | `#004077` | Mylan/Pluto project default hover. White text: 10.50:1 |
| `--brand-primary` (dark) | `#537bb4` | Mylan/Pluto dark default = steel solid. Focus ring and indicators: 4.10:1 on `--bg-surface` |
| `--brand-fg` (dark) | `#7595c3` | Brand-colored text and links in dark mode: 5.77:1 on `--bg-surface` |

> [!NOTE]
> White text on the dark steel solid measures 4.32:1, below the text threshold. Dark primary buttons therefore use `--brand-fg` text with a 1px `--brand-fg` border on a 12% `--brand-fg` tint.

### 2.2 Light Mode Neutrals

| Token | Value | Usage | Contrast |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#f4f6f9` | Outermost window / page canvas | Baseline |
| `--bg-surface` | `#ffffff` | Cards, data panels, grid background | Baseline |
| `--bg-elevated` | `#f8fafc` | Grouped containers, table headers, inputs, zebra opt-in tint | Baseline |
| `--bg-hover` | `#f1f5f9` | Row and item hover | Baseline |
| `--border-subtle` | `#edf2f7` | Interior dividers, grid row dividers | Divider |
| `--border-default` | `#e2e8f0` | Card boundaries | Structural |
| `--border-strong` | `#cbd5e1` | Hovered / active boundaries | Structural |
| `--border-input` | `#7f8ba0` | Form-control boundaries: inputs, selects, checkboxes, grid editors | 3.44:1 on surface, 3.29:1 on elevated, 3.18:1 on canvas, 3.14:1 on hover |
| `--text-primary` | `#0f172a` | Primary data, headings | 17.85:1 on surface |
| `--text-secondary` | `#475569` | Labels, column titles | 7.58:1 on surface, 7.00:1 on canvas |
| `--text-muted` | `#607085` | Timestamps, helpers, units | 5.06:1 on surface, 4.83:1 on elevated, 4.67:1 on canvas, 4.61:1 on hover |
| `--text-disabled` | `#94a3b8` | Disabled state only (exempt from text contrast) | 2.56:1 |

### 2.3 Light Mode Semantic States

`-fg` and `-solid` share one value. `-border` is `-fg` at 25% alpha.

| State | `-fg` / `-solid` | `-bg` | `-border` | Contrast (fg on white / white text on solid) |
| :--- | :--- | :--- | :--- | :--- |
| success | `#1f7a40` | `#e9f2ec` | `rgba(31, 122, 64, 0.25)` | 5.36:1 |
| warning | `#936025` | `#f4efe9` | `rgba(147, 96, 37, 0.25)` | 5.33:1 |
| danger | `#c63131` | `#f9eaea` | `rgba(198, 49, 49, 0.25)` | 5.41:1 |
| info | `#267299` | `#e9f1f5` | `rgba(38, 114, 153, 0.25)` | 5.32:1 |

Every `-fg` also reaches >= 4.5:1 on its own `-bg` tint.

### 2.4 Dark Mode Neutrals

| Token | Value | Usage | Contrast |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#0d0f13` | Outermost canvas (never pure black) | Baseline |
| `--bg-surface` | `#151822` | Primary container card | Baseline |
| `--bg-elevated` | `#1a1e2a` | Nested panels, inputs, zebra opt-in tint | Baseline |
| `--bg-hover` | `#222736` | Hover highlight | Baseline |
| `--border-subtle` | `#1c212c` | Interior dividers, grid row dividers | Divider |
| `--border-default` | `#242934` | Card boundaries | Structural |
| `--border-strong` | `#363c4c` | Interactive hover border | Structural |
| `--border-input` | `#68728a` | Form-control boundaries: inputs, selects, checkboxes, grid editors | 3.68:1 on surface, 3.45:1 on elevated, 3.98:1 on canvas, 3.09:1 on hover |
| `--text-primary` | `#e6e8ee` | Primary data, headings | 14.46:1 on surface |
| `--text-secondary` | `#9aa1b2` | Labels, captions | 6.84:1 on surface |
| `--text-muted` | `#868ea0` | Timestamps, helpers (legacy name `--text-dim`) | 5.39:1 on surface, 5.06:1 on elevated |

### 2.5 Dark Mode Accents and Semantic States

`-solid` is the fill; `-fg` is text and icons. `-bg` is `-fg` at 12% alpha. `-border` is `-fg` at 25% alpha. In dark mode, each `--{state}-*` token takes the values of the accent row whose semantic role matches (for example `--danger-fg` = cinnabar `-fg`).

| Accent | Semantic role | `-solid` | `-fg` | `-fg` on surface | Text on `-solid` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| cinnabar | danger | `#b84a4a` | `#cc7d7d` | 5.73:1 | white 5.10:1 |
| jade | success | `#4f8c62` | `#5ba171` | 5.72:1 | `--bg-canvas` 4.80:1 (white fails at 3.99:1) |
| steel | info, brand | `#537bb4` | `#7595c3` | 5.77:1 | none reaches 4.5:1; use the tint pattern from §2.1 |
| amethyst | categorical / secondary | `#8668aa` | `#a089bc` | 5.73:1 | white 4.59:1 |
| gold | warning | `#c29f55` | `#c29f55` | 7.07:1 | `--bg-canvas` 7.66:1 (white fails at 2.50:1) |

### 2.6 Palette Migration (old -> new)

| Token | Old value | New value | Reason |
| :--- | :--- | :--- | :--- |
| Light `success` | `#16a34a` | `#1f7a40` | Saturation 76% -> 59% |
| Light `warning` | `#d97706` | `#936025` | Saturation 95% -> 60%; old value failed 4.5:1 |
| Light `danger` | `#dc2626` | `#c63131` | Saturation 72% -> 60% |
| Light `info` | `#0284c7` | `#267299` | Saturation 98% -> 60% |
| Light `--text-muted` | `#64748b` | `#607085` | Old value measured 4.40:1 on canvas, 4.34:1 on hover |
| Dark `--text-dim` | `#60687a` | `#868ea0` | Old value measured 2.98:1 |

The former indigo `PrimaryAccent` / `--primary-accent` palette and the `#0F111A` dark scale are retired; map them to `--brand-primary` and the §2.4 neutrals.

---

## 3. Spacing & Layout Tokens

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

### 3.1 Row Height Tokens (AS-07)

| Token | Value | Platform |
| :--- | :--- | :--- |
| `--row-desktop` | `28px` (band 24-28px) | WinForms / WPF grids |
| `--row-web` | `36px` (band 32-40px) | Web data tables |
| `--row-web-compact` | `32px` | Web compact tables |
| `--row-mobile` | `48dp` (minimum) | Mobile lists, touch targets |

---

## 4. Corner Radius Tokens (AS-04)

| Token | Value | Target elements |
| :--- | :--- | :--- |
| `--radius-xs` | `3px` | Checkboxes, progress tracks, inline grid-cell indicators |
| `--radius-sm` | `4px` | Chips, badges, tags |
| `--radius-md` | `6px` | Buttons, inputs, selects, segmented controls |
| `--radius-lg` | `8px` | Cards, panels, modals, popovers |
| `--radius-pill` | `9999px` | Avatars and notification count bubbles only |

Grid cells, splitters, and tab strips use `0`.

---

## 5. Elevation Tokens (AS-02)

Neutral black only.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--elevation-0` | `none` + `1px solid var(--border-default)` | Default for cards and panels |
| `--elevation-1` | `0 1px 2px rgba(0, 0, 0, 0.06)` | Optional raised card, sticky header |
| `--elevation-overlay` | `0 8px 24px rgba(0, 0, 0, 0.12)` | Modal, popover, dropdown, toast |

---

## 6. Motion Tokens (AS-03)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--duration-fast` | `120ms` | Hover, focus, color changes |
| `--duration-base` | `180ms` | Expand/collapse, tab switch |
| `--duration-data` | `300ms` | Progress fill, numeric value transitions, GSAP one-shot ceiling |

Progress fill: `transform: scaleX(var(--progress)); transform-origin: left;` with `--progress` in `0..1`. Width is never transitioned.
