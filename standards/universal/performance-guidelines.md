---
desc: High-performance data access, anti-N+1, and UI non-blocking guidelines
rules: [R_CORE, R_DB]
---
# ⚡ Universal Performance & Data Access Guidelines

## 1. Quantitative Latency SLOs & Complexity Budgets
| Operation Tier | `p50` Budget | `p95` Budget | `p99` Ceiling | Mandatory Complexity Bound |
| :--- | :--- | :--- | :--- | :--- |
| **In-Memory Lookup / Join** | $\le 0.1\text{ ms}$ | $\le 0.5\text{ ms}$ | $\le 2.0\text{ ms}$ | $O(1)$ per probe via hash index (`Dictionary`/`Map`) |
| **OLTP Point Read / Write** | $\le 5\text{ ms}$ | $\le 20\text{ ms}$ | $\le 50\text{ ms}$ | $1$ DB roundtrip; covering index seek |
| **Batch Grid Query ($\le 500$ rows)** | $\le 25\text{ ms}$ | $\le 80\text{ ms}$ | $\le 200\text{ ms}$ | $\le 2$ DB roundtrips total ($0$ N+1 loops) |
| **Bulk Ingestion ($10,000$ rows)** | $\le 150\text{ ms}$ | $\le 400\text{ ms}$ | $\le 1,000\text{ ms}$ | Set-based TVP / `SqlBulkCopy` / `COPY` |
| **UI Thread Event Handler** | $\le 4\text{ ms}$ | $\le 12\text{ ms}$ | $\le 16.6\text{ ms}$ | $100\%$ non-blocking `async/await` |

---

## 2. Algorithmic Complexity Bounds ($O(N)$ Hash Indexing vs $O(N^2)$ Nested Loops)
- **Invariant:** Nested collection scans (`foreach` inside `foreach`, or `.FirstOrDefault()` / `.Where()` inside a loop) over datasets where $N > 50$ are strictly forbidden. At $N = 10,000$, an $O(N^2)$ loop executes $10^8$ comparisons ($\approx 350\text{ ms}$ CPU spike); pre-indexing into a hash map reduces complexity to $O(N + M)$ ($\approx 0.4\text{ ms}$).

```csharp
// ❌ BAD: O(N * M) nested linear scan inside loop (100,000,000 comparisons at 10k rows)
public void EnrichOrderLinesBad(IReadOnlyList<OrderLineDTO> lines, IReadOnlyList<ProductDTO> products)
{
    foreach (var line in lines)
    {
        var product = products.FirstOrDefault(p => p.Id == line.ProductId); // O(M) scan per row!
        line.ProductName = product?.Name ?? "Unknown";
    }
}

// ✅ GOOD: O(N + M) hash indexing via Dictionary<TKey, TValue> with pre-sized capacity
public void EnrichOrderLinesGood(IReadOnlyList<OrderLineDTO> lines, IReadOnlyList<ProductDTO> products)
{
    var productById = new Dictionary<int, string>(capacity: products.Count);
    foreach (var p in products)
    {
        productById[p.Id] = p.Name;
    }

    foreach (var line in lines)
    {
        line.ProductName = productById.GetValueOrDefault(line.ProductId, "Unknown");
    }
}
```

---

## 3. Batch I/O Over Chatty N+1 Roundtrips
- **Anti-N+1 Rule:** Never execute SQL queries, HTTP calls, or Redis lookups inside a loop. Collect distinct keys first, execute a single batched query (`WHERE Id IN @Ids` or Table-Valued Parameter), and map results in memory.
- **Batch Writes:** Replace row-by-row `INSERT`/`UPDATE` loops with bulk primitives (`Dapper` multi-row batching, SQL Server TVPs, PostgreSQL `UNNEST`, or `SqlBulkCopy`).

```csharp
// ❌ BAD: N+1 network roundtrips inside loop (500 rows * 2ms RTT = 1,000ms network stall)
foreach (var invoice in invoices)
{
    invoice.Lines = await _db.QueryAsync<InvoiceLineDTO>(
        "SELECT * FROM tb_invoice_line WHERE InvoiceId = @Id", new { invoice.Id });
}

// ✅ GOOD: Single batched roundtrip + ILookup grouping (1 RTT = 3ms total)
var invoiceIds = invoices.Select(i => i.Id).Distinct().ToArray();
var allLines = await _db.QueryAsync<InvoiceLineDTO>(
    "SELECT InvoiceId, Sku, Qty, Price FROM tb_invoice_line WHERE InvoiceId IN @Ids",
    new { Ids = invoiceIds });

var linesByInvoice = allLines.ToLookup(x => x.InvoiceId);
foreach (var invoice in invoices)
{
    invoice.Lines = linesByInvoice[invoice.Id].ToList();
}
```

---

## 4. Bounded Memory Streaming & Cache-Locality Principles
- **Bounded Streaming:** Never load unbounded tables or multi-gigabyte files entirely into memory (`File.ReadAllBytes`, unfiltered `SELECT *`). Enforce pagination (`OFFSET/FETCH` or keyset cursor), `IAsyncEnumerable<T>` streaming, and `ArrayPool<byte>.Shared` buffers.
- **Strong Typing Over `DataTable`:** Never pass untyped `System.Data.DataTable` across application layers (`DataTable` incurs $4\times\text{–}8\times$ memory overhead and boxing penalties). Map directly to strongly-typed `List<TDto>` or `readonly record struct`.
- **Cache Locality & Pre-Allocation:** Always initialize `new List<T>(expectedCount)` and `new Dictionary<K, V>(expectedCount)` when cardinality is known to eliminate dynamic array doubling and GC Gen 0/LOH fragmentation.
- **Non-Blocking Concurrency:** Calling `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on incomplete `Task` objects is strictly prohibited across all tiers to prevent thread-pool starvation and synchronization context deadlocks.

