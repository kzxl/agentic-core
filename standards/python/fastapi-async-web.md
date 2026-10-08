---
desc: Python FastAPI Asynchronous Web, SSE Streaming, Pydantic v2 & Architecture Standards
rules: [R_PY, R_API, R_CORE]
---
# ⚡ Python FastAPI & Asynchronous Web Standards

## 1. Asynchronous Event-Loop & Non-Blocking I/O Directives

1. **Strict Non-Blocking Invariant in `async def` Routes**:
   - Never execute blocking I/O (e.g. `time.sleep()`, synchronous `requests.get()`, blocking disk file I/O `open().read()`, or heavy CPU-bound algorithms) directly inside an `async def` endpoint.
   - Synchronous network calls MUST use `httpx.AsyncClient` or `aiohttp`.
   - If a third-party library is strictly synchronous/blocking, delegate it explicitly to the worker threadpool:
     ```python
     result = await asyncio.to_thread(blocking_function, *args, **kwargs)
     ```
   - For CPU-bound operations (e.g., image transformations, intensive serialization, cryptographic calculations), dispatch to `concurrent.futures.ProcessPoolExecutor` to bypass the Global Interpreter Lock (GIL).

2. **Lifespan Context Management**:
   - Deprecated `@app.on_event("startup")` and `@app.on_event("shutdown")` are PROHIBITED.
   - Use the standard ASGI `lifespan` context manager:
     ```python
     from contextlib import asynccontextmanager
     from fastapi import FastAPI

     @asynccontextmanager
     async def lifespan(app: FastAPI):
         # Startup: Initialize shared client sessions, database connection pools
         await init_resources()
         yield
         # Shutdown: Gracefully drain connections, flush logs
         await close_resources()

     app = FastAPI(lifespan=lifespan)
     ```

---

## 2. Server-Sent Events (SSE) & Real-Time Streaming Directives

1. **Streaming Protocol & Header Discipline**:
   - Token streaming endpoints (e.g., `/api/chat/stream`) MUST return `StreamingResponse` with `media_type="text/event-stream"`.
   - Mandatory HTTP headers to prevent proxy buffer stalls:
     ```python
     headers = {
         "Cache-Control": "no-cache",
         "Connection": "keep-alive",
         "X-Accel-Buffering": "no" # Prevents NGINX from buffering chunked SSE tokens
     }
     ```
2. **Normalized SSE Event Framing**:
   - Always format events conforming to the standard SSE framing protocol:
     ```text
     event: <event_name>\n
     data: <json_payload>\n\n
     ```
   - Standard event channels:
     - `event: status`: Graph initialization or lifecycle transitions.
     - `event: node_start`: Beginning of intermediate node execution.
     - `event: token`: High-frequency streaming text chunks.
     - `event: node_complete`: Node finalization with metrics and duration.
     - `event: workflow_complete`: End of pipeline with final response and total latency.
     - `event: error`: Unhandled exceptions.

---

## 3. Pydantic v2 Schema Modeling & Data Validation

1. **Pydantic v2 Idioms**:
   - Use `model_dump()` and `model_dump_json()` instead of deprecated v1 `.dict()` and `.json()`.
   - Define explicit field constraints using `Field(...)` (e.g., `gt`, `le`, `min_length`, `description`).
   - Use `Annotated[...]` for parameter type metadata and reusable validation constraints.
2. **Strict Request & Response DTO Localization**:
   - Endpoints MUST explicitly declare `response_model` or typed return signatures.
   - Never expose raw internal state or internal entities directly to client APIs; map via localized DTO schemas.

---

## 4. Dependency Injection & Resource Management

1. **Idiomatic `Depends` Composition**:
   - Use FastAPI `Depends()` for authentication, authorization gates, and service instantiation.
   - Client sessions (e.g., `httpx.AsyncClient`) should be instantiated per application lifetime or yielded as a managed dependency to avoid connection exhaustion:
     ```python
     async def get_http_client() -> AsyncGenerator[httpx.AsyncClient, None]:
         async with httpx.AsyncClient(timeout=30.0) as client:
             yield client
     ```
