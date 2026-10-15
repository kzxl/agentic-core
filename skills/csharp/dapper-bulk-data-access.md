---
name: CsharpDapperBulkDataAccess
desc: High-performance Dapper bulk insert, multi-mapping, and buffered query optimization patterns
rules: [R_CS, R_DB]
category: CSharp
---
# ⚡ C# Dapper High-Throughput Data Access Protocol

**Goal:** Maximize SQL Server / PostgreSQL data access throughput in C# using `QueryMultipleAsync` (zero cartesian explosion), Table-Valued Parameters (`AsTableValuedParameter`), `DbString` ANSI index seeks, and unbuffered streaming.

---

## 1. Quantitative Dapper Performance Invariants
| Operation Pattern | Mandatory Mechanism | Performance Impact |
| :--- | :--- | :--- |
| **1-to-Many Aggregate Read** | `QueryMultipleAsync` ($1$ RTT, multiple result sets) | Eliminates `LEFT JOIN` row duplication & network bloat |
| **Batch Writes ($> 20$ rows)** | `DataTable.AsTableValuedParameter("dbo.udt_*")` | $1$ roundtrip vs $N$ roundtrips ($15\times\text{–}40\times$ faster) |
| **`VARCHAR` Column Filtering** | `new DbString { Value = v, IsAnsi = true, Length = N }` | Prevents `CONVERT_IMPLICIT` full index scans |
| **Large Export ($> 10,000$ rows)** | `CommandFlags.None` (Unbuffered `IAsyncEnumerable`) | Avoids Gen 2 / LOH memory spikes |
| **Dynamic `IN (@Ids)` Lists** | Cap at $\le 500$ items or pass via TVP | Prevents SQL query-plan cache pollution |

---

## 2. Eliminating `CONVERT_IMPLICIT` Index Scans with `DbString`

By default, Dapper binds C# `string` properties as SQL `NVARCHAR(4000)`. When comparing against a `VARCHAR(32)` indexed column (such as `DocumentNo`, `Barcode`, or `Sku`), SQL Server's type precedence rules force `CONVERT_IMPLICIT(NVARCHAR(4000), [Sku])` on every row in the table, degrading a $0.1\text{ ms}$ `Index Seek` into a $400\text{ ms}$ `Index Scan`.

```csharp
// ❌ BAD: Default C# string binds as NVARCHAR(4000), causing CONVERT_IMPLICIT scan on VARCHAR(32) index
var item = await conn.QueryFirstOrDefaultAsync<ProductDTO>(
    "SELECT Id, Sku, Price FROM tb_product WHERE Sku = @Sku",
    new { Sku = skuCode });

// ✅ GOOD: Explicit ANSI DbString with fixed column length guarantees a pure B-Tree Index Seek
var parameters = new
{
    Sku = new DbString { Value = skuCode, IsAnsi = true, IsFixedLength = false, Length = 32 }
};
var cmd = new CommandDefinition(
    "SELECT Id, Sku, Price FROM tb_product WHERE Sku = @Sku",
    parameters,
    cancellationToken: ct);
var item = await conn.QueryFirstOrDefaultAsync<ProductDTO>(cmd);
```

---

## 3. Set-Based Batch Writes via Table-Valued Parameters (TVP)

Passing `IEnumerable<T>` directly to `connection.ExecuteAsync(sql, items)` in Dapper still executes $N$ individual SQL `INSERT` statements over $N$ roundtrips inside a loop. For batch writes ($> 20$ rows), bind a strongly-typed SQL Server User-Defined Table Type (`TVP`) for a true single-statement set operation:

```csharp
// ❌ BAD: Dapper ExecuteAsync(sql, list) executes 1,000 separate INSERT statements one by one!
await conn.ExecuteAsync(
    "INSERT INTO tb_stock_detail (HeaderId, MaterialId, Qty) VALUES (@HeaderId, @MaterialId, @Qty)",
    detailsList, transaction: tx);

// ✅ GOOD: Single-roundtrip set-based INSERT using Table-Valued Parameter (TVP)
public async Task BulkUpsertStockDetailsAsync(
    int headerId,
    IReadOnlyList<StockDetailSaveDTO> lines,
    IDbTransaction tx,
    CancellationToken ct)
{
    using var tvpTable = new DataTable();
    tvpTable.Columns.Add("MaterialId", typeof(int));
    tvpTable.Columns.Add("Quantity", typeof(decimal));
    tvpTable.Columns.Add("UnitPrice", typeof(decimal));

    foreach (var line in lines)
    {
        tvpTable.Rows.Add(line.MaterialId, line.Quantity, line.UnitPrice);
    }

    const string sql = @"
        INSERT INTO dbo.tb_stock_detail (HeaderId, MaterialId, Quantity, UnitPrice)
        SELECT @HeaderId, t.MaterialId, t.Quantity, t.UnitPrice
        FROM @Lines AS t;";

    var args = new
    {
        HeaderId = headerId,
        Lines = tvpTable.AsTableValuedParameter("dbo.udt_StockDetailItem")
    };

    var cmd = new CommandDefinition(sql, args, transaction: tx, cancellationToken: ct);
    await tx.Connection!.ExecuteAsync(cmd);
}
```

---

## 4. `QueryMultipleAsync` & Unbuffered Streaming
- **1-to-Many Aggregates (`QueryMultipleAsync`):** Fetch header and child detail collections in a single `CommandDefinition` containing multiple `SELECT` statements rather than a `LEFT JOIN` that duplicates wide header columns across hundreds of child rows.
- **Unbuffered Streaming (`CommandFlags.None`):** When streaming $> 10,000$ rows to an Excel/CSV export or background pipeline, pass `flags: CommandFlags.None` to `CommandDefinition` so Dapper yields records lazily from the `DbDataReader` without buffering the entire list in RAM.

