---
desc: Multi-Platform Implementation Mapping Guide for WinForms, WPF, Web, and Mobile
rules: [R_CORE, R_UI]
---
# 💻 Multi-Platform Implementation Mapping Guide

This reference provides production-ready code snippets and direct architectural mappings for translating universal design tokens and component specs into **WinForms (DevExpress)**, **WPF (XAML)**, **Web (React/Tailwind)**, and **Mobile (Jetpack Compose/Flutter)**.

---

## 1. WINFORMS & DEVEXPRESS MAPPING

### 1.1 Central Enterprise Theme SSoT (C#)

```csharp
using System.Drawing;

namespace AgentOption.UI.WinForms
{
    public static class EnterpriseTheme
    {
        // --- Living Slate Dark Palette ---
        public static readonly Color BgCanvas       = Color.FromArgb(0x0F, 0x11, 0x1A);
        public static readonly Color BgSurface      = Color.FromArgb(0x18, 0x1A, 0x26);
        public static readonly Color BgElevated     = Color.FromArgb(0x1F, 0x22, 0x33);
        public static readonly Color BgHover        = Color.FromArgb(0x26, 0x2A, 0x3D);
        public static readonly Color BorderDefault  = Color.FromArgb(0x2B, 0x30, 0x46);
        public static readonly Color BorderSubtle   = Color.FromArgb(0x20, 0x24, 0x36);
        public static readonly Color PrimaryAccent  = Color.FromArgb(0x81, 0x8C, 0xF8);
        public static readonly Color TextPrimary    = Color.FromArgb(0xF1, 0xF5, 0xF9);
        public static readonly Color TextSecondary  = Color.FromArgb(0x94, 0xA3, 0xB8);
        public static readonly Color Success        = Color.FromArgb(0x34, 0xD3, 0x99);
        public static readonly Color Danger         = Color.FromArgb(0xF8, 0x71, 0x71);

        // --- Typography ---
        public static readonly Font PrimaryFont     = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        public static readonly Font HeaderFont      = new Font("Segoe UI Semibold", 10.5f, FontStyle.Bold);
        public static readonly Font MonospaceFont   = new Font("Cascadia Code", 9.5f, FontStyle.Regular);
    }
}
```

### 1.2 DevExpress GridControl Setup
```csharp
public static void ApplyEnterpriseGridStyle(DevExpress.XtraGrid.Views.Grid.GridView gv)
{
    gv.RowHeight = 28;
    gv.ColumnPanelRowHeight = 30;
    gv.Appearance.Row.Font = EnterpriseTheme.PrimaryFont;
    gv.Appearance.HeaderPanel.Font = EnterpriseTheme.HeaderFont;
    
    // Eliminate zebra striping in favor of crisp 1px borders
    gv.OptionsView.EnableAppearanceEvenRow = false;
    gv.OptionsView.EnableAppearanceOddRow = false;
    gv.OptionsView.ShowHorizontalLines = DevExpress.Utils.DefaultBoolean.True;
    gv.OptionsView.ShowVerticalLines = DevExpress.Utils.DefaultBoolean.False;
    
    // Keyboard & Selection ergonomics
    gv.OptionsSelection.EnableAppearanceFocusedCell = false;
    gv.OptionsBehavior.Editable = false;
}
```

---

## 2. WPF (XAML) MAPPING

### 2.1 Theme Dictionary (`Themes/EnterpriseTokens.xaml`)

```xml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <!-- Living Slate Palette Brushes -->
    <SolidColorBrush x:Key="BrushBgCanvas" Color="#0F111A"/>
    <SolidColorBrush x:Key="BrushBgSurface" Color="#181A26"/>
    <SolidColorBrush x:Key="BrushBgElevated" Color="#1F2233"/>
    <SolidColorBrush x:Key="BrushBgHover" Color="#262A3D"/>
    <SolidColorBrush x:Key="BrushBorderDefault" Color="#2B3046"/>
    <SolidColorBrush x:Key="BrushBorderSubtle" Color="#202436"/>
    <SolidColorBrush x:Key="BrushPrimaryAccent" Color="#818CF8"/>
    <SolidColorBrush x:Key="BrushTextPrimary" Color="#F1F5F9"/>
    <SolidColorBrush x:Key="BrushTextSecondary" Color="#94A3B8"/>
    <SolidColorBrush x:Key="BrushSuccess" Color="#34D399"/>
    <SolidColorBrush x:Key="BrushDanger" Color="#F87171"/>

    <!-- Primary CTA Button Template -->
    <Style x:Key="StyleAccentButton" TargetType="Button">
        <Setter Property="Background" Value="{DynamicResource BrushPrimaryAccent}"/>
        <Setter Property="Foreground" Value="#FFFFFF"/>
        <Setter Property="Height" Value="30"/>
        <Setter Property="Padding" Value="14,4"/>
        <Setter Property="FontFamily" Value="Segoe UI Variable"/>
        <Setter Property="FontWeight" Value="SemiBold"/>
        <Setter Property="FontSize" Value="12.5"/>
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="Button">
                    <Border CornerRadius="4" Background="{TemplateBinding Background}" Padding="{TemplateBinding Padding}">
                        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
```

---

## 3. WEB (REACT & TAILWIND CSS) MAPPING

### 3.1 CSS Custom Properties (`globals.css`)

```css
:root {
  --bg-canvas: #f8f9fc;
  --bg-surface: #ffffff;
  --bg-elevated: #f1f3f9;
  --border-default: #dce1ee;
  --primary-accent: #4f46e5;
  --text-primary: #0f172a;
  --text-secondary: #475569;
}

[data-theme="dark"] {
  --bg-canvas: #0f111a;
  --bg-surface: #181a26;
  --bg-elevated: #1f2233;
  --border-default: #2b3046;
  --primary-accent: #818cf8;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
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
        border: 'var(--border-default)',
        primary: 'var(--primary-accent)',
        'text-main': 'var(--text-primary)',
        'text-muted': 'var(--text-secondary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        compact: '4px',
        card: '8px',
      }
    }
  }
}
```

### 3.3 High-Density React Table Component Snippet
```tsx
export function EnterpriseTable<T>({ columns, data }: TableProps<T>) {
  return (
    <div className="border border-border rounded-compact overflow-hidden bg-surface">
      <table className="w-full text-left border-collapse">
        <thead className="bg-elevated border-b border-border text-[11px] font-semibold text-text-muted uppercase">
          <tr>
            {columns.map(col => (
              <th key={col.id} className="py-2 px-3">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-[13px] text-text-main">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-elevated/50 transition-colors h-7">
              {columns.map(col => (
                <td key={col.id} className="py-1 px-3 tabular-nums">{col.cell(row)}</td>
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
    background = Color(0xFF0F111A),
    surface = Color(0xFF181A26),
    surfaceVariant = Color(0xFF1F2233),
    outline = Color(0xFF2B3046),
    primary = Color(0xFF818CF8),
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF94A3B8)
)
```
