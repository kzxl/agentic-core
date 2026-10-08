---
desc: Python Type Annotations, Code Quality, Exception Hierarchies & Packaging Standards
rules: [R_PY, R_CORE, R_TDD]
---
# 📐 Python Code Quality & Type Safety Standards

## 1. Type Annotations & Static Typing Directives

1. **Mandatory Type Hints on All Public Signatures**:
   - Every function, method, and class attribute MUST declare explicit type annotations for all parameters and return values.
   - Use modern Python 3.10+ union syntax (`int | str` instead of `Union[int, str]`, `str | None` instead of `Optional[str]`).
2. **Generic Types & Protocols**:
   - Prefer `typing.Protocol` (structural subtyping / duck typing) over rigid multi-inheritance hierarchies.
   - Use `Sequence[T]`, `Mapping[K, V]`, and `Iterable[T]` for function input arguments to avoid over-constraining callers to concrete types like `list` or `dict`.
3. **Mypy & Strict Type Verification**:
   - Codebases should pass strict type checking without `Any` leaks on domain models and public APIs:
     ```bash
     mypy --strict src/
     ```

---

## 2. Error Handling & Exception Discipline

1. **Strict Prohibition on Bare `except:`**:
   - Catching bare `except:` or generic `except Exception:` without logging or re-raising is FORBIDDEN.
   - Always catch specific exception classes (e.g., `httpx.HTTPStatusError`, `json.JSONDecodeError`, `KeyError`).
2. **Domain Exception Hierarchy**:
   - Define a localized domain exception hierarchy rooted in a project base exception:
     ```python
     class ZFlowError(Exception):
         """Base exception for all ZFlow operations."""
         pass

     class NodeExecutionError(ZFlowError):
         def __init__(self, node_id: str, message: str):
             super().__init__(f"Node '{node_id}' failed: {message}")
             self.node_id = node_id

     class GraphCycleExceededError(ZFlowError):
         """Raised when a cyclic loop exceeds maximum threshold."""
         pass
     ```
3. **Traceback Preservation**:
   - When wrapping low-level errors into domain exceptions, always use explicit chaining `raise NewError(...) from err` to preserve causal tracebacks.

---

## 3. Package Architecture & Project Structure

1. **Package Layout**:
   - Modularize by domain features or architectural layers (`engine/`, `nodes/`, `api/`, `storage/`).
   - Every package directory MUST include an explicit `__init__.py` file declaring `__all__` to control exposed public symbols and prevent circular import side-effects.
2. **Dependency & Environment Discipline**:
   - Pin core dependencies in `pyproject.toml` or `requirements.txt`.
   - Never commit virtual environments (`venv/`, `.venv/`) or `.pyc` caches into version control.
   - Adhere to zero machine-specific hardcoded absolute paths per `R_PKG`.

---

## 4. Automated Testing & Verification

1. **Asynchronous Testing Invariants**:
   - Asynchronous endpoints and runners must be verified using `pytest` and `pytest-asyncio` (`@pytest.mark.asyncio`).
2. **Mocking External I/O**:
   - Unit tests must run 100% offline and isolated per `R_SEC_STD`.
   - External LLM and HTTP requests must be mocked deterministically using `httpx.MockTransport` or high-fidelity built-in simulator fallbacks.
