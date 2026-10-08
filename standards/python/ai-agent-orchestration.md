---
desc: Python AI Agent, LLM Orchestration, Workflow Node Graphs & Tool Calling Standards
rules: [R_PY, R_PERF, R_CORE, R_RES]
---
# 🤖 Python AI Agent & Workflow Orchestration Standards

## 1. LLM Client Communication & Streaming Invariants

1. **Sub-100ms Time-to-First-Token (TTFT) Streaming**:
   - For all interactive chat or conversational endpoints, use asynchronous token streaming via `AsyncGenerator[Dict[str, Any], None]`.
   - Never wait for the complete model generation to buffer in memory before responding to the user.
2. **Network Resilience & Jittered Exponential Backoff**:
   - External LLM API calls (OpenAI, Anthropic, Ollama, vLLM) must enforce strict timeouts:
     - Connect timeout: $\le 5.0\text{s}$
     - Read/stream timeout: $\le 60.0\text{s}$
   - Implement exponential backoff with full jitter on HTTP 429 (Rate Limit) and 503 (Overloaded):
     ```python
     sleep_time = min(max_delay, base_delay * (2 ** attempt)) + random.uniform(0, 1.0)
     ```
3. **Provider Agnostic Abstraction**:
   - Encapsulate LLM clients behind an abstract provider contract (`BaseLlmProvider` or `LlmNode`).
   - Workflows must seamlessly switch between Cloud APIs (OpenAI, Claude, Gemini) and Local Inference (Ollama, vLLM, SGLang) via configuration without code changes.

---

## 2. Graph & Node-Based Workflow Architecture

1. **Deterministic Execution Context (`ExecutionContext`)**:
   - Keep node execution isolated. Nodes receive typed inputs and produce typed outputs; they must not mutate external global state.
   - Session variables must be scoped, tracked, and interpolated deterministically using token placeholders (e.g. `{query}`, `{system_prompt}`).
2. **Agentic Loop Termination & Safeguards**:
   - In graphs supporting cycles (ReAct reasoning loops, evaluator-optimizer loops, tool retries), ALWAYS enforce a hard ceiling on iterations (`max_steps` or `max_loops <= 10`).
   - If a node exceeds its iteration threshold, the execution runner MUST terminate the cycle gracefully and yield a fallback explanation rather than crashing or burning infinite tokens.
3. **Topological Ingestion & Dynamic Branching**:
   - Condition and Router nodes must emit discrete branch handles (e.g., `true_branch`, `false_branch`) that activate only the corresponding downstream edge paths in the graph.

---

## 3. Tool Calling & Safe Execution

1. **Schema-Driven Tool Contracts**:
   - Define all tool arguments using Pydantic models with explicit docstrings and field validations.
   - Convert Pydantic schemas automatically into JSON Schema specifications matching OpenAI Function Calling or JSON Schema constraints.
2. **Strict Prohibition on Unsanitized Code Execution**:
   - NEVER execute raw Python `eval()` or `exec()` on arbitrary user inputs.
   - For mathematical evaluations, use safe AST parsing (`ast.parse`) with strict whitelist operators (`ast.Add`, `ast.Sub`, `ast.Mult`, `ast.Div`, `ast.Pow`) or restricted namespace scopes.
   - For external code execution, dispatch to containerized sandboxes or isolated subprocesses with CPU/memory quotas and execution timeouts.

---

## 4. Context Budgeting & Sliding Window Memory

1. **Predictable Token Budgets**:
   - Track conversation history token counts using fast BPE tokenizers (e.g. `tiktoken`).
   - Implement sliding-window trimming (e.g., retaining the system prompt + last $N$ dialogue turns) to strictly adhere to model context limits and prevent "Lost in the Middle" degradation.
2. **KV-Cache Optimization**:
   - Partition prompts into **Static Prefix** (System Directive, Tool Schemas, Few-shot Examples) and **Dynamic Suffix** (Working Memory, Ephemeral User Turns) to maximize KV-cache hit ratios on local inference engines.
