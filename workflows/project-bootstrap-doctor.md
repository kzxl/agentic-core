---
name: ProjectBootstrapDoctorWorkflow
desc: Automated onboarding, rule binding, and architectural compliance health-check workflow for new repositories
rules: [R_CORE]
category: Workflows
---
# 🩺 Project Bootstrap & Compliance Doctor Workflow

**Goal:** Bind any target repository to AgentOption standards, initialize `.project-rule.md`, run architectural compliance checks, and index the codebase for AI agents.

---

### Step 1: Initialize Project Rule Configuration
Generate `.project-rule.md` at the root of the target project repository:
```yaml
---
project_name: <project_id>
domain: <inventory | sales | erp | auth | mobile>
primary_language: <csharp | nodejs | react | go | php>
architecture: <clean_architecture | universe_plugin | winforms_erp>
framework_references:
  agent_option_root: "E:\\16. AgentOption"
  rules: ["R_CORE", "R_CS", "R_WPF", "R_API"]
---
```

### Step 2: Run AgentOption Doctor Health-Check
Execute automated compliance scanner to detect missing files, invalid rule bindings, or unlocalized DTOs:
// turbo
```bash
node [AgentOption]/tools/doctor.js <path-to-target-repo>
```

### Step 3: Run Framework Self-Validation
Ensure AgentOption rules, shortcuts, and frontmatter are 100% synchronized:
// turbo
```bash
node [AgentOption]/tools/validate-framework.js
```

### Step 4: Semantic Brain Initial Warm-up
Query initial context to verify SemanticBrain connectivity:
// turbo
```bash
node [AgentOption]/tools/brain.js pre "initial bootstrap check" --tags=<domain>
```

### Step 5: Initial Baseline Git Checkpoint
Commit the newly created configuration:
```bash
git add .project-rule.md
git commit -m "chore(config): initialize AgentOption baseline and rules registry"
```
