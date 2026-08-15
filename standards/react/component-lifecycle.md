---
desc: React Component Lifecycle, TypeScript Contracts & AbortController Race Defense
rules: [R_REACT]
---
# ⚛️ React Component Lifecycle Standards

## 1. Functional Components & Types
- Functional Components ONLY (Zero Class Components).
- Strict TypeScript `interface` / `type` for Props and State (Zero `any`).

## 2. Race-Condition Defense (AbortController)
- All async effects MUST clean up with `AbortController`:
  ```typescript
  useEffect(() => {
    const controller = new AbortController();
    apiClient.get('/data', { signal: controller.signal })
      .then(res => setData(res.data))
      .catch(err => { if (!controller.signal.aborted) setError(err); });
    return () => controller.abort();
  }, [id]);
  ```
