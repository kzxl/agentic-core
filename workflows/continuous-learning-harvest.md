---
name: ContinuousLearningHarvestWorkflow
desc: Automated pre-task context lookup and post-task knowledge harvesting workflow using SemanticBrain bridge
rules: [R_CORE]
category: Workflows
---
# 🧠 Continuous Learning & Semantic Memory Workflow

**Goal:** Ensure zero memory loss between agent sessions by enforcing automated pre-task historical retrieval and post-task distilled lesson harvesting.

---

### Step 1: PRE-Fetch Before Planning or Coding (Mandatory)
Query SemanticBrain for project history, anti-patterns, and architectural guidelines:
// turbo
```bash
node [AgentOption]/tools/brain.js pre "<User Task Description>" --tags=<domain>
```

### Step 2: Extract & Apply Past Insights
Review retrieved knowledge before reasoning:
- Avoid documented bugs and regression points.
- Reuse proven patterns (e.g. `RunAfterShown`, `DbScope`, `1-to-1 Partials`).

### Step 3: Execute Task with Strict Verification
Execute work adhering to standards:
- Build and verify code with zero warnings/errors.
- Run automated unit and integration tests.

### Step 4: Commit Verified Changes to VCS
Commit changes cleanly before harvesting:
```bash
git add .
git commit -m "<type>(<domain>): <concise message describing fix or feature>"
```

### Step 5: POST-Harvest Distilled Technical Lesson (Mandatory)
Record the distilled lesson into SemanticBrain Vector DB using the **3-field format**:
// turbo
```bash
node [AgentOption]/tools/brain.js post "[Symptom/Context] | [Root Cause/Problem] | [Concrete Solution & Gotcha]" --tags=<domain>,<technical_tag>
```

**Tagging Standard (Minimum 2 tags):**
- 1 Domain Tag: `inventory`, `sales`, `production`, `inspection`, `handover`, `rd`, `auth`
- 1 Technical Tag: `csharp`, `winforms`, `react`, `nodejs`, `async`, `refactor`, `bug`, `perf`
