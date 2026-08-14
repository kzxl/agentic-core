---
desc: Conformance Testing Standard — Verify module behavioral parity
rules: [R_UNIVERSE]
source: Universe Architecture v4.0 — conformance/spec.yaml
---

**Goal:** Verify module isolation & behavioral parity qua automated tests.

**Test Categories:**
1. **Registry Core**: Register → Dispatch → expected output
2. **EventBus**: Subscribe → Publish → handler called / Unsubscribe → handler NOT called
3. **Middleware Pipeline**: Ordered execution, error catching
4. **Enterprise Scenario**: Business flow end-to-end (Sales→Inventory→Notification)

**Spec Format (YAML):**
```yaml
tests:
  - name: "Register and dispatch calculator add"
    register: ["calculator"]
    dispatch: { module: "calculator", command: "add", args: ["10", "25"] }
    expect_contains: "10 + 25 = 35"
```

**Module Isolation Test (PowerShell — CI):**
```powershell
# Delete feature folder → build → pass?
$features = Get-ChildItem "Features/" -Directory
foreach ($f in $features) {
    $backup = "$f.FullName.bak"
    Rename-Item $f.FullName $backup
    $result = dotnet build --no-restore 2>&1
    Rename-Item $backup $f.FullName
    if ($LASTEXITCODE -ne 0) { Write-Error "ISOLATION FAIL: $($f.Name)" }
}
```

**Data Sovereignty Test (grep):**
```powershell
# Grep Service files → no cross-module entity references
# VD: Sales/Service không được reference Inventory entities
rg "tb_inventory_" Features/Sales/ --type cs
# Kết quả phải = 0 matches
```

**Ref:** `[AgentOption]/architecture/universe-plugin.md`
