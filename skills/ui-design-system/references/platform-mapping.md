---
name: ui-platform-mapping
description: Use when translating design tokens or component specs into WinForms (DevExpress GridControl, skins), WPF (XAML resource dictionaries, control templates), Web (CSS custom properties, Tailwind config, React tables), or Mobile (Jetpack Compose color schemes) code.
desc: Multi-Platform Implementation Mapping Guide for WinForms, WPF, Web, and Mobile
rules: [R_CORE, R_UI, R_ANTI_SLOP]
---
# Multi-Platform Implementation Mapping Guide

This reference provides production-ready code snippets and direct architectural mappings for translating universal design tokens and component specs into **WinForms (DevExpress)**, **WPF (XAML)**, **Web (React/Tailwind)**, and **Mobile (Jetpack Compose/Flutter)**.

> [!IMPORTANT]
> Literal values in these snippets are platform encodings of [tokens.md](tokens.md). When a value here differs from tokens.md, tokens.md wins; update the snippet, never the other way round.

---

## 1. WINFORMS & DEVEXPRESS MAPPING

### 1.1 Central Enterprise Theme (C#, dark mode)

```csharp
using System.Drawing;

namespace AgentOption.UI.WinForms
{
    public static class EnterpriseTheme
    {
        // ── Living Slate Dark Palette ──
        public static readonly Color BgCanvas       = Color.FromArgb(0x0D, 0x0F, 0x13);
        public static readonly Color BgSurface      = Color.FromArgb(0x15, 0x18, 0x22);
        public static readonly Color BgElevated     = Color.FromArgb(0x1A, 0x1E, 0x2A);
        public static readonly Color BgHover        = Color.FromArgb(0x22, 0x27, 0x36);
        public static readonly Color BorderSubtle   = Color.FromArgb(0x1C, 0x21, 0x2C);
        public static readonly Color BorderDefault  = Color.FromArgb(0x24, 0x29, 0x34);
        public static readonly Color BorderInput    = Color.FromArgb(0x68, 0x72, 0x8A);
        public static readonly Color BrandPrimary   = Color.FromArgb(0x53, 0x7B, 0xB4);
        public static readonly Color BrandFg        = Color.FromArgb(0x75, 0x95, 0xC3);
        public static readonly Color TextPrimary    = Color.FromArgb(0xE6, 0xE8, 0xEE);
        public static readonly Color TextSecondary  = Color.FromArgb(0x9A, 0xA1, 0xB2);
        public static readonly Color TextMuted      = Color.FromArgb(0x86, 0x8E, 0xA0);
        public static readonly Color SuccessFg      = Color.FromArgb(0x5B, 0xA1, 0x71);
        public static readonly Color DangerFg       = Color.FromArgb(0xCC, 0x7D, 0x7D);

        // ── Typography ──
        public static readonly Font PrimaryFont     = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        public static readonly Font HeaderFont      = new Font("Segoe UI Semibold", 9.5f, FontStyle.Regular);
        public static readonly Font MonospaceFont   = new Font("Cascadia Code", 9.5f, FontStyle.Regular);
    }
}
```

### 1.2 DevExpress GridControl Setup (AS-07)

Zebra striping is off by default; dividers and hover carry row tracking. `ApplyZebraOptIn` is the only place that enables `EnableAppearanceEvenRow`.

```csharp
public static void ApplyEnterpriseGridStyle(DevExpress.XtraGrid.Views.Grid.GridView gv)
{
    gv.RowHeight = 28;
    gv.ColumnPanelRowHeight = 30;
    gv.Appearance.Row.Font = EnterpriseTheme.PrimaryFont;
    gv.Appearance.HeaderPanel.Font = EnterpriseTheme.HeaderFont;

    gv.OptionsView.EnableAppearanceEvenRow = false;
    gv.OptionsView.EnableAppearanceOddRow = false;
    gv.OptionsView.ShowHorizontalLines = DevExpress.Utils.DefaultBoolean.True;
    gv.OptionsView.ShowVerticalLines = DevExpress.Utils.DefaultBoolean.False;

    gv.OptionsSelection.EnableAppearanceFocusedCell = false;
    gv.OptionsBehavior.Editable = false;
}

public static void ApplyZebraOptIn(DevExpress.XtraGrid.Views.Grid.GridView gv)
{
    const int MinVisibleColumnsForZebra = 8;
    if (gv.OptionsBehavior.Editable || gv.VisibleColumns.Count < MinVisibleColumnsForZebra)
        return;

    gv.OptionsView.EnableAppearanceEvenRow = true;
    gv.Appearance.EvenRow.BackColor = EnterpriseTheme.BgElevated;
}
```

---

## 2. WPF (XAML) MAPPING

### 2.1 Theme Dictionary (`Themes/EnterpriseTokens.Light.xaml`)

```xml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <!-- ── Light Palette Brushes ── -->
    <SolidColorBrush x:Key="BrushBgCanvas" Color="#F4F6F9"/>
    <SolidColorBrush x:Key="BrushBgSurface" Color="#FFFFFF"/>
    <SolidColorBrush x:Key="BrushBgElevated" Color="#F8FAFC"/>
    <SolidColorBrush x:Key="BrushBgHover" Color="#F1F5F9"/>
    <SolidColorBrush x:Key="BrushBorderSubtle" Color="#EDF2F7"/>
    <SolidColorBrush x:Key="BrushBorderDefault" Color="#E2E8F0"/>
    <SolidColorBrush x:Key="BrushBorderInput" Color="#7F8BA0"/>
    <SolidColorBrush x:Key="BrushBrandPrimary" Color="#005496"/>
    <SolidColorBrush x:Key="BrushBrandPrimaryHover" Color="#004077"/>
    <SolidColorBrush x:Key="BrushTextPrimary" Color="#0F172A"/>
    <SolidColorBrush x:Key="BrushTextSecondary" Color="#475569"/>
    <SolidColorBrush x:Key="BrushSuccessFg" Color="#1F7A40"/>
    <SolidColorBrush x:Key="BrushDangerFg" Color="#C63131"/>

    <!-- ── Primary CTA Button ── -->
    <Style x:Key="StyleAccentButton" TargetType="Button">
        <Setter Property="Background" Value="{DynamicResource BrushBrandPrimary}"/>
        <Setter Property="Foreground" Value="#FFFFFF"/>
        <Setter Property="Height" Value="28"/>
        <Setter Property="Padding" Value="14,4"/>
        <Setter Property="FontFamily" Value="Segoe UI Variable"/>
        <Setter Property="FontWeight" Value="SemiBold"/>
        <Setter Property="FontSize" Value="12.5"/>
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="Button">
                    <Border CornerRadius="6" Background="{TemplateBinding Background}" Padding="{TemplateBinding Padding}">
                        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
        <Style.Triggers>
            <Trigger Property="IsMouseOver" Value="True">
                <Setter Property="Background" Value="{DynamicResource BrushBrandPrimaryHover}"/>
            </Trigger>
        </Style.Triggers>
    </Style>
</ResourceDictionary>
```

Keep the default `FocusVisualStyle` (AS-09); a custom template must not set it to `{x:Null}` without a visible replacement.

---

## 3. WEB (REACT & TAILWIND CSS) MAPPING

### 3.1 CSS Custom Properties (`globals.css`)

Declare every token from tokens.md under `:root` (light) and `[data-theme="dark"]`. Excerpt:

```css
:root {
  --bg-canvas: #f4f6f9;
  --bg-surface: #ffffff;
  --bg-elevated: #f8fafc;
  --bg-hover: #f1f5f9;
  --border-subtle: #edf2f7;
  --border-default: #e2e8f0;
  --border-input: #7f8ba0;
  --brand-primary: #005496;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #607085;
}

[data-theme="dark"] {
  --bg-canvas: #0d0f13;
  --bg-surface: #151822;
  --bg-elevated: #1a1e2a;
  --bg-hover: #222736;
  --border-subtle: #1c212c;
  --border-default: #242934;
  --border-input: #68728a;
  --brand-primary: #537bb4;
  --text-primary: #e6e8ee;
  --text-secondary: #9aa1b2;
  --text-muted: #868ea0;
}

:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  transform: scaleX(var(--progress));
  transform-origin: left;
  transition: transform var(--duration-data) ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3.2 Tailwind Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        hover: 'var(--bg-hover)',
        border: 'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        'border-input': 'var(--border-input)',
        primary: 'var(--brand-primary)',
        'text-main': 'var(--text-primary)',
        'text-sub': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
    }
  }
}
```

### 3.3 High-Density React Table Component Snippet

```tsx
export function EnterpriseTable<T>({ columns, data }: TableProps<T>) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      <table className="w-full text-left border-collapse">
        <thead className="bg-elevated border-b border-border text-[11px] font-semibold text-text-sub uppercase">
          <tr>
            {columns.map(col => (
              <th key={col.id} className="py-2 px-3">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle text-[13px] text-text-main">
          {data.map((row, idx) => (
            <tr key={idx} className="h-9 hover:bg-hover transition-colors duration-fast">
              {columns.map(col => (
                <td key={col.id} className="px-3 tabular-nums">{col.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4. MOBILE (ANDROID JETPACK COMPOSE) MAPPING

```kotlin
package com.agentoption.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

val EnterpriseDarkColors = darkColorScheme(
    background = Color(0xFF0D0F13),
    surface = Color(0xFF151822),
    surfaceVariant = Color(0xFF1A1E2A),
    outline = Color(0xFF242934),
    primary = Color(0xFF537BB4),
    error = Color(0xFFCC7D7D),
    onBackground = Color(0xFFE6E8EE),
    onSurface = Color(0xFFE6E8EE),
    onSurfaceVariant = Color(0xFF9AA1B2)
)
```

List items keep a `--row-mobile` minimum touch target; chips inside them stay compact with `--radius-sm`.
