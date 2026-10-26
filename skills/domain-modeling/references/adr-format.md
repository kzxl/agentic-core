---
name: domain-modeling-adr-format
description: Architecture Decision Record format and qualification bar. Read when a decision is hard to reverse, surprising without context, and the result of a real trade-off, or when editing, superseding, or numbering an existing ADR under docs/adr/.
desc: ADR location, numbering, minimal template, optional sections, and what qualifies
rules: [R_CORE, R_RES_MEM]
---

# ADR Format

Used by the `domain-modeling` skill ([../SKILL.md](../SKILL.md)) and by `codebase-design` after a design-it-twice comparison.

## 1. Location and Numbering

- Path: `docs/adr/NNNN-slug.md` in the target project (system-wide) or `<context>/docs/adr/` (context-specific, multi-context repos). AgentOption uses `docs/adr/` for decisions about the framework itself.
- Number: scan the folder for the highest `NNNN` and add one. Four digits, zero-padded, kebab-case slug: `0003-event-bus-for-stock-movements.md`.
- Create `docs/adr/` lazily, when the first ADR is written.

## 2. Template

```md
# {Short title of the decision}

{1-3 sentences: the context, what was decided, and why.}
```

An ADR can be one paragraph. Its value is recording *that* a decision was made and *why*.

## 3. Optional Sections

Add only when they carry information a reader needs:

- **Status** frontmatter: `proposed | accepted | deprecated | superseded by ADR-NNNN`, when decisions get revisited.
- **Considered Options**: when the rejected alternatives are worth remembering.
- **Consequences**: when downstream effects are non-obvious.

To change a decision, write a new ADR and mark the old one `superseded by ADR-NNNN`; keep the old text intact.

## 4. Qualification Bar

All three must hold:

1. **Hard to reverse:** changing it later costs meaningful time or migration work.
2. **Surprising without context:** a reasonable engineer reading the code would ask "why this way?"
3. **Real trade-off:** genuine alternatives existed and one was picked for stated reasons.

Easy to reverse → just reverse it later. Not surprising → nobody will ask. No alternative → nothing to record.

## 5. What Qualifies (ERP / .NET examples)

- **Architectural shape:** "Inventory and Production communicate through an in-memory EventBus, Level 2 in the Universe migration path."
- **Integration between contexts:** "Sales reads stock only through `IInventoryQueryService`, never through Inventory tables."
- **Technology with lock-in:** database engine, message broker, auth provider, UI suite (DevExpress vs native WinForms). Not every NuGet package.
- **Scope and ownership:** "Lot master data is owned by Inventory; other contexts store `LotId` only." Explicit no's are as valuable as yes's.
- **Deliberate deviations:** "Dapper with hand-written SQL instead of EF Core for the stock ledger, because lock hints and plan control are required." These stop the next engineer from "fixing" a deliberate choice.
- **Constraints invisible in code:** "Label printing must finish in under 500 ms because of the line conveyor speed." "Data stays on-premises for compliance."
- **Non-obvious rejections:** "Considered SQL Server Service Broker for events; rejected because the team cannot operate it."

## 6. Completion Criterion

The ADR file exists at the next free number, states context + decision + reason in at most three sentences (plus optional sections), and passes all three criteria in §4.
