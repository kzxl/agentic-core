---
desc: WPF dark theme color palette, typography, and styling standards
rules: [R_WPF]
---
# 🎨 WPF Dark Theme UI Design — Standards & Best Practices

## 1. Bảng Màu (Color Palette)

### Base colors (Deep Navy)
```
BgDark:      #0D1117    (nền chính — GitHub-inspired)
BgMedium:    #161B22    (panels, title bar)
BgLight:     #1C2333    (inputs, hover states)
BgCard:      #1E2637    (card panels, sections)
BgElevated:  #252D3D    (elevated cards, active tabs)
```

### Accent colors
```
AccentBlue:    #58A6FF   (primary accent — links, active)
AccentCyan:    #56D4DD   (secondary — charts, indicators)
AccentGreen:   #3FB950   (success, start)
AccentOrange:  #D29922   (warning, caution)
AccentRed:     #F85149   (error, stop, danger)
AccentPurple:  #BC8CFF   (special, premium features)
```

### Text colors
```
TextPrimary:    #E6EDF3   (main text — 96% readable)
TextSecondary:  #7D8590   (labels, hints)
TextMuted:      #484F58   (disabled, placeholders)
```

### Borders & Effects
```
Border:        #30363D   (subtle separation)
BorderFocus:   #58A6FF40 (focus glow — 25% opacity blue)
Glow:          #58A6FF20 (background glow effects)
```

---

## 2. Typography

### Font Stack
```
Primary:   "Segoe UI Variable", "Segoe UI", sans-serif  (UI elements)
Mono:      "Cascadia Code", "JetBrains Mono", "Fira Code", Consolas  (code, logs, data)
```

### Size Scale
```
Display:  24px  (app title)
Title:    16px  (section headers)
Body:     13px  (default text, inputs)
Caption:  11px  (labels, hints)
Micro:    10px  (badges, status indicators)
```

---

## 3. Design Patterns

### Cards
- **CornerRadius**: 8-12px
- **Border**: 1px `Border` color
- **Padding**: 16px
- **Shadow**: Subtle inner glow hoặc `DropShadowEffect` blur 10, opacity 0.15

### Buttons
- **Primary** (accent gradient): linear gradient top→bottom
- **Secondary** (muted): solid background `BgElevated`
- **Hover**: Slightly lighter + cursor Hand
- **Pressed**: Slightly darker + scale 98%
- **Disabled**: Opacity 0.4

### Inputs (TextBox, ComboBox)
- **Background**: `BgLight`
- **Border**: 1px `Border`
- **Focus**: Border → `AccentBlue`, thêm outer glow (`BorderFocus`)
- **Padding**: 10px 12px

### Tabs
- **Inactive**: `BgMedium` background, `TextSecondary` text
- **Active**: `BgCard` background, `AccentBlue` text, top/bottom border accent
- **Hover**: Subtle background shift

---

## 4. Micro-Animations

### Hover transitions
- **Duration**: 0.15-0.2s
- **Property**: Background, BorderBrush, Opacity
- **Easing**: QuadraticEaseOut

### State changes
- **IsRunning pulse**: Subtle glow animation trên status bar
- **Alert flash**: Orange pulsing border hoặc text

### Tab transitions
- **Switch**: Fade in content (0.15s)

---

## 5. Layout Rules

### Spacing System (8px base)
```
XS:  4px   (inline spacing)
SM:  8px   (between elements)
MD:  12px  (section spacing)
LG:  16px  (card padding)
XL:  24px  (major sections)
```

### Grid
- Sidebar: 320-360px fixed
- Content: Flexible fill
- Gap: 12px

---

## 6. Gradient Patterns

### Title bar gradient
```xaml
<LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
    <GradientStop Color="#161B22" Offset="0"/>
    <GradientStop Color="#1A2233" Offset="1"/>
</LinearGradientBrush>
```

### Button gradient (primary)
```xaml
<LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
    <GradientStop Color="#3FB950" Offset="0"/>
    <GradientStop Color="#2EA043" Offset="1"/>
</LinearGradientBrush>
```

### Active tab indicator (accent line)
```xaml
<Border BorderBrush="{StaticResource AccentBlueBrush}"
        BorderThickness="0,0,0,2" />
```

---

## 7. Anti-Patterns

| ❌ Tránh | ✅ Nên |
|---------|-------|
| Flat, đơn sắc mọi nơi | Gradients tinh tế, depth through layers |
| Cùng 1 màu nền cho mọi element | 3-4 tầng background (dark → elevated) |
| Text trắng 100% | Text 90-95% (`#E6EDF3`) giảm eyestrain |
| Hard borders rõ ràng | Subtle borders hoặc shadow separation |
| Không animation | Micro-transitions 0.15s |
| Font size đều nhau | Hierarchy rõ (24/16/13/11/10) |
