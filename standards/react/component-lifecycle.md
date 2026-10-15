---
desc: React Component Lifecycle, TypeScript Contracts & AbortController Race Defense
rules: [R_REACT]
---
# ⚛️ React Component Lifecycle Standards

## 1. Quantitative Invariants & Metrics
| Metric / Constraint | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Component Size Limit** | $\le 200$ LOC per file | Extract sub-components or custom hooks (`use*`) when exceeded |
| **Props Interface Arity** | $\le 8$ distinct props | Group cohesive domain properties or compose via `children` / slots |
| **Hook Nesting Depth** | Top-level component body only | ESLint `react-hooks/rules-of-hooks` (`error`) |
| **Type Safety** | $0$ occurrences of `any` or `@ts-ignore` | `tsconfig.json` (`"strict": true`, `"noImplicitAny": true`) |
| **Derived State `useEffect`** | $0$ state-sync effects | Compute synchronously during render or memoize via `useMemo` |

---

## 2. Single-Responsibility Functional Components & Custom Hooks
- **Functional Components Only:** Class components are strictly prohibited outside top-level Error Boundaries.
- **Explicit TypeScript Contracts:** Define exported `interface <Component>Props` for all inputs (`0` `any`).
- **Custom Hook Extraction:** Any stateful orchestration combining $\ge 2$ hooks (`useState` + `useEffect` / `useRef`) MUST be extracted into a dedicated custom hook (`useShipmentDetails`, `useDebouncedFilter`).

```tsx
// ❌ BAD: Untyped component mixing raw fetch lifecycle and presentation
export function ShipmentTracker({ shipmentId }: { shipmentId: any }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/shipments/${shipmentId}`).then(r => r.json()).then(setData);
  }, [shipmentId]);
  return <div>{data?.status}</div>;
}

// ✅ GOOD: Strict TypeScript contract + extracted custom hook
export interface ShipmentTrackerProps {
  readonly shipmentId: string;
  readonly onStatusChange?: (status: ShipmentStatus) => void;
}

export function ShipmentTracker({ shipmentId, onStatusChange }: ShipmentTrackerProps) {
  const { shipment, isLoading, error } = useShipmentDetails(shipmentId, onStatusChange);
  if (error) return <ShipmentErrorState message={error.message} />;
  if (isLoading || !shipment) return <ShipmentSkeleton />;
  return <ShipmentStatusBadge status={shipment.status} updatedAt={shipment.updatedAt} />;
}
```

---

## 3. Eliminating Derived-State `useEffect` Anti-Patterns
- **Invariant:** Never store values in `useState` that can be deterministically computed from existing props or state during render. Synchronizing derived values inside `useEffect` causes redundant double-renders and transient state tearing.
- **Identity Reset:** Pass `key={entityId}` to reset child state cleanly on ID transitions instead of calling `setState` inside `useEffect`.

```tsx
// ❌ BAD: Redundant derived state synchronized via useEffect (double render + tearing)
function InvoiceSummary({ items, taxRate }: InvoiceSummaryProps) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    setTotal(subtotal * (1 + taxRate));
  }, [items, taxRate]);
  return <span>{total.toFixed(2)}</span>;
}

// ✅ GOOD: Synchronous derivation during render (zero extra renders)
function InvoiceSummary({ items, taxRate }: InvoiceSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal * (1 + taxRate);
  return <span>{total.toFixed(2)}</span>;
}
```

---

## 4. Race-Condition Defense (`AbortController` Cleanup)
- **Invariant:** Every raw async effect (`fetch`, `axios`, WebSocket, `setInterval`, DOM listener) MUST return a cleanup closure that aborts in-flight requests when dependencies change or the component unmounts, preventing out-of-order response overwrites.

```tsx
// ❌ BAD: Unmanaged async effect vulnerable to out-of-order response overwrites
useEffect(() => {
  apiClient.get<InventoryItem>(`/inventory/${itemId}`).then(res => setItem(res.data));
}, [itemId]);

// ✅ GOOD: Deterministic AbortController cancellation and abort-aware error guard
useEffect(() => {
  const controller = new AbortController();
  setIsLoading(true);

  apiClient.get<InventoryItem>(`/inventory/${itemId}`, { signal: controller.signal })
    .then(res => { if (!controller.signal.aborted) setItem(res.data); })
    .catch((err: unknown) => {
      if (!controller.signal.aborted) setError(err instanceof Error ? err : new Error(String(err)));
    })
    .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });

  return () => controller.abort();
}, [itemId]);
```

---

## 5. Fault Isolation via React Error Boundaries
- **Granular Containment:** Wrap route-level views and independent dashboard widgets in `<ErrorBoundary fallbackRender={...} onReset={...}>` so uncaught render exceptions in a single widget never white-screen the entire SPA shell.

