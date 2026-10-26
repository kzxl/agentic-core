---
desc: Practical UI Engineering & Anti-AI-Slop Standard — Visual Restraint, Ergonomics, Contrast Integrity & De-AI-ification Guidelines
rules: [R_CORE, R_UI, R_ANTI_SLOP]
---

# 🛡️ Practical UI Engineering & Anti-AI-Slop Standard

This standard establishes mandatory visual restraint, ergonomic, and anti-clutter engineering guidelines for all software interfaces and code generation across the AgentOption ecosystem and enterprise enterprise applications (ERP, HelpDesk, Desktop, Web, Mobile).

Its primary objective is to prevent **"AI Slop"**—the distinct, gaudy, hyper-saturated, cartoonish aesthetic and bloated inline commentary characteristically produced by generative AI models when left unconstrained.

---

## 1. The Anatomy of "AI Slop" in User Interfaces & Code

### Why Generative AI Creates Tacky UI and Bloated Code by Default
Large language models and code-generation agents default to visual and syntactic excess because their training corpora are skewed by flashy Dribbble conceptual mockups, marketing landing pages, consumer mobile toys, and tutorial code with redundant explanations. When asked to construct or modify an interface, AI models exhibit predictable failure modes:
1. **Compensatory Novelty:** Attempting to make every element look "impressive" by adding glowing box shadows, gradients, and animated keyframes.
2. **Color Disconnection:** Assigning independent, uncoordinated saturated colors to every category, badge, and button (the "Candy Store" effect).
3. **Absence of Visual Restraint:** Treating empty space as a defect to be filled with emojis, floating circles, rainbow circular icon badges, and stadium pills.
4. **Ignorance of Cognitive Ergonomics:** Forgetting that human operators look at business, ERP, and operational tools for 8+ hours daily, where high-contrast neon, candy buttons, and breathing animations induce severe retinal fatigue.
5. **Verbose Inline Commentary Slop:** Littering code with trivial, play-by-play comments (`// handle click`, `// get entity from db`, `// check null`, `// return list`) and agent changelogs that degrade codebase signal-to-noise ratio.

### The Core Philosophy: "Invisible Craftsmanship & Functional Restraint"
* **The Prime Directive:** Exceptional UI gets out of the way. It prioritizes information hierarchy, data scanability, and deterministic operational feedback over decorative spectacle.
* **Quiet Competence:** A dignified, professional interface relies on subtle 1px border strokes, desaturated semantic accents, structured typography, and high data density rather than glowing gradients and cartoon animations.
* **Self-Documenting Code:** Clean code expresses intent through precise naming, small methods ($\le 40$ lines), and strong typing—not verbose explanatory prose.

---

## 2. The 10 Deadly Sins of AI-ified UI & Code (The Anti-Patterns Matrix)

| # | Anti-Pattern ("AI Slop") | The Technical Defect | Mandatory Engineering Law (The Fix) |
| :- | :--- | :--- | :--- |
| **1** | **Candy Rainbow & Neon Circus** | Saturating buttons, tags, and tabs with uncoordinated bright green, hot pink (`#ff385c`), radioactive cyan, and neon yellow. | **The 1-Accent & Desaturation Rule:** 90% of surfaces must be neutral slate/white. Functional semantic colors (success, danger, warning) must be muted/earthy and desaturated by $\ge 30\%$. |
| **2** | **Glow & Shadow Abuse** | Putting `box-shadow: 0 0 15px ...`, `text-shadow`, or glowing colored drop-shadows on buttons (`box-shadow: 0 4px 14px rgba(255, 56, 92, 0.28)`) to look "futuristic" or "modern". | **Zero Decorative Glow Invariant:** `text-shadow` is **STRICTLY PROHIBITED** on all typography. Box-shadow is clamped to structural elevation (`0 1px 3px rgba(0,0,0,0.06)` or crisp 1px `#e2e8f0` borders). Never apply colored glowing drop-shadows. |
| **3** | **Hyperactive Keyframe Addiction** | Looping `@keyframes` (`pulse`, `bounce`, `glowBorder`, `fireGlow`) on static buttons, countdowns, and cards. | **Static Canvas Invariant:** Continuous looping animations on idle elements are **PROHIBITED**. Animations are strictly limited to user-triggered state transitions (150–200ms ease) or genuine critical system alerts. |
| **4** | **Stadium Pill Obsession** | Wrapping every single piece of metadata, tag, and button in rounded pill capsules (`border-radius: 9999px` / `20px+`) with bright fills. | **Geometric Rectangular Rhythm:** Use structured rectangular chips with $3\text{px} - 6\text{px}$ radius (`var(--radius)`). Never use stadium pills for dense data grids, form buttons, or technical dashboards. |
| **5** | **Emoji Vomit & Icon Clutter** | Prepending emojis to every button, label, nav item, table cell, or wrapping every row item in 42px multi-colored circular badges (`🔥 Sát Thương`, `⚡ Tốc Độ`). | **Typographic First Principle:** Visual hierarchy must be established via font size, weight, and opacity. Reserve icons exclusively for navigational anchors or functional action bars. Never wrap standard list items in rainbow circular containers. |
| **6** | **Gradient Wallpaper** | Diagonal multi-color gradients (`linear-gradient(135deg, ...)`) splashed across panels, card bodies, hero banners, and footers. | **Flat Tinted Surface Invariant:** Containers must use solid, opaque or high-opacity tinted neutral fills (`BgSurface`, `BgElevated`). Gradients are prohibited on container backgrounds and only allowed in progress meters. |
| **7** | **Low Density & Mobile Creep** | Bloated 80px-tall cards, oversized buttons, and giant padding that push critical operational data below the fold. | **Desktop Ergonomic Density:** Standard table rows $32\text{px} - 40\text{px}$. Compact cards with high information density. Numeric data must use tabular lining figures (`font-variant-numeric: tabular-nums`). |
| **8** | **Glassmorphism & Contrast Halation** | Layering heavy translucent blurred panels (`backdrop-filter: blur(20px)`) over dynamic backgrounds, ruining legibility. | **Contrast & Opacity Invariant:** Surface opacity must be $\ge 90\%$. All text must maintain minimum **4.5:1** contrast against its actual background (WCAG 2.1 AA). Never rely on blur for readability. |
| **9** | **Code-Level Commentary Slop** | Littering code with trivial, explanatory inline comments (`// get entity`, `// check null`, `// return list`, `// call api`) or inline AI changelogs (`// Modified by AI...`). | **Strict Zero-Comment Standard:** Explanatory inline comments are **STRICTLY PROHIBITED**. Obsolete code must be deleted, not commented out. Change history belongs exclusively to Git commits and audit logs. |
| **10** | **Speculative Wrapper & Dead Code Bloat** | Creating redundant pass-through wrapper functions, single-impl interfaces for small features, empty utils files, or dead variables. | **Lean Execution Invariant:** Code must have direct, verifiable execution paths. No dead code, no speculative boilerplate, no orphaned files. |

---

## 3. Concrete Engineering Specifications

### ① Dual-Mode Palette Systems (Dark & Light Enterprise)

#### Mode A: The Sovereign Living Slate System (Dark Mode Focus)
Rather than pure black (`#000`) or saturated colors, professional dark interfaces use **Living Slate** with subtle warm or cool undertones:

```css
:root {
  /* Surfaces: Deep Slate Ink */
  --bg-canvas: #0d0f13;          /* Outermost canvas */
  --bg-surface: #151822;         /* Primary container card */
  --bg-elevated: #1a1e2a;        /* Nested panels, inputs */
  --bg-hover: #222736;           /* Hover highlight */
  
  /* Borders: Crisp 1px structure */
  --border-subtle: #1c212c;      /* Interior dividers */
  --border-default: #242934;     /* Card boundaries */
  --border-light: #363c4c;       /* Interactive hover border */
  
  /* Typography: High-contrast legible grays */
  --text-primary: #e6e8ee;       /* 100% luminance */
  --text-secondary: #9aa1b2;     /* ~70% luminance */
  --text-dim: #60687a;           /* ~45% luminance */
  
  /* Muted Semantic Accents (Desaturated Earth / Daoist Tones) */
  --accent-gold: #c29f55;        /* Muted Antique Gold (not electric yellow #ffff00) */
  --accent-cinnabar: #b84a4a;    /* Muted Cinnabar Red (not radioactive crimson #ff0033) */
  --accent-jade: #4f8c62;        /* Muted Jade Green (not neon lime #00ff66) */
  --accent-slate-blue: #537bb4;  /* Muted Steel Blue (not hot cyan #00ffff) */
  --accent-amethyst: #8668aa;    /* Muted Deep Plum (not neon magenta #ff00ff) */
}
```

#### Mode B: Enterprise Dignified Palette (Light Mode ERP & WebApps)
Enterprise business systems must project reliability, precision, and calm competence. Avoid consumer candy colors entirely:

```css
:root {
  /* Surfaces: Crisp Off-White & Crisp Paper */
  --bg-canvas: #f4f6f9;          /* Enterprise canvas background */
  --bg-surface: #ffffff;         /* Primary cards and data panels */
  --bg-elevated: #f8fafc;        /* Grouped containers, table headers */
  --bg-hover: #f1f5f9;           /* Row hover */
  
  /* Borders: Architectural 1px dividers */
  --border-subtle: #edf2f7;      /* Interior item dividers */
  --border-default: #e2e8f0;     /* Card boundaries and inputs */
  --border-strong: #cbd5e1;      /* Active / focus boundaries */
  
  /* Typography: High-density slate contrast */
  --text-primary: #0f172a;       /* 100% contrast black-slate */
  --text-secondary: #475569;     /* 70% structural labels */
  --text-muted: #64748b;         /* 55% timestamps, helpers */
  --text-disabled: #94a3b8;      /* Inactive state */
  
  /* Enterprise Primary & Semantic Accents */
  --brand-primary: #005496;      /* Mylan / Pluto Industrial Blue (not candy hot pink) */
  --brand-primary-hover: #004077;
  --accent-success: #16a34a;     /* Forest Emerald Green */
  --accent-warning: #d97706;     /* Amber Ochre */
  --accent-danger: #dc2626;      /* Muted Crimson */
  --accent-info: #0284c7;        /* Steel Cyan */
}
```

---

### ② The 1px Outline & Flat Action Button Paradigm (Ending Solid Candy Buttons)

AI models frequently render every button as a solid, high-contrast, fully-saturated rectangle or glowing pink bubble.

* **Incorrect (AI Slop):**
  ```css
  /* ❌ GAUDY: Candy pink, stadium pill, glowing shadow, looping keyframe */
  .btn-submit {
    background: #ff385c;
    color: #fff;
    box-shadow: 0 4px 14px rgba(255, 56, 92, 0.28);
    border-radius: 22px;
    animation: pulse 1.5s infinite;
  }
  ```

* **Correct (Professional Enterprise Restraint):**
  ```css
  /* ✅ CLEAN: Deep corporate blue, 6px crisp radius, zero glow */
  .btn-submit {
    background: #005496;
    border: 1px solid #005496;
    color: #ffffff;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 18px;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .btn-submit:hover {
    background: #004077;
    border-color: #004077;
  }
  ```

* **Secondary & Ghost Actions:**
  ```css
  /* ✅ CLEAN: Neutral 1px outline button */
  .btn-secondary {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
  }
  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
  }
  ```

---

### ③ Chip & Badge Restraint

Never use full-saturation backgrounds on badges. Use **10%–15% tinted alpha** backgrounds with **25%–30% alpha matching borders** and **rectangular radius (3–6px)**:

```css
/* ✅ Professional Enterprise Tag / Chip Pattern */
.badge-semantic {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1.2;
}

.badge-semantic--success {
  background: rgba(22, 163, 74, 0.10);
  color: #15803d;
  border: 1px solid rgba(22, 163, 74, 0.25);
}

.badge-semantic--danger {
  background: rgba(220, 38, 38, 0.10);
  color: #b91c1c;
  border: 1px solid rgba(220, 38, 38, 0.25);
}

.badge-semantic--warning {
  background: rgba(217, 119, 6, 0.10);
  color: #b45309;
  border: 1px solid rgba(217, 119, 6, 0.25);
}
```

---

### ④ Progress Bars & Meters

* **Prohibited:** Candy gradients (`linear-gradient(90deg, #ff00ff, #00ffff)`), striped animated barbershop poles, or neon glow halos.
* **Mandated:** Flat, solid, desaturated fills inside recessed tracks with clean 1px borders.

```css
.progress-track {
  height: 6px;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  transition: width 0.3s ease;
}
```

---

## 4. Typography-First Information Architecture

When an interface looks "plain", AI models reflexively add colors, borders, and emojis. **Human design masters solve hierarchy using typography alone.**

### The 3-Tier Contrast Hierarchy
1. **Primary Data (100% Opacity):** Headings, critical metrics, selected values (`var(--text-primary)`).
2. **Structural Labels (70% Opacity):** Form field headers, column titles, descriptive metadata (`var(--text-secondary)`).
3. **Tertiary Context (45% Opacity):** Timestamps, unit labels, inactive hotkeys, secondary hints (`var(--text-muted)`).

```html
<!-- ✅ Superior Typography Hierarchy without Rainbow Colors -->
<div class="metric-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; background: #fff;">
  <div style="font-size: 11.5px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Tồn Kho Khả Dụng</div>
  <div style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 4px; font-family: monospace;">
    48,250.00 <span style="font-size: 12px; color: #94a3b8; font-weight: 400; font-family: sans-serif;">KG</span>
  </div>
  <div style="font-size: 12px; color: #16a34a; margin-top: 4px; font-weight: 500;">
    <i class="fa fa-arrow-up" style="margin-right: 4px;"></i>+3.4% so với kỳ trước
  </div>
</div>
```

---

## 5. Code-Level Anti-Slop Standard (Strict Clean Code Hygiene)

Generative AI produces code-level slop that clutters repositories, wastes developer time, and introduces subtle bugs.

### The 5 Invariants of Anti-Code-Slop
1. **Zero Explanatory Inline Comments:**
   - **PROHIBITED:** Commenting obvious code lines (`// get user id`, `// check if list is empty`, `// return result`).
   - Code **MUST** be self-documenting through expressive variable, method, and class names.
2. **Zero Dead / Commented-Out Code:**
   - **PROHIBITED:** Leaving commented-out blocks (`// var oldCalculation = ...`).
   - Obsolete code must be completely deleted; Git history preserves all iterations.
3. **Zero Agent Metadata & Changelogs in Source Files:**
   - **PROHIBITED:** Adding comments attributing work to AI agents or tasks (`// Added by Agent on 2026-10-26`, `// Fix for issue 2FA`).
   - Change provenance belongs exclusively to Git commits and database action logs (`ActionLogHelper`).
4. **Zero Single-Use Boilerplate Wrappers:**
   - **PROHIBITED:** Creating trivial wrapper functions that simply forward arguments to another function without adding logic.
5. **Zero Orphaned or Dead Imports:**
   - All unused imports, unreferenced variables, and dead state machines must be swept clean before submitting code.

### Exhaustive Allowlist (Permitted Comments Only)
1. **Interface Section Banners:** (`// ── Query ──────────────────`, `// ── Action ──────────────────`).
2. **High-level XML Doc comments (`/// <summary>`):** On public Contract interfaces (stating *WHAT/WHY*, never volatile *HOW* details).
3. **Non-obvious third-party workarounds:** (e.g. DevExpress or WinForms synchronization quirks) restricted to a single concise line explaining the *WHY*.

---

## 6. Cross-Platform Anti-Slop Enforcements

### ① Web (React / Vue / Tailwind / Ant Design)
- **Buttons:** Solid deep tones (`#005496`) or 1px neutral borders. No candy pinks, no glowing halos.
- **Modals & Cards:** Crisp `1px solid #e2e8f0` borders, `borderRadius: 6px - 10px`. No floating `0 2px 10px rgba(0,0,0,0.05)` blurry shadows.
- **Lists & Grids:** Categorized grouped lists (Google Account pattern) with typographic hierarchy. No 42px multi-colored circular rainbow badges.

### ② Desktop (WinForms DevExpress & WPF)
- **Skinning & Themes:** Adhere strictly to the enterprise theme (`Office 2019 Colorful` or `Living Slate Dark`). Never override standard cells with rainbow gradients or garish 3D bevels.
- **Grid Density:** Compact row heights ($24\text{px} - 28\text{px}$ in WinForms GridView). Numeric columns right-aligned with standard format strings (`{0:N2}`).
- **Dialogs:** All dialogs inherit `BaseForm`, standard dialog buttons (`Lưu`, `Đóng`), standard font (`Segoe UI` or `Tahoma` 9pt-10pt).

### ③ Mobile (Jetpack Compose & Flutter)
- **Tonal Elevation:** Use Material 3 surface tinting rather than harsh colored drop-shadows.
- **Touch Targets:** Minimum $48\text{dp}$ touch target, but internal chip visuals remain compact ($28\text{dp} - 32\text{dp}$) with $4\text{dp} - 8\text{dp}$ radius.

---

## 7. Automated AI Code-Review Checklist (Anti-Slop Linter)

Before committing or approving any UI or code change, verify this checklist:

- [ ] **No `text-shadow`:** Zero instances of `text-shadow` in CSS or inline styles.
- [ ] **No Glowing/Colored `box-shadow`:** No colored halos (`rgba(255, 56, 92, 0.28)` or `0 0 15px`). Shadows are strictly neutral elevation.
- [ ] **No Infinite Looping Keyframes:** No `@keyframes pulse`, `bounce`, or `glow` running indefinitely on buttons, badges, or cards.
- [ ] **No Candy Buttons:** Buttons are solid corporate blue (`#005496`) or 1px outline, not hot pink or neon blocks.
- [ ] **No Rainbow Badges:** Status chips use desaturated tones with $\le 15\%$ fill opacity and crisp 1px borders.
- [ ] **No Emojis as Bullets:** Emojis are stripped from button bodies, table cells, and list item prefixes.
- [ ] **No Background Gradients:** Panel bodies use flat tinted neutral surfaces (`#ffffff` or `#151822`), not multi-color linear gradients.
- [ ] **No Stadium Pills on Data:** Tables and dense card grids use standard $3\text{px} - 6\text{px}$ corner radius.
- [ ] **Density Preserved:** Table row heights clamped to $32\text{px} - 40\text{px}$ (Web) or $24\text{px} - 28\text{px}$ (Desktop). Essential data visible without excessive scrolling.
- [ ] **Zero Explanatory Comments:** All trivial inline comments (`// handle click`, `// get data`) removed.
- [ ] **Zero Dead Code:** All commented-out code deleted.
- [ ] **WCAG 2.1 AA Compliant:** Minimum 4.5:1 text-to-background contrast verified across all states.
