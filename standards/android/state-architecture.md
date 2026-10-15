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
| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Upstream Flow Sharing Timeout** | `SharingStarted.WhileSubscribed(5_000)` (`5s` rotation grace) | Keeps upstream warm across config changes; stops in background |
| **Lifecycle-Aware UI Collection** | `100%` via `collectAsStateWithLifecycle()` (never raw `collectAsState`) | Halts sensor/DB emissions when Activity enters `STOPPED` |
| **State Mutation Atomicity** | `100%` via `_uiState.update { it.copy(...) }` CAS loop | Prevents concurrent coroutine race conditions on state |
| **Process-Death Survivability** | Transient filter/draft keys persisted in `SavedStateHandle` | Tested via `adb shell am kill <package>` while backgrounded |
| **One-Shot Side-Effect Delivery** | `Channel<UiEffect>(Channel.BUFFERED)` + `receiveAsFlow()` | Exactly-once delivery without duplicate replay on rotation |

---

## 2. Unidirectional Data Flow (UDF) & `WhileSubscribed(5_000)` StateFlow

Exposing disjoint `MutableStateFlow` properties or using `SharingStarted.Eagerly` causes UI tearing and wastes battery when backgrounded. Combine upstream streams into a single `@Immutable` `UiState` via `stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), InitialState)` (`5,000 ms` keeps flows warm across `~300 ms` screen rotations while halting collection `5s` after backgrounding).

```kotlin
// ❌ BAD: Eagerly runs forever in background; non-atomic _state.value = ... races; SharedFlow drops effects!
class OrderViewModelBad(repo: OrderRepository) : ViewModel() {
    val orders = repo.observeOrders().stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
    val isLoading = MutableStateFlow(false) // Exposed mutable state!
    val effects = MutableSharedFlow<String>() // Drops navigation events if UI is paused!
}

// ✅ GOOD: SavedStateHandle process-death survival, WhileSubscribed(5000), atomic .update {}, and buffered Channel
@Immutable
data class OrderScreenUiState(
    val selectedFilter: OrderFilter = OrderFilter.ALL,
    val orders: List<OrderItemUi> = emptyList(),
    val isRefreshing: Boolean = false,
    val errorBanner: String? = null,
)

sealed interface OrderUiEffect {
    data class ShowSnackbar(val message: String) : OrderUiEffect
}

class OrderViewModelGood(
    private val savedStateHandle: SavedStateHandle,
    private val repository: OrderRepository,
) : ViewModel() {
    private val selectedFilter = savedStateHandle.getStateFlow("filter", OrderFilter.ALL)
    private val _transient = MutableStateFlow(TransientMeta())

    val uiState: StateFlow<OrderScreenUiState> = combine(
        selectedFilter,
        selectedFilter.flatMapLatest { repository.observeOrders(it) },
        _transient,
    ) { filter, items, meta ->
        OrderScreenUiState(filter, items, meta.isRefreshing, meta.error)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), OrderScreenUiState())

    private val _effects = Channel<OrderUiEffect>(Channel.BUFFERED)
    val effects: Flow<OrderUiEffect> = _effects.receiveAsFlow()

    fun onFilterChanged(newFilter: OrderFilter) { savedStateHandle["filter"] = newFilter }

    fun onRefreshClicked() {
        viewModelScope.launch {
            _transient.update { it.copy(isRefreshing = true, error = null) }
            runCatching { repository.syncRemoteOrders() }
                .onFailure { e ->
                    _transient.update { it.copy(isRefreshing = false, error = e.message) }
                    _effects.send(OrderUiEffect.ShowSnackbar("Sync failed"))
                }
                .onSuccess { _transient.update { it.copy(isRefreshing = false) } }
        }
    }

    private data class TransientMeta(val isRefreshing: Boolean = false, val error: String? = null)
}
```

---

## 3. Process-Death Restoration (`SavedStateHandle`) & Dispatcher Injection

- **Process Death:** Persist filter keys and draft IDs in `SavedStateHandle` (`<= 50 KB` Bundle limit) to survive OS background kill (`adb shell am kill`).
- **Dispatcher Injection:** Inject `CoroutineDispatcher` into repositories rather than hardcoding `Dispatchers.IO`.
