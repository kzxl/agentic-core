---
name: ServerAuthoritativeBridge
desc: Concrete Host-Client architectural bridge separating game presentation from authoritative simulation logic across singleplayer in-process and multiplayer socket connections
rules: [R_GAME, R_CORE, R_CS]
category: Game
---
# 🌉 Server-Authoritative Bridge Pattern

**Goal:** Provide a unified communication bridge (`IServerBridge`) that decouples presentation views (Godot/Unity UI & render components) from authoritative simulation logic. Enable seamless switching between in-process singleplayer host mode (zero latency, zero network serialization) and multiplayer dedicated server mode without modifying presentation code.

---

## 1. Unified Bridge Interface (`IServerBridge.cs`)

```csharp
public interface IServerBridge
{
    bool IsConnected { get; }
    
    // Character & Session Management
    Task<CharacterData> LoadOrCreateCharacterAsync(string characterName, string characterClass);
    Task<bool> SaveCharacterProgressAsync(CharacterData character);
    
    // Authoritative Combat & Loot Commands
    Task<LootDropResult> GenerateLootAsync(string zoneId, int monsterLevel, int monsterRarity);
    Task<CraftingResult> ExecuteCraftingAsync(Guid characterId, string recipeId, List<Guid> ingredientIds);
    Task<MarketActionResult> PostMarketListingAsync(Guid characterId, Guid itemId, long price, string currency);
    
    // Realtime Gameplay Event Notifications
    event Action<CombatEventDto> OnCombatEventReceived;
    event Action<WorldStateSnapshotDto> OnWorldSnapshotReceived;
}
```

---

## 2. In-Process Host Bridge (`LocalServerBridge.cs`)

Used for singleplayer, offline gameplay, and automated unit testing:

```csharp
public class LocalServerBridge : IServerBridge
{
    private readonly EmbeddedServerSession _serverSession;
    public bool IsConnected => _serverSession != null;

    public event Action<CombatEventDto> OnCombatEventReceived;
    public event Action<WorldStateSnapshotDto> OnWorldSnapshotReceived;

    public LocalServerBridge(EmbeddedServerSession session)
    {
        _serverSession = session ?? throw new ArgumentNullException(nameof(session));
    }

    public async Task<CharacterData> LoadOrCreateCharacterAsync(string characterName, string characterClass)
    {
        // Executes directly against in-memory GameWorld / SQLite EF Core without socket overhead
        return await _serverSession.CharacterService.GetOrCreateAsync(characterName, characterClass);
    }

    public async Task<LootDropResult> GenerateLootAsync(string zoneId, int monsterLevel, int monsterRarity)
    {
        return await _serverSession.LootService.RollLootAsync(zoneId, monsterLevel, monsterRarity);
    }

    public async Task<CraftingResult> ExecuteCraftingAsync(Guid characterId, string recipeId, List<Guid> ingredientIds)
    {
        return await _serverSession.ForgeService.CraftItemAsync(characterId, recipeId, ingredientIds);
    }

    public async Task<MarketActionResult> PostMarketListingAsync(Guid characterId, Guid itemId, long price, string currency)
    {
        return await _serverSession.MarketService.CreateListingAsync(characterId, itemId, price, currency);
    }

    public async Task<bool> SaveCharacterProgressAsync(CharacterData character)
    {
        return await _serverSession.CharacterService.SaveAsync(character);
    }
}
```

---

## 3. Remote Dedicated Server Bridge (`RemoteServerBridge.cs`)

Used for online multiplayer deployments (WebSockets, ENet, TCP/UDP):

```csharp
public class RemoteServerBridge : IServerBridge
{
    private readonly INetworkClient _networkClient;
    public bool IsConnected => _networkClient.IsConnected;

    public event Action<CombatEventDto> OnCombatEventReceived;
    public event Action<WorldStateSnapshotDto> OnWorldSnapshotReceived;

    public RemoteServerBridge(INetworkClient networkClient)
    {
        _networkClient = networkClient;
        _networkClient.RegisterHandler<CombatEventDto>(pkt => OnCombatEventReceived?.Invoke(pkt));
        _networkClient.RegisterHandler<WorldStateSnapshotDto>(pkt => OnWorldSnapshotReceived?.Invoke(pkt));
    }

    public async Task<LootDropResult> GenerateLootAsync(string zoneId, int monsterLevel, int monsterRarity)
    {
        var request = new LootRequestPacket { ZoneId = zoneId, Level = monsterLevel, Rarity = monsterRarity };
        return await _networkClient.SendRequestAsync<LootDropResult>(request);
    }

    // Other methods delegate transparently via network packets...
}
```

---

## 4. Architectural Rules

1. **Strictly One-Way Flow:** UI and Presentation nodes call methods on `IServerBridge` to issue commands. They NEVER mutate health, gold, or items locally.
2. **Deterministic Fallbacks:** If a network operation fails or times out, the bridge returns a structured `Result<T>` with an error code, allowing the UI to rollback optimistic mutations.
3. **No Engine Imports in Session:** The underlying `EmbeddedServerSession` must have zero dependencies on engine visual assemblies (Godot, Unity).
