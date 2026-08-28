# 🧭 Agent Skill Router & Toolchain Architecture

## 1. Architectural Vision

As AI coding agents take on increasingly heterogeneous engineering tasks (Fullstack development, Embedded Systems, Reverse Engineering, EDR Security, Computational Vision), relying on a monolithic prompt or unguided tool execution leads to failure.

The **Agent Skill Router Architecture** introduces a deterministic dispatch and tool bootstrapping layer between the AI agent and the underlying operating system.

---

## 2. Core Architecture Matrix

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT RUNTIME CORE                              │
│       (Claude Code, Codex CLI, Cursor, Windsurf, Antigravity)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SKILL DISPATCH ROUTING LAYER                         │
│                                                                        │
│  ┌──────────────────────────┐          ┌────────────────────────────┐  │
│  │ Single Source of Truth   │          │ Scope & Precedent Gate     │  │
│  │ (`config/routing.json`)  │          │ (Authorized Target / Sample│  │
│  └────────────┬─────────────┘          └─────────────┬──────────────┘  │
│               └───────────────────────┬──────────────┘                 │
│                                       ▼                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Primary Skill Resolver (Pattern Matching on Input Artifact & Hint│  │
│  └────────────────────────────────────┬─────────────────────────────┘  │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │ Dispatches to Skill Playbook
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    TOOLCHAIN BOOTSTRAP SUBSYSTEM                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Machine-Local Tool Index (`tool-index.md` / `tool-index.json`)   │  │
│  │ [Verified Absolute Paths SSoT for Current Host]                  │  │
│  └───────────────────┬──────────────────────────────┬───────────────┘  │
│                      │ Path Exists                  │ Missing Tool     │
│                      ▼                              ▼                  │
│             [Execute Tool Directly]    [Platform Manifest Bootstrap]   │
│                                        - Auto-install via Package Mgr  │
│                                        - Execute `refresh-tool-index`  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Design Pillars

1. **Client-Neutral Routing Core**: The routing tables, manifests, and playbooks are strictly decoupled from client-specific IDE extensions.
2. **On-Demand Toolchain Lazy Bootstrapping**: Tools are only installed when a specific task requires them, preventing massive initial download bloat.
3. **Continuous Field Journaling**: When an agent solves an undocumented edge case (e.g., anti-hook bypass or framework deadlock), it immediately commits a post-task journal entry to prevent future hallucination.
