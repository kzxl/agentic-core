---
name: domain-modeling-glossary-format
description: Format rules for GLOSSARY.md and GLOSSARY-MAP.md. Read before the first glossary edit in a session, or when creating a glossary or splitting a repo into multiple glossary contexts.
desc: GLOSSARY.md structure, term rules, and multi-context GLOSSARY-MAP.md format
rules: [R_CORE]
---

# GLOSSARY.md Format

Used by the `domain-modeling` skill ([../SKILL.md](../SKILL.md)).

## 1. Structure

```md
# {Context Name}

{One or two sentences: what this context is and why it exists.}

## Language

### Stock

**Lot**:
A quantity of one material produced or received together and traced as a unit.
_Avoid_: Batch, roll

**Reservation**:
A hold on a quantity of a specific Lot for a specific demand line.
_Avoid_: Allocation, booking

### Sales

**Sales Order**:
A customer's confirmed request to buy goods at agreed prices and dates.
_Avoid_: Order (alone), PO, purchase
```

## 2. Term Rules

- **Opinionated:** when several words name one concept, pick one and list the rest under `_Avoid_`.
- **Tight:** one or two sentences; define what the term *is*, not what it does or how it is stored.
- **Project-specific only:** domain concepts unique to this context belong. General programming concepts (timeout, retry, DTO, cache) do not, even when the code uses them heavily.
- **Language only:** no table names, column names, class names, or implementation decisions. Those go to code, specs, or ADRs.
- **Group** terms under subheadings when natural clusters emerge; a flat list is fine for one cohesive area.

## 3. Multi-Context Map

When the repo spans several contexts, `GLOSSARY-MAP.md` at the root lists them and their relationships:

```md
# Glossary Map

## Contexts

- [Inventory](./src/Inventory/GLOSSARY.md): tracks Lots, locations, and stock movements
- [Production](./src/Production/GLOSSARY.md): plans and executes Production Orders
- [Sales](./src/Sales/GLOSSARY.md): receives Sales Orders and ships goods

## Relationships

- **Sales -> Inventory**: Sales emits `SalesOrderConfirmed`; Inventory creates Reservations
- **Production -> Inventory**: Production emits `MaterialConsumed`; Inventory posts stock movements
- **Sales <-> Production**: shared identifiers `CustomerId`, `MaterialCode`
```

Relationships follow the Universe plugin rule: contexts communicate through events or contracts, never through each other's tables (`[AgentOption]/architecture/universe-plugin.md`).

## 4. Completion Criterion

Every edited entry has a bold term, a one or two sentence definition, and an `_Avoid_` line when synonyms exist; no entry names a class, table, or column.
