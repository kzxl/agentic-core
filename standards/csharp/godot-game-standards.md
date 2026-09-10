---
desc: Godot 4 & .NET C# Engineering Standards — Node Lifecycle, Zero-Alloc Hot Loops, Signal Hygiene, and Component Composition
rules: [R_GODOT, R_GAME, R_CS]
---
# 🎮 Godot 4 & C# Game Development Standards

## 1. Node Lifecycle Invariants

| Lifecycle Method | Purpose & Permitted Actions | Prohibited Actions |
| :--- | :--- | :--- |
| **`_EnterTree()`** | Register to tree-level singletons or internal services. | Heavy IO, searching scene tree nodes (children not yet ready). |
| **`_Ready()`** | Cache child node references (`GetNode<T>()`), wire signals, initial setup. | Heavy network calls blocking main thread. |
| **`_PhysicsProcess(double delta)`** | Authoritative physics, character kinematic velocity (`MoveAndSlide()`), collision queries. | Non-physics visual animations, camera rotation, UI layout recalculations. |
| **`_Process(double delta)`** | Camera tracking, visual smoothing, particle effects, UI animations. | Mutating authoritative gameplay state or physics velocity. |
| **`_ExitTree()`** | Disconnect all signals, dispose unmanaged buffers, return pooled instances. | Retaining dangling delegates or references to freed tree nodes. |

---

## 2. Zero-Allocation Hot Path Rules (`_Process` & `_PhysicsProcess`)

The simulation tick and render loop execute up to 240+ times per second. Any garbage collection (GC) allocation causes frame drops (stutter):
- **STRICTLY NO LINQ:** Prohibit `.Where()`, `.Select()`, `.OrderBy()`, `.ToList()`, `.ToArray()` inside `_Process`, `_PhysicsProcess`, or frequently invoked collision callbacks. Use indexed `for` loops.
- **NO String Formatting / Concatenation:** Avoid `$"{score}"` or `a + b` every frame. Update UI labels only when the underlying value actually changes (dirty flag or event-driven).
- **NO Struct Boxing:** Avoid passing structs to methods taking `object` or storing them in non-generic `ArrayList`.
- **Pre-Allocate Collections:** Initialize `List<T>` with capacity (`new List<T>(64)`) and invoke `.Clear()` instead of instantiating new collections every tick.
- **Use Spatial Object Pooling:** Always pool projectiles, floating combat text, visual damage numbers, and impact particles.

---

## 3. Signal & Event Subscription Hygiene

Dangling signal connections keep freed Godot nodes in memory and trigger `ObjectDisposedException` on dead instances:
```csharp
// CORRECT: Clean unhooking in _ExitTree
public override void _Ready()
{
    _healthComponent.Died += OnDied;
}

public override void _ExitTree()
{
    if (_healthComponent != null)
    {
        _healthComponent.Died -= OnDied;
    }
}
```
- When using Godot C# Signals (`[Signal]`), prefer connecting via Godot method pointers or standard C# `event Action` for pure C# components.
- Always disconnect external event subscriptions when the node exits the scene tree.

---

## 4. Node Composition Over Deep Inheritance

Favor shallow inheritance trees combined with modular component nodes:
- **Root Node:** Extends `CharacterBody2D` or `CharacterBody3D`.
- **Child Components:** Add focused helper nodes rather than inheriting a monolithic base:
  - `HealthComponent` (manages HP, shields, damage events).
  - `HitboxComponent` (handles incoming hurtbox area overlaps).
  - `CombatController` (manages skill cooldowns and projectile casting).
  - `StatusEffectContainer` (manages buffs, debuffs, burning, stuns).

---

## 5. UI / HUD Architecture (CanvasLayer Isolation)

- **CanvasLayer Root:** All HUD elements and modal dialogs must reside inside a dedicated `CanvasLayer` to prevent camera parallax or transform interference.
- **Controller-Modal Pattern:**
  - Dedicated `HudController` routes top-level hotkeys (`I`, `K`, `C`, `B`, `Tab`, `Escape`).
  - Each modal (`InventoryModal`, `SkillsModal`, `StatsModal`) is an autonomous View responsible for its own widgets and layouts.
  - Modals interact with game state strictly through the authoritative `IServerBridge`, not by reaching into world entities directly.
- **Input Consumption:** Modals must capture input (`GetViewport().SetInputAsHandled()`) when focused or open to prevent player movement or combat attacks from clicking through UI windows.

---

## 6. Resource Preloading & Type-Safe Instantiation

- Preload scenes as `PackedScene` in static fields or export them:
```csharp
[Export] public PackedScene ProjectileScene { get; set; }

public void SpawnProjectile(Vector2 position, Vector2 direction)
{
    var projectile = ProjectileScene.Instantiate<Projectile>();
    GetTree().Root.AddChild(projectile);
    projectile.GlobalPosition = position;
    projectile.Initialize(direction);
}
```
- Always use generic `Instantiate<T>()` instead of casting untyped `Node`.
