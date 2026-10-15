---
desc: React Render Performance, Virtualization & SPA Routing
rules: [R_REACT, R_CORE]
---
# ⚡ React Performance & SPA Routing Standards

## 1. Quantitative Performance Budgets & Invariants
| Performance Dimension | Mandatory Threshold | Architectural Enforcement |
| :--- | :--- | :--- |
| **DOM Row Virtualization** | Mandatory for $> 100$ items | `@tanstack/react-virtual` with fixed/estimated row heights |
| **Main-Thread Frame Budget** | $\le 16.6\text{ ms}$ per commit ($60\text{ FPS}$) | Offload heavy filtering via `useTransition` / `useDeferredValue` |
| **Initial Route Chunk Size** | $\le 150\text{ KB}$ gzipped per route | Route-level code splitting via `React.lazy()` + `<Suspense>` |
| **Unnecessary Re-renders** | $0$ cascading re-renders on sibling typing | Colocate state or stabilize references passed to `React.memo` |
| **SPA Navigation Latency** | $0$ full-document reloads | Strictly use `<Link>` or `useNavigate()`; ban `window.location.href` |

---

## 2. Referential Stability (`useMemo` & `useCallback` Discipline)
- **When to Memoize:** Apply `useMemo` / `useCallback` strictly for: (1) computations $\ge O(N \log N)$ or $> 250$ items, (2) props passed to `React.memo` subtrees, or (3) Context values and downstream effect dependencies.
- **Anti-Pattern:** Never allocate inline object literals or closures inside high-frequency list loops.

```tsx
// ❌ BAD: Inline object & closure allocation inside loop defeats React.memo on OrderRow
export function OrderTable({ orders, onApprove }: OrderTableProps) {
  return (
    <div>
      {orders.map(order => (
        <MemoizedOrderRow
          key={order.id}
          order={order}
          style={{ padding: 8 }}
          onClick={() => onApprove(order.id)}
        />
      ))}
    </div>
  );
}

// ✅ GOOD: Hoisted style + stable callback preserves React.memo bailout
const ROW_STYLE: React.CSSProperties = { padding: 8 };

export function OrderTable({ orders, onApprove }: OrderTableProps) {
  const handleApprove = useCallback((id: string) => onApprove(id), [onApprove]);
  return (
    <div>
      {orders.map(order => (
        <MemoizedOrderRow key={order.id} order={order} style={ROW_STYLE} onApprove={handleApprove} />
      ))}
    </div>
  );
}
```

---

## 3. List & Grid Virtualization (`> 100` Rows)
- **Invariant:** Any table, log viewer, or dropdown exceeding $100$ rows MUST virtualize its viewport using `@tanstack/react-virtual` (`overscan: 5..10`) to keep live DOM nodes bounded.

```tsx
// ❌ BAD: Mounting 10,000 DOM nodes directly into the document tree
export function AuditLogList({ logs }: { logs: AuditEntry[] }) {
  return <div className="h-[600px] overflow-auto">{logs.map(l => <AuditLogRow key={l.id} entry={l} />)}</div>;
}

// ✅ GOOD: Windowed rendering via @tanstack/react-virtual (~20 DOM nodes mounted)
export function AuditLogList({ logs }: { logs: readonly AuditEntry[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 8,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vRow => (
          <div
            key={logs[vRow.index].id}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              height: `${vRow.size}px`, transform: `translateY(${vRow.start}px)`,
            }}
          >
            <AuditLogRow entry={logs[vRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. Concurrent Rendering (`useTransition` & `useDeferredValue`)
- **Non-Blocking Input:** Decouple urgent typing from expensive list filtering using `useDeferredValue` or `startTransition`.

```tsx
// ✅ GOOD: Urgent input stays at 60 FPS while heavy catalog filtering defers
export function CatalogSearch({ catalog }: { catalog: readonly ProductItem[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => catalog.filter(item => item.sku.includes(deferredQuery)),
    [catalog, deferredQuery]
  );
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <VirtualizedProductGrid items={filtered} isStale={query !== deferredQuery} />
    </>
  );
}
```

---

## 5. Code-Splitting (`React.lazy`) & SPA Routing Preservation
- **Route & Heavy Asset Splitting:** Dynamically load route views and heavy editors (`React.lazy(() => import('./ReportViewer'))`) inside `<Suspense fallback={<PageSkeleton />}>`.
- **SPA Routing Invariant:** Strictly navigate via `<Link>` or `useNavigate()`. Never set `window.location.href`, which destroys the JS heap and clears in-memory caches.

