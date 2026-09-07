---
name: AgenticContinuousLearningProtocol
desc: Adaptive episodic knowledge lifecycle, progressive context retrieval, and guarded post-task harvesting protocol
rules: [R_CORE]
category: Agentic
---
# 🧠 Agentic Continuous Learning & Episodic Knowledge Lifecycle Protocol

**Goal:** Provide an autonomous **Episodic Knowledge Lifecycle** for AI Coding Agents. Eliminate recurring architectural regressions, prevent context window bloat via progressive retrieval, protect database health with pre-save quality guards, and curate aging knowledge over time.

---

## 1. The Three-Phase Knowledge Lifecycle

```
[User Task Received]
        │
        ▼
[1. PRE-FETCH (L0 Index)]   ──► Fast, token-efficient semantic scan (1-line index per match)
        │                       Optional: L1 Deep Inspection (`brain.js view <id>`)
        ▼
[Execute Work]              ──► Plan, Code, Test-Driven Verification, Review
        │
        ▼
[2. POST-HARVEST (Guarded)] ──► Quality Guard Check + Semantic Deduplication (Strengthen existing if >= 85% match)
        │
        ▼
[3. ADAPTIVE CURATION]      ──► Periodic lifecycle state check (Active ──► Stale ──► Archived; Pinned protected)
```

---

## 2. Protocol Specifications

### Phase 1: Progressive PRE-Fetch (Before Designing or Coding)
Before altering architecture, refactoring, or diagnosing bugs, inspect episodic memory:

```bash
# Auto-detects project from .project-rule.md; outputs compact L0 Index by default
node [AgentOption]/tools/brain.js pre "<task description>" --tags=<domain>

# Optional: Full verbatim text dump
node [AgentOption]/tools/brain.js pre "<task description>" --tags=<domain> --full
```

#### Progressive Disclosure Levels
* **Level 0 (Index Scan - Default):** Returns high-density index table (`ID | Match % | Tags | 1-line Solution`). Conserves 70–80% context tokens during task orientation.
* **Level 1 (Deep Inspection):** When the agent actively touches that subsystem, retrieve complete root cause, code examples, and revision history:
  ```bash
  node [AgentOption]/tools/brain.js view <id>
  ```

---

### Phase 2: Guarded POST-Harvest (Immediately After Verification)
Once code changes pass build and test verification, distill the engineering lesson using the structured 3-part format:

```bash
node [AgentOption]/tools/brain.js post "[Symptom/Problem] | [Root Cause] | [Concrete Solution & Gotcha]" --tags=<domain>,<type> [--pinned]
```

#### Harvest Quality Guard (Enforced Pre-Save)
The pipeline automatically rejects noise and false lessons:

| Category | Filter Rule | Example Blocked |
| :--- | :--- | :--- |
| **Transient Network/VPN** | ❌ Reject | VPN dropped, socket timeout, `ECONNREFUSED` |
| **Secrets & Credentials** | ❌ Reject | Missing API key, 401 unauthorized, expired token |
| **Machine Glitches** | ❌ Reject | Disk full (`ENOSPC`), out of RAM |
| **Missing Binaries** | ❌ Reject | "Command not found", uninstalled global tool |
| **Tool Generalizations** | ❌ Reject | "Tool X is broken", "Cannot use tool Y" |
| **Durable Architectural Gotchas** | ✅ **Accept** | Race conditions, binding freezes, deadlock indexes, framework quirks |

#### Semantic Deduplication & Automatic Strengthening
* If cosine similarity with an existing entry in the same project is **$\ge 85\%$**, the pipeline **strengthens** the existing entry instead of polluting the database with a duplicate.
* Increments `hit_count`, records revision diff in `agent_qa_history`, and preserves tags.

#### Golden Invariants (`--pinned`)
* For universal architecture standards that must never expire (e.g., `BaseForm + RunAfterShown`, explicit 1-way mapping, Folder-per-Feature), append `--pinned`:
  ```bash
  node [AgentOption]/tools/brain.js post "BaseForm UI thread safety | Direct background updates cause COM freeze | Always invoke via RunAfterShown" --tags=ui,winforms --pinned
  ```

---

### Phase 3: Adaptive Knowledge Curation
Prevent database stagnation through scheduled lifecycle auditing:

```bash
# Audit knowledge health (dry-run report)
node [AgentOption]/tools/brain.js curate --dry-run

# Mark idle entries (> 60 days without usage) as stale
node [AgentOption]/tools/brain.js curate --mark-stale --stale-days=60
```

#### Lifecycle States
* **Pinned:** Golden rules. Invariant, permanent priority, exempt from all staleness transitions.
* **Active:** Recently created or frequently matched in active tasks.
* **Stale:** Unused for $> 60$ days. Tagged `status:stale` to de-prioritize in ranking.
* **Archived / Superseded:** Legacy framework patterns replaced by newer architectural standards.

---

## 3. Benefits
* **Clean Context Windows:** Progressive L0 index avoids token exhaustion before implementation starts.
* **Zero Hallucination of Dead Patterns:** Curation and deduplication eliminate obsolete architectural advice.
* **Poison-Resistant Memory:** Quality guard keeps transient environment failures out of durable knowledge.
