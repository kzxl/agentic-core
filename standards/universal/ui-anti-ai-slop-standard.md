---
desc: Practical UI Engineering & Anti-AI-Slop Standard — Visual Restraint, Ergonomics, Contrast Integrity & De-AI-ification Guidelines
rules: [R_CORE, R_UI]
---

# 🛡️ Practical UI Engineering & Anti-AI-Slop Standard

This standard establishes mandatory visual restraint, ergonomic, and anti-clutter engineering guidelines for all software interfaces across the AgentOption ecosystem. Its primary objective is to prevent **"AI Slop"**—the distinct, gaudy, hyper-saturated, and cartoonish aesthetic characteristically produced by generative AI models when left unconstrained.

---

## 1. The Anatomy of "AI Slop" in User Interfaces

### Why Generative AI Creates Tacky UI by Default
Language models and code-generation agents default to visual excess because their training corpora are skewed by flashy Dribbble conceptual mockups, marketing landing pages, and consumer mobile toys. When asked to style an interface, AI models exhibit predictable failure modes:
1. **Compensatory Novelty:** Attempting to make every element look "impressive" by adding glowing box shadows, gradients, and animated keyframes.
2. **Color Disconnection:** Assigning independent, uncoordinated saturated colors to every category, badge, and button (the "Candy Store" effect).
3. **Absence of Visual Restraint:** Treating empty space as a defect to be filled with emojis, floating circles, and rainbow pill badges.
4. **Ignorance of Cognitive Ergonomics:** Forgetting that human operators look at business and gameplay tools for hours, where high-contrast neon and breathing animations induce severe retinal fatigue.

### The Core Philosophy: "Invisible Craftsmanship & Functional Restraint"
* **The Prime Directive:** Exceptional UI gets out of the way. It prioritizes information hierarchy, data scanability, and deterministic operational feedback over decorative spectacle.
* **Quiet Competence:** A dignified, professional interface relies on subtle 1px border strokes, desaturated semantic accents, and structured typography rather than glowing gradients and cartoon animations.

---

## 2. The 8 Deadly Sins of AI-ified UI (The Anti-Patterns Matrix)

| # | Anti-Pattern ("AI Slop") | The Technical Defect | Mandatory Engineering Law (The Fix) |
| :- | :--- | :--- | :--- |
| **1** | **Candy Rainbow & Neon Circus** | Saturating buttons, tags, and tabs with uncoordinated bright green, hot pink, radioactive cyan, and neon yellow. | **The 1-Accent & Desaturation Rule:** 90% of surfaces must be neutral slate. Functional semantic colors (success, danger, warning) must be muted/earthy and desaturated by $\ge 30\%$. |
| **2** | **Glow & Shadow Abuse** | Putting `box-shadow: 0 0 15px ...` and `text-shadow: 0 0 10px ...` on text, cards, and buttons to look "futuristic" or "magical". | **Zero Decorative Glow Invariant:** `text-shadow` is **STRICTLY PROHIBITED** on all typography. Box-shadow is clamped to structural elevation (`0 1px 3px rgba(0,0,0,0.3)` or `0 8px 24px rgba(0,0,0,0.5)` for floating dialogs). Never apply colored glowing drop-shadows. |
| **3** | **Hyperactive Keyframe Addiction** | Looping `@keyframes` (`pulse`, `bounce`, `glowBorder`, `fireGlow`) on static buttons, countdowns, and cards. | **Static Canvas Invariant:** Continuous looping animations on idle elements are **PROHIBITED**. Animations are strictly limited to user-triggered state transitions (150–200ms ease) or genuine critical system alerts. |
| **4** | **Pill Badge Obsession** | Wrapping every single piece of metadata in rounded pill capsules (`border-radius: 9999px` / `20px`) with bright fills. | **Geometric Rectangular Rhythm:** Use structured rectangular chips with $3\text{px} - 6\text{px}$ radius (`var(--radius)`). Never use stadium pills for dense data grids or technical dashboards. |
| **5** | **Emoji Vomit & Icon Clutter** | Prepending emojis to every button, label, nav item, table cell, and header (`🔥 Sát Thương`, `⚡ Tốc Độ`, `💎 Đá`). | **Typographic First Principle:** Visual hierarchy must be established via font size, weight, and opacity. Reserve icons exclusively for navigational anchors or functional action bars. Never use emojis as decorative bullet points. |
| **6** | **Gradient Wallpaper** | Diagonal multi-color gradients (`linear-gradient(135deg, ...)`) splashed across panels, card bodies, and footers. | **Flat Tinted Surface Invariant:** Containers must use solid, opaque or high-opacity tinted neutral fills (`BgSurface`, `BgElevated`). Gradients are prohibited on container backgrounds and only allowed in progress meters. |
| **7** | **Low Density & Mobile Creep** | Bloated 80px-tall cards, oversized buttons, and giant padding that push critical operational data below the fold. | **Desktop Ergonomic Density:** Standard table rows $32\text{px} - 40\text{px}$. Compact cards with high information density. Numeric data must use tabular lining figures (`font-variant-numeric: tabular-nums`). |
| **8** | **Glassmorphism & Contrast Halation** | Layering heavy translucent blurred panels (`backdrop-filter: blur(20px)`) over dynamic backgrounds, ruining legibility. | **Contrast & Opacity Invariant:** Surface opacity must be $\ge 90\%$. All text must maintain minimum **4.5:1** contrast against its actual background (WCAG 2.1 AA). Never rely on blur for readability. |

---

## 3. Concrete Engineering Specifications

### ① The Slate & Muted Accent System (Dark Mode Focus)

Rather than pure black (`#000`) or saturated colors, professional dark interfaces use **Living Slate** with subtle warm or cool undertones:

```css
/* --- THE SOVEREIGN MINIMALIST PALETTE --- */
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

### ② The 1px Outline Button Paradigm (Ending Solid Candy Buttons)

AI models frequently render every button as a solid, high-contrast, fully-saturated rectangle. This turns screens into a visual shouting match.

* **Incorrect (AI Slop):**
  ```css
  /* ❌ GAUDY: High-contrast solid block, glowing shadow */
  .btn-challenge {
    background: #ef4444;
    color: #fff;
    box-shadow: 0 0 14px rgba(239, 68, 68, 0.6);
    border-radius: 20px;
    animation: pulseGlow 1.5s infinite;
  }
  ```

* **Correct (Professional Restraint):**
  ```css
  /* ✅ CLEAN: Dark slate foundation with subtle 1px semantic stroke */
  .btn-challenge {
    background: #221a1d;
    color: #d67a7a;
    border: 1px solid #572c30;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    transition: all 0.15s ease;
  }
  .btn-challenge:hover {
    background: #2c2024;
    border-color: #793c42;
    color: #f09292;
  }
  ```

### ③ Chip & Badge Restraint

Never use full-saturation backgrounds on badges. Use **10%–15% tinted alpha** backgrounds with **30% alpha matching borders**:

```css
/* ✅ Professional Tag / Badge Pattern */
.badge-semantic {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.2;
}

.badge-semantic--success {
  background: rgba(79, 140, 98, 0.12);
  color: #7cb387;
  border: 1px solid rgba(79, 140, 98, 0.25);
}

.badge-semantic--danger {
  background: rgba(184, 74, 74, 0.12);
  color: #d67a7a;
  border: 1px solid rgba(184, 74, 74, 0.3);
}

.badge-semantic--gold {
  background: rgba(194, 159, 85, 0.12);
  color: #dfcfb2;
  border: 1px solid rgba(194, 159, 85, 0.3);
}
```

### ④ Progress Bars & Meters

* **Prohibited:** Candy gradients (`linear-gradient(90deg, #ff00ff, #00ffff)`), striped animated barbershop poles, or neon glow halos.
* **Mandated:** Flat, solid, desaturated fills inside dark recessed tracks with clean 1px borders.

```css
.progress-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-jade);
  transition: width 0.3s ease;
}
```

---

## 4. Typography-First Information Architecture

When an interface looks "boring" or "flat", AI models reflexively add colors, borders, and emojis. **Human design masters solve hierarchy using typography alone.**

### The 3-Tier Contrast Hierarchy
1. **Primary Data (100% Opacity):** Headings, critical metrics, selected values (`var(--text-primary)`).
2. **Structural Labels (70% Opacity):** Form field headers, column titles, descriptive metadata (`var(--text-secondary)`).
3. **Tertiary Context (45% Opacity):** Timestamps, unit labels, inactive hotkeys, secondary hints (`var(--text-dim)`).

```html
<!-- ✅ Superior Typography Hierarchy without Rainbow Colors -->
<div class="metric-card">
  <div class="metric-card__label" style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Phòng Ngự Vật Lý</div>
  <div class="metric-card__value" style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">1,224.3 <span style="font-size: 12px; color: var(--text-dim); font-weight: 400;">PTS</span></div>
  <div class="metric-card__delta" style="font-size: 11px; color: var(--accent-jade); margin-top: 4px;">+14.2% so với tầng trước</div>
</div>
```

---

## 5. Automated AI Code-Review Checklist (Anti-Slop Linter)

Before committing or approving any UI code, verify this checklist:

- [ ] **No `text-shadow`:** Zero instances of `text-shadow` in CSS or inline styles.
- [ ] **No Unbounded `box-shadow`:** No colored glowing halos (`rgba(..., 0.5) 0 0 15px`). Shadows are strictly neutral elevation.
- [ ] **No Infinite Looping Keyframes:** No `@keyframes pulse`, `bounce`, or `glow` running indefinitely on buttons, badges, or cards.
- [ ] **No Candy Buttons:** Buttons are dark slate with 1px accent borders, not neon blocks.
- [ ] **No Rainbow Badges:** Status chips use desaturated tones with $\le 15\%$ fill opacity and crisp 1px borders.
- [ ] **No Emojis as Bullets:** Emojis are stripped from button bodies and list item prefixes.
- [ ] **No Background Gradients:** Panel bodies use flat tinted neutral surfaces (`#151822`), not multi-color linear gradients.
- [ ] **No Stadium Pills on Data:** Tables and dense card grids use standard $3\text{px} - 6\text{px}$ corner radius.
- [ ] **Density Preserved:** Table row heights clamped to $32\text{px} - 40\text{px}$. Essential data visible without excessive scrolling.
- [ ] **WCAG 2.1 AA Compliant:** Minimum 4.5:1 text-to-background contrast verified across all states.
