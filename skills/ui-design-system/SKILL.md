---
name: ui-design-system
description: Use when building or reviewing UI: dashboards, data grids, forms, buttons, badges, palettes, dark mode, DevExpress skins, Tailwind components, motion, or output that looks AI-generated. Enterprise multi-platform design system for WinForms (DevExpress), WPF, Web (React/Tailwind), and Mobile (Compose/Flutter) with token lookups, component specs, and platform mappings.
desc: Enterprise Multi-Platform UI/UX Design System skill for WinForms, WPF, Web, and Mobile
rules: [R_CORE, R_UI, R_ANTI_SLOP]
---

# Enterprise Multi-Platform UI/UX Design System

A toolkit for building production-ready, cognitive-ergonomic, high-density interfaces for enterprise desktop (WinForms, WPF), responsive web applications, and mobile clients.

Before generating any UI component or layout:
1. Read `standards/universal/ui-anti-ai-slop-standard.md` and follow it. Its AS IDs are the laws this skill applies.
2. Read **`references/tokens.md`** when you need any concrete value (color, radius, elevation, motion, spacing, row height). It is the single source of truth.
3. Read **`references/components.md`** when specifying buttons, inputs, data grids, notifications, badges, or segmented controls.
4. Read **`references/platform-mapping.md`** when translating tokens into WinForms, WPF, Tailwind, or Compose code.

---

## 1. DESIGN PHILOSOPHY

- **Subtract, don't decorate.** Every pixel must justify its presence. Default to structural containment and whitespace over visual embellishments.
- **Structure is ornament.** The grid, data columns, alignment lines, and typographic hierarchy provide aesthetic dignity. Never add decorative graphics or fake 3D depth to enterprise software.
- **Monochrome is the canvas (Living Slate).** 90% of surfaces are neutral tokens (`--bg-canvas`, `--bg-surface`). Color is an event reserved for semantic states and the one brand accent (AS-01).
- **Type does the heavy lifting.** Scale, weight, and the text tokens communicate importance (AS-02).
- **Both modes are first-class.** Dark mode uses layered slate neutrals (never pure black). Light mode uses crisp off-white paper tones. Both use the `-fg/-solid/-bg/-border` semantic tokens.
- **Information density over mobile fluff.** Enterprise operators process tabular data for hours. Respect screen real estate with compact paddings, dense rows, and tabular numbers (AS-07).

---

## 2. CRAFT RULES — HOW TO COMPOSE

### 2.1 Visual Hierarchy: The Three-Layer Rule

Every screen and view region must contain exactly **three layers of visual importance**:

| Layer | Functional Purpose | Typographic & Spatial Treatment |
| :--- | :--- | :--- |
| **Primary** | The ONE primary anchor of the screen (Key operational metric, main view title, active entity code). | `--type-display` / `--type-h1`. `--text-primary`. Margin `--space-lg` to `--space-xl`. |
| **Secondary** | Structural content, active workhorse controls, data grids, form input fields, primary action buttons. | `--type-body`. `--text-primary` / `--text-secondary`. Rhythm `--space-sm` to `--space-lg`. |
| **Tertiary** | Supporting metadata, column headers, keyboard shortcut hints, timestamps, status bar telemetry. | `--type-caption` / `--type-micro`. `--text-muted` / `--text-secondary`. Padding `--space-2xs` to `--space-xs`. Pushed to edges or footers. |

> **The Squint Test:** Squint at the generated layout. Can an operator instantly determine the primary focal point? If two adjacent elements compete for visual priority, demote one via `--text-secondary` or size.

---

### 2.2 Font & Typographic Discipline

Per screen, enforce strict typographic limits:
- **Maximum 2 Font Families:** (e.g., `Segoe UI` for desktop UI + `Cascadia Code`/`Consolas` for numeric codes; or `Inter` for web + monospace for serial IDs).
- **Maximum 3 Font Sizes:** Display/Heading, Body, and Caption.
- **Maximum 2 Font Weights:** Regular (`400`) and SemiBold (`600`). Never use UltraLight or ExtraBold in enterprise tools.
- **Tabular Figures for Numbers:** All financial quantities, stock levels, dates, and IDs **MUST** use monospace or tabular lining figures (`font-variant-numeric: tabular-nums`).

---

### 2.3 Spacing Rhythm (4px / 8px Base)

Spacing communicates structural affinity:

```
Tight (2–4px)    -> "Atomic binding" (Icon + label, numeric value + currency unit)
Standard (8px)   -> "Component internal" (Padding inside inputs, buttons, list rows)
Medium (16px)    -> "Group boundary" (Gap between form fields, toolbar elements, cards)
Section (24–32px)-> "Major partition" (Header to grid, filter panel to results)
Canvas (40–48px) -> "Window margin" (Outer page padding)
```

**Rule of Thumb:** If you feel the urge to insert a heavy divider line, the spatial margin is likely too small. Increase negative space before introducing lines.

---

### 2.4 Container & Elevation Strategy

Apply containment using the lightest tool that achieves structural clarity:
1. **Whitespace & Alignment Alone** (Strongest & cleanest).
2. **Subtle 1px Divider Line** (`--border-subtle`).
3. **Structured Card Container** (`--bg-surface` with `--elevation-0`).
4. **Elevated Floating Panel** (Dropdown menus, dialogs, and popups with `--elevation-overlay`).

Keep nesting to one card level; group inside a card with whitespace or `--border-subtle` dividers.

---

### 2.5 Color as Functional Hierarchy (60-30-10 Rule)

- **60% Dominant Canvas:** Neutral, low-contrast background (`--bg-canvas`).
- **30% Structural Surfaces:** Container cards, tables, text bodies (`--bg-surface`, `--text-primary`).
- **10% Functional Accent:** Primary CTA button, active tab indicator, critical status pip (`--brand-primary`, semantic `-fg` tokens).
- **One Accent Rule:** Place at most ONE primary brand accent button in a single view quadrant. Competing primary buttons destroy decision velocity.

---

### 2.6 Density Mode Selection

Always determine density mode based on the target platform and operator persona:

| Dimension | Compact ERP Density (Desktop WinForms, WPF, ERP Web) | Standard Density (Portals, Dashboards, Mobile) |
| :--- | :--- | :--- |
| **Target User** | Operations clerks, warehouse managers, accountants | Executives, casual users, touch-screen field staff |
| **Input Height** | `26 – 28px` (desktop) / `32px` (web) | `36 – 40px` (web) / `48px` (touch) |
| **Grid Row Height**| `--row-desktop` (desktop) / `--row-web-compact` (web) | `--row-web` (web) / `--row-mobile` (touch) |
| **Typography** | `12 – 12.5px` (Segoe UI / Inter) | `14 – 15px` |
| **Corner Radius** | `--radius-sm` (chips) / `--radius-md` (controls) | `--radius-md` (controls) / `--radius-lg` (cards) |

---

### 2.7 Cognitive Ergonomics & Business UX

1. **Hick's Law & Option Clamping:** Clamp simultaneous visible choices to $\le 5–7$. If options exceed 7, provide search filtering, category tabs, or auto-complete lookups.
2. **Action-Oriented Button Verbs:** All buttons **MUST** begin with an imperative action verb (*Save*, *Apply*, *Approve*, *Export*, *Post Ledger*). Strictly forbid vague labels (*OK*, *Submit*, *Go*). Length: 1–3 words, $\le 20$ characters (AS-11).
3. **Single Active Language:** Display 100% Vietnamese or 100% English. Never concatenate bilingual labels in parentheses (`Lưu (Save)`).
4. **Ledger Immutability (ERP Invariant):** Never provide hard `Delete` on records tied to financial ledgers, stock journals, or audit logs. Use `Deactivate` (`Ngừng sử dụng`) or `Archive`.

---

## 3. ANTI-SLOP LAWS APPLIED

The laws live in the anti-slop standard; this skill applies them by ID.

| Concern | Apply |
| :--- | :--- |
| Palette, semantic states | AS-01 |
| Elevation, hierarchy by type | AS-02 |
| Motion, animation libraries, profiles | AS-03 (ladder, GSAP allowlist, `ui_profile`) |
| Corner radius | AS-04 |
| Icons, emoji | AS-05 |
| Surfaces, progress bars | AS-06 |
| Row heights, zebra striping | AS-07 (zebra off by default) |
| Contrast, translucency | AS-08 |
| Focus indication | AS-09 |
| Charts | AS-10 |
| Labels, error copy | AS-11 |
| Empty and loading states | AS-12 |
| Comments, wrappers, dead code | AS-C1..AS-C5 |

---

## 4. EXECUTION WORKFLOW (THE 7-STEP CYCLE)

When commanded to design or implement a UI view, follow this deterministic sequence:

```
[1. Declare Context] -> Platform (WinForms/WPF/Web/Mobile) + Density (Compact/Standard) + Mode (Dark/Light) + ui_profile
         ↓
[2. Identify 3 Layers] -> Determine Primary Anchor, Secondary Workhorse, Tertiary Metadata
         ↓
[3. Consult Tokens]   -> Extract exact tokens from references/tokens.md
         ↓
[4. Apply Hierarchy]  -> Structure grid layout, enforce 4/8px spacing, apply 60-30-10 palette
         ↓
[5. Spec Components]  -> Select Button, Grid, Input, and InfoBar patterns from references/components.md
         ↓
[6. Platform Map]     -> Map tokens to framework primitives using references/platform-mapping.md
         ↓
[7. Self-Audit]       -> Run the anti-slop completion criteria (standard §6), Squint Test, action-verb labels
```

Step 7 is complete when `node tools/anti-slop-lint.js --diff` reports zero MUST errors and every new text/background token pair passes `--tokens` at >= 4.5:1.

---

## 5. DO

- AS-01: one `--brand-primary` accent per region; semantic `-fg/-solid/-bg/-border` tokens for states.
- AS-02: hierarchy from size, weight, and text tokens; elevation tokens only.
- AS-03: motion runs once, transform/opacity only, reduced-motion in CSS and JS, cleanup on unmount.
- AS-04: chips and badges `--radius-sm`; buttons and inputs `--radius-md`; cards `--radius-lg`.
- AS-05: 16px icons from the project set on nav and action bars; words in labels.
- AS-06: flat `--bg-*` fills on containers and progress bars.
- AS-07: platform row bands; 1px `--border-subtle` dividers plus hover.
- AS-08 / AS-09: measured contrast; visible `:focus-visible` ring or native focus cue.
- AS-11 / AS-12: verb-first labels; cause + action errors; skeleton rows at real row height.
- AS-C1..AS-C5: self-documenting names; delete dead code; provenance in git.
