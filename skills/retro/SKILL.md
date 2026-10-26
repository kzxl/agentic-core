---
name: retro
description: Environment-improvement retrospective on a finished agent session. Use only when the user explicitly asks for a retro, retrospective, or post-session review of how the agent worked; it ranks fixes to navigation pointers, validators and linters, standards, always-loaded rules, tooling, and information access so future sessions run better.
desc: Post-session retrospective that ranks improvements to the agent environment (pointers, checks, standards, rules size, tool economy, no-ops, information access)
rules: [R_LLM_GOV, R_RES_MEM, R_PROOF, R_CORE]
---

# Retro

**Goal:** Improve the agent's **environment** (files, checks, rules, tools) so future sessions avoid the friction this session hit. The output is a ranked list of candidate changes, not code edits.

Start only when the user asks for a retro.

## 1. Steps

1. **Load the writing guide.** Read `skills/writing-for-agents/SKILL.md` and follow it for every proposed wording change. Done when the guide is in context.
2. **Collect session evidence.** Read the transcript of the session the user names; default to the current conversation.
   - Path: `<appDataDir>\brain\<conversation-id>\.system_generated\logs\transcript.jsonl`.
   - Start with `transcript.jsonl` (compact). When a step lists `truncated_fields`, read that same line in `transcript_full.jsonl`.
   - For subagent sessions, `rg "invoke_subagent" transcript.jsonl` to find child conversation IDs and read their transcripts.
   - Done when you can list every failed tool call, every repeated search, every user correction, and every reviewer finding in the session.
3. **Find candidates** in the categories of §2. Every candidate cites evidence: step index, tool call, or quoted user correction. Candidates without evidence are dropped (observed-failure bar).
4. **Classify each standards candidate** as mechanical or judgement (§3).
5. **Rank** by severity: wrong output shipped > user had to correct the agent > wasted tool calls or tokens > style friction. Done when the list is ordered and each item has category, evidence, proposed change, and target file.
6. **Present** the ranked list to the user. Apply only the items the user selects.
7. **Harvest** durable lessons the user accepts: `node E:\Tools\SemanticBrain\tools\auto-post-task.js "<lesson>"`.

## 2. Candidate Categories (severity order)

| Category | Question | Reach for it when |
| :--- | :--- | :--- |
| **Navigation pointers** | Could a "Read X when Y" line, a `shortcuts.json` entry, or a sharper skill description have taken the agent straight to the right file? Are there hidden dependencies between files? | The agent searched long for information that exists in the repo |
| **Automated checks** | Could `node tools/validate-framework.js`, `node tools/anti-slop-lint.js`, a unit test in `tests/`, a Roslyn analyzer, ESLint, or a pre-commit hook have caught the mistake? Read the repo's existing check commands (`package.json` scripts, CI) first: an unwired or broken check is the finding. A repo with no guardrail at all is itself a finding. | The agent made an error a deterministic check could catch |
| **Standards** | Should the reviewer enforce a new rule, or should an existing rule be clarified or removed? Classify first (§3). | A reviewer missed a mistake, or a standard was ignored |
| **Always-loaded rules size** | Can lines in `user_global` rules, `.project-rule.md`, or `rules.json` move to a standard, a skill, or a check, leaving a pointer? | Always-loaded files are large |
| **Tool economy** | Did the agent make expensive calls (full-file reads of huge files, repeated recursive listings, broad `rg` without path scope, polling loops) that a script, flag, or narrower command would avoid? | A tool call cost many tokens or repeated itself |
| **No-ops** | Do steering files contain instructions that change nothing versus the model default? | Steering files are long and unwieldy |
| **Information access** | Was a crucial fact unavailable (build logs, SQL Server plan output, dev-server logs, read-only DB access, MCP server)? | The agent guessed where it could have looked |

## 3. Mechanical vs Judgement

- **Mechanical** violation (fixed syntactic pattern, banned API, import shape, file location, frontmatter shape, hex literal outside tokens): propose a deterministic check: a new rule in `tools/anti-slop-lint.js` or `tools/validate-framework.js`, a test in `tests/`, an analyzer, or a hook, whichever the repo's existing guardrails make cheapest. Default to building the check over writing prose.
- **Judgement call** (cross-file consistency, naming fit, deletion-test verdicts, matching surrounding style): propose a standard line under `standards/`, phrased positive-first with a rule ID.

## 4. Implementation vs Review

Work passes through implementation and review. The implementer carries the most context pressure (exploration, coding, debugging); the reviewer receives a diff and has the least. Standards enforcement therefore belongs to the reviewer (`[AgentOption]/skills/agentic/adversarial-code-review.md`) and to tooling, not to extra instructions loaded into the implementer.

## 5. Where Changes Go

| Target | Use for |
| :--- | :--- |
| `user_global` rules, `.project-rule.md`, `rules.json` | Navigation pointers only; every line pays context load |
| `standards/` | Judgement calls read during review |
| `tools/*.js`, `tests/` | Mechanical rules |
| Skill packages | Disciplines the agent must reach autonomously; follow `skills/writing-for-agents/SKILL.md` |
| Workflows / slash commands | Flows only a human starts |

## 6. Output Format

```md
| # | Severity | Category | Evidence | Proposed change | Target file |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | High | Automated checks | step 42: hex literal in Button.css shipped | Add AS-01 hex rule fixture | tools/anti-slop-lint.js |
```

Completion criterion: every row has evidence from the transcript and a single target file.

Adapted from mattpocock/skills (MIT).
