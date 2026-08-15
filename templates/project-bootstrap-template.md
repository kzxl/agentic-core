---
name: ProjectBootstrapTemplate
desc: Quick bootstrap template for integrating AgentOption standards and skills into any project using portable [AgentOption] paths
rules: [R_CORE]
category: Template
---
# 🚀 Project Bootstrap Guide with AgentOption

To bind any new or existing repository to the **AgentOption Universal Framework**, place a `.project-rule.md` file in the project root.

---

## 1. Portable Path Resolution (`[AgentOption]`)

All references in rules and skills use the token `[AgentOption]`, which AI Agents resolve using the following priority:
1. **Environment Variable:** `AGENT_OPTION_PATH` (if defined in the system/shell).
2. **Relative Path:** `../16. AgentOption` or `./16. AgentOption` (relative to workspace).
3. **Configured Root:** Value defined in `agent_option_root` within `.project-rule.md`.
4. **Default Fallback:** `E:\16. AgentOption`.

---

## 2. Project Configuration File: `.project-rule.md`

Create `.project-rule.md` in the root of the project:

```yaml
---
project_name: <project_identifier>       # e.g., portal_frontend, inventory_service, billing_api
domain: <business_domain>                 # e.g., ecommerce, logistics, banking, healthcare
primary_language: <language>              # e.g., nodejs, react, csharp, go, php
architecture: <architecture_type>        # e.g., clean_architecture, universe_plugin, modular_monolith
framework_references:
  agent_option_root: "[AgentOption]"      # Resolves portably across any workstation
  rules: ["R_CORE", "R_CS", "R_WPF"]     # Hard rules from rules.json
  shortcuts: ["BASE", "PART", "PERF", "PONY", "CONS", "BLAST"] # Active skills & patterns
key_paths:
  features_root: "Features/"              # Root directory for vertical slice features
  constants: "Shared/Constants.cs"       # Central permissions & rule codes
  dbcontext: "Data/AppDataContext.cs"     # Primary database context
---
```

# Project Specific Directives
- Follow language standards in `[AgentOption]/standards/<primary_language>.md`.
- Reference architecture blueprints in `[AgentOption]/architecture/`.
- Apply reusable skills in `[AgentOption]/skills/<primary_language>/`.
- Validate against rules in `[AgentOption]/rules.json`.

---

## 3. Agent Execution Checklist
1. **Pre-Task Lookup:** Resolve `[AgentOption]`, load `.project-rule.md`, and check applicable rules in `[AgentOption]/rules.json`.
2. **Design & Plan:** Consult `[AgentOption]/architecture/` for module segregation and domain boundaries.
3. **Implementation:** Adhere to `[AgentOption]/standards/` and apply `[AgentOption]/skills/` patterns.
4. **Verification & Commit:** Build, verify behavior, commit changes cleanly.
5. **Post-Task Harvest:** Record learned insights into the local/shared knowledge base.
