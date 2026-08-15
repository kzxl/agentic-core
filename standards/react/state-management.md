---
desc: React State Architecture — Server State vs Client State Separation
rules: [R_REACT]
---
# 📦 React State Architecture

## 1. Server State vs Client State
- **Server Cache:** Use RTK Query / React Query for server cache and mutations.
- **Client State:** Use Zustand or Redux Toolkit for UI-only transient state.
- **Anti-Pattern:** NEVER duplicate server response data into local `useState` (causes state de-synchronization).

## 2. Container-Presenter Pattern
- Keep leaf components purely presentational. Avoid binding global store deep into reusable UI components.
