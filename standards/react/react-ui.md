---
name: react-ui
description: Use when building or reviewing React or Tailwind web UI - CSS custom properties, tailwind.config theme tokens, data tables and row density, buttons and focus rings, badges, progress bars, animation (CSS, WAAPI, GSAP, Framer Motion), reduced motion, or Radix/TanStack components.
desc: Comprehensive React & Tailwind CSS Web UI Standards — Design Tokens, High-Density Data Tables, Responsive Layouts & Anti-AI-Slop Restraint
rules: [R_REACT, R_UI, R_ANTI_SLOP]
---

# React & Tailwind Web UI Engineering Standards

This standard establishes mandatory visual, ergonomic, and component architecture guidelines for React web applications across the AgentOption ecosystem. It specializes the [Universal Software UI/UX Design System](file:///E:/16.%20AgentOption/standards/universal/ui-ux-design-system.md) for React, Next.js/Vite, Tailwind CSS, and headless UI primitives (Radix UI, TanStack Table). Visual laws come from the [Anti-AI-Slop Standard](file:///E:/16.%20AgentOption/standards/universal/ui-anti-ai-slop-standard.md) (cited by AS ID); values come from [tokens.md](file:///E:/16.%20AgentOption/skills/ui-design-system/references/tokens.md).

---

## 1. Design Token Integration & Theme Configuration

### 1.1 CSS Custom Properties (`src/index.css` or `globals.css`)
Declare every token from tokens.md as a CSS variable inside `@layer base`, under `:root` (light) and `[data-theme="dark"], .dark` (dark), keeping the token names unchanged (`--bg-canvas`, `--brand-primary`, `--success-fg`, `--radius-md`, `--elevation-overlay`, `--duration-fast`). A ready excerpt lives in [platform-mapping.md §3.1](file:///E:/16.%20AgentOption/skills/ui-design-system/references/platform-mapping.md). Components consume tokens through Tailwind classes, never through hex literals.

### 1.2 Tailwind Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        hover: 'var(--bg-hover)',
        border: 'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-input': 'var(--border-input)',
        primary: 'var(--brand-primary)',
        'primary-hover': 'var(--brand-primary-hover)',
        'text-main': 'var(--text-primary)',
        'text-sub': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        success: { fg: 'var(--success-fg)', solid: 'var(--success-solid)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
        warning: { fg: 'var(--warning-fg)', solid: 'var(--warning-solid)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
        danger: { fg: 'var(--danger-fg)', solid: 'var(--danger-solid)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' },
        info: { fg: 'var(--info-fg)', solid: 'var(--info-solid)', bg: 'var(--info-bg)', border: 'var(--info-border)' },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-overlay': 'var(--elevation-overlay)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        data: 'var(--duration-data)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

---

## 2. High-Density Enterprise Data Tables (AS-07)

High-density tables are the operational centerpiece of web enterprise dashboards:
1. **Row Height:** web band 32-40px: `h-9` (36px) default, `h-8` (32px) compact.
2. **Dividers, zebra off by default:** `divide-y divide-border-subtle` plus `hover:bg-hover`. Zebra opt-in only for read-only tables with >= 8 visible columns: `even:bg-elevated`.
3. **Tabular Figures:** Always apply `tabular-nums font-mono` to numbers, stock counts, and currencies.
4. **Right Alignment:** Numeric and currency columns **MUST** use `text-right`.

High-density table row:

```tsx
<tr className="h-9 hover:bg-hover transition-colors duration-fast border-b border-border-subtle">
  <td className="px-3 text-xs font-mono text-text-sub">{item.sku}</td>
  <td className="px-3 text-xs font-medium text-text-main">{item.name}</td>
  <td className="px-3 text-xs font-mono tabular-nums text-right text-text-main">
    {formatCurrency(item.price)}
  </td>
  <td className="px-3 text-center">
    <StatusBadge status={item.status} />
  </td>
</tr>
```

`StatusBadge` uses `rounded-sm border px-2 text-[11px] font-semibold` with the state classes `bg-success-bg border-success-border text-success-fg` (AS-01, AS-04).

---

## 3. Button & Form Ergonomics (R_UI)

1. **Imperative Action Verbs (AS-11):**
   - Every submit button **MUST** use an action verb: `<button>Lưu thay đổi</button>`, `<button>Duyệt phiếu xuất</button>`.
   - Never use vague labels (`<button>OK</button>`, `<button>Submit</button>`).
2. **One Primary CTA per Region (AS-01):**
   - Primary: `bg-primary text-white hover:bg-primary-hover font-semibold px-4 h-8 text-xs rounded-md transition-colors duration-fast`.
   - Secondary: `bg-surface border border-border-strong text-text-main hover:bg-elevated rounded-md`.
3. **Visible Focus (AS-09):**
   - `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`. Keep the outline; replace it, never remove it.
4. **Form-Control Boundaries (AS-08):**
   - Inputs, selects, checkboxes, and grid editors: `border border-border-input bg-surface hover:bg-hover rounded-md`. Decorative card borders keep `border-border`.

---

## 4. Anti-Slop Mapping (Tailwind)

| AS ID | Tailwind / React application |
| :--- | :--- |
| AS-01 | `primary` for the one accent; `success/warning/danger/info` `-fg/-solid/-bg/-border` classes for states |
| AS-02 | `shadow-elevation-1` and `shadow-elevation-overlay` only; hierarchy via `text-*` size, weight, and `text-main/sub/muted` |
| AS-03 | Motion per §5 |
| AS-04 | `rounded-sm` chips and badges, `rounded-md` buttons and inputs, `rounded-lg` cards; `rounded-full` only on avatars and counts |
| AS-05 | `lucide-react` (or the project set) at `size={16}` and `strokeWidth={1.75}` in nav and action bars; labels use words |
| AS-06 | Solid `bg-canvas`, `bg-surface`, `bg-elevated`; containers, buttons, and progress fills carry one flat color |
| AS-08 | Opaque `bg-surface` cards over busy content; measure contrast with `--tokens` |
| AS-12 | Skeleton rows at `h-9` in `bg-elevated`, static under `motion-reduce` |

---

## 5. Motion in React (AS-03)

1. **Ladder first:** hover/focus/expand use Tailwind `transition-*` with `duration-fast` or `duration-base` (L1). Overlay enter/exit uses CSS keyframes or WAAPI once (L2). GSAP (L3) only within the profile allowlist, via `useGSAP` so it reverts on unmount.
2. **Compositor-only progress:** the fill is full width and scaled.

   ```tsx
   export function ProgressBar({ value }: { value: number }) {
     const progress = Math.min(Math.max(value, 0), 1);
     return (
       <div
         role="progressbar"
         aria-valuemin={0}
         aria-valuemax={100}
         aria-valuenow={Math.round(progress * 100)}
         className="h-1.5 overflow-hidden rounded-xs border border-border bg-elevated"
       >
         <div
           className="h-full w-full origin-left bg-primary transition-transform duration-data motion-reduce:transition-none"
           style={{ transform: `scaleX(${progress})` }}
         />
       </div>
     );
   }
   ```

3. **Reduced motion in JS too:** CSS `motion-reduce:` variants do not stop WAAPI, GSAP, Framer Motion, or chart-library animations. Gate them in JS:

   ```tsx
   const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

   export function usePrefersReducedMotion(): boolean {
     const [prefersReducedMotion, setPrefersReducedMotion] = useState(
       () => window.matchMedia(reducedMotionQuery).matches
     );
     useEffect(() => {
       const mediaQuery = window.matchMedia(reducedMotionQuery);
       const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
       mediaQuery.addEventListener('change', handleChange);
       return () => mediaQuery.removeEventListener('change', handleChange);
     }, []);
     return prefersReducedMotion;
   }
   ```

4. **Cleanup:** every JS animation returns a cleanup from its effect (`animation.cancel()`, `ctx.revert()`, `mm.revert()`).

   ```tsx
   useEffect(() => {
     const panel = panelRef.current;
     if (!panel || !isOpen || prefersReducedMotion) return;
     const durationMs = parseFloat(getComputedStyle(panel).getPropertyValue('--duration-base'));
     const animation = panel.animate(
       [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
       { duration: durationMs, easing: 'ease-out' }
     );
     return () => animation.cancel();
   }, [isOpen, prefersReducedMotion]);
   ```

5. **Idle stays still:** `animate-spin` only while a request is in flight; elements faded to opacity 0 also get `invisible`.
