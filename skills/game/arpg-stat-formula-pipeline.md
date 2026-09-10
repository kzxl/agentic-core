---
name: ArpgStatFormulaPipeline
desc: Multi-stage ARPG attribute calculation pipeline handling Flat, Increased, More, Diminishing Returns, and Hard Caps (Resistances, Leech Rate)
rules: [R_GAME, R_CS]
category: Game
---
# 📊 ARPG Stat Calculation & Attribute Pipeline

**Goal:** Implement the standard multi-stage ARPG stat evaluation pipeline. Guarantees deterministic calculation across Base, Flat, Increased/Reduced (additive), More/Less (multiplicative), diminishing return formulas, and hard caps.

---

## 1. Multi-Stage Modifier Mathematical Model

```
Final Stat = [ (Base + Σ Flat) * (1 + Σ Increased - Σ Reduced) * Π (1 + More_i) * Π (1 - Less_j) ]
Then apply:
1. Diminishing Returns (e.g. Armor Damage Reduction)
2. Hard Clamping: Clamp(Final, MinCap, MaxCap)
```

| Modifier Type | Stacking Rule | Example In-Game Wording |
| :--- | :--- | :--- |
| **Base** | Character innate base | Base Life: 500 |
| **Flat** | Direct scalar addition | `+50 to Maximum Life` |
| **Increased / Reduced** | Additive sum of percentages | `20% increased Life`, `10% reduced Mana` |
| **More / Less** | Multiplicative compound factors | `30% more Physical Damage`, `15% less Damage Taken` |
| **Caps & Thresholds** | Clamped bounds | `Fire Resistance: 75% max cap`, `Leech: 20% Max Life/sec` |

---

## 2. Stat Pipeline Implementation in C#

```csharp
public class StatModifier
{
    public float Flat { get; set; }
    public float IncreasedPercent { get; set; }
    public List<float> MoreMultipliers { get; } = new(4);
    public List<float> LessMultipliers { get; } = new(4);

    public void AddFlat(float val) => Flat += val;
    public void AddIncreased(float percent) => IncreasedPercent += percent;
    public void AddMore(float percent) => MoreMultipliers.Add(percent);
    public void AddLess(float percent) => LessMultipliers.Add(percent);

    public float Calculate(float baseValue, float minCap = float.MinValue, float maxCap = float.MaxValue)
    {
        // 1. Base + Flat
        float total = baseValue + Flat;

        // 2. Additive Percentage: (1 + Σ Increased)
        float additiveFactor = Math.Max(0f, 1f + (IncreasedPercent / 100f));
        total *= additiveFactor;

        // 3. Multiplicative Compounds: Π(1 + More) * Π(1 - Less)
        for (int i = 0; i < MoreMultipliers.Count; i++)
            total *= (1f + (MoreMultipliers[i] / 100f));

        for (int i = 0; i < LessMultipliers.Count; i++)
            total *= Math.Max(0f, 1f - (LessMultipliers[i] / 100f));

        // 4. Hard Cap Clamp
        return Math.Clamp(total, minCap, maxCap);
    }
}
```

---

## 3. Standard ARPG Diminishing Returns & Formulas

### A. Armor Damage Reduction
Armor effectiveness scales with incoming damage hit size to prevent trivializing boss hits:
```csharp
public static float CalculateArmorReduction(float rawDamage, float totalArmor)
{
    if (rawDamage <= 0 || totalArmor <= 0) return 0f;
    
    // Standard Rule: Armor / (Armor + 5 * RawDamage), capped at 90%
    float reduction = totalArmor / (totalArmor + (5f * rawDamage));
    return Math.Clamp(reduction, 0f, 0.90f);
}
```

### B. Elemental Resistances Cap (75% Baseline)
```csharp
public const float DefaultMaxResistance = 75f;
public const float AbsoluteHardCapResistance = 90f;

public static float CalculateEffectiveResistance(float uncappedRes, float bonusMaxRes = 0f)
{
    float currentMax = Math.Min(AbsoluteHardCapResistance, DefaultMaxResistance + bonusMaxRes);
    return Math.Clamp(uncappedRes, -100f, currentMax);
}
```

### C. Life Leech Rate Cap (20% Max Life/sec)
```csharp
public static float CalculateLeechPoolCap(float maxLife, float bonusLeechCapPercent = 0f)
{
    // Baseline cap: 20% of maximum life restored per second
    float maxRatePercent = 0.20f + (bonusLeechCapPercent / 100f);
    return maxLife * maxRatePercent;
}
```

---

## 4. Architectural Rules

1. **Calculate on Mutation, Not on Frame Render:** Stat calculations should run when equipment, passive skill points, or buffs change (Dirty Flag pattern). Cache the result in a `CharacterSheet` structure.
2. **Never Confuse `Increased` with `More`:** Ensure item definitions strictly parse keyword distinctions. Adding `More` as additive or `Increased` as multiplicative breaks game balance exponentially.
3. **Display Uncapped vs Effective:** UI tooltips should show uncapped resistance (e.g. `115% (Capped at 75%)`) to inform players of their over-cap cushion against curses and penetration.
