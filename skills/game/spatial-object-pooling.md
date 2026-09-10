---
name: SpatialObjectPooling
desc: High-performance object pooling pattern for Godot and game engines to recycle projectiles, floating combat text, and particle effects without GC allocation spikes
rules: [R_GAME, R_PERF, R_GODOT]
category: Game
---
# ♻️ Spatial Object Pooling Pattern

**Goal:** Eliminate runtime garbage collection spikes and CPU frame drops by pre-allocating and recycling transient game objects (projectiles, floating damage numbers, impact VFX, audio emitters).

---

## 1. Generic Game Object Pool Implementation

```csharp
using System;
using System.Collections.Generic;
using Godot;

public interface IPoolable
{
    bool IsInPool { get; set; }
    void OnSpawned();
    void OnDespawned();
}

public class NodeObjectPool<T> where T : Node, IPoolable
{
    private readonly Stack<T> _pool;
    private readonly Func<T> _factoryMethod;
    private readonly Node _poolParent;
    private readonly int _maxCapacity;

    public int ActiveCount { get; private set; }
    public int AvailableCount => _pool.Count;

    public NodeObjectPool(Func<T> factoryMethod, Node poolParent, int initialCapacity = 32, int maxCapacity = 256)
    {
        _factoryMethod = factoryMethod ?? throw new ArgumentNullException(nameof(factoryMethod));
        _poolParent = poolParent ?? throw new ArgumentNullException(nameof(poolParent));
        _maxCapacity = maxCapacity;
        _pool = new Stack<T>(initialCapacity);

        // Warm up initial pool
        for (int i = 0; i < initialCapacity; i++)
        {
            var instance = CreateNewInstance();
            instance.IsInPool = true;
            _pool.Push(instance);
        }
    }

    private T CreateNewInstance()
    {
        var item = _factoryMethod();
        item.SetProcess(false);
        item.SetPhysicsProcess(false);
        if (item is CanvasItem ci) ci.Visible = false;
        if (item is Node3D n3d) n3d.Visible = false;
        _poolParent.AddChild(item);
        return item;
    }

    public T Rent()
    {
        T item = _pool.Count > 0 ? _pool.Pop() : CreateNewInstance();

        item.IsInPool = false;
        item.SetProcess(true);
        item.SetPhysicsProcess(true);
        if (item is CanvasItem ci) ci.Visible = true;
        if (item is Node3D n3d) n3d.Visible = true;

        ActiveCount++;
        item.OnSpawned();
        return item;
    }

    public void Return(T item)
    {
        if (item == null || item.IsInPool) return;

        item.OnDespawned();
        item.IsInPool = true;
        item.SetProcess(false);
        item.SetPhysicsProcess(false);
        if (item is CanvasItem ci) ci.Visible = false;
        if (item is Node3D n3d) n3d.Visible = false;

        ActiveCount--;
        if (_pool.Count < _maxCapacity)
        {
            _pool.Push(item);
        }
        else
        {
            item.QueueFree(); // Evict overflow
        }
    }
}
```

---

## 2. Concrete Poolable Projectile (`Projectile.cs`)

```csharp
public partial class Projectile : Area2D, IPoolable
{
    [Export] public float Speed { get; set; } = 800f;
    public bool IsInPool { get; set; }
    
    private Vector2 _velocity;
    private double _lifetime;
    private const double MaxLifetime = 2.0;

    public void OnSpawned()
    {
        _lifetime = 0;
        Monitoring = true;
        Monitorable = true;
    }

    public void OnDespawned()
    {
        Monitoring = false;
        Monitorable = false;
        _velocity = Vector2.Zero;
    }

    public void Fire(Vector2 origin, Vector2 direction)
    {
        GlobalPosition = origin;
        _velocity = direction.Normalized() * Speed;
        Rotation = direction.Angle();
    }

    public override void _PhysicsProcess(double delta)
    {
        GlobalPosition += _velocity * (float)delta;
        _lifetime += delta;

        if (_lifetime >= MaxLifetime)
        {
            // Return back to pool manager instead of QueueFree()
            PoolManager.Instance.Projectiles.Return(this);
        }
    }
}
```

---

## 3. Best Practices & Invariants

1. **Never Call `QueueFree()` on Pooled Entities:** Projectile or damage number scripts must delegate to `pool.Return(this)` when dying or timing out.
2. **Disable Processing When Pooled:** Always turn off `SetProcess(false)` and `SetPhysicsProcess(false)` so inactive objects consume zero CPU ticks.
3. **Reset State Completely in `OnDespawned()`:** Clear all target references, velocities, and timers to prevent state contamination on subsequent spawns.
