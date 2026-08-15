---
desc: Database Composite Indexing Order, Covering Indexes & SARGable Query Rules
rules: [R_DB]
---
# 🗄️ Database Indexing & Query Optimization

## 1. Indexing Strategy
- **Composite Index Order:** Equality (`=`) &rarr; Range (`>`, `<`, `BETWEEN`) &rarr; Sort (`ORDER BY`).
- **Covering Indexes:** Use `INCLUDE (ColA, ColB)` for read-heavy queries to eliminate Key Lookups.

## 2. SARGable Query Rules
- Never wrap indexed columns in functions (e.g. `WHERE YEAR(Date) = 2026` &rarr; Bad. Use `WHERE Date >= '2026-01-01' AND Date < '2027-01-01'`).
