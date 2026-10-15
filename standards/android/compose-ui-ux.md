---
desc: Modern Jetpack Compose UI/UX standards, Material 3 design tokens, micro-animations, and gestures
rules: [R_ANDROID, R_CORE]
---
# 🎨 Jetpack Compose UI/UX & Recomposition Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Composable Parameter Stability** | `100%` of UI models marked `@Immutable` / `@Stable` (`ImmutableList<T>`) | Compose Compiler Metrics (`-PcomposeCompilerReports=true`) |
| **`LazyColumn` / `LazyGrid` Identity** | `100%` of dynamic `items(...)` specify `key = { ... }` & `contentType` | Prevents `O(N)` full-list recomposition on insert/delete |
| **Continuous State Reads (Scroll/Anim)** | `0` direct reads in Composition phase; defer to Layout/Draw lambdas | `Modifier.offset { IntOffset(...) }` & `drawBehind { ... }` |
| **Threshold State Coalescing** | Wrap high-frequency boolean predicates in `remember { derivedStateOf {} }` | Reduces recompositions from `120/sec` to `1` per threshold cross |
| **Stateless Leaf Composables** | `0` `ViewModel` parameters in reusable `components/` functions | Pass state values down and event lambdas `() -> Unit` up |

---

## 2. Recomposition Stability (`@Immutable`), `LazyColumn` Keys & `derivedStateOf`

Standard Kotlin `List<T>`, `Set<T>`, and `Map<K, V>` interfaces are treated as **unstable** by the Compose compiler unless Strong Skipping is enabled or `kotlinx.collections.immutable.ImmutableList<T>` / `@Immutable` wrapper classes are used. Furthermore, reading `listState.firstVisibleItemScrollOffset > 0` directly inside a Composable body forces the entire screen to recompose on **every single pixel** of scroll (`120 times/sec`).

```kotlin
// ❌ BAD: Unstable List<T>, missing LazyColumn key/contentType, and 120Hz scroll read in Composition phase!
@Composable
fun FeedScreenBad(items: List<FeedItem>, listState: LazyListState, onItemClick: (String) -> Unit) {
    val showFab = listState.firstVisibleItemIndex > 0 // Recomposes entire FeedScreen on every scroll pixel!
    Box {
        LazyColumn(state = listState) {
            items(items) { item -> // Missing key: insertar/deletion recomposes all visible rows!
                FeedRow(item = item, onClick = { onItemClick(item.id) })
            }
        }
        if (showFab) FloatingActionButton(onClick = {}) { Text("Top") }
    }
}

// ✅ GOOD: @Immutable state, derivedStateOf scroll threshold, stable LazyColumn key + contentType
@Immutable
data class FeedUiState(val items: ImmutableList<FeedItem> = persistentListOf())

@Composable
fun FeedScreenGood(
    state: FeedUiState,
    listState: LazyListState,
    onItemClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    // Emits ONLY when boolean flips (true <-> false), eliminating 99% of scroll recompositions
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 2 }
    }

    Box(modifier = modifier.fillMaxSize()) {
        LazyColumn(state = listState, contentPadding = PaddingValues(vertical = 8.dp)) {
            items(
                items = state.items,
                key = { item -> item.id },           // Preserves item scroll/focus state across reorders
                contentType = { item -> item.kind }, // Reuses composition slots across matching item types
            ) { item ->
                FeedRow(item = item, onItemClick = onItemClick)
            }
        }

        AnimatedVisibility(
            visible = showScrollToTop,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            enter = fadeIn() + scaleIn(),
            exit = fadeOut() + scaleOut(),
        ) {
            FloatingActionButton(onClick = { /* scroll to top */ }) { Text("Top") }
        }
    }
}
```

---

## 3. Deferred State Reads (Layout & Draw Phases) & Modifier Ordering

Compose executes **Composition &rarr; Layout &rarr; Drawing**. When animating offsets, alpha, or color, use lambda modifiers so state is read in the Layout or Draw phase, bypassing Composition completely:

```kotlin
// ❌ BAD: Reads scroll/animation state during Composition -> triggers recomposition every frame
Box(Modifier.offset(y = scrollOffsetDp).alpha(animatedAlpha).background(animatedColor))

// ✅ GOOD: Lambda modifiers defer state reads to Layout & Draw phases (0 recompositions!)
Box(
    modifier = Modifier
        .offset { IntOffset(x = 0, y = scrollState.value / 2) } // Layout phase
        .graphicsLayer { alpha = animatedAlphaState.value }     // Draw/RenderNode phase
        .drawBehind { drawRect(color = animatedColorState.value) }
)
```

- **Modifier Ordering:** Place `clickable` **after** outer margin `padding` and **before** inner content `padding` (`Modifier.padding(outer).clip(shape).clickable(onClick).padding(inner)`).
