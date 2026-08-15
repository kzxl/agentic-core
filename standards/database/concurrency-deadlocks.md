---
desc: Database Deadlock Defense, Consistent Lock Ordering & Optimistic Concurrency
rules: [R_DB, R_RES]
---
# 🔒 Database Concurrency & Deadlock Defense

## 1. Deadlock Defense
- **Consistent Lock Ordering:** Access tables in the exact same order across all services.
- **Shortest Transaction Window:** Keep transactions strictly around writes (Never call external APIs or long calculations inside an open DB transaction).
- **Isolation:** Use `READ COMMITTED SNAPSHOT` (RCSI) or `MVCC` for non-blocking concurrent reads.

## 2. Optimistic Concurrency (Lost Update Defense)
- Entities MUST contain a `RowVersion` (C#) or integer `version` field.
- Mutate conditionally: `WHERE id = @Id AND version = @ExpectedVersion`. If 0 rows affected &rarr; Throw `DbConcurrencyException`.
