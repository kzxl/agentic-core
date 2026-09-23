---
name: SqlServerQueryTuning
desc: Step-by-step diagnostic and rewriting workflow for high-performance SQL Server 2012+ queries
rules: [R_DB, R_CS, R_PERF]
category: Database
---
# 🛠️ SQL Server Query Tuning & Rewriting Workflow

**Goal:** Diagnose slow T-SQL queries, eliminate full scans and lookups, cure parameter sniffing, and rewrite queries to achieve sub-millisecond execution times on SQL Server 2012+.

---

## 1. The 5-Step Query Tuning Protocol

Follow this deterministic sequence whenever a query exceeds SLA or causes CPU/IO spikes:

```
[1. Baseline] ──> [2. Plan Inspection] ──> [3. SARG Rewrite] ──> [4. Structure Refactor] ──> [5. Delta Proof]
  Capture IO/Time    Find Scans & Lookups    Fix Types & Funcs     Use #Temp / Indexes      Compare Metrics
```

1. **Step 1: Capture Baseline Performance:**
   - Run `SET STATISTICS IO, TIME ON;` and record Logical Reads and CPU/Elapsed time.
2. **Step 2: Inspect Execution Plan:**
   - Locate the most expensive operators (Scan, Key Lookup, Sort Spill, Hash Match).
3. **Step 3: Rewrite for SARGability & Type Alignment:**
   - Remove functions on columns in `WHERE` and `ON` clauses; fix `NVARCHAR`/`VARCHAR` mismatches.
4. **Step 4: Refactor Intermediate Structures:**
   - Replace heavy `@Table` variables and multi-evaluated CTEs with indexed `#Temp` tables.
5. **Step 5: Verify Delta Proof:**
   - Re-run with statistics and confirm a minimum **5x–50x reduction** in Logical Reads.

---

## 2. Concrete Query Rewriting Patterns

### Pattern 1: Non-SARGable Date Filter & Implicit Conversion

#### ❌ BEFORE (Slow: Full Clustered Index Scan, 120,000 Reads):
```sql
-- C# passed @FromDate as NVARCHAR string, and query wrapped Date in function
SELECT OrderId, CustomerId, TotalAmount 
FROM Orders
WHERE CONVERT(VARCHAR(10), OrderDate, 120) = @OrderDateStr;
```

#### ✅ AFTER (Fast: Index Seek, 4 Reads):
```sql
-- Date boundaries calculated as SARGable range; parameter strongly typed as DATE
DECLARE @TargetDate DATE = CAST(@OrderDateStr AS DATE);

SELECT OrderId, CustomerId, TotalAmount
FROM Orders
WHERE OrderDate >= @TargetDate 
  AND OrderDate < DATEADD(day, 1, @TargetDate);
```

---

### Pattern 2: Multi-Referenced CTE Refactored to Indexed `#Temp`

#### ❌ BEFORE (Slow: Evaluates heavy aggregation 3 times):
```sql
WITH InventoryRollup AS (
    SELECT MaterialId, SUM(Quantity) AS TotalQty, MAX(LastUpdated) AS MaxDate
    FROM InventoryTransactions
    GROUP BY MaterialId
)
SELECT m.MaterialCode, r.TotalQty
FROM Materials m
INNER JOIN InventoryRollup r ON m.Id = r.MaterialId
WHERE r.TotalQty < m.SafetyStock
UNION ALL
SELECT m.MaterialCode, r.TotalQty
FROM Materials m
INNER JOIN InventoryRollup r ON m.Id = r.MaterialId
WHERE r.TotalQty > m.MaxCapacity;
```

#### ✅ AFTER (Fast: Aggregates once into `#Temp` with Clustered Index):
```sql
SELECT MaterialId, SUM(Quantity) AS TotalQty
INTO #InventoryRollup
FROM InventoryTransactions
GROUP BY MaterialId;

-- Add Clustered Index for instantaneous join
CREATE CLUSTERED INDEX CIX_Temp_Rollup ON #InventoryRollup(MaterialId);

SELECT m.MaterialCode, r.TotalQty
FROM Materials m
INNER JOIN #InventoryRollup r ON m.Id = r.MaterialId
WHERE r.TotalQty < m.SafetyStock
UNION ALL
SELECT m.MaterialCode, r.TotalQty
FROM Materials m
INNER JOIN #InventoryRollup r ON m.Id = r.MaterialId
WHERE r.TotalQty > m.MaxCapacity;

DROP TABLE #InventoryRollup;
```

---

### Pattern 3: Curing Parameter Sniffing in Stored Procedures

#### ❌ BEFORE (Unstable: Fast for small customer, times out for big customer):
```sql
CREATE PROCEDURE dbo.GetCustomerShipments
    @CustomerId INT,
    @Status VARCHAR(20)
AS
BEGIN
    SELECT s.ShipmentId, s.ShipDate, d.ItemId, d.Quantity
    FROM Shipments s
    INNER JOIN ShipmentDetails d ON s.ShipmentId = d.ShipmentId
    WHERE s.CustomerId = @CustomerId AND s.Status = @Status;
END
```

#### ✅ AFTER: Solution A — Local Variable Decoupling (Standard Distribution):
```sql
CREATE PROCEDURE dbo.GetCustomerShipments
    @CustomerId INT,
    @Status VARCHAR(20)
AS
BEGIN
    -- Local variables break parameter sniffing by forcing average density estimates
    DECLARE @LocalCustId INT = @CustomerId;
    DECLARE @LocalStatus VARCHAR(20) = @Status;

    SELECT s.ShipmentId, s.ShipDate, d.ItemId, d.Quantity
    FROM Shipments s
    INNER JOIN ShipmentDetails d ON s.ShipmentId = d.ShipmentId
    WHERE s.CustomerId = @LocalCustId AND s.Status = @LocalStatus;
END
```

#### ✅ AFTER: Solution B — `OPTION (RECOMPILE)` (For high-variance queries):
```sql
CREATE PROCEDURE dbo.GetCustomerShipments
    @CustomerId INT,
    @Status VARCHAR(20)
AS
BEGIN
    SELECT s.ShipmentId, s.ShipDate, d.ItemId, d.Quantity
    FROM Shipments s
    INNER JOIN ShipmentDetails d ON s.ShipmentId = d.ShipmentId
    WHERE s.CustomerId = @CustomerId AND s.Status = @Status
    OPTION (RECOMPILE); -- Compiles dedicated plan per execution
END
```

---

### Pattern 4: Fixing `OR` Predicates with `UNION ALL`

The Query Optimizer often struggles with `OR` clauses spanning different columns, choosing a Table Scan over multiple index seeks.

#### ❌ BEFORE (Slow: Index Scan due to `OR` across different tables/columns):
```sql
SELECT Id, OrderNo, CustomerId, SalesRepId 
FROM Orders
WHERE CustomerId = @CustomerId OR SalesRepId = @SalesRepId;
```

#### ✅ AFTER (Fast: 2 Independent Index Seeks concatenated via `UNION`):
```sql
SELECT Id, OrderNo, CustomerId, SalesRepId 
FROM Orders
WHERE CustomerId = @CustomerId
UNION
SELECT Id, OrderNo, CustomerId, SalesRepId 
FROM Orders
WHERE SalesRepId = @SalesRepId;
```

---

## 3. High-Performance C# Dapper Parameterization

Always enforce strong typing in C# to eliminate implicit database conversions:

```csharp
public async Task<IReadOnlyList<WarrantyTicketDTO>> QueryWarrantyTicketsAsync(
    string serialNo, 
    DateTime? fromDate, 
    CancellationToken ct = default)
{
    const string sql = @"
        SELECT Id, TicketNo, SerialNo, CustomerId, CreatedDate, Status
        FROM WarrantyTickets
        WHERE (@SerialNo IS NULL OR SerialNo = @SerialNo)
          AND (@FromDate IS NULL OR CreatedDate >= @FromDate);
    ";

    var parameters = new DynamicParameters();
    
    // Explicit ANSI varchar matching DB column varchar(50)
    parameters.Add("@SerialNo", serialNo, DbType.AnsiString, size: 50);
    
    // Strongly typed Date
    parameters.Add("@FromDate", fromDate, DbType.Date);

    using (var conn = CreateConnection())
    {
        var cmd = new CommandDefinition(sql, parameters, cancellationToken: ct);
        var rows = await conn.QueryAsync<WarrantyTicketDTO>(cmd);
        return rows.AsList();
    }
}
```
