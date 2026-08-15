---
desc: Database Chunked Bulk Processing & Mandatory Mutation Audit Logging
rules: [R_DB]
---
# 📦 Database Bulk Processing & Audit Logging

## 1. Bulk Processing & Lock Escalation Defense
- Batch updates/deletes in chunks of 500–1,000 records to prevent Table Lock Escalation.
- Use `SqlBulkCopy` (C#) or `COPY FROM` (Postgres) instead of row-by-row `INSERT` loops.

## 2. Mandatory Audit Logging
- Every mutation (INSERT / UPDATE / DELETE) on core entities MUST record: `EntityName`, `EntityId`, `ActionType`, `OldValues`, `NewValues`, `CreatedBy`, `CreatedAt`.
