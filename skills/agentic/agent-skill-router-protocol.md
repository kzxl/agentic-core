---
name: AgentSkillRouterProtocol
desc: Deterministic Skill Routing, Tool-Index SSoT, On-Demand Capability Bootstrapping, and Self-Supervision Loop Protocol
rules: [R_CORE, R_STATE, R_ROUTE]
category: Agentic
---
# 🧭 Agent Skill Router & Toolchain Bootstrap Protocol

**Goal:** Eliminate "Command Guessing" and "Tool Amnesia" in AI Coding Agents. Transform agent behavior from unstructured trial-and-error into deterministic, router-first execution backed by a Machine-Local **Tool-Index Single Source of Truth (SSoT)** and continuous **Self-Supervision**.

---

## 1. Core Operating Principles

```
[User Task Received]
        │
        ▼
[1. SSoT Router (MASTER-ROUTING)] ──► Determine PRIMARY Skill + Specialist Sub-skills
        │
        ▼
[2. Scope & Precedent Gate]       ──► Verify authorization, target scope, and field journal logs
        │
        ▼
[3. Tool-Index SSoT Verification] ──► Check absolute paths in tool-index; missing ──► Auto-Bootstrap
        │
        ▼
[4. Bounded Action Execution]     ──► Execute action ladder with structured timeline & hash verification
        │
        ▼
[5. Self-Supervision Checkpoint]  ──► Every 5 calls: <self_review> (Progress check & anti-loop defense)
```

---

## 2. The Tool-Index Single Source of Truth (SSoT)

1. **Never Guess Tool Paths**: An agent must never guess command invocations or assume tools are globally installed in `PATH`.
2. **Read `tool-index.md` / `tool-index.json` First**: The tool index contains exact, verified absolute paths for the current machine.
3. **On-Demand Capability Bootstrapping**:
   - If a required tool is marked missing in `tool-index`, execute the platform-specific bootstrap script immediately instead of failing or reporting a helpless error.
   - Limit auto-install retries to **2 attempts**. If installation fails twice, halt and provide precise manual setup steps.
4. **Post-Install Index Refresh**: After any tool installation, immediately execute `refresh-tool-index` so subsequent agent turns and other CLI tools can immediately discover the newly installed binary.

---

## 3. Self-Supervision & Anti-Loop Protocol

To prevent infinite execution loops, token exhaustion, and context drift, the agent MUST enforce the following guardrails:

```markdown
<self_review>
- Progress Check: What concrete artifact, log, or evidence was generated in the last 5 steps?
- Repetition Gate: Have I executed the same command/tool with identical parameters >= 2 times?
  - YES -> MUST switch strategy (e.g., Static <-> Dynamic, Tool A <-> Equivalent Tool B).
- Error Comprehension: Can I explain the exact root cause of the last error?
  - NO -> Pause and inspect code/logs before executing any further action.
- Tool Call Budget: If approaching 30 calls on a single subtask, summarize state and ask user.
</self_review>
```

---

## 4. The Evidence → Finding → Path Chain

When performing complex investigations (debugging, security research, performance profiling, reverse engineering):

1. **Evidence (E-xxx)**: Raw, immutable data (compiler logs, hex dumps, HTTP captures, stack traces) verified with cryptographic hashes (SHA-256).
2. **Finding (F-xxx)**: Concrete, deduplicated technical conclusions derived directly from Evidence.
3. **Path (P-xxx)**: Reproducible step-by-step reproduction command and remediation/patch roadmap.

---

## 5. Execution Directives
- **Zero Hallucinated Tools**: Only execute tools registered in the verified local index.
- **Fail-Fast Strategy Switching**: If static analysis is obfuscated/packed, pivot immediately to dynamic hooking/tracing without repeated dead-end decompilation attempts.
- **Deterministic Action Over Passive Acknowledgment**: Never reply with mere confirmations ("Understood", "I will do this") without executing the actual setup and analysis steps.
