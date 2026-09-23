---
name: SqlServerIndexAdvisor
desc: Production index architecture, covering index design, filtered indexes, and DMV health audit queries
rules: [R_DB, R_PERF]
category: Database
---
# 📐 SQL Server Index Design, Consolidation & DMV Diagnostics

**Goal:** Design high-efficiency Covering Indexes, implement Filtered Indexes, and audit index health, fragmentation, and redundancies using SQL Server 2012+ Dynamic Management Views (DMVs).

---

## 1. Index Architecture & Column Ordering Principles

### 1.1 The Golden Rule: Equality &rarr; Range &rarr; Sort
When creating a multi-column composite index, order columns strictly by their role in the query:

1. **Equality Columns (`=`):** Place columns compared with `=` first.
2. **Range Columns (`>`, `<`, `BETWEEN`, `LIKE 'A%'`):** Place inequality range columns next. (Once a range column is hit, SQL Server cannot use subsequent index key columns for seeking).
3. **Sort Columns (`ORDER BY`):** Place sort columns matching the query direction.
4. **Included Columns (`INCLUDE`):** Non-key payload columns required by the `SELECT` list.

```sql
-- Query to optimize:
SELECT OrderId, CustomerId, TotalAmount, Status, OrderDate
FROM Orders
WHERE CustomerId = @CustomerId       -- 1. Equality
  AND OrderDate >= @StartDate        -- 2. Range
ORDER BY OrderDate DESC;             -- 3. Sort

-- ✅ Optimal Index:
CREATE NONCLUSTERED INDEX IX_Orders_Cust_Date_Covering
ON Orders (CustomerId, OrderDate DESC)
INCLUDE (OrderId, TotalAmount, Status);
```

---

## 2. Filtered Indexes (High-Speed Sparse Indexing)

Filtered indexes are partial indexes containing only a subset of table rows satisfying an explicit `WHERE` predicate.

### 2.1 Soft Deletes (`IsDeleted = 0`)
In enterprise ERPs where soft-deleted rows accumulate over years:
```sql
-- Index only active records (90% smaller index, faster seeks & cache residency)
CREATE NONCLUSTERED INDEX FIX_Products_Active_Code
ON Products (ProductCode)
INCLUDE (ProductName, UnitPrice)
WHERE IsDeleted = 0;
```

### 2.2 Workflow Statuses (e.g. `PendingApproval`)
```sql
-- Indexes only unprocessed tickets for rapid dispatcher retrieval
CREATE NONCLUSTERED INDEX FIX_Warranty_Pending
ON WarrantyTickets (CreatedDate, AssignedTo)
INCLUDE (TicketNo, CustomerId)
WHERE Status = 'Pending';
```

---

## 3. Production DMV Diagnostic Scripts (SQL Server 2012+)

### 3.1 Script 1: Identify Highest-Impact Missing Indexes
```sql
SELECT TOP 20
    CONVERT(DECIMAL(18,2), migs.user_seeks * migs.avg_user_impact * (migs.avg_total_user_cost + migs.avg_user_impact)) AS ImpactScore,
    migs.user_seeks AS EstimatedSeeks,
    migs.avg_user_impact AS ExpectedImprovementPct,
    DB_NAME(mid.database_id) AS DatabaseName,
    mid.statement AS TableName,
    mid.equality_columns AS EqualityCols,
    mid.inequality_columns AS InequalityCols,
    mid.included_columns AS IncludedCols,
    'CREATE NONCLUSTERED INDEX IX_' + 
        OBJECT_NAME(mid.object_id, mid.database_id) + '_' + 
        REPLACE(REPLACE(REPLACE(ISNULL(mid.equality_columns, ''), ', ', '_'), '[', ''), ']', '') +
        ' ON ' + mid.statement + ' (' + 
        ISNULL(mid.equality_columns, '') +
        CASE WHEN mid.equality_columns IS NOT NULL AND mid.inequality_columns IS NOT NULL THEN ', ' ELSE '' END +
        ISNULL(mid.inequality_columns, '') + ')' +
        ISNULL(' INCLUDE (' + mid.included_columns + ')', '') + ';' AS ProposedIndexDdl
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid ON mid.index_handle = mig.index_handle
ORDER BY ImpactScore DESC;
```

---

### 3.2 Script 2: Detect Unused / Write-Costly Indexes (Drop Candidates)
Identifies indexes that consume write I/O on `INSERT`/`UPDATE` but are never or rarely read by queries:

```sql
SELECT TOP 25
    OBJECT_SCHEMA_NAME(i.object_id) AS SchemaName,
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    s.user_updates AS TotalWrites,
    (s.user_seeks + s.user_scans + s.user_lookups) AS TotalReads,
    (s.user_updates - (s.user_seeks + s.user_scans + s.user_lookups)) AS WritePenaltyScore,
    'DROP INDEX ' + QUOTENAME(i.name) + ' ON ' + QUOTENAME(OBJECT_SCHEMA_NAME(i.object_id)) + '.' + QUOTENAME(OBJECT_NAME(i.object_id)) + ';' AS DropDdl
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s 
    ON s.object_id = i.object_id 
    AND s.index_id = i.index_id 
    AND s.database_id = DB_ID()
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
  AND i.is_primary_key = 0 
  AND i.is_unique_constraint = 0
  AND i.type_desc = 'NONCLUSTERED'
  AND (s.user_updates > 1000 AND (s.user_seeks + s.user_scans + s.user_lookups) < 10)
ORDER BY WritePenaltyScore DESC;
```

---

### 3.3 Script 3: Index Fragmentation & Maintenance Protocol
```sql
SELECT 
    OBJECT_NAME(ps.object_id) AS TableName,
    i.name AS IndexName,
    ps.index_type_desc AS IndexType,
    ps.avg_fragmentation_in_percent AS FragPct,
    ps.page_count AS TotalPages,
    CASE 
        WHEN ps.avg_fragmentation_in_percent > 30 THEN 'ALTER INDEX ' + QUOTENAME(i.name) + ' ON ' + QUOTENAME(OBJECT_NAME(ps.object_id)) + ' REBUILD WITH (ONLINE = ON);'
        WHEN ps.avg_fragmentation_in_percent >= 10 THEN 'ALTER INDEX ' + QUOTENAME(i.name) + ' ON ' + QUOTENAME(OBJECT_NAME(ps.object_id)) + ' REORGANIZE;'
        ELSE 'OPTIMAL'
    END AS MaintenanceAction
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON i.object_id = ps.object_id AND i.index_id = ps.index_id
WHERE ps.page_count > 1000 -- Only consider indexes larger than 8 MB
  AND ps.avg_fragmentation_in_percent >= 10
ORDER BY ps.avg_fragmentation_in_percent DESC;
```
