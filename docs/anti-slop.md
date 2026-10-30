# Anti-Slop: Quiet, Dense UI and Self-Documenting Code

Human-facing guide to the [Anti-AI-Slop Standard](../standards/universal/ui-anti-ai-slop-standard.md). Agents read the standard; people read this page for the reasoning and the examples.

## What it does

AI code generators drift toward the same look: candy colors, glowing shadows, pulsing buttons, capsule badges, gradients, emoji labels, and comments that narrate every line. This family of defects is called "AI slop".

The anti-slop system replaces that default with five behaviours, each anchored by one leading word:

| Word | Behaviour |
| :--- | :--- |
| quiet | One brand accent, muted semantic states, no glow |
| dense | Platform row-height bands, data first |
| flat | Solid surfaces and progress bars |
| once | Motion answers a user action or active I/O, then stops |
| self-documenting | Names carry intent; comments explain only a non-obvious why |

It is made of four parts:

| Part | Role |
| :--- | :--- |
| [ui-anti-ai-slop-standard.md](../standards/universal/ui-anti-ai-slop-standard.md) | Positive laws with IDs AS-01..AS-12 and AS-C1..AS-C5, motion profiles, completion criteria |
| [tokens.md](../skills/ui-design-system/references/tokens.md) | The only place where hex, px, and ms values live |
| [ui-design-system skill](../skills/ui-design-system/SKILL.md) | The composition workflow agents follow when building UI |
| `tools/anti-slop-lint.js` | Diff-scoped linter that enforces the MUST laws |

## When to reach for it

- Building or reviewing any screen, component, theme, or chart.
- Adding animation, especially with a library such as GSAP or Framer Motion.
- A reviewer says the output "looks AI-generated".
- Adding comments, wrappers, or interfaces to code.
- Migrating a project from the old Tailwind-600 semantic palette (see the migration table below).

Run the linter on staged changes before committing:

```bash
node tools/anti-slop-lint.js --diff
node tools/anti-slop-lint.js --tokens src/styles/globals.css
```

## Before/After gallery

These negative examples exist only on this page and in the linter fixtures. The agent-facing standard never shows them, because printing a forbidden pattern makes a model more likely to reproduce it.

### Candy pink button with glow, pulse, and capsule (AS-01, AS-02, AS-03, AS-04)

Before:

```css
.btn-submit {
  background: #ff385c;
  color: #fff;
  box-shadow: 0 4px 14px rgba(255, 56, 92, 0.28);
  border-radius: 22px;
  animation: pulse 1.5s infinite;
}
```

After:

```css
.btn-submit {
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  color: #ffffff;
  border-radius: var(--radius-md);
  font-weight: 600;
  padding: 6px 18px;
  transition: background-color var(--duration-fast) ease, border-color var(--duration-fast) ease;
}
.btn-submit:hover {
  background: var(--brand-primary-hover);
  border-color: var(--brand-primary-hover);
}
```

### Glowing text and colored halo (AS-02)

Before:

```css
.kpi-value {
  color: #00ffff;
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.8);
}
.card {
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}
```

After:

```css
.kpi-value {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  box-shadow: var(--elevation-0);
  border-radius: var(--radius-lg);
}
```

### Idle pulse and width-animated progress (AS-03)

Before:

```css
.badge-live { animation: pulse 2s infinite; }
.progress-fill { transition: width 0.3s ease; }
```

After:

```css
.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  transform: scaleX(var(--progress));
  transform-origin: left;
  transition: transform var(--duration-data) ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .progress-fill { transition: none; }
}
```

The live badge stays static; a spinner appears only while a request is in flight. JS animations also need a reduced-motion branch and a cleanup path, because the CSS media query does not stop WAAPI or GSAP.

### Capsule badges on data (AS-04)

Before:

```css
.status-tag {
  border-radius: 9999px;
  background: #22c55e;
  color: #fff;
  padding: 4px 14px;
}
```

After:

```css
.status-tag--success {
  border-radius: var(--radius-sm);
  background: var(--success-bg);
  border: 1px solid var(--success-border);
  color: var(--success-fg);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
}
```

### Gradient wallpaper and gradient progress (AS-06)

Before:

```css
.panel { background: linear-gradient(135deg, #6366f1, #ec4899); }
.meter-fill { background: linear-gradient(90deg, #ff00ff, #00ffff); }
```

After:

```css
.panel { background: var(--bg-surface); border: 1px solid var(--border-default); }
.meter-fill { background: var(--brand-primary); }
```

### Emoji labels (AS-05, AS-11)

Before:

```html
<button>🔥 Lưu ngay!</button>
<td>⚡ Đang xử lý</td>
```

After:

```html
<button><svg class="icon-16" aria-hidden="true"><use href="#icon-save"/></svg>Lưu</button>
<td>Đang xử lý</td>
```

### Comment slop (AS-C1, AS-C2, AS-C3)

Before:

```csharp
// Added by Agent on 2026-10-26
// get the customer from db
var c = await _repo.GetAsync(id);
// check null
if (c == null) return NotFound();
// var oldTotal = c.Orders.Sum(o => o.Amount);
// return result
return Ok(c);
```

After:

```csharp
var customer = await _customerRepository.GetAsync(customerId);
if (customer is null) return NotFound();
return Ok(customer);
```

The author line moves to the git commit, the commented-out calculation is deleted, and the names make every remaining comment redundant.

## Common questions

**Why is the standard written positive-first?**
Telling a model "never use hot pink" puts hot pink into its context and makes it more available. The standard states the target ("one brand accent, `--brand-primary`") and keeps prohibitions only as short guardrails tied to an ID. The negative examples live here and in linter fixtures, where agents do not load them as patterns.

**Why are comment rules diff-scoped?**
AS-C1 applies only to lines a change adds or modifies. A rule that applied to whole files would push every edit into a mass comment deletion, mixing unrelated churn into reviews and violating the rule to preserve unrelated documentation. Legacy cleanup happens deliberately, in a dedicated change audited with `node tools/anti-slop-lint.js --all <path>`.

**Why is zebra striping off by default?**
Across 50+ rows, alternating fills add visual noise, and on narrow grids 1px dividers plus a hover highlight track rows just as well. Wide read-only grids are the exception: with eight or more visible columns, the eye loses the row while scanning sideways, so those grids may opt in to a `--bg-elevated` tint.

**What are motion profiles?**
A project declares `ui_profile: enterprise` (default) or `ui_profile: expressive` in its `.project-rule.md` frontmatter. Enterprise tools (ERP, HelpDesk, WinForms, dashboards) use the lowest sufficient level of the Motion Decision Ladder and a narrow GSAP allowlist (one-shot tweens, Flip, Draggable). Expressive projects (landing pages, onboarding, games) may use the full toolset but still honour reduced motion, cleanup, and contrast. In the enterprise profile the anti-slop rule overrides third-party skills that recommend animation libraries by default.

**Why are values only in tokens.md?**
The earlier documents restated the same numbers in six places, and every copy drifted. One owner per value means a fix happens once.

**What about interfaces with a single implementation?**
An interface earns its place when something varies across the seam: a production adapter plus an in-memory test fake counts as two, and runtime plugin contracts count too. Otherwise apply the deletion test: if deleting it makes complexity vanish instead of moving to callers, inline it.

## It's working if

- A screenshot of any changed screen shows at most one non-neutral accent hue outside semantic states.
- `node tools/anti-slop-lint.js --diff` exits with zero MUST errors, and its summary lists no suppression without a reason.
- Reviewers stop writing "looks AI-generated".

## Palette migration

Projects that copied the old values keep them until migrated. Replace them as follows (full token list in [tokens.md](../skills/ui-design-system/references/tokens.md)):

| Token | Old value | New value |
| :--- | :--- | :--- |
| Light `success` | `#16a34a` | `#1f7a40` |
| Light `warning` | `#d97706` | `#936025` |
| Light `danger` | `#dc2626` | `#c63131` |
| Light `info` | `#0284c7` | `#267299` |
| Light `--text-muted` | `#64748b` | `#607085` |
| Dark `--text-dim` (now `--text-muted`) | `#60687a` | `#868ea0` |

The brand accent is now a project token: `--brand-primary` defaults to `#005496` for Mylan/Pluto projects, and other projects override that one value.
