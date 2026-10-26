---
name: writing-for-agents
description: Writing guide for any document an agent consumes. Use when creating or editing a skill package (SKILL.md, references/), a standard under standards/, an architecture blueprint, an agent persona, a rules.json entry, a shortcuts.json entry, an AGENTS.md or .project-rule.md, or a workflow template in AgentOption; also use when pruning or reviewing such documents for sprawl, duplication, no-ops, or vague completion criteria.
desc: Context pointers, information hierarchy, completion criteria, leading words, positive-first steering, and pruning for agent-facing docs
rules: [R_LLM_GOV, R_CORE, R_REUSE]
---

# Writing for Agents

**Goal:** Every agent-facing document makes the agent take the same *process* on every run. The packaging differs (skill, standard, rule line, `.project-rule.md`); the writing levers below are the same.

Read [references/skill-mechanics.md](references/skill-mechanics.md) when the document is a skill package, a `rules.json` / `shortcuts.json` entry, or anything synced by `npm run sync-skills`.

## 1. Context Pointers

A **context pointer** is an in-context reference that names out-of-context material and encodes *when* to reach it. A skill `description`, a `rules.json` line, and a "Read X when Y" sentence are all pointers. The pointer's wording, not its target, decides reliability.

- State what the material is, then list its **branches** (distinct cases that should trigger it).
- Front-load the leading word.
- One trigger per branch. Collapse synonyms that rename the same branch.
- Cut identity the body already carries.
- A must-have target behind a weak pointer is a variance bug: sharpen the pointer first; inline the material only if sharpening fails.

Pointer shape for a rule line: `<leading words>. Read <path> before <branch 1>, <branch 2>, or <branch 3>.` (see `R_ANTI_SLOP` in `rules.json`).

## 2. The Two Loads

| Load | Cost lands on | Examples in AgentOption |
| :--- | :--- | :--- |
| **Context load** | The agent window, every turn | Skill descriptions in the Antigravity system prompt, `user_global` rules, `.project-rule.md` |
| **Cognitive load** | The human, who must remember what exists | Workflows and slash commands, shortcut IDs, files with no pointer |

Spend context load only on material the agent must reach on its own. Spend cognitive load where human judgement matters.

## 3. Information Hierarchy

Content is **steps** (ordered actions) or **reference** (facts consulted on demand). Place each piece on the ladder:

1. **In-file step**: what the agent does, in order.
2. **In-file reference**: consulted on demand; a flat peer set is fine.
3. **Disclosed reference**: a separate file behind a pointer (`references/*.md` in a skill package).

- **Branch test:** inline what every branch needs; disclose what only some branches reach.
- **Co-location:** a concept's definition, rules, and caveats sit under one heading.
- **Sprawl** (too long even when every line is live) is cured by disclosure or splitting, never by compressing prose into fragments.
- Split by **sequence** only when visible later steps make the agent rush the current one, and only across a real context boundary (a subagent dispatched with `invoke_subagent`, or a handoff file).

## 4. Completion Criteria

Every step ends on a criterion that is:

- **Checkable:** an observable state. Prefer command exit codes: `node tools/validate-framework.js` reports `Errors found: 0`; `dotnet test` exit 0; `node tools/anti-slop-lint.js --diff` reports zero MUST errors.
- **Demanding:** exhaustive scope. "Every caller found by `rg` updated" forces legwork; "update callers" does not.

Vague criteria cause **premature completion**: the agent drifts toward *being done*. Sharpen the bound before adding steps.

## 5. Leading Words

A **leading word** is a compact concept already in the model's pretraining (*tight*, *red*, *tracer bullet*, *frontier*, *seam*). Repeat it as a token, never re-explain it as a sentence. It anchors execution in the body and invocation in the pointer.

- Prefer an existing word to a coined label; coined labels recruit no priors.
- Hunt triads ("fast, deterministic, low-overhead") and collapse them into one word (*tight*).
- AgentOption leading words: *quiet*, *dense*, *flat*, *once*, *self-documenting* (UI and naming); *Middle Man*, *Speculative Generality*, *Dead Code* (code bloat); *deep module*, *seam*, *adapter* (design); *blast radius* (impact).

## 6. Positive-First Steering

Prohibitions activate the forbidden concept ("don't think of an elephant"). State the target behaviour instead.

| Negation | Positive target |
| :--- | :--- |
| "No explanatory comments" | "Names carry intent; a comment states a non-obvious why in one line" |
| "No infinite animations" | "Motion runs **once**, then stops" |

Keep a prohibition only as a hard guardrail you cannot phrase positively. Pair it with the positive target and a rule or guardrail ID (`AS-03`, `R_SEC`). Negative examples belong in linter fixtures or human-facing docs, never in an agent-loaded document.

## 7. Pruning

- **Single source of truth (SSOT):** one meaning, one place. Values (tokens, thresholds, paths) live in one file; others reference it by name. Duplication inflates prominence and doubles maintenance.
- **Environment as cache:** `package.json` scripts, `rules.json`, `shortcuts.json`, directory layout, and `--help` output are sources of truth. A doc that restates them is a stale cache. Cache only what looking cannot reveal: conventions, reasons, gotchas.
- **No-op pruning:** delete every sentence the model already obeys by default. Delete the whole sentence, not words. If a word is too weak to beat the default (*thorough*), use a stronger one (*relentless*).
- **Sediment:** stale layers accumulate because adding feels safe and removing feels risky. Every edit includes a prune pass over the touched section.

## 8. Authoring Protocol

1. **Pre-fetch:** `node E:\Tools\SemanticBrain\tools\context-fetch.js "<doc purpose>"`. Done when prior lessons on the topic are read or none exist.
2. **Reuse check:** `rg -l "<leading word>" skills standards architecture`. Done when you have either chosen an existing file to extend or confirmed no file owns the concept.
3. **Draft the pointer first** (description or rule line) using §1. Done when every branch has exactly one trigger.
4. **Draft the body** with steps on top, reference below, long reference disclosed (§3). Done when each step has a checkable criterion (§4).
5. **Prune** (§6, §7). Done when no sentence is a no-op, restatement, or unpaired prohibition.
6. **Verify:** `node tools/validate-framework.js`. Done when it reports `Errors found: 0`, or every remaining error is a documented orchestrator-owned item (for example shortcut coverage).

## 9. Review Checklist

- [ ] Pointer names material + branches; no synonym duplicates.
- [ ] Every step ends on a checkable, exhaustive criterion.
- [ ] Each value has one home; other files reference it.
- [ ] No sentence restates the environment or the model default.
- [ ] Prohibitions appear only as guardrails with an ID and a paired positive target.
- [ ] No emoji headings; no em-dash chains.

Adapted from mattpocock/skills (MIT).
