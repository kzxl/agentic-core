---
desc: Python Asynchronous Performance, Concurrency, Event-Loop & Memory Standards
rules: [R_PY, R_PERF, R_CORE]
---
# ⚡ Python High-Performance & Concurrency Standards

## 1. Event-Loop Safety & GIL Mitigation

1. **Event-Loop Starvation Prevention**:
   - The `asyncio` event loop runs on a single thread by default. Long-running synchronous CPU operations starve all concurrent connections.
   - Any CPU-bound computation lasting $> 5\text{ms}$ MUST be offloaded:
     ```python
     import asyncio
     from concurrent.futures import ProcessPoolExecutor

     # I/O bound blocking library -> ThreadPool
     data = await asyncio.to_thread(blocking_io_call)

     # Heavy CPU algorithm -> ProcessPool (bypasses Python GIL)
     loop = asyncio.get_running_loop()
     result = await loop.run_in_executor(process_pool, heavy_math_computation, data)
     ```
2. **TaskGroup Structured Concurrency (Python 3.11+)**:
   - Prefer `asyncio.TaskGroup()` over unstructured `asyncio.gather()` for fan-out tasks to guarantee that failure in any child task cancels peer tasks cleanly:
     ```python
     async with asyncio.TaskGroup() as tg:
         t1 = tg.create_task(fetch_context(user_id))
         t2 = tg.create_task(retrieve_tools(query))
     # Both tasks guaranteed completed or cleanly aborted on error
     ```

---

## 2. Concurrency Rate-Limiting & Backpressure

1. **Semaphore-Guarded Fan-Out**:
   - When issuing batch queries or fan-out tool calls, always throttle concurrent outbound requests using `asyncio.Semaphore` to prevent socket exhaustion and API rate limits:
     ```python
     sem = asyncio.Semaphore(10) # Max 10 concurrent requests

     async def bounded_request(item):
         async with sem:
             return await client.post("/endpoint", json=item)
     ```
2. **Bounded Asynchronous Queues**:
   - Producer-consumer pipelines must use `asyncio.Queue(maxsize=1000)` with backpressure to prevent unbounded RAM growth when producers outpace consumers.

---

## 3. High-Throughput JSON Serialization

1. **Pydantic Rust Core & Fast Serializers**:
   - Utilize Pydantic v2's compiled Rust engine (`pydantic_core`) via `model.model_dump_json()` for high-speed serialization.
   - For high-throughput payload serialization outside Pydantic, prefer `orjson` (compiled Rust) which provides $4\times - 10\times$ speedups over the standard library `json` module.

---

## 4. Memory Leak & Connection Lifecycle Discipline

1. **Avoid Circular Reference Retentions**:
   - Avoid creating circular references involving closures and `__del__` methods, which can prevent the cyclic garbage collector from reclaiming memory.
2. **Mandatory Connection Draining**:
   - Always close `httpx.AsyncClient` or `aiohttp.ClientSession` instances deterministically via context managers `async with` or lifespan hooks to eliminate unclosed socket warnings (`ResourceWarning: unclosed <socket.socket>`).
