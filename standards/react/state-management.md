---
desc: React State Architecture — Server State vs Client State Separation
rules: [R_REACT]
---
# 📦 React State Management Architecture Standards

## 1. The 4-Domain State Taxonomy & Quantitative Invariants
Every piece of state in a React application MUST be classified into exactly one of four orthogonal domains. Mixing domains is an architectural violation:

| State Domain | Authorized Tooling | Invariant & Lifecycle Contract |
| :--- | :--- | :--- |
| **1. Server Cache State** | TanStack Query / RTK Query | $0$ duplication into `useState` or Zustand; governed by `staleTime` & query keys |
| **2. Global Client State** | Zustand / Redux Toolkit | Transient UI state only (sidebar, active theme, workspace); atomic selectors mandatory |
| **3. URL Search State** | Router `useSearchParams` | Pagination, sort order, active filters, and selected tab must persist in URL query string |
| **4. Ephemeral Form State** | React Hook Form + Zod | Uncontrolled/isolated input state; schema-validated before mutation dispatch |

---

## 2. Server Cache Sovereignty (TanStack Query & Deterministic Key Factories)
- **Zero Mirroring Invariant:** Never copy data returned from `useQuery` into local `useState` or a global Zustand store. Mirroring breaks background refetching and causes stale UI desynchronization.
- **Deterministic Query-Key Factories:** Centralize query keys per domain module using a hierarchical factory object (`all` $\to$ `lists` $\to$ `list(filters)` $\to$ `details` $\to$ `detail(id)`) so targeted cache invalidations are type-safe and deterministic.
- **Optimistic Updates with Rollback:** Mutations affecting high-frequency interactive UI (`onMutate`) must snapshot previous cache state and restore it in `onError` before invalidating in `onSettled`.

```tsx
// ❌ BAD: Ad-hoc string keys and copying server cache into local useState
export function InventoryEditor({ warehouseId }: { warehouseId: string }) {
  const { data } = useQuery({ queryKey: ['inv', warehouseId], queryFn: () => fetchInv(warehouseId) });
  const [items, setItems] = useState<InventoryDTO[]>([]);
  useEffect(() => { if (data) setItems(data); }, [data]); // Desynchronizes on background refetch!
  return <Grid data={items} />;
}

// ✅ GOOD: Hierarchical Query-Key Factory + direct consumption + optimistic rollback
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (warehouseId: string, filter: string) => [...inventoryKeys.lists(), { warehouseId, filter }] as const,
  detail: (itemId: string) => [...inventoryKeys.all, 'detail', itemId] as const,
};

export function useAdjustStockMutation(warehouseId: string, filter: string) {
  const queryClient = useQueryClient();
  const targetKey = inventoryKeys.list(warehouseId, filter);

  return useMutation({
    mutationFn: (payload: AdjustStockRequest) => inventoryApi.adjustStock(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: targetKey });
      const previous = queryClient.getQueryData<readonly InventoryDTO[]>(targetKey);
      queryClient.setQueryData<readonly InventoryDTO[]>(targetKey, old =>
        old?.map(item => item.id === payload.itemId ? { ...item, qty: payload.newQty } : item) ?? []
      );
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(targetKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
```

---

## 3. Global Client State (Zustand Atomic Selectors)
- **Atomic Subscription Rule:** Consumers of a Zustand store MUST subscribe to a single primitive slice or use `useShallow`. Subscribing to the root store forces re-renders on every unrelated state mutation.

```tsx
// ❌ BAD: Full-store subscription causes re-render whenever ANY store property changes
const { isSidebarOpen } = useWorkspaceStore();

// ✅ GOOD: Atomic selector triggers re-render ONLY when isSidebarOpen toggles
const isSidebarOpen = useWorkspaceStore(state => state.isSidebarOpen);
const toggleSidebar = useWorkspaceStore(state => state.toggleSidebar);
```

---

## 4. URL Search State (`useSearchParams`) & Form State (React Hook Form + Zod)
- **Shareable Deep-Linking:** Pagination (`page`, `pageSize`), sort columns (`sortBy`, `sortDir`), and filters (`q`, `status`) MUST persist in the URL via `useSearchParams` so back/forward navigation and bookmarks restore exact view state.
- **Schema-Driven Forms:** Forms with $\ge 3$ fields MUST use `react-hook-form` + `zodResolver(schema)` instead of controlled `useState` per field.

```tsx
// ✅ GOOD: Type-safe Zod schema + zero-rerender uncontrolled registration
const OrderCreateSchema = z.object({
  customerCode: z.string().min(3).max(32),
  priority: z.enum(['NORMAL', 'URGENT']),
  requestedQty: z.number().int().positive(),
});
type OrderCreateInput = z.infer<typeof OrderCreateSchema>;
```

