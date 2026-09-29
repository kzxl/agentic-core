---
name: ui-design-system
description: Enterprise Multi-Platform UI/UX Design System skill. Crafts structured, high-density, anti-slop user interfaces across WinForms (DevExpress), WPF, Web (React/Tailwind), and Mobile (Compose/Flutter).
desc: Enterprise Multi-Platform UI/UX Design System skill for WinForms, WPF, Web, and Mobile
rules: [R_CORE, R_UI]
---

# 🎨 Enterprise Multi-Platform UI/UX Design System

A master toolkit for autonomous software engineers and senior product designers. Crafts production-ready, cognitive-ergonomic, and high-density interfaces for enterprise desktop (WinForms, WPF), responsive web applications, and mobile clients.

Before generating any UI component or layout, consult:
- **`references/tokens.md`** — Universal token matrix (Living Slate dark & off-white light modes, typography, spacing).
- **`references/components.md`** — Ergonomic component specifications (Buttons, Data Grids, Forms, InfoBars, Modals).
- **`references/platform-mapping.md`** — Direct implementation cheat-sheets for WinForms, WPF, Web, and Mobile.

---

## 1. DESIGN PHILOSOPHY

- **Subtract, don't decorate.** Every pixel must justify its presence. Default to structural containment and whitespace over visual embellishments.
- **Structure is ornament.** The grid, data columns, alignment lines, and typographic hierarchy provide aesthetic dignity. Never add decorative graphics or fake 3D depth to enterprise software.
- **Monochrome is the canvas (Living Slate).** 90% of surfaces are neutral slate tones (`#0F111A` in dark mode, `#F8F9FC` in light mode). High-saturation color is an event reserved strictly for functional status indicators and primary call-to-action buttons.
- **Type does the heavy lifting.** Scale, weight, and opacity communicate importance — not rainbow badges, glowing shadows, or colorful borders.
- **Both modes are first-class.** Dark mode uses layered Obsidian/Slate (never pure `#000000`, which causes contrast halation and eye fatigue). Light mode uses crisp off-white paper tones.
- **Information density over mobile fluff.** Enterprise operators process tabular data for hours. Respect screen real estate with compact paddings, dense rows, and tabular numbers.
- **Zero AI Slop.** Strictly adhere to the visual restraint principles defined in [Practical UI Engineering & Anti-AI-Slop Standard](file:///E:/16.%20AgentOption/standards/universal/ui-anti-ai-slop-standard.md).

---

## 2. CRAFT RULES — HOW TO COMPOSE

### 2.1 Visual Hierarchy: The Three-Layer Rule

Every screen and view region must contain exactly **three layers of visual importance**:

| Layer | Functional Purpose | Typographic & Spatial Treatment |
| :--- | :--- | :--- |
| **Primary** | The ONE primary anchor of the screen (Key operational metric, main view title, active entity code). | Heading / Display size (`18–24px` desktop, `24–32px` web). Highest contrast (`TextPrimary`). Generous top/bottom margin (`16–24px`). |
| **Secondary** | Structural content, active workhorse controls, data grids, form input fields, primary action buttons. | Body size (`12.5–13px` desktop, `14–15px` web). Standard contrast (`TextPrimary` / `TextSecondary`). Grouped with standard rhythm (`8–16px`). |
| **Tertiary** | Supporting metadata, column headers, keyboard shortcut hints, timestamps, status bar telemetry. | Caption / Microcopy (`10–11.5px`). Muted contrast (`TextMuted` / `TextSecondary`). Micro-padding (`2–4px`). Pushed to edges or footers. |

> **The Squint Test:** Squint at the generated layout. Can an operator instantly determine the primary focal point? If two adjacent elements compete for visual priority, demote one via opacity (`TextSecondary`) or size.

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
2. **Subtle 1px Divider Line** (`BorderSubtle` — `#202436` dark / `#EAEFF8` light).
3. **Structured Card Container** (`BgSurface` with `1px solid BorderDefault`).
4. **Elevated Floating Panel** (Reserved strictly for dropdown menus, dialogs, and popups with structural shadow).

**Prohibition:** Never nest cards inside cards inside cards ("Russian Doll Container Hell").

---

### 2.5 Color as Functional Hierarchy (60-30-10 Rule)

- **60% Dominant Canvas:** Neutral, low-contrast background (`BgCanvas`).
- **30% Structural Surfaces:** Container cards, tables, text bodies (`BgSurface`, `TextPrimary`).
- **10% Functional Accent:** Primary CTA button, active tab indicator, critical status pip (`PrimaryAccent`, `Success`, `Danger`).
- **One Accent Rule:** Never place more than ONE primary brand accent button in a single view quadrant. Competing primary buttons destroy decision velocity.

---

### 2.6 Density Mode Selection

Always determine density mode based on the target platform and operator persona:

| Dimension | Compact ERP Density (Desktop WinForms, WPF, ERP Web) | Standard Density (Portals, Dashboards, Mobile) |
| :--- | :--- | :--- |
| **Target User** | Operations clerks, warehouse managers, accountants | Executives, casual users, touch-screen field staff |
| **Input Height** | `26 – 28px` (desktop) / `32px` (web) | `38 – 42px` (web) / `48px` (touch) |
| **Grid Row Height**| `24 – 28px` | `40 – 48px` |
| **Typography** | `12 – 12.5px` (Segoe UI / Inter) | `14 – 15px` |
| **Corner Radius** | `3 – 4px` (Sharp, professional) | `6 – 8px` (Modern softened) |

---

### 2.7 Cognitive Ergonomics & Business UX

1. **Hick's Law & Option Clamping:** Clamp simultaneous visible choices to $\le 5–7$. If options exceed 7, provide search filtering, category tabs, or auto-complete lookups.
2. **Action-Oriented Button Verbs:** All buttons **MUST** begin with an imperative action verb (*Save*, *Apply*, *Approve*, *Export*, *Post Ledger*). Strictly forbid vague labels (*OK*, *Submit*, *Go*). Length: 1–3 words, $\le 20$ characters.
3. **Single Active Language:** Display 100% Vietnamese or 100% English. Never concatenate bilingual labels in parentheses (❌ `Lưu (Save)`).
4. **Ledger Immutability (ERP Invariant):** Never provide hard `Delete` on records tied to financial ledgers, stock journals, or audit logs. Use `Deactivate` (`Ngừng sử dụng`) or `Archive`.

---

## 3. ANTI-PATTERNS MATRIX (THE 8 DEADLY SINS)

| Anti-Pattern | Defect Description | Mandatory Law |
| :--- | :--- | :--- |
| ❌ **Candy Rainbow** | Using bright neon blue, hot pink, and radioactive green across adjacent badges and buttons. | **1-Accent Law:** 90% slate neutral. Mute and desaturate semantic colors by $\ge 30\%$. |
| ❌ **Glow & Shadow Abuse** | Glowing `text-shadow` or neon `box-shadow` on cards and buttons. | **Zero Glow Invariant:** `text-shadow` is prohibited. Box shadows clamped to structural elevation only. |
| ❌ **Keyframe Addiction** | Looping pulsing animations or continuous borders. | **Static Canvas Invariant:** Prohibit continuous animations on idle elements. Transitions $\le 200\text{ms}$. |
| ❌ **Pill Badge Obsession**| Stadium capsules (`border-radius: 9999px`) on every label and table cell. | **Rectangular Rhythm:** Use crisp $3–4\text{px}$ rounded chips for data grids. |
| ❌ **Emoji Vomit** | Prepending emojis to every button and header (`🔥 Lưu`, `⚡ Chạy`). | **Typographic Invariant:** Establish hierarchy via font weight and opacity. Emojis forbidden in enterprise UI. |
| ❌ **Gradient Wallpaper** | Saturated multi-color diagonal gradients splashed across panels. | **Flat Tint Invariant:** Container backgrounds must be solid or high-opacity tinted slate. |
| ❌ **Mobile Creep in Desktop**| Giant 80px cards and loose padding on desktop screens pushing data off-screen. | **Compact Ergonomics:** Maximize visible data rows. Keep row height $26–28\text{px}$ in desktop ERP. |
| ❌ **Glassmorphism Blur** | Heavy `backdrop-filter: blur(20px)` obscuring data legibility. | **Contrast Invariant:** Surfaces must maintain $\ge 90\%$ opacity. Text contrast $\ge 4.5:1$ (WCAG AA). |

---

## 4. EXECUTION WORKFLOW (THE 7-STEP CYCLE)

When commanded to design or implement a UI view, follow this deterministic sequence:

```
[1. Declare Context] -> Platform (WinForms/WPF/Web/Mobile) + Density (Compact/Standard) + Mode (Dark/Light)
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
[7. Self-Audit]       -> Run Squint Test, check WCAG 4.5:1 contrast, verify Action-Verb button labels
```

---

## 5. SKILL REFERENCE FILES

- **`references/tokens.md`** — Design tokens: Living Slate dark mode, crisp light mode, type scale, spacing, corner radius.
- **`references/components.md`** — Complete component library specs: Buttons, Enterprise Data Grids, Forms, InfoBars, Modals, Status Chips.
- **`references/platform-mapping.md`** — Framework-specific implementation code for WinForms (DevExpress), WPF (XAML), Web (Tailwind/React), and Mobile (Compose/Flutter).
