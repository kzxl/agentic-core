---
desc: React Render Performance, Virtualization & SPA Routing
rules: [R_REACT, R_CORE]
---
# ⚡ React Performance & SPA Routing

## 1. Virtualization (> 100 Items)
- Any list or table with > 100 rows MUST use virtualization (`@tanstack/react-virtual` or `react-window`).

## 2. Render Optimization
- Use `useMemo` / `useCallback` for expensive computations and props passed to memoized children.
- Never allocate inline objects or functions inside high-frequency loops.

## 3. SPA Routing
- Strictly use `useNavigate()` or `<Link>`.
- NEVER use `window.location.href = ...` (destroys in-memory SPA state).
