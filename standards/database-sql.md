---
desc: Universal Database & SQL Enterprise Standards — Indexing, Deadlock Prevention & Concurrency Control
rules: [R_DB, R_CORE]
---
# 🗄️ Universal Database & SQL Enterprise Standards

## 1. Indexing Strategy & Query Optimization
- **Composite Index Order:** Order index columns by Equality first (`=`), then Range filter (`>`, `<`, `BETWEEN`), and finally Sorting (`ORDER BY`).
- **Covering Indexes:** Use `INCLUDE (ColA, ColB)` (SQL Server/Postgres) for read-heavy queries to avoid expensive Key/Bookmark Lookups.
- **SARGable Queries:** Never wrap indexed columns in functions (e.g. `WHERE YEAR(CreatedDate) = 2026` &rarr; Bad. Use `WHERE CreatedDate >= '2026-01-01' AND CreatedDate < '2027-01-01'`).

## 2. Deadlock Prevention & Transaction Scoping
- **Consistent Lock Ordering:** Always access/update tables in the exact same alphabetical or topological order across all services (e.g. `Orders` &rarr; `OrderDetails` &rarr; `Inventory`).
- **Shortest Transaction Window:** Keep transactions strictly around database writes. Never make external HTTP/API calls or heavy CPU calculations inside an open database transaction.
- **Isolation Levels:** Use `READ COMMITTED SNAPSHOT` (RCSI) or `MVCC` to allow concurrent non-blocking reads during active writes.

## 3. Optimistic Concurrency Control (Lost Update Defense)
- **Version Tracking:** Business entities MUST contain a `RowVersion` (byte[] in C# / `timestamp` in SQL) or integer `version` field.
- **Conditional Mutations:**
  ```sql
  UPDATE tb_inventory 
  SET quantity = quantity - @Qty, version = version + 1 
  WHERE id = @Id AND version = @ExpectedVersion;
  ```
  If affected rows = 0 &rarr; Throw `DbConcurrencyException`.

## 4. Bulk Data & Lock Escalation Defense
- **Chunked Processing:** When updating/deleting > 5,000 records, batch in chunks of 500–1,000 records to prevent SQL Server Table Lock Escalation.
- **Bulk Insert:** Use `SqlBulkCopy` (C#) or `COPY FROM` (PostgreSQL) instead of multi-row `INSERT` loops.

## 5. Audit Logging Invariant
- Every mutation (INSERT / UPDATE / DELETE) on core business entities MUST record: `EntityName`, `EntityId`, `ActionType`, `OldValues`, `NewValues`, `CreatedBy`, `CreatedAt`.
