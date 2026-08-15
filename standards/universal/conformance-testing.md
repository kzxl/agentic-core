---
desc: Conformance Testing Standard — Verify module isolation and behavioral parity
rules: [R_UNIVERSE, R_CORE]
---
# 🧪 Conformance Testing Standard

## 1. Test Categories
1. **Registry Core:** Register &rarr; Dispatch &rarr; verify expected output.
2. **EventBus:** Subscribe &rarr; Publish &rarr; handler called / Unsubscribe &rarr; handler NOT called.
3. **Middleware Pipeline:** Ordered execution and error catching.
4. **Enterprise Scenario:** Business flow end-to-end (Sales &rarr; Inventory &rarr; Notification).

## 2. Module Isolation Test (PowerShell CI)
```powershell
# Delete/Rename feature folder -> build -> must pass!
$features = Get-ChildItem "Features/" -Directory
foreach ($f in $features) {
    $backup = "$f.FullName.bak"
    Rename-Item $f.FullName $backup
    $result = dotnet build --no-restore 2>&1
    Rename-Item $backup $f.FullName
    if ($LASTEXITCODE -ne 0) { Write-Error "ISOLATION FAIL: $($f.Name)" }
}
```

## 3. Data Sovereignty Test (Grep)
```powershell
# Grep Service files -> zero cross-module direct table references
rg "tb_inventory_" Features/Sales/ --type cs
# Result must equal 0 matches!
```
