---
name: HierarchicalFiniteStateMachine
desc: High-performance Hierarchical Finite State Machine (HFSM) pattern for game entities, player combat controllers, and AI behaviors with transition guards and action buffering
rules: [R_GAME, R_CS]
category: Game
---
# 🕹️ Hierarchical Finite State Machine (HFSM) Pattern

**Goal:** Provide a zero-allocation, robust State Machine architecture for game entities (Player, Bosses, Enemies) that cleanly isolates behaviors (Idle, Run, Attack, HitStun, Death) while supporting transition guards, hierarchical sub-states, and buffered inputs.

---

## 1. Core State Interface & Abstract State

```csharp
public interface IState<TContext>
{
    void Enter(TContext context);
    void Update(TContext context, double delta);
    void PhysicsUpdate(TContext context, double delta);
    void Exit(TContext context);
    bool CanTransitionTo(IState<TContext> nextState, TContext context);
}

public abstract class BaseState<TContext> : IState<TContext>
{
    public virtual void Enter(TContext context) { }
    public virtual void Update(TContext context, double delta) { }
    public virtual void PhysicsUpdate(TContext context, double delta) { }
    public virtual void Exit(TContext context) { }
    public virtual bool CanTransitionTo(IState<TContext> nextState, TContext context) => true;
}
```

---

## 2. Generic State Machine Controller

```csharp
public class StateMachine<TContext>
{
    private readonly TContext _context;
    public IState<TContext> CurrentState { get; private set; }
    public IState<TContext> PreviousState { get; private set; }

    public event Action<IState<TContext>, IState<TContext>> OnStateChanged;

    public StateMachine(TContext context, IState<TContext> initialState)
    {
        _context = context;
        CurrentState = initialState ?? throw new ArgumentNullException(nameof(initialState));
        CurrentState.Enter(_context);
    }

    public bool ChangeState(IState<TContext> nextState)
    {
        if (nextState == null || nextState == CurrentState)
            return false;

        // Transition Guard check
        if (!CurrentState.CanTransitionTo(nextState, _context))
            return false;

        PreviousState = CurrentState;
        CurrentState.Exit(_context);

        CurrentState = nextState;
        CurrentState.Enter(_context);

        OnStateChanged?.Invoke(PreviousState, CurrentState);
        return true;
    }

    public void Update(double delta) => CurrentState.Update(_context, delta);
    public void PhysicsUpdate(double delta) => CurrentState.PhysicsUpdate(_context, delta);
}
```

---

## 3. Concrete ARPG Combat States

```csharp
// 1. Idle State
public class IdleState : BaseState<PlayerController>
{
    public override void Enter(PlayerController player)
    {
        player.PlayAnimation("idle");
    }

    public override void Update(PlayerController player, double delta)
    {
        if (player.InputVector.LengthSquared() > 0.01f)
            player.StateMachine.ChangeState(player.RunState);
        else if (player.IsAttackPressed)
            player.StateMachine.ChangeState(player.AttackState);
    }
}

// 2. Attack State with Animation Lock & Buffer
public class AttackState : BaseState<PlayerController>
{
    private double _elapsedTime;
    private const double AttackDuration = 0.45;
    private const double RecoveryThreshold = 0.30;

    public override void Enter(PlayerController player)
    {
        _elapsedTime = 0;
        player.PlayAnimation("attack_1");
        player.SpawnAttackHitbox();
    }

    public override void Update(PlayerController player, double delta)
    {
        _elapsedTime += delta;
        if (_elapsedTime >= AttackDuration)
        {
            player.StateMachine.ChangeState(player.IdleState);
        }
    }

    public override bool CanTransitionTo(IState<PlayerController> nextState, PlayerController player)
    {
        // Can be interrupted immediately by HitStun or Death
        if (nextState is HitStunState || nextState is DeadState)
            return true;

        // Cannot cancel attack before recovery window
        return _elapsedTime >= RecoveryThreshold;
    }
}
```

---

## 4. Architectural Rules

1. **Pre-Instantiate States:** Create all state instances upfront (e.g. in the controller constructor or `_Ready()`). NEVER call `new AttackState()` during runtime state transitions to maintain zero GC allocations.
2. **Transition Authority:** Keep state conditions inside `CanTransitionTo` guards rather than cluttering external scripts with boolean flags.
3. **Strict Teardown:** Reset timers and cancel buffered inputs inside `Exit()` to prevent state leakage.
