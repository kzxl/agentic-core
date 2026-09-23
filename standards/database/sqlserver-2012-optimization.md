---
desc: Enterprise SQL Server 2012+ Query Optimization, SARGability, Type Coercion & Structure Rules
rules: [R_DB, R_PERF]
---
# 🚀 SQL Server 2012+ Performance Optimization Standards

**Scope:** Production T-SQL query design, index alignment, type conversion, and intermediate memory structures for Microsoft SQL Server 2012 and later.

---

## 1. SARGability Invariants (Search Argument Able)

A query is **SARGable** if the SQL Server Query Optimizer can utilize an index seek instead of scanning the entire index or table.

### 1.1 Never Wrap Filtered Columns in Functions
Wrapping a column in a function prevents index seeks because the engine must evaluate the function row-by-row across the entire table.

```sql
-- ❌ BAD: Forces Clustered Index / Table Scan
WHERE YEAR(OrderDate) = 2026 AND MONTH(OrderDate) = 9
WHERE ISNULL(Status, 'Pending') = 'Pending'
WHERE LEFT(ItemCode, 3) = 'RAW'
WHERE DATEDIFF(day, CreatedDate, GETDATE()) <= 7

-- ✅ GOOD: SARGable Range Predicates (Index Seek)
WHERE OrderDate >= '2026-09-01' AND OrderDate < '2026-10-01'
WHERE (Status = 'Pending' OR Status IS NULL)
WHERE ItemCode LIKE 'RAW%'
WHERE CreatedDate >= DATEADD(day, -7, CAST(GETDATE() AS DATE))
```

### 1.2 Mathematical Operations on Columns
Keep column references isolated on one side of the operator.

```sql
-- ❌ BAD: Evaluates column expression per row
WHERE TotalAmount * 1.1 > 1000

-- ✅ GOOD: Calculates constant once
WHERE TotalAmount > (1000 / 1.1)
```

### 1.3 Wildcard Search Rules
- `LIKE 'ABC%'`: **SARGable** (Executes Index Seek on leading characters).
- `LIKE '%ABC'`: **Non-SARGable** (Forces Index Scan).
- `LIKE '%ABC%'`: **Non-SARGable** (Forces Full Scan). For high-scale text search, use Full-Text Search.

---

## 2. Data Type Mismatch & Implicit Conversion (Silent Killer)

When data types in a comparison do not match, SQL Server converts the data type with **lower precedence to higher precedence**.

### 2.1 The `VARCHAR` vs `NVARCHAR` Trap
- In .NET / C# (Dapper, EF, LINQ to SQL), strings default to `NVARCHAR` (Unicode).
- If the database column is `VARCHAR` (ANSI), SQL Server converts the **column** to `NVARCHAR` (`CONVERT_IMPLICIT(nvarchar(50), [Column], 0) = @Param`).
- **Impact:** An entire table scan occurs, completely invalidating Non-Clustered Indexes.

```csharp
// ❌ Dapper BAD: Defaults to DbType.String (NVARCHAR) -> Causes CONVERT_IMPLICIT on VARCHAR columns
var result = await conn.QueryAsync<Order>(
    "SELECT * FROM Orders WHERE OrderNo = @OrderNo", 
    new { OrderNo = orderNo });

// ✅ Dapper GOOD: Explicitly specify AnsiString (VARCHAR)
var result = await conn.QueryAsync<Order>(
    "SELECT * FROM Orders WHERE OrderNo = @OrderNo", 
    new { OrderNo = new DbString { Value = orderNo, IsAnsi = true, Length = 20 } });
```

---

## 3. Intermediate Storage: `#Temp` vs `@Table` vs `CTE`

Choosing the wrong temporary construct is the most common cause of memory bottlenecks and inaccurate cardinality estimates in SQL Server 2012.

| Dimension | Temporary Table (`#Temp`) | Table Variable (`@Table`) | Common Table Expression (`CTE`) |
| :--- | :--- | :--- | :--- |
| **Physical Storage** | `TempDB` (disk & buffer pool) | `TempDB` (disk & buffer pool) | In-Memory (Inline View) |
| **Statistics** | ✅ Full Column & Index Statistics | ❌ **No Statistics** (Always estimated as **1 row** in SQL 2012) | ❌ Inherited from base tables |
| **Indexes** | ✅ Clustered & Multiple Non-Clustered | ⚠️ PK/Unique constraint at declaration only | ❌ None |
| **Recompilation** | ✅ Recompiles on row threshold changes | ❌ Never triggers recompile | N/A |
| **Reuse in Query** | ✅ Materialized; read multiple times freely | ✅ Materialized; read multiple times freely | ❌ **Re-executed for EVERY reference** |
| **Recommended Use** | **Datasets > 100 rows**, complex joins | Small sets (< 100 rows), TVPs in SPs | Readability, 1-time hierarchical recursion |

### 3.1 The Table Variable 1-Row Estimation Trap
In SQL Server 2012, the Cardinality Estimator assumes `@Table` contains **1 row**. If `@Table` contains 50,000 rows and is joined with a large table, the optimizer selects a **Nested Loops Join** instead of Hash or Merge Join, causing severe CPU spikes and query timeouts.

**Standard Rule:** Use `#Temp` tables whenever intermediate data exceeds 100 rows or is involved in subsequent joins.

### 3.2 The CTE Multi-Evaluation Trap
```sql
-- ❌ BAD: The heavy aggregation inside SalesSummary runs TWICE!
WITH SalesSummary AS (
    SELECT CustomerId, SUM(Amount) AS TotalSpent
    FROM HeavySalesLedger
    GROUP BY CustomerId
)
SELECT * FROM SalesSummary WHERE TotalSpent > 10000
UNION ALL
SELECT * FROM SalesSummary WHERE TotalSpent < 100;

-- ✅ GOOD: Materialize once into #Temp
SELECT CustomerId, SUM(Amount) AS TotalSpent
INTO #SalesSummary
FROM HeavySalesLedger
GROUP BY CustomerId;

CREATE CLUSTERED INDEX CIX_SalesSummary ON #SalesSummary(CustomerId);

SELECT * FROM #SalesSummary WHERE TotalSpent > 10000
UNION ALL
SELECT * FROM #SalesSummary WHERE TotalSpent < 100;

DROP TABLE #SalesSummary;
```

---

## 4. SQL Server 2012+ Pagination Standard

SQL Server 2012 introduced the ANSI standard `OFFSET ... FETCH NEXT` clause.

### 4.1 Standard Offset Pagination
```sql
-- Required: Must have an explicit ORDER BY clause
SELECT Id, OrderNo, CustomerId, TotalAmount, OrderDate
FROM Orders
ORDER BY OrderDate DESC, Id DESC
OFFSET @Offset ROWS 
FETCH NEXT @PageSize ROWS ONLY;
```

### 4.2 High-Scale Keyset Pagination (Seek Method)
For deep pagination (e.g. page 1,000+ across 10,000,000 rows), `OFFSET` must scan and discard earlier rows. Keyset pagination delivers instant $O(1)$ performance:

```sql
-- Instant seek using last seen values from previous page
SELECT TOP (@PageSize) Id, OrderNo, TotalAmount, OrderDate
FROM Orders
WHERE (OrderDate < @LastOrderDate) 
   OR (OrderDate = @LastOrderDate AND Id < @LastId)
ORDER BY OrderDate DESC, Id DESC;
```

---

## 5. Parameter Sniffing Defense

When a stored procedure or parameterized query executes for the first time, SQL Server compiles a plan optimized for those specific parameter values. If future parameter calls have drastically different distributions (e.g. Tenant A has 10 rows, Tenant B has 5,000,000 rows), performance plummets.

### Remedies:
1. **Local Variable Assignment (Forces Average Density):**
   ```sql
   CREATE PROCEDURE GetOrdersByStatus @Status VARCHAR(20)
   AS
   BEGIN
       DECLARE @LocalStatus VARCHAR(20) = @Status;
       SELECT * FROM Orders WHERE Status = @LocalStatus;
   END
   ```
2. **Recompile Hint (For highly variable parameters running infrequently):**
   ```sql
   SELECT * FROM Orders WHERE Status = @Status
   OPTION (RECOMPILE);
   ```
3. **Optimize For Hint (For known predictable typical values):**
   ```sql
   SELECT * FROM Orders WHERE Status = @Status
   OPTION (OPTIMIZE FOR (@Status = 'Completed'));
   ```

---

## 6. Concurrency & Locking Invariants

1. **Consistent Lock Ordering:** Always access tables in alphabetical or standard hierarchical order (e.g., Parent `Orders` $\to$ Child `OrderDetails`) to eliminate cyclic deadlocks.
2. **Short Transaction Boundaries:** Never place HTTP calls, file I/O, or extensive client-side processing inside an active database transaction.
3. **Intentional Query Locking Hints:**
   - `WITH (NOLOCK)`: Use strictly for asynchronous audit logging or non-financial reporting dashboards where dirty reads are tolerable.
   - `WITH (UPDLOCK, ROWLOCK)`: Mandatory for stock reservations and lot allocation to serialize write intent without escalating to table locks.
