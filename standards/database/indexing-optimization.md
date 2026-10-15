---
desc: Database Composite Indexing Order, Covering Indexes & SARGable Query Rules
rules: [R_DB]
---
# 🗄️ Database Indexing & Query Optimization Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Max Non-Clustered Indexes / Table** | OLTP Write-Heavy Ledger: `<= 5`; Read-Heavy Lookup: `<= 8` | Schema migration review gate |
| **Max Composite Index Key Width** | `<= 4` key columns (`<= 900 bytes` total key size) | Move extra SELECT columns to `INCLUDE (...)` |
| **Key Lookup / RID Lookup Elimination** | `0` Key Lookups on queries executing `> 50 RPS` | Execution plan verification (`SET STATISTICS IO ON`) |
| **Index Fragmentation Maintenance** | `10% – 30%`: `REORGANIZE`; `> 30%`: `REBUILD WITH (ONLINE = ON)` | Automated weekly index maintenance job |
| **Implicit Column Type Conversion** | `0` `CONVERT_IMPLICIT` warnings in execution plans | Match parameter types (`NVARCHAR` vs `VARCHAR`) exactly |

---

## 2. Composite Index Key Ordering & `INCLUDE` Covering Columns

B-Tree composite indexes sort rows lexicographically by the leading key column, then break ties using subsequent columns.
- **Equality &rarr; Sort/Group &rarr; Inequality Rule:** Place exact-match equality predicates (`=`) first, followed by `ORDER BY` / `GROUP BY` columns (if aligned with range direction), and place range/inequality predicates (`>`, `<`, `BETWEEN`, `!=`) **last** in the key list. Once the engine encounters an inequality column, no subsequent key column in the index can be used for seeking.
- **Covering Indexes (`INCLUDE`):** Append non-filter payload columns required by the `SELECT` projection into the `INCLUDE (...)` clause. `INCLUDE` columns live only at the B-Tree leaf level—reducing intermediate tree depth while completely eliminating expensive random-I/O **Key Lookups**.

```sql
-- ❌ BAD: Inequality column (CreatedAt) placed before Equality column (Status);
-- non-SARGable YEAR() function forces full Clustered Index Scan + Key Lookups
CREATE INDEX IX_Orders_Bad ON dbo.Orders (CreatedAt, TenantId, Status);

SELECT OrderId, CustomerId, TotalAmount
FROM dbo.Orders
WHERE TenantId = @TenantId
  AND Status = 'PAID'
  AND YEAR(CreatedAt) = 2026; -- Non-SARGable function disables index seek!

-- ✅ GOOD: Equality keys first (TenantId, Status), Range/Sort key last (CreatedAt),
-- INCLUDE payload columns for a 100% Covering Index Seek with 0 Key Lookups
CREATE NONCLUSTERED INDEX IX_Orders_Tenant_Status_CreatedAt
ON dbo.Orders (TenantId ASC, Status ASC, CreatedAt DESC)
INCLUDE (CustomerId, TotalAmount);

SELECT OrderId, CustomerId, TotalAmount
FROM dbo.Orders
WHERE TenantId = @TenantId
  AND Status = 'PAID'
  AND CreatedAt >= '2026-01-01T00:00:00Z'
  AND CreatedAt <  '2027-01-01T00:00:00Z'
ORDER BY CreatedAt DESC;
```

---

## 3. Filtered Indexes for Sparse States & SARGability Rules

When querying a small active subset of a massive table (e.g., `5,000` pending outbox messages out of `100,000,000` archived rows, or enforcing uniqueness only on non-deleted rows), full-table indexes waste 99% of buffer pool memory and disk pages. Use **Filtered Indexes** (`WHERE` predicate in `CREATE INDEX`).

```sql
-- ✅ GOOD: Sparse filtered index consumes < 1% storage of a full index and accelerates worker polling
CREATE NONCLUSTERED INDEX IX_OutboxMessages_Pending_NextRetry
ON dbo.OutboxMessages (NextRetryAt ASC)
INCLUDE (PayloadJson, AttemptCount)
WHERE Status = 0 AND IsDeleted = 0;

-- ✅ GOOD: Unique filtered index allowing multiple soft-deleted history rows per SKU
CREATE UNIQUE NONCLUSTERED INDEX UX_Products_Tenant_Sku_Active
ON dbo.Products (TenantId, Sku)
WHERE IsDeleted = 0;
```

- **Strict SARGability Invariants:**
  1. Never apply scalar functions (`ISNULL(Col, '')`, `LOWER(Col)`, `CAST(Col AS ...)`, `DATEADD(...)`) to indexed columns in `WHERE` or `JOIN` clauses. Push arithmetic to the parameter side (`Col >= DATEADD(day, -7, SYSUTCDATETIME())`).
  2. Never use leading wildcards (`LIKE '%term'`) on B-Tree indexes; use Full-Text Search (`CONTAINS`) or trigram (`pg_trgm` GIN) indexes instead.

---

## 4. Write-Amplification & Fragmentation Governance

Every non-clustered index adds `1` extra B-Tree write per `INSERT` and up to `2` writes (delete + insert) per `UPDATE` on indexed columns.
- **Avoid Over-Indexing Ledger Tables:** High-velocity append-only tables (`AuditLogs`, `IoTTelemetry`, `StockMovements`) MUST have `<= 3` non-clustered indexes and use a monotonically increasing clustered key (`BIGINT IDENTITY` or `NEWSEQUENTIALID()`) with `FILLFACTOR = 90` (or `100` for purely sequential tail inserts) to prevent page-split fragmentation.

