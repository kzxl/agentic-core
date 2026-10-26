---
name: ui-anti-ai-slop-standard
description: Use when writing or reviewing UI styles, colors, shadows, radius, icons, motion or animation (CSS, WAAPI, GSAP), data grids, row heights, badges, charts, empty or loading states, or UI copy, and before adding comments, wrappers, or interfaces. Defines the AS-01..AS-12 and AS-C1..AS-C5 laws, motion profiles, and checkable completion criteria.
desc: Anti-AI-Slop Standard - quiet, dense, flat UI and self-documenting code (AS-01..AS-12, AS-C1..AS-C5)
rules: [R_CORE, R_UI, R_ANTI_SLOP]
---

# Anti-AI-Slop Standard

Target: quiet, dense, flat interfaces that move once, and self-documenting code. "AI slop" is the gaudy, over-decorated default output of unconstrained generators.

- Values (hex, px, ms) live only in [tokens.md](../../skills/ui-design-system/references/tokens.md). This file references token names.
- Rationale and before/after examples live in [docs/anti-slop.md](../../docs/anti-slop.md) (human-facing).
- Severity: `MUST` = blocking (linter exit code 1). `SHOULD` = warning; the reviewer decides.

---

## 1. Leading Words

| Word | Region it anchors | Laws |
| :--- | :--- | :--- |
| **quiet** | Color, shadow, ornament restraint | AS-01, AS-02, AS-05, AS-10, AS-11 |
| **dense** | Row height, padding, data per screen | AS-07, AS-12 |
| **flat** | Surfaces, progress bars | AS-06 |
| **once** | Motion | AS-03 |
| **self-documenting** | Names over comments | AS-C1, AS-C3 |
| *Dead Code*, *Middle Man*, *Speculative Generality* | Code bloat (Fowler) | AS-C2, AS-C4, AS-C5 |

---

## 2. Laws

### 2.1 UI

| ID | Law | Severity | Why |
| :--- | :--- | :---: | :--- |
| AS-01 | One brand accent: `--brand-primary`. Semantic states use the `--{state}-fg`, `-solid`, `-bg`, `-border` tokens. Solid semantic fills stay at HSL saturation <= 60%. | MUST | Operators read these screens for hours; saturated color competes with data. |
| AS-02 | Elevation comes from `--elevation-0`, `--elevation-1`, `--elevation-overlay` (neutral black only). Hierarchy comes from size, weight, and the text tokens. Guardrail: no text-shadow, no colored shadow. | MUST | Glow blurs edges and reads as decoration. |
| AS-03 | Motion runs **once** in response to a user action or active I/O, on compositor-only properties, with motion tokens, reduced-motion gating in CSS and JS, and a cleanup path (full checklist in §4.3). | MUST | Idle motion pulls attention away from data. |
| AS-04 | Radius from `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`. `--radius-pill` only on avatars and notification counts. | MUST | Rectangular rhythm aligns with grid columns. |
| AS-05 | Icons come from the project icon set at 16px, stroke 1.75, on navigation and action bars only. UI chrome uses words; no emoji. | MUST | Icons are anchors, not filler. |
| AS-06 | Surfaces are **flat**: `--bg-canvas`, `--bg-surface`, `--bg-elevated`. Containers and progress bars use one solid fill; no gradients. | MUST | Flat fills keep contrast predictable. |
| AS-07 | Rows are **dense** within the platform band (§3). | SHOULD | More rows visible means less scrolling. |
| AS-08 | Text >= 4.5:1 and non-text UI (form-control boundaries, focus ring, icons) >= 3:1 against the actual background. Form controls whose border is the only identifying cue use `--border-input`; decorative dividers and card borders are exempt. Surface opacity >= 90%. | MUST | WCAG 2.1 AA; blur does not fix contrast. |
| AS-09 | `:focus-visible` outline 2px `--brand-primary`, offset 2px. Desktop keeps the native focus cue. Removing an outline requires this replacement in the same file. | MUST | Keyboard users need to see focus. |
| AS-10 | Charts: <= 6 categorical hues in one S/L band (S 35-55%), one highlighted series in `--brand-primary`, others neutral; flat 2D, area opacity <= 20%. | SHOULD | One story per chart. |
| AS-11 | UI copy: verb-first labels of 1-3 words; errors state cause + action; plain words, no emoji, no marketing filler, no exclamation marks in system messages. | SHOULD | Copy is an instrument, not a pitch. |
| AS-12 | Empty state = one muted line icon <= 32px + one sentence + optional action. Loading > 300ms = skeleton rows at the real row height. | SHOULD | Layout stays stable while data arrives. |

### 2.2 Code

| ID | Law | Severity | Why |
| :--- | :--- | :---: | :--- |
| AS-C1 | **Self-documenting** names carry intent. A comment states a non-obvious WHY in one line or belongs to the allowlist (§5.1). Applies to new or modified lines only (§5.2). | MUST | Narrating comments drift from the code. |
| AS-C2 | *Dead Code*: delete obsolete code. No commented-out code. | MUST | Git keeps every version. |
| AS-C3 | Provenance lives in git: no agent metadata, author tags, dates, or changelogs in source. | MUST | Source states the present, git states the past. |
| AS-C4 | *Middle Man* / *Speculative Generality*: every module passes the deletion test; interfaces follow the seam rule (§5.3). | SHOULD | Indirection without variation is cost without value. |
| AS-C5 | No unused imports, variables, or files. | MUST | Noise hides the live path. |

---

## 3. Platform Row Bands (AS-07)

| Platform | Band | Default |
| :--- | :---: | :---: |
| Desktop (WinForms / WPF) | 24-28px | 28px |
| Web data table | 32-40px | 36px (compact 32px) |
| Mobile list | >= 48dp touch target | 48dp |

- Numeric columns are right-aligned with tabular figures.
- Zebra striping is **off by default**: 1px `--border-subtle` row dividers plus `--bg-hover` on hover.
- Zebra opt-in: read-only grids with >= 8 visible columns may tint alternate rows with `--bg-elevated` only.

---

## 4. Motion (AS-03)

### 4.1 Profiles

Declare once per project in the `.project-rule.md` frontmatter: `ui_profile: enterprise` or `ui_profile: expressive`. When absent, the profile is `enterprise`.

| Profile | Scope | Allowed ladder levels |
| :--- | :--- | :--- |
| `enterprise` (default) | ERP, HelpDesk, internal tools, WinForms/WPF, admin dashboards | L0-L2; L3 only from the allowlist (§4.4) |
| `expressive` | Marketing and landing pages, onboarding, games | L0-L3 with the full toolset; §4.3 items 2-7 and AS-08 stay binding |

### 4.2 Motion Decision Ladder

Choose the lowest sufficient level.

| Level | Mechanism | Use for |
| :---: | :--- | :--- |
| L0 | No animation | Data refresh, static content |
| L1 | CSS transition with `--duration-fast` or `--duration-base` (transform, opacity, color) | Hover, focus, expand, tab switch |
| L2 | CSS keyframes or WAAPI, <= 200ms, runs once | Overlay enter/exit, toast |
| L3 | GSAP within the profile allowlist | Reorder, drag, coordinated multi-step, chart transition |

### 4.3 AS-03 Checklist

1. **Once:** a user action or an active I/O state starts the animation, and it stops when done. Spinners exist only while I/O is active.
2. **Compositor-only:** animate `transform` and `opacity`. Progress fill uses `transform: scaleX(var(--progress))` with `transform-origin: left`.
3. **Tokens:** durations come from `--duration-fast`, `--duration-base`, `--duration-data`.
4. **Reduced motion in CSS and JS:** a `prefers-reduced-motion: reduce` media query for CSS, and a JS branch (`matchMedia` or `gsap.matchMedia()`) that sets duration 0 or skips the animation.
5. **Cleanup:** every JS animation reverts on unmount, route change, or off-screen (`useGSAP`, `ctx.revert()`, `mm.revert()`, `animation.cancel()`).
6. **Non-interactive when hidden:** an element at opacity 0 also gets `visibility: hidden` (or GSAP `autoAlpha`).
7. **`will-change`** only on elements while they animate.

### 4.4 GSAP Allowlist

| GSAP feature | `enterprise` | `expressive` |
| :--- | :---: | :---: |
| `gsap.to` / `gsap.from` / timeline, one-shot, <= `--duration-data` | allowed | allowed |
| Flip | allowed | allowed |
| Draggable + Inertia | allowed | allowed |
| `gsap.utils`, `quickTo` | allowed | allowed |
| ScrollTrigger with `toggleActions` (no pin, no scrub) | review; prefer IntersectionObserver + CSS | allowed |
| ScrollTrigger `pin` / `scrub`, ScrollSmoother | forbidden | allowed |
| SplitText, ScrambleText | forbidden | allowed |
| Decorative MorphSVG / DrawSVG | forbidden | allowed |
| CustomBounce, CustomWiggle, Physics2D | forbidden | allowed |
| `repeat: -1` on idle elements | forbidden | allowed when paused off-screen |

### 4.5 Precedence over Third-Party Skills

- In the `enterprise` profile, R_ANTI_SLOP overrides third-party skill recommendations (for example a skill that recommends GSAP by default).
- Install `gsap-skills` per workspace only in `expressive` projects, never globally.

---

## 5. Code Hygiene

### 5.1 Comment Allowlist (AS-C1)

1. Section banners (`// ── Query ──`).
2. `///` XML docs on public contracts, stating WHAT and WHY.
3. One line explaining a non-obvious third-party workaround; it may include a ticket ID.

Any other comment: rename until the comment is redundant, then delete it.

### 5.2 Diff Scope (AS-C1)

AS-C1 applies to lines added or modified in the current change. Existing unrelated comments stay. Clean legacy comments only in a dedicated change, audited with `node tools/anti-slop-lint.js --all <path>`.

### 5.3 Seam Rule (AS-C4)

An interface earns its place when something varies across the seam: two adapters exist (a production implementation plus an in-memory test fake counts as two), or plugin contracts load at runtime per [universe-plugin.md](../../architecture/universe-plugin.md). Otherwise apply the deletion test: if deleting the module makes complexity vanish instead of moving to its callers, inline it. This is a judgement call; the reviewer decides.

### 5.4 Suppression

Write `anti-slop-ignore AS-xx: <reason>` on the same line. The reason is mandatory, and the linter summary lists every suppression.

---

## 6. Completion Criteria

A UI or code change is complete when every row holds:

| Criterion | Checked by |
| :--- | :--- |
| `node tools/anti-slop-lint.js --diff` reports zero MUST errors | Linter exit code 0 |
| Every new or changed text/background token pair measures >= 4.5:1 (non-text >= 3:1) | `node tools/anti-slop-lint.js --tokens <file>` output |
| Every JS animation has a reduced-motion branch and a cleanup path | Linter warnings + reviewer |
| Every new module or interface passes the deletion test or has two adapters | Reviewer (judgement call) |
| Every suppression carries a reason | Linter summary |

**It's working if:** a screenshot of any changed screen shows at most one non-neutral accent hue outside semantic states, the linter summary lists no suppressions without reasons, and reviewers stop writing "looks AI-generated".

---

## 7. Related

- Values: [tokens.md](../../skills/ui-design-system/references/tokens.md)
- Composition workflow: [ui-design-system SKILL.md](../../skills/ui-design-system/SKILL.md)
- Platform mappings: [winforms-ui.md](../csharp/winforms-ui.md), [wpf-ui.md](../csharp/wpf-ui.md), [react-ui.md](../react/react-ui.md)
- Human guide: [docs/anti-slop.md](../../docs/anti-slop.md)
