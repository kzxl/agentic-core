---
name: CsharpDapperBulkDataAccess
desc: High-performance Dapper bulk insert, multi-mapping, and buffered query optimization patterns
rules: [R_CS, R_DB]
category: CSharp
---
# ⚡ C# Dapper High-Performance Data Access Pattern

**Goal:** Execute high-throughput bulk operations, multi-entity mapping (1-to-many, 1-to-1), and parameterized multi-result queries with maximum performance and zero SQL injection vulnerability.

---

## 1. Multi-Result Query Pattern (Header + Details in 1 Network Roundtrip)

```csharp
public async Task<StockReturnDTO> GetStockReturnByIdAsync(int id, CancellationToken cancellationToken = default)
{
    const string sql = @"
        -- 1. Query Header
        SELECT * FROM StockReturns WHERE Id = @Id;
        
        -- 2. Query Details
        SELECT * FROM StockReturnDetails WHERE StockReturnId = @Id;
    ";

    using (var connection = CreateConnection())
    {
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        using (var multi = await connection.QueryMultipleAsync(command))
        {
            var header = await multi.ReadFirstOrDefaultAsync<StockReturnDTO>();
            if (header != null)
            {
                header.Details = (await multi.ReadAsync<StockReturnDetailDTO>()).AsList();
            }
            return header;
        }
    }
}
```

---

## 2. Parameterized Bulk Insert / Update via Transaction

```csharp
public async Task BulkInsertDetailsAsync(int headerId, List<StockReturnDetailActionDTO> details)
{
    const string sql = @"
        INSERT INTO StockReturnDetails 
        (StockReturnId, MaterialId, Quantity, UnitPrice, Note)
        VALUES (@StockReturnId, @MaterialId, @Quantity, @UnitPrice, @Note);
    ";

    using (var connection = CreateConnection())
    {
        await connection.OpenAsync();
        using (var transaction = connection.BeginTransaction())
        {
            try
            {
                var parameters = details.Select(d => new
                {
                    StockReturnId = headerId,
                    d.MaterialId,
                    d.Quantity,
                    d.UnitPrice,
                    d.Note
                });

                await connection.ExecuteAsync(sql, parameters, transaction: transaction);
                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
```
