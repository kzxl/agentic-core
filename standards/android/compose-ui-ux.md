---
desc: Modern Jetpack Compose UI/UX standards, Material 3 design tokens, micro-animations, and gestures
rules: [R_ANDROID, R_CORE]
---
# 🎨 Jetpack Compose UI/UX Standards

## 1. Material 3 Design System & Theming
- **Token Centralization:** Define all color palettes, typography scales, shapes, and elevation in a dedicated `ui/theme/` package (`Color.kt`, `Theme.kt`, `Type.kt`).
- **Dark Mode First:** Implement high-contrast dark schemes (e.g. `0xFF07090E` background, `0xFF0F172A` panel, neon accents for active indicators).
- **Glassmorphism & Overlays:** Use translucent alpha panels (`color.copy(alpha = 0.85f)`) with subtle 1.dp border strokes (`0xFF334155`) for floating HUDs.

## 2. Component Architecture (Container vs Presenter)
- **`screens/` (Stateful Orchestrators):** Collect `StateFlow` from ViewModel via `collectAsStateWithLifecycle()`, handle navigation triggers, and delegate rendering to dumb components.
- **`components/` (Stateless Presenters):** Pure Composables that accept immutable data models and emit events via lambda callbacks `(T) -> Unit`. Never inject ViewModels into reusable leaf components.
- **Preview Stability:** Every reusable component in `components/` MUST provide a `@Preview` composable with realistic mock data.

## 3. Micro-Animations & Motion Design
- **Physics Springs over Durations:** Use `spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow)` for natural, responsive touch feedback instead of rigid linear tweens.
- **Animated Content Switching:** Use `AnimatedVisibility` (with `fadeIn() + expandVertically()`) and `Crossfade` for loading $\rightarrow$ content $\rightarrow$ error state transitions.
- **Shared Transitions:** Implement `SharedTransitionLayout` when navigating from thumbnail/card grids to detail/viewer screens.

## 4. Interactive Gestures & Viewers
- **Pinch-to-Zoom / Pan:** Use `detectTransformGestures` with scale clamping (`1.0f..10.0f`) and offset bounding to prevent image clipping.
- **Before/After Split Wipe:** Use `Canvas` with horizontal drag tracking `detectHorizontalDragGestures` to draw custom divider lines and clip sub-regions.

## 5. Anti-Patterns
- ❌ **Recomposition Traps:** Never create non-remembered objects (e.g. `val brush = Brush.linearGradient(...)`) inside high-frequency composable bodies.
- ❌ **Blocking Main Thread:** Never perform image decoding, file I/O, or heavy calculations inside Composable functions or UI callbacks.
