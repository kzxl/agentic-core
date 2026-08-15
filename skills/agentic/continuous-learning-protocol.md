---
name: AgenticContinuousLearningProtocol
desc: Pre-task semantic context retrieval and post-task knowledge harvesting protocol using SemanticBrain Bridge
rules: [R_CORE]
category: Agentic
---
# 🧠 Agentic Continuous Learning & Semantic Memory Protocol

**Goal:** Close the feedback loop for AI Coding Agents. Prevent repeating past mistakes by automatically querying past project lessons before coding (**PRE-Fetch**) and harvesting new engineering insights immediately upon task completion (**POST-Harvest**).

---

## 1. The Dual-Phase Lifecycle

```
[User Task Received]
        |
        v
[1. PRE-FETCH]  -> Query SemanticBrain for project history & patterns
        |
        v
[Execute Work]  -> Plan, Code, TDD, Review, Verify
        |
        v
[2. POST-HARVEST]-> Commit distilled technical lessons to SemanticBrain Vector DB
        |
        v
[Task Complete]
```

---

## 2. Agent Execution Workflow

### A. PRE-Fetch (Before Designing or Coding)
Before modifying code on complex tasks (features, bugfixes, refactorings), retrieve context:

```bash
# Auto-detects project from .project-rule.md
node [AgentOption]/tools/brain.js pre "<task description>" --tags=<domain>
```

### B. POST-Harvest (Immediately After Successful Verification)
After changes are built, verified, and committed, record the lesson using the mandatory **3-field format**:

```bash
node [AgentOption]/tools/brain.js post "[Symptom/Problem] | [Root Cause] | [Concrete Fix & Gotcha]" --tags=<domain>,<type>
```

**Example:**
```bash
node [AgentOption]/tools/brain.js post "GridControl freeze after RunAfterShown | Invoked sync void delegate instead of Task | Use RunAfterShown(async () => await LoadData()) with top-level try/catch" --tags=inventory,winforms
```

**Tag Rules:**
- 1 Domain Tag: `inventory`, `sales`, `auth`, `production`, `report`, `ui`
- 1 Technical Tag: `react`, `nodejs`, `csharp`, `winforms`, `async`, `bug`, `refactor`

---

## 3. Benefits
- **Zero Hallucination of Legacy Patterns:** The agent immediately knows repository-specific quirks.
- **Continuous Knowledge Accumulation:** Every solved bug permanently teaches future agent sessions.
