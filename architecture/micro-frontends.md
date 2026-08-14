---
name: MicroFrontendArchitecture
desc: Universal Micro-Frontend design blueprint using Module Federation, runtime isolation, and decoupled deployments
rules: [R_CORE, R_REACT]
category: Architecture
---
# 🧩 Micro-Frontend Architecture Blueprint

**Goal:** Break large monolithic web applications (ERP Web, Enterprise Portals, Multi-team Suites) into autonomous, independently deployable frontend applications assembled at runtime.

---

## 1. Core Topologies

```
+-------------------------------------------------------------+
|                     Host / Shell Application                |
|        (Auth, Layout, Theme, Global Navigation, Routing)     |
+-------------------------------------------------------------+
         |                        |                        |
         v (Module Federation)    v (Module Federation)    v
+------------------+     +------------------+     +------------------+
|  Remote App:     |     |  Remote App:     |     |  Remote App:     |
|  InventoryModule |     |  SalesModule     |     |  AuthPortal      |
+------------------+     +------------------+     +------------------+
```

### A. Host (Shell) Container
- Provides authentication state, global navigation bar, sidebar, and routing gateway.
- Lazy-loads remote micro-frontends on demand via Module Federation or dynamic script injection.

### B. Remote Micro-Apps (Features / Domains)
- Can be developed, tested, and deployed independently by dedicated domain teams.
- Exports components (e.g. `InventoryDashboard`, `PackingTable`) via standard manifests.

---

## 2. Shared State & Communication Rules
1. **Loose Coupling via Event Bus / Custom Events:**
   ```javascript
   // Shell dispatches auth change event
   window.dispatchEvent(new CustomEvent('global:auth-changed', { detail: { token, user } }));
   ```
2. **Shared Singletons (Vite / Webpack Module Federation):**
   - Share libraries like `react`, `react-dom`, `react-router-dom` to prevent loading multiple runtime instances into browser memory.

---

## 3. Checklist for Implementation
- [ ] Each micro-frontend can be built and run standalone in development mode.
- [ ] Shell application gracefully handles remote loading failures (Error Boundaries around remote imports).
- [ ] CSS namespacing or CSS Modules used to prevent style pollution across micro-apps.
