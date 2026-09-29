---
desc: Comprehensive React & Tailwind CSS Web UI Standards — Design Tokens, High-Density Data Tables, Responsive Layouts & Anti-AI-Slop Restraint
rules: [R_REACT, R_UI]
---

# 🌐 React & Tailwind Web UI Engineering Standards

This standard establishes mandatory visual, ergonomic, and component architecture guidelines for React web applications across the AgentOption ecosystem. It specializes the [Universal Software UI/UX Design System](file:///E:/16.%20AgentOption/standards/universal/ui-ux-design-system.md) for React, Next.js/Vite, Tailwind CSS, and headless UI primitives (Radix UI, TanStack Table).

---

## 1. Design Token Integration & Theme Configuration

### 1.1 CSS Custom Properties (`src/index.css` or `globals.css`)
All colors, elevations, and radius tokens must be declared as CSS variables mapped to the Living Slate palette:

```css
@layer base {
  :root {
    --bg-canvas: #f8f9fc;
    --bg-surface: #ffffff;
    --bg-elevated: #f1f3f9;
    --bg-hover: #e8edf8;
    --border-default: #dce1ee;
    --border-subtle: #eaeff8;
    --primary-accent: #4f46e5;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
  }

  [data-theme="dark"], .dark {
    --bg-canvas: #0f111a;
    --bg-surface: #181a26;
    --bg-elevated: #1f2233;
    --bg-hover: #262a3d;
    --border-default: #2b3046;
    --border-subtle: #202436;
    --primary-accent: #818cf8;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --success: #34d399;
    --danger: #f87171;
    --warning: #fbbf24;
  }
}
```

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
        primary: 'var(--primary-accent)',
        'text-main': 'var(--text-primary)',
        'text-sub': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
      },
      borderRadius: {
        compact: '4px',
        card: '8px',
        modal: '12px',
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

## 2. High-Density Enterprise Data Tables

High-density tables are the operational centerpiece of web enterprise dashboards:
1. **Compact Row Height:** Clamp row heights to `h-8` (`32px`) or `h-9` (`36px`). Never use bloated `56px+` rows for data grids.
2. **Divider Separation:** Use `divide-y divide-border-subtle`. Prohibit zebra striping.
3. **Tabular Figures:** Always apply `tabular-nums font-mono` to numbers, stock counts, and currencies.
4. **Right Alignment:** Numeric and currency columns **MUST** use `text-right`.

```tsx
// Pattern: High-Density Table Row
<tr className="h-8 hover:bg-hover transition-colors border-b border-border-subtle">
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

---

## 3. Button & Form Ergonomics (R_UI)

1. **Imperative Action Verbs:**
   - Every submit button **MUST** use an action verb: `<button>Lưu thay đổi</button>`, `<button>Duyệt phiếu xuất</button>`.
   - Never use vague labels (`<button>OK</button>`, `<button>Submit</button>`).
2. **One Primary CTA per Region:**
   - Use `bg-primary text-white hover:bg-primary/90 font-medium px-4 h-8 text-xs rounded-compact` for the primary button.
   - Secondary actions must use outline: `bg-transparent border border-border text-text-main hover:bg-elevated`.
3. **Accessible Focus Rings:**
   - Avoid removing focus outlines. Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1`.

---

## 4. Anti-AI-Slop Web Enforcements

- **No Gradient Buttons:** `<button className="bg-gradient-to-r from-purple-500 to-pink-500">` is **STRICTLY FORBIDDEN**. Use solid tints.
- **No Looping Keyframe Animations:** Never place `animate-pulse` or `animate-bounce` on idle data cards or badges. Animations are limited to active spinners during async I/O.
- **No Glassmorphism Blur on Data:** Do not apply `backdrop-blur-md` over busy backgrounds in business views. Container cards must have solid opaque backgrounds (`bg-surface`).
- **No Emojis as UI Bullets:** Do not place emojis in navigation bars, table cells, or button bodies. Use clean SVG icon libraries (e.g., `lucide-react`) with `strokeWidth={1.75}`.
