---
desc: React + TypeScript / Redux Enterprise Standards — Performance, Lifecycle & State Architecture
rules: [R_REACT, R_CORE]
---
# ⚛️ React & TypeScript Enterprise Standards

## 1. Components & Hook Lifecycle
- **Functional Components ONLY:** Strictly no Class Components.
- **TypeScript:** Strict `interface` / `type` for Props, State, and API Payloads (Zero `any`).
- **Race-Condition Defense (AbortController):** All async effects MUST clean up with `AbortController`:
  ```typescript
  useEffect(() => {
    const controller = new AbortController();
    apiClient.get('/data', { signal: controller.signal })
      .then(res => setData(res.data))
      .catch(err => { if (!controller.signal.aborted) setError(err); });
    return () => controller.abort();
  }, [id]);
  ```

## 2. State Architecture & Segregation
- **Server State vs Client State:** Use RTK Query / React Query for server cache; use Zustand / Redux for local UI state. NEVER duplicate server response data into local `useState`.
- **Container-Presenter Pattern:** Keep leaf components purely presentational. Avoid binding global store deep into reusable UI components.

## 3. Render Performance & Virtualization
- **Virtualization Required:** Any table/list with > 100 rows MUST use virtualization (`@tanstack/react-virtual` or `react-window`).
- **Memoization Rules:** Use `useMemo` / `useCallback` for expensive computations and props passed to memoized children. Never allocate inline objects/functions inside high-frequency loops.

## 4. SPA Routing & Zero Inline Redirects
- **Navigation:** Strictly use `useNavigate()` or `<Link>`. NEVER use `window.location.href = ...` (destroys in-memory SPA state).
- **Directory Layout:** `components/FeatureName/index.tsx`, `components/FeatureName/FeatureName.module.css`.

