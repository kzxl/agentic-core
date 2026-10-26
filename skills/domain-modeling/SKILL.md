---
name: domain-modeling
description: Active discipline for building and sharpening a project's domain model. Use when a domain term is fuzzy, overloaded, or conflicts with GLOSSARY.md (for example lot vs batch, reservation vs allocation, order vs request in inventory, production, sales, or handover domains), when writing or editing GLOSSARY.md or GLOSSARY-MAP.md, when stress-testing domain rules with edge-case scenarios, when a stated business rule may contradict the code, or when recording or editing an ADR.
desc: Challenge and sharpen domain terms, cross-check code, update GLOSSARY.md inline, and record ADRs only for hard-to-reverse trade-offs
rules: [R_CORE, R_RES_MEM, R_DOMAIN_INV, R_DOMAIN_PROD, R_DOMAIN_SALES]
---

# Domain Modeling

**Goal:** Build a shared **ubiquitous language** with the user while designing, and write terms and decisions down the moment they crystallise. One precise word replaces twenty vague ones in prompts, code, and reviews.

Reading `GLOSSARY.md` for vocabulary is a habit every skill may follow. This skill is the *active* discipline: use it when the model changes.

## 1. File Structure

| Repo shape | Files |
| :--- | :--- |
| Single context (most repos) | `GLOSSARY.md` at the repo root; `docs/adr/NNNN-slug.md` |
| Multiple contexts | `GLOSSARY-MAP.md` at the root pointing to `<context>/GLOSSARY.md`; system-wide ADRs in `docs/adr/`, context-specific ADRs in `<context>/docs/adr/` |

- Detect: `GLOSSARY-MAP.md` exists → multi-context; only `GLOSSARY.md` → single; neither → create a root `GLOSSARY.md` when the first term is resolved.
- **Lazy creation:** create a file or folder only when there is content to write. AgentOption itself follows the same convention (`docs/adr/`).
- In multi-context repos, infer the context from the topic; ask when unclear.

## 2. Session Moves

Apply these whenever domain language appears in the conversation.

### 2.1 Challenge against the glossary
When a term conflicts with `GLOSSARY.md`, call it out at once: "The glossary defines *Reservation* as a hold on a specific Lot; you seem to mean a quantity hold on the SKU. Which is it?"

### 2.2 Sharpen fuzzy language
When a word is vague or overloaded, propose one canonical term: "'Order' here: the customer Sales Order, the Production Order, or the Transfer Request? Those are different things."

### 2.3 Stress-test with scenarios
Invent concrete edge cases that force precision at the edges between concepts:
- A Lot is split across two warehouses mid-transfer.
- A Sales Order line is partially shipped, then the remainder is cancelled.
- A Production Order consumes material from an expired Lot.
- A handover is signed by a shift lead who is not assigned to the line.

### 2.4 Cross-check with code
When the user states how something works, verify it in the code (`rg`, read the service and SQL). Surface contradictions: "`CancelOrderAsync` cancels the whole order, but you just said partial cancellation is allowed. Which is right?"

### 2.5 Update GLOSSARY.md inline
When a term is resolved, write it into `GLOSSARY.md` immediately, not in a batch at the end. Read [references/glossary-format.md](references/glossary-format.md) before the first edit to a glossary in this session.

The glossary holds language only: definitions and avoided synonyms. Specs, implementation notes, and decisions live elsewhere.

### 2.6 Offer ADRs sparingly
Offer an ADR only when all three hold:
1. **Hard to reverse:** changing your mind later has meaningful cost.
2. **Surprising without context:** a future reader would ask "why this way?"
3. **Real trade-off:** genuine alternatives existed and one was chosen for stated reasons.

If any is missing, skip the ADR. Read [references/adr-format.md](references/adr-format.md) when writing one.

## 3. Grilling Hook

When open design questions surface (scope, ownership of data, which context owns a concept), run the grilling protocol: read `[AgentOption]/skills/agentic/brainstorming-and-spec.md` and follow it. Facts are your job (look them up with `rg` or `research` subagents); decisions are the user's.

## 4. Protocol

1. **Pre-fetch.** `node E:\Tools\SemanticBrain\tools\context-fetch.js "<domain topic>"`. Done when prior domain lessons are read or none exist.
2. **Load the language.** Read `GLOSSARY-MAP.md` / `GLOSSARY.md` and `docs/adr/` titles if present. Done when you can list the existing terms for the topic.
3. **Run the session moves** (§2) as the conversation proceeds. Done when every domain term used in the agreed design is either in the glossary or explicitly general-purpose.
4. **Cross-check.** Every business rule the user stated is confirmed in code or recorded as a known contradiction to fix.
5. **Record.** Glossary entries written; ADRs written only for decisions that pass §2.6.
6. **Harvest.** `node E:\Tools\SemanticBrain\tools\auto-post-task.js "<resolved term or decision + reason>"` for durable lessons.

## 5. Completion Checklist

- [ ] No term in the design has two names; avoided synonyms are listed under `_Avoid_`.
- [ ] Every contradiction between stated rules and code is resolved or tracked.
- [ ] `GLOSSARY.md` contains no implementation detail.
- [ ] Each new ADR passes all three criteria in §2.6.

Adapted from mattpocock/skills (MIT).
