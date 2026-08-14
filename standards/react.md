---
desc: React + TypeScript / Redux Standards
rules: [R_REACT]
---
# ⚛️ React & TypeScript Standards

## 1. Components & Hooks
- **Functional Components ONLY:** Strictly no Class Components.
- **Rule of Hooks:** Hooks called strictly at top level.
- **TypeScript:** Strict `interface` / `type` definitions for Props, Component State, and Redux State.

## 2. State Management (Redux Toolkit / Zustand)
- **Feature Slices:** `features/auth/authSlice.ts`.
- **Async API Operations:** `createAsyncThunk` with centralized `apiClient`.
- **Container-Presenter Pattern:** Avoid binding global state deeply into leaf UI components.

## 3. Realtime & WebSockets
- **Lazy Initialization:** Initialize Socket.IO connection lazily upon authentication.
- **State Synchronization:** Dispatch actions on WebSocket events (`socket.on('entity:update', data => dispatch(updateEntity(data)))`).

## 4. UI & Styling
- Component directory structure: `Component/index.tsx`, `Component/Component.module.css`.
