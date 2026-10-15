---
name: MicroFrontendArchitecture
desc: Universal Micro-Frontend design blueprint using Module Federation, runtime isolation, and decoupled deployments
rules: [R_CORE, R_REACT]
category: Architecture
---
# 🧩 Micro-Frontend Architecture Blueprint

**Goal:** Decompose monolithic enterprise web suites into independently deployable domain micro-applications composed at runtime with strict fault isolation, shared singleton governance, and zero CSS bleed (`[R_CORE, R_REACT]`).

---

## 1. Runtime Composition & Performance Invariants

| Architectural Dimension | Mandatory Target / Invariant | Enforcement Mechanism | Violation Impact |
| :--- | :--- | :--- | :--- |
| **Shared Runtime Singletons** | Exactly `1` instance of `react`, `react-dom`, `@tanstack/react-query` | Module Federation `singleton: true, strictVersion: true` | Invalid Hook Call crash & duplicate virtual DOM memory |
| **Remote Entry Initial Payload** | `< 15 KB` (`remoteEntry.js` manifest) + `< 120 KB` gzipped chunk | Code-splitting + tree-shaken exposed modules | Multi-second route transitions across domain boundaries |
| **Fault Blast Radius** | `0` Shell crashes when a Remote CDN or bundle fails | Per-Remote `<RemoteBoundary>` + timeout fallback | Single team's broken deploy brings down entire ERP portal |
| **Cross-App Coupling** | `0` direct cross-remote imports (`@sales/internal/*` forbidden) | Typed host contract props + versioned CustomEvent bus | Distributed monolith with synchronized release lockstep |
| **Style Isolation** | `100%` scoped selectors + shared CSS custom properties (`--ds-*`) | CSS Modules / Tailwind prefixing per remote | Global `.btn` or `.modal` overrides corrupt sibling micro-apps |

### Core Topology Rules
1. **Shell Boundary:** The Host Shell owns auth tokens, top-level navigation, toasts, and theme CSS variables (`--ds-*`), with zero domain logic.
2. **Contract Mounting:** Remotes expose route/widget entry points (`./InventoryApp`) accepting a versioned `MicroAppContractProps` interface.
3. **Sub-Route Sync:** The Shell owns the top-level prefix (`/inventory/*`), while the Remote syncs sub-routes without hijacking global `window.history`.

---

## 2. Failure Modes & Anti-Patterns

- **Dual React Instance Collision:** Omitting `singleton: true` in Module Federation causes a remote to bundle a second copy of React (`Invalid hook call`).
- **Immutable `remoteEntry.js` Caching:** Caching `remoteEntry.js` with `immutable` prevents the Shell from discovering new deployment hashes (`remoteEntry.js` MUST use `Cache-Control: no-cache, must-revalidate`).
- **Cross-Remote Store Sharing:** Passing mutable Redux/Zustand stores across remotes creates tight schema lockstep across teams.

---

## 3. Production Implementation: Fault-Isolated Module Federation

```tsx
// ❌ BAD: Unprotected lazy import crashes entire Shell if Remote CDN is offline; leaks global store
const RemoteInventory = React.lazy(() => import('inventoryRemote/InventoryApp'));
export const BadShell = ({ store }: { store: AnyStore }) => (
  <Suspense fallback={<div />}><RemoteInventory store={store} /></Suspense>
);
```

```typescript
// ✅ GOOD: 1. Strict Singleton Negotiation (rspack.config.ts)
new ModuleFederationPlugin({
  name: 'erp_shell',
  remotes: { inventory: 'inventory@https://cdn.corp.internal/mfe/inventory/remoteEntry.js' },
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
    '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
  },
});
```
```tsx
// ✅ GOOD: 2. Resilient Remote Boundary & Versioned Host Contract
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

export interface MicroAppContractProps {
  readonly basePath: string;
  readonly tenantId: string;
  readonly getAccessToken: () => Promise<string>;
  readonly onNavigateExternal: (path: string) => void;
}

export class RemoteMicroAppBoundary extends Component<
  { appName: string; children: ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };
  static getDerivedStateFromError(): { hasError: boolean } { return { hasError: true }; }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[MFE_BOUNDARY] Remote '${this.props.appName}' failed:`, error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <section role="alert" className="p-4 border border-red-300 rounded bg-red-50">
        <h2 className="font-semibold text-red-900">Module Unavailable ({this.props.appName})</h2>
        <button onClick={() => this.setState({ hasError: false })} className="mt-2 px-3 py-1 bg-red-800 text-white rounded">
          Retry Module
        </button>
      </section>
    );
  }
}
```
