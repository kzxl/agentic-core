---
name: StructuredLlmToolCalling
desc: Deterministic state-machine agent loops, bounded retries, schema-enforced tool dispatch, and SSE streaming
rules: [R_PY, R_ROUTE, R_CORE]
category: Python
---
# 🤖 Python Structured LLM Tool Calling & Agent State-Machine Loop

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Max Agent Loop Iterations** | Hard cap `<= 8` turns (`MAX_STEPS = 8`) | Explicit step counter in state machine |
| **Token & Cost Budget** | Cumulative ceiling `<= 32,000` tokens | Pre-flight token counter & circuit breaker |
| **Tool Execution Timeout** | `<= 10.0s` per call (`asyncio.timeout(10.0)`) | Prevents hung external API stalling worker |
| **Tool Argument Validation** | `100%` validated via strict Pydantic v2 | Zero `eval()` / `exec()` or raw `**kwargs` |
| **Schema Repair Retries** | Max `2` structured error feedback turns | Returns `ValidationError` as `tool` output |

---

## 2. Deterministic Agent State Machine & Bounded Tool Dispatch

Unbounded `while True:` loops without step limits or tool timeouts risk runaway token burn (`$100+`). Every agent loop MUST enforce: (1) `max_steps <= 8` and `max_tokens <= 32,000`, (2) strict Pydantic `model_validate_json` before execution, and (3) structured error strings returned as `tool` messages for model self-repair.

```python
import asyncio
from collections.abc import Awaitable, Callable
from pydantic import BaseModel, ConfigDict, Field, ValidationError

# ❌ BAD: Infinite while True loop, unvalidated json.loads passed to **kwargs
async def run_agent_bad(llm, messages: list[dict], tools: dict[str, Callable]) -> str:
    import json
    while True:  # Runaway cost risk!
        resp = await llm.chat(messages)
        if not resp.tool_calls:
            return resp.content
        for tc in resp.tool_calls:
            res = await tools[tc.name](**json.loads(tc.arguments))  # Crashes on bad keys!
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(res)})


# ✅ GOOD: Bounded loop, Pydantic schema enforcement, timeout guard, and self-repair
class QueryOrderArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    order_id: str = Field(pattern=r"^ORD-[0-9]{6,12}$")

class ToolSpec(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    name: str
    schema_cls: type[BaseModel]
    handler: Callable[[BaseModel], Awaitable[str]]

async def dispatch_tool(spec: ToolSpec | None, raw_args: str, timeout_sec: float = 10.0) -> str:
    if spec is None:
        return "ERROR: Unknown tool. Choose from registered tools."
    try:
        parsed = spec.schema_cls.model_validate_json(raw_args)
        async with asyncio.timeout(timeout_sec):
            return (await spec.handler(parsed))[:8192]
    except ValidationError as exc:
        return f"ERROR: Invalid arguments: {exc.errors(include_url=False)}"
    except TimeoutError:
        return f"ERROR: Tool '{spec.name}' timed out after {timeout_sec}s."

async def run_agent_loop_good(
    llm,
    messages: list[dict],
    registry: dict[str, ToolSpec],
    max_steps: int = 8,
    max_tokens: int = 32_000,
) -> str:
    used_tokens = 0
    for _ in range(max_steps):
        resp = await llm.chat(messages=messages, tools=list(registry.keys()))
        used_tokens += resp.usage.total_tokens
        if used_tokens > max_tokens:
            raise RuntimeError(f"Token budget exceeded ({used_tokens} > {max_tokens})")
        if not resp.tool_calls:
            return resp.content

        messages.append(resp.to_assistant_message())
        for tc in resp.tool_calls:
            content = await dispatch_tool(registry.get(tc.name), tc.arguments)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": content})

    raise RuntimeError(f"Agent exceeded max reasoning steps ({max_steps})")
```

---

## 3. Server-Sent Events (`SSE`) Streaming & Idempotent Side-Effects

- **Mutating Tool Idempotency:** Derive a deterministic `idempotency_key` from `(conversation_id, step_index, tool_call_id)` for all state-mutating tools.
- **SSE Disconnect Guard:** Emit `: ping\n\n` every `15s` on `text/event-stream` and check `await request.is_disconnected()` to abort generation on client disconnect.
