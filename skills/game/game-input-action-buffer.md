---
name: GameInputActionBuffer
desc: Action buffering and input queueing architecture with Coyote Time and 8-direction Virtual Radial Wheel navigation for responsive keyboard and gamepad controls
rules: [R_GAME, R_GODOT]
category: Game
---
# 🎮 Game Input Action Buffer & Radial Navigation

**Goal:** Ensure crisp, responsive character controls by implementing an input action buffer (preventing dropped skill inputs during animation locks) and an 8-direction virtual radial wheel menu for unified Keyboard and Gamepad navigation.

---

## 1. Input Buffer & Coyote Time Pipeline

```csharp
public class ActionBuffer
{
    private string _bufferedAction;
    private double _bufferTimer;
    private readonly double _bufferWindowSeconds;

    public ActionBuffer(double bufferWindowSeconds = 0.15) // Default 150ms buffer
    {
        _bufferWindowSeconds = bufferWindowSeconds;
    }

    public void BufferAction(string actionName)
    {
        _bufferedAction = actionName;
        _bufferTimer = _bufferWindowSeconds;
    }

    public void Update(double delta)
    {
        if (_bufferTimer > 0)
        {
            _bufferTimer -= delta;
            if (_bufferTimer <= 0)
            {
                _bufferedAction = null;
            }
        }
    }

    public bool TryConsumeAction(string actionName)
    {
        if (_bufferedAction == actionName && _bufferTimer > 0)
        {
            _bufferedAction = null;
            _bufferTimer = 0;
            return true;
        }
        return false;
    }

    public bool HasBufferedAction(out string action)
    {
        if (_bufferTimer > 0 && !string.IsNullOrEmpty(_bufferedAction))
        {
            action = _bufferedAction;
            return true;
        }
        action = null;
        return false;
    }
}
```

---

## 2. 8-Direction Virtual Radial Wheel Navigation

Maps analog sticks or 8-way mouse vectors into discrete menu/ability slots:

```csharp
public static class RadialMenuNavigation
{
    public static readonly string[] Slots8Way = new[]
    {
        "Up (North)",            // Slot 0: 0°
        "Up-Right (North-East)",  // Slot 1: 45°
        "Right (East)",           // Slot 2: 90°
        "Down-Right (South-East)",// Slot 3: 135°
        "Down (South)",           // Slot 4: 180°
        "Down-Left (South-West)", // Slot 5: 225°
        "Left (West)",            // Slot 6: 270°
        "Up-Left (North-West)"    // Slot 7: 315°
    };

    public static int GetSelectedSectorIndex(Vector2 inputDirection, float deadzone = 0.25f)
    {
        if (inputDirection.LengthSquared() < deadzone * deadzone)
            return -1; // Center / No selection

        // Convert vector angle to degrees (0 to 360)
        float angleDeg = Mathf.RadToDeg(inputDirection.Angle());
        // Offset so North (0, -1) starts at 0°
        float adjustedAngle = Mathf.PosMod(angleDeg + 90f, 360f);

        // 8 sectors: 360 / 8 = 45° each. Shift by 22.5° for centered wedges
        int sector = (int)MathF.Floor((adjustedAngle + 22.5f) / 45f) % 8;
        return sector;
    }
}
```

---

## 3. Integrating Input Buffer into Character Controller

```csharp
public partial class PlayerInputHandler : Node
{
    private ActionBuffer _buffer = new(0.18); // 180ms buffer

    public override void _UnhandledInput(InputEvent @event)
    {
        if (@event.IsActionPressed("attack_primary"))
            _buffer.BufferAction("attack_primary");
        else if (@event.IsActionPressed("skill_dash"))
            _buffer.BufferAction("skill_dash");
        else if (@event.IsActionPressed("skill_ultimate"))
            _buffer.BufferAction("skill_ultimate");
    }

    public override void _Process(double delta)
    {
        _buffer.Update(delta);
    }

    public bool TryExecuteAction(string action)
    {
        return _buffer.TryConsumeAction(action);
    }
}
```

---

## 4. Architectural Rules

1. **Keep Buffer Windows Short (120ms - 200ms):** A buffer window greater than 250ms feels sluggish or gives the player the impression the character acted on outdated intent.
2. **Clear Buffer on Hard Interrupts:** When the character is stunned, knocked back, or killed, immediately invoke `_buffer.Clear()` to avoid executing stale abilities upon recovery.
3. **Deadzone Verification:** Always guard analog stick and mouse delta inputs against small noise deadzones before triggering sector selections in radial menus.
