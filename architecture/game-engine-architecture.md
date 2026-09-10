---
name: GameEngineArchitecture
desc: Universal architectural blueprint for game engines and ARPG/MMO systems featuring Host-Client decoupling, deterministic fixed-timestep simulation, and state reconciliation
rules: [R_GAME, R_CORE]
category: Architecture
---
# 🎮 Universal Game Engine & Simulation Architecture Blueprint

**Goal:** Establish an industrial-grade, deterministic, and modular architectural standard for game development. Decouple authoritative simulation from presentation views, supporting zero-latency singleplayer (In-Process Host) and scalable multiplayer (Dedicated Server) under the exact same game logic.

```
+---------------------------------------------------------------------------------+
|                               Presentation Layer                                |
|        (Godot/Unity Nodes, Camera, Audio, VFX, HUD Modals, Input Handlers)       |
+---------------------------------------------------------------------------------+
                                       │ (Sends Commands / Inputs)
                                       ▼
+---------------------------------------------------------------------------------+
|                       Server Bridge Boundary (IServerBridge)                    |
|       ┌──────────────────────────────────────┴──────────────────────────────────┐
|       ▼                                                                         ▼
|  [LocalServerBridge]                                                   [RemoteServerBridge]
|  (In-Process 0ms Latency)                                              (Multiplayer UDP/Socket)
+---------------------------------------------------------------------------------+
        │                                                                         │
        ▼                                                                         ▼
+─────────────────────────────────────────────────────────────────────────────────+
|                           Authoritative Simulation Core                         |
|  - GameWorld / ECS Registry / Spatial Grid                                      |
|  - Fixed-Timestep Physics & Logic Tick Loop (e.g. 50Hz / 60Hz)                  |
|  - Authoritative Combat, Progression, Loot, Inventory, & Economy Services        |
+─────────────────────────────────────────────────────────────────────────────────+
        │                                                                         │
        ▼                                                                         ▼
+─────────────────────────────────────────────────────────────────────────────────+
|                         Persistence & Master Data Layer                         |
|  - Master Data Static Tables (Seeders, Item Affixes, Drop Curves, Skill Trees)   |
|  - Relational / Document Store (SQLite EF Core, Local DB, Cloud DB)             |
+─────────────────────────────────────────────────────────────────────────────────+
```

---

## 1. Core Architectural Pillars

### A. Host-Client Architecture (Unified Core)
- **Single Source of Truth (SSoT):** Game logic (damage calculation, loot rolling, inventory operations, cooldowns) is strictly authoritative. The client presentation never calculates its own rewards or authoritative health.
- **Pluggable Bridge Contract (`IServerBridge`):**
  - In **Singleplayer / Dev Mode**: Simulation runs in-process inside `LocalServerBridge` (zero serialization overhead, instant debugging, fully playable offline).
  - In **Multiplayer Mode**: The exact same calls route through `RemoteServerBridge` using packet serialization (WebSockets, ENet, LiteNetLib) without changing any UI or presentation code.

### B. Simulation vs. Presentation Decoupling
- **Simulation Layer (Core):** Pure C# / engine-agnostic classes. No references to Godot `Node`, Unity `MonoBehaviour`, or GPU shaders. Easily unit-tested in CLI test runners without rendering context.
- **Presentation Layer (View):** Responsible only for interpolating positions, playing animations, rendering particle effects, playing SFX, and receiving player raw inputs.

### C. Fixed Timestep Tick vs. Variable Render Interpolation
- **Simulation Loop (Fixed Delta `Δt_sim`):** Runs at fixed intervals (e.g., 20ms = 50 TPS or 16.6ms = 60 TPS). Accumulated time advances in fixed quanta to guarantee deterministic physics, cooldowns, and collision math.
- **Render Loop (Variable Delta `Δt_render`):** Runs as fast as hardware permits (60Hz, 144Hz, 240Hz). Renders entity visual positions via linear interpolation (`lerp`) between the previous tick state and the current tick state.

```
Visual Position = lerp(PreviousTickState.Position, CurrentTickState.Position, Accumulator / FixedDelta)
```

---

## 2. State Synchronization & Reconciliation

| Strategy | Usage Scenario | Description |
| :--- | :--- | :--- |
| **Server-Authoritative with Prediction** | Player Movement & Basic Attacks | Client executes immediately to provide snappy responsiveness, logs input to history buffer, and snaps/smooths when authoritative snapshot arrives. |
| **Server-Authoritative Confirmed** | Inventory, Loot Pickup, Trading, Crafting | Client shows optimistic state or loading indicator; state mutation completes only upon server ACK to prevent dupe exploits. |
| **Snapshot Interpolation** | Remote Enemies & Other Players | Buffer incoming snapshots (50–100ms) and smoothly interpolate positions between buffered ticks. |

---

## 3. Master Data & Entity Persistence

1. **Master Data Registry (Immutable Catalog):**
   - Game definitions (Monsters, Items, Skill Trees, Affixes, Recipes) are immutable, versioned, and loaded into fast in-memory lookup caches (`IReadOnlyDictionary<string, T>`) on startup.
   - Seeded from verified JSON/CSV or relational tables during database bootstrap.
2. **Dynamic Entity State (Mutable Persistence):**
   - Player characters, active inventories, and marketplace listings are persisted via transactional operations (e.g., SQLite EF Core with WAL mode or ACID SQL).
   - Write operations are asynchronous and isolated from the hot gameplay simulation tick.

---

## 4. Performance & Memory Invariants

- **Zero Allocations in Simulation Tick:** No heap allocations (`new`), no LINQ queries (`.Where()`, `.Select()`), and no string formatting inside the game tick or render loop.
- **Object Pooling:** Projectiles, floating combat damage numbers, and particle systems must be acquired from and returned to pre-allocated pools.
- **Spatial Partitioning:** Avoid brute-force $O(N^2)$ distance checks. Use 2D/3D Spatial Grids, QuadTrees, or BVH (Bounding Volume Hierarchy) for entity queries and area-of-effect (AoE) damage resolution.
