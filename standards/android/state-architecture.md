---
desc: Android State Architecture — Unidirectional Data Flow (UDF), Immutable State, and ViewModel Coroutines
rules: [R_ANDROID, R_CORE]
---
# 🏛️ Android State & Architecture Standards

## 1. Unidirectional Data Flow (UDF)
```
       ┌───────────────────────────────┐
       │     UI Screen (Compose)       │
       └──────────────┬────────────────┘
          Emits Event │ ▲ Observes State
                      ▼ │
       ┌───────────────────────────────┐
       │     ViewModel (StateFlow)     │
       └───────────────────────────────┘
```
- **Single Source of Truth:** State is held exclusively inside ViewModel using `MutableStateFlow<UiState>` and exposed as read-only `StateFlow<UiState> = _uiState.asStateFlow()`.
- **Immutable UI State Data Class:** Aggregate entire screen state into a single cohesive data class:
  ```kotlin
  data class MainUiState(
      val isLoading: Boolean = false,
      val items: List<ItemModel> = emptyList(),
      val activeTab: Int = 0,
      val errorMessage: String? = null
  )
  ```
- **Atomic State Updates:** Always update state via copy semantics: `_uiState.update { it.copy(...) }`.

## 2. One-Time Side-Effects (Events)
- **Channel Pattern:** Use `Channel<UiEffect>(Channel.BUFFERED)` exposed as `Flow<UiEffect>` for one-off events (Navigation, Toasts, Snackbars, Hardware Haptic Triggers).
- **Lifecycle Collection:** Collect effects in Compose using `LaunchedEffect(Unit)`.

## 3. Coroutine Scoping & Dispatchers
- **`viewModelScope`:** All background jobs launched from ViewModel must bind to `viewModelScope`.
- **Dispatcher Segregation:**
  * `Dispatchers.Main`: UI state emissions and immediate UI updates.
  * `Dispatchers.Default`: Heavy calculations, sorting, image matrix transforms, JSON parsing.
  * `Dispatchers.IO`: File disk persistence, SQLite/Room queries, Network HTTP requests.

## 4. Anti-Patterns
- ❌ **Multiple Independent StateFlows:** Avoid splitting 10 primitive StateFlows per screen (causes inconsistent UI frames); bundle into a single `UiState`.
- ❌ **GlobalScope:** NEVER launch jobs in `GlobalScope` (leads to memory leaks and zombie background processes).
