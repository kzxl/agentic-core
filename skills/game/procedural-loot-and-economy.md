---
name: ProceduralLootAndEconomy
desc: Procedural ARPG loot generation algorithm with weighted affix rolling and balanced game economy currency sink mechanisms
rules: [R_GAME, R_CORE, R_CS]
category: Game
---
# 💰 Procedural Loot Generation & Economy Sink Pattern

**Goal:** Provide an authoritative procedural loot generation engine supporting weighted drop tables, item rarity tiers, prefix/suffix affix rolling, and an inflation-resistant economy with transaction gold sinks.

---

## 1. Weighted Loot Table Roll Algorithm

```csharp
public enum ItemRarity { Normal, Magic, Rare, Legendary, Mythic }

public class LootDropTable
{
    private readonly List<(string ItemTemplateId, int Weight)> _dropEntries = new();
    private int _totalWeight;

    public void AddEntry(string templateId, int weight)
    {
        if (weight <= 0) return;
        _dropEntries.Add((templateId, weight));
        _totalWeight += weight;
    }

    public string RollDrop(Random rng)
    {
        if (_dropEntries.Count == 0 || _totalWeight == 0) return null;

        int roll = rng.Next(0, _totalWeight);
        int accumulated = 0;

        for (int i = 0; i < _dropEntries.Count; i++)
        {
            accumulated += _dropEntries[i].Weight;
            if (roll < accumulated)
                return _dropEntries[i].ItemTemplateId;
        }

        return _dropEntries[^1].ItemTemplateId;
    }
}
```

---

## 2. Affix Rolling & Item Synthesis Engine

```csharp
public class AffixDefinition
{
    public string Id { get; set; }
    public string Name { get; set; }
    public bool IsPrefix { get; set; } // true = Prefix, false = Suffix
    public string StatKey { get; set; }
    public float MinRoll { get; set; }
    public float MaxRoll { get; set; }
    public int RequiredItemLevel { get; set; }
    public int Weight { get; set; }
}

public class ItemGenerator
{
    public static GeneratedItem RollItem(string baseId, int itemLevel, ItemRarity rarity, List<AffixDefinition> affixPool, Random rng)
    {
        var item = new GeneratedItem
        {
            Id = Guid.NewGuid(),
            BaseTemplateId = baseId,
            ItemLevel = itemLevel,
            Rarity = rarity
        };

        // Determine affix counts based on rarity
        int maxPrefixes = rarity switch
        {
            ItemRarity.Magic => 1,
            ItemRarity.Rare => 3,
            ItemRarity.Legendary => 3,
            _ => 0
        };

        int maxSuffixes = rarity switch
        {
            ItemRarity.Magic => 1,
            ItemRarity.Rare => 3,
            ItemRarity.Legendary => 3,
            _ => 0
        };

        // Filter pool by item level
        var validPrefixes = affixPool.Where(a => a.IsPrefix && a.RequiredItemLevel <= itemLevel).ToList();
        var validSuffixes = affixPool.Where(a => !a.IsPrefix && a.RequiredItemLevel <= itemLevel).ToList();

        // Roll prefixes & suffixes using non-repeating weighted sampling
        RollAffixSlots(item.Prefixes, validPrefixes, maxPrefixes, rng);
        RollAffixSlots(item.Suffixes, validSuffixes, maxSuffixes, rng);

        return item;
    }

    private static void RollAffixSlots(List<RolledAffix> destination, List<AffixDefinition> pool, int count, Random rng)
    {
        var available = new List<AffixDefinition>(pool);
        for (int i = 0; i < count && available.Count > 0; i++)
        {
            int totalWeight = available.Sum(a => a.Weight);
            int roll = rng.Next(0, totalWeight);
            int accum = 0;

            for (int j = 0; j < available.Count; j++)
            {
                accum += available[j].Weight;
                if (roll < accum)
                {
                    var chosen = available[j];
                    float rolledVal = (float)(chosen.MinRoll + (rng.NextDouble() * (chosen.MaxRoll - chosen.MinRoll)));
                    destination.Add(new RolledAffix { AffixId = chosen.Id, Value = rolledVal });
                    available.RemoveAt(j); // Prevent duplicate affix on same item
                    break;
                }
            }
        }
    }
}
```

---

## 3. Economy Gold Sink & Marketplace Anti-Inflation

To prevent hyperinflation common in online RPGs, transactions enforce non-refundable currency sinks:

```csharp
public class MarketEconomyManager
{
    public const float ListingFeePercent = 0.05f; // 5% Gold sink upon posting

    public static long CalculateListingTax(long askingPrice)
    {
        return (long)Math.Ceiling(askingPrice * ListingFeePercent);
    }

    public static bool ProcessListing(PlayerWallet sellerWallet, long price, out long taxPaid)
    {
        taxPaid = CalculateListingTax(price);

        // Deduct upfront gold sink regardless of whether item sells
        if (sellerWallet.Gold < taxPaid)
            return false;

        sellerWallet.DeductGold(taxPaid);
        return true;
    }
}
```

---

## 4. Architectural Rules

1. **Deterministic RNG Seeds for Replay/Verification:** For racing or competitive leagues, pass a seeded `Random` instance tied to map instance seeds to prevent client-side roll manipulation.
2. **Server-Side Exclusivity:** Item generation code runs strictly on the Authoritative Server or `LocalServerBridge`. Clients receive only the finished serialized `ItemDto`.
3. **Immutable Master Pool:** Affix tables are read-only definitions loaded on startup.
