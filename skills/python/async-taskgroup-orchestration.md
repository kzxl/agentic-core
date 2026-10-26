---
name: AsyncTaskGroupOrchestration
desc: Structured concurrency with asyncio.TaskGroup, bounded semaphores, and thread/process offloading.
rules: [R_PY, R_PERF, R_CORE]
category: Python
---
# 🐍 Python Structured Concurrency & `asyncio.TaskGroup` Orchestration

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Orphaned Background Tasks** | `0` fire-and-forget `asyncio.create_task()` without strong reference | Use `asyncio.TaskGroup` (Python 3.11+) |
| **Event Loop Blocking Budget** | `< 5 ms` synchronous execution per coroutine step | `loop.set_debug(True)` & `slow_callback_duration = 0.005` |
| **Concurrent I/O Fan-Out Cap** | Max `16 – 50` concurrent tasks per request via `asyncio.Semaphore` | Explicit `async with sem:` inside `TaskGroup` |
| **Blocking I/O / GIL CPU Offload** | Sync I/O &rarr; `asyncio.to_thread()`; CPU `> 5ms` &rarr; `ProcessPoolExecutor` | Zero `requests.*` or `time.sleep()` inside `async def` |
| **Cancellation Safety** | `0` swallowed `asyncio.CancelledError` exceptions | Never catch bare `BaseException` without re-raising |

---

## 2. Structured Concurrency (`asyncio.TaskGroup` vs. `asyncio.gather`)

Legacy `asyncio.gather(*tasks)` leaves sibling tasks running as background zombies if one task raises an exception, leaking sockets and DB connections. Calling `asyncio.create_task(coro)` without storing a strong reference in a `set` allows GC to destroy the task mid-execution. Always use `asyncio.TaskGroup` with `asyncio.timeout()` and `asyncio.Semaphore`.

```python
import asyncio
from collections.abc import Sequence
import httpx

# ❌ BAD: Unbounded gather leaks sibling tasks on failure; sync time.sleep freezes the event loop!
async def fetch_all_profiles_bad(urls: list[str]) -> list[dict]:
    import time
    time.sleep(0.1)  # FATAL: Freezes single-threaded event loop for all concurrent requests!
    async with httpx.AsyncClient() as client:
        responses = await asyncio.gather(*(client.get(u) for u in urls))
        return [r.json() for r in responses]


# ✅ GOOD: Bounded TaskGroup cancels all siblings immediately on first exception or timeout
async def fetch_all_profiles_good(
    client: httpx.AsyncClient,
    urls: Sequence[str],
    max_concurrency: int = 20,
    timeout_sec: float = 5.0,
) -> list[dict]:
    semaphore = asyncio.Semaphore(max_concurrency)
    results: list[dict | None] = [None] * len(urls)

    async def _worker(idx: int, url: str) -> None:
        async with semaphore:
            resp = await client.get(url)
            resp.raise_for_status()
            results[idx] = resp.json()

    try:
        async with asyncio.timeout(timeout_sec):
            async with asyncio.TaskGroup() as tg:
                for i, target_url in enumerate(urls):
                    tg.create_task(_worker(i, target_url))
    except* httpx.HTTPError as eg:
        raise RuntimeError(f"Batch fetch failed with {len(eg.exceptions)} HTTP errors") from eg

    return [r for r in results if r is not None]
```

---

## 3. Offloading Blocking I/O (`to_thread`) & CPU-Bound Work (`ProcessPoolExecutor`)

- **Blocking I/O (`asyncio.to_thread`):** Wrap synchronous libraries (`boto3`, `pyodbc`, `Path.read_bytes`) in `await asyncio.to_thread(fn, *args)` to dispatch to the thread pool without stalling the event loop.
- **CPU-Bound GIL Contention:** Because the GIL serializes Python bytecode across threads, CPU-bound work (`> 5 ms`: Pandas/Polars transforms, crypto, PDF rendering) MUST be dispatched to a pre-warmed `ProcessPoolExecutor` via `await loop.run_in_executor(process_pool, cpu_fn, payload)`.

---

## 4. Shielding Critical Cleanup & Graceful Cancellation

When a task is cancelled during a two-phase commit, wrap the final audit persistence in `await asyncio.shield(persist_audit_state())` so cancellation waits for atomic completion before propagating `CancelledError`.
