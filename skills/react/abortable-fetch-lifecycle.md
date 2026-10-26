---
name: ReactAbortableFetchLifecycle
desc: AbortController lifecycle integration in React components and router listeners to prevent memory leaks and race conditions.
rules: [R_REACT]
category: React
---
# 🛑 React Abortable Fetch & Request Cancellation Lifecycle

**Goal:** Eliminate out-of-order response overwrites (stale search results replacing newer ones), memory leaks on unmounted views, and wasted backend CPU by binding every HTTP request to an `AbortSignal`.

---

## 1. Quantitative Request Cancellation Invariants
| Cancellation Boundary | Mandatory Contract | Defect Prevented |
| :--- | :--- | :--- |
| **TanStack Query `queryFn`** | Destructure `{ signal }` and pass to `fetch` / `axios` | Orphaned requests when query keys change rapidly |
| **Custom `useEffect` Fetch** | Instantiate `new AbortController()` & return `() => controller.abort()` | Out-of-order race conditions on rapid filter/tab switches |
| **Error Classification** | Filter out `err.name === 'AbortError'` / `axios.isCancel(err)` | False-positive error banners when user navigates away |
| **Post-Await State Guard** | Check `if (!controller.signal.aborted)` before `setState` in `finally` | Stale `isLoading = false` clobbering a newer active request |

---

## 2. TanStack Query `AbortSignal` Forwarding (Primary Pattern)

When using TanStack Query (`useQuery`), React Query automatically creates an `AbortController` for each query key and aborts it whenever the key changes or all observers unmount—**but only if `signal` is forwarded to the underlying HTTP client**:

```tsx
// ❌ BAD: Ignores QueryFunctionContext.signal — rapid typing in search box fires 10 un-aborted requests!
export function useCustomerSearchBad(searchTerm: string) {
  return useQuery({
    queryKey: ['customers', 'search', searchTerm],
    queryFn: () => apiClient.get<CustomerDTO[]>(`/customers?q=${encodeURIComponent(searchTerm)}`),
  });
}

// ✅ GOOD: Forwards { signal } into HTTP client so superseded requests abort at the TCP/fetch layer
export function useCustomerSearchGood(searchTerm: string) {
  return useQuery({
    queryKey: ['customers', 'search', searchTerm] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<readonly CustomerDTO[]>('/customers', {
        params: { q: searchTerm },
        signal, // Automatically cancels in-flight HTTP call when searchTerm changes!
      });
      return response.data;
    },
    enabled: searchTerm.trim().length >= 2,
  });
}
```

---

## 3. Custom Hook `AbortController` Lifecycle & `AbortError` Discrimination

When authoring a custom imperative fetch hook outside TanStack Query (e.g., streaming file downloads, multi-step probing), enforce deterministic abort cleanup and explicit `AbortError` discrimination:

```tsx
export interface UseAbortableResourceResult<T> {
  readonly data: T | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useAbortableDeviceTelemetry(deviceId: string): UseAbortableResourceResult<DeviceTelemetryDTO> {
  const [data, setData] = useState<DeviceTelemetryDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    async function loadTelemetry() {
      try {
        const res = await fetch(`/api/v1/devices/${encodeURIComponent(deviceId)}/telemetry`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const payload = (await res.json()) as DeviceTelemetryDTO;
        if (!controller.signal.aborted) {
          setData(payload);
        }
      } catch (err: unknown) {
        // Strictly ignore expected cancellation exceptions
        if (controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        // Never clear loading state if this effect was superseded by a newer deviceId!
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTelemetry();
    return () => controller.abort();
  }, [deviceId]);

  return { data, isLoading, error };
}
```

---

## 4. Timeout Composition via `AbortSignal.any` & `AbortSignal.timeout`
Combine component unmount cancellation with a hard per-request timeout using modern Web standard `AbortSignal.any`:
```ts
const signal = AbortSignal.any([
  controller.signal,
  AbortSignal.timeout(10_000), // Hard 10-second timeout
]);
```

