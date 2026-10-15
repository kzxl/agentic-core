#!/usr/bin/env node

/**
 * AgentOption Framework Validator
 * Validates YAML frontmatter, rules.json & shortcuts.json integrity,
 * .project-rule.md compliance, orphaned .bak files, and shortcut coverage.
 */

const fs = require('fs');
const path = require('path');
const {
  ROOT_DIR,
  loadRules,
  loadShortcuts,
  parseFrontmatter,
  walkMarkdownFiles,
  parseCliArgs
} = require('./lib/framework-core');

const { flags } = parseCliArgs(process.argv.slice(2));
const profileMode = Boolean(flags.profile);

console.log('🔍 Validating AgentOption Framework...\n');

let errorCount = 0;
let fileCount = 0;
let checkedLinkCount = 0;
const usedRules = new Set();
const contentFiles = [];

const MIN_STANDARD_BYTES = 1500;
const layerStats = {
  'architecture/': { files: 0, bytes: 0, tokens: 0, minBytes: Infinity, maxBytes: 0 },
  'standards/': { files: 0, bytes: 0, tokens: 0, minBytes: Infinity, maxBytes: 0 },
  'skills/': { files: 0, bytes: 0, tokens: 0, minBytes: Infinity, maxBytes: 0 },
  'agents/': { files: 0, bytes: 0, tokens: 0, minBytes: Infinity, maxBytes: 0 }
};

// 1. Validate rules.json
let rulesData = {};
try {
  rulesData = loadRules(ROOT_DIR);
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}

if (Array.isArray(rulesData._duplicates) && rulesData._duplicates.length > 0) {
  for (const dup of rulesData._duplicates) {
    console.error(`❌ Duplicate rule key detected in rules.json: "${dup}"`);
    errorCount++;
  }
}

const validRuleKeys = new Set(Object.keys(rulesData));
console.log(`✅ Loaded ${validRuleKeys.size} valid rules from rules.json`);

// 2. Validate shortcuts.json
let shortcutsData = {};
try {
  shortcutsData = loadShortcuts(ROOT_DIR);
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}

if (Array.isArray(shortcutsData._duplicates) && shortcutsData._duplicates.length > 0) {
  for (const dup of shortcutsData._duplicates) {
    console.error(`❌ Duplicate shortcut key detected in shortcuts.json: "${dup}"`);
    errorCount++;
  }
}

const validShortcutKeys = new Set(Object.keys(shortcutsData));
const shortcutTargets = new Set();

for (const [sKey, sVal] of Object.entries(shortcutsData)) {
  if (!sVal.target) {
    console.error(`❌ Shortcut "${sKey}" missing target path`);
    errorCount++;
  } else {
    const normalizedTarget = sVal.target.replace(/\\/g, '/');
    shortcutTargets.add(normalizedTarget);
    const absTarget = path.join(ROOT_DIR, sVal.target);
    if (!fs.existsSync(absTarget)) {
      console.error(`❌ Shortcut "${sKey}" points to non-existent target: "${sVal.target}"`);
      errorCount++;
    }
  }
  if (!sVal.name || !sVal.desc) {
    console.error(`❌ Shortcut "${sKey}" missing name or desc`);
    errorCount++;
  }
}
console.log(`✅ Validated ${validShortcutKeys.size} shortcuts`);

// 3. Scan for orphaned .bak files across repository
function scanOrphanedBakFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      scanOrphanedBakFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.bak')) {
      const rel = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
      console.error(`❌ Orphaned .bak file detected: "${rel}"`);
      errorCount++;
    }
  }
}

scanOrphanedBakFiles(ROOT_DIR);

// 4. Validate .project-rule.md
const projectRuleFile = path.join(ROOT_DIR, '.project-rule.md');
if (!fs.existsSync(projectRuleFile)) {
  console.error('❌ Missing .project-rule.md at repository root!');
  errorCount++;
} else {
  const prContent = fs.readFileSync(projectRuleFile, 'utf8');
  const prFm = parseFrontmatter(prContent);
  if (!prFm.hasFrontmatter || prFm.malformed) {
    console.error('❌ [.project-rule.md] Missing or malformed YAML frontmatter');
    errorCount++;
  } else {
    for (const r of prFm.rules) {
      usedRules.add(r);
      if (!validRuleKeys.has(r)) {
        console.error(`❌ [.project-rule.md] References unknown rule ID: "${r}"`);
        errorCount++;
      }
    }
    for (const s of prFm.shortcuts) {
      if (!validShortcutKeys.has(s)) {
        console.error(`❌ [.project-rule.md] References unknown shortcut ID: "${s}"`);
        errorCount++;
      }
    }
    for (const [k, relTarget] of Object.entries(prFm.key_paths || {})) {
      const absKeyPath = path.join(ROOT_DIR, relTarget);
      if (!fs.existsSync(absKeyPath)) {
        console.error(`❌ [.project-rule.md] key_paths.${k} points to non-existent path: "${relTarget}"`);
        errorCount++;
      }
    }
  }
}

// 5. Internal Markdown Link Validator
function verifyMarkdownLinks(filePath, relativePath, content) {
  if (relativePath.startsWith('templates/')) return;

  // Strip fenced code blocks and inline code spans to avoid matching example links
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\r\n]+`/g, '');

  const linkRegex = /!?\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(stripped)) !== null) {
    const rawTarget = match[1].trim().replace(/\s+["'][^"']*["']$/, '');
    if (!rawTarget) continue;

    // Ignore external protocols, anchors, and template placeholders
    if (
      /^(?:https?:|mailto:|conversation:|#)/i.test(rawTarget) ||
      rawTarget.includes('[AgentOption]') ||
      /[<>{}*]/.test(rawTarget)
    ) {
      continue;
    }

    const withoutAnchor = rawTarget.split('#')[0].trim();
    if (!withoutAnchor) continue;

    let resolvedPath = null;
    try {
      if (/^file:\/\/\//i.test(withoutAnchor)) {
        const decoded = decodeURIComponent(withoutAnchor.replace(/^file:\/\/\//i, ''));
        resolvedPath = path.normalize(decoded);
      } else {
        const decoded = decodeURIComponent(withoutAnchor);
        const relToFile = path.resolve(path.dirname(filePath), decoded);
        if (fs.existsSync(relToFile)) {
          resolvedPath = relToFile;
        } else {
          resolvedPath = path.resolve(ROOT_DIR, decoded);
        }
      }
    } catch {
      resolvedPath = path.resolve(path.dirname(filePath), withoutAnchor);
    }

    checkedLinkCount++;
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      console.error(`❌ [${relativePath}] Broken markdown link target: "${rawTarget}"`);
      errorCount++;
    }
  }
}

// 6. Recursive Markdown Validator & Depth Profiler
const CORE_PREFIXES = ['architecture/', 'standards/', 'skills/', 'agents/'];

function isSkillPackageSubResource(relativePath) {
  return /^skills\/[^/]+\/(?:references|examples|resources)\/.+\.md$/.test(relativePath);
}

function recordLayerProfile(relativePath, byteLength) {
  for (const prefix of CORE_PREFIXES) {
    if (relativePath.startsWith(prefix)) {
      const stat = layerStats[prefix];
      stat.files++;
      stat.bytes += byteLength;
      stat.tokens += Math.ceil(byteLength / 4);
      if (byteLength < stat.minBytes) stat.minBytes = byteLength;
      if (byteLength > stat.maxBytes) stat.maxBytes = byteLength;
      break;
    }
  }
}

function validateFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const byteLength = Buffer.byteLength(content, 'utf8');

  verifyMarkdownLinks(filePath, relativePath, content);

  if (
    relativePath === 'README.md' ||
    relativePath.startsWith('templates/') ||
    relativePath === '.project-rule.md' ||
    relativePath.startsWith('docs/')
  ) {
    return;
  }

  const isCoreContent = CORE_PREFIXES.some(prefix => relativePath.startsWith(prefix));
  if (isCoreContent) {
    contentFiles.push(relativePath);
    recordLayerProfile(relativePath, byteLength);
  }

  // Enforce baseline minimum depth on standards/
  if (relativePath.startsWith('standards/') && byteLength < MIN_STANDARD_BYTES) {
    console.error(
      `❌ [${relativePath}] Standard file below minimum depth (${byteLength} bytes < ${MIN_STANDARD_BYTES} bytes)`
    );
    errorCount++;
  }

  const fm = parseFrontmatter(content);

  if (!fm.hasFrontmatter) {
    if (isCoreContent) {
      console.error(`❌ [${relativePath}] Missing mandatory YAML frontmatter (must start with '---')`);
      errorCount++;
    }
    return;
  }

  if (fm.malformed) {
    console.error(`❌ [${relativePath}] Malformed frontmatter (missing closing '---')`);
    errorCount++;
    return;
  }

  const descValue = fm.desc || fm.description;
  if (!descValue || !descValue.trim()) {
    console.error(`❌ [${relativePath}] Missing or empty 'desc:' (or 'description:') in frontmatter`);
    errorCount++;
  }

  if (!fm.hasRules) {
    if (isCoreContent) {
      console.error(`❌ [${relativePath}] Missing 'rules: [...]' array in frontmatter`);
      errorCount++;
    }
  } else {
    if (fm.rules.length === 0 && isCoreContent) {
      console.error(`❌ [${relativePath}] 'rules: []' is empty; must reference at least one rule`);
      errorCount++;
    }
    for (const rule of fm.rules) {
      usedRules.add(rule);
      if (!validRuleKeys.has(rule)) {
        console.error(`❌ [${relativePath}] References unknown rule ID: "${rule}"`);
        errorCount++;
      }
    }
  }

  if (fm.hasShortcuts || relativePath.startsWith('agents/')) {
    for (const sc of fm.shortcuts) {
      if (!validShortcutKeys.has(sc)) {
        console.error(`❌ [${relativePath}] References unknown shortcut ID: "${sc}"`);
        errorCount++;
      }
    }
  }
}

function validateMarkdownFiles(dir) {
  walkMarkdownFiles(dir, {
    onFile: fullPath => {
      fileCount++;
      validateFile(fullPath);
    }
  });
}

validateMarkdownFiles(ROOT_DIR);

// 7. SSoT Vital Metrics Sync Verification (README.md vs Disk)
function verifyReadmeVitalMetrics() {
  const readmePath = path.join(ROOT_DIR, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.error('❌ Missing README.md at repository root!');
    errorCount++;
    return;
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const expectedMetrics = {
    'Agent Personas & Specialist Roles': layerStats['agents/'].files,
    'Architectural Blueprints': layerStats['architecture/'].files,
    'Language & Enterprise Standards': layerStats['standards/'].files,
    'Universal Machine Rules': validRuleKeys.size,
    'Agent Quick-Routing Shortcuts': validShortcutKeys.size
  };

  const parsedMetrics = {};
  const rowRegex = /^\|\s*\*\*([^*]+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|/gm;
  let match;
  while ((match = rowRegex.exec(readmeContent)) !== null) {
    parsedMetrics[match[1].trim()] = parseInt(match[2], 10);
  }

  for (const [metricName, actualCount] of Object.entries(expectedMetrics)) {
    if (!(metricName in parsedMetrics)) {
      console.error(`❌ [README.md] Missing Vital Metric row in table: "${metricName}"`);
      errorCount++;
    } else if (parsedMetrics[metricName] !== actualCount) {
      console.error(
        `❌ [README.md] Vital Metric out of sync for "${metricName}": documented ${parsedMetrics[metricName]}, actual ${actualCount}`
      );
      errorCount++;
    }
  }
}

verifyReadmeVitalMetrics();

// 8. Shortcut Coverage Check (treating skill sub-resources as covered if parent SKILL.md is covered)
const uncoveredFiles = contentFiles.filter(f => {
  if (shortcutTargets.has(f)) return false;
  if (isSkillPackageSubResource(f)) {
    const parentSkill = f.split('/').slice(0, 2).join('/') + '/SKILL.md';
    if (shortcutTargets.has(parentSkill)) return false;
  }
  return true;
});

const coveredCount = contentFiles.length - uncoveredFiles.length;
const coveragePct = contentFiles.length > 0
  ? ((coveredCount / contentFiles.length) * 100).toFixed(1)
  : '100.0';

console.log(`\n📊 Framework Audit Summary:`);
console.log(`   - Total Markdown Files: ${fileCount}`);
console.log(`   - Core Content Files: ${contentFiles.length}`);
console.log(`   - Internal Links Verified: ${checkedLinkCount}`);
console.log(`   - Defined Rules: ${validRuleKeys.size} (Used: ${usedRules.size})`);
console.log(`   - Shortcuts Coverage: ${coveredCount}/${contentFiles.length} (${coveragePct}%)`);

if (profileMode) {
  console.log(`\n📐 Layer-by-Layer Token & Depth Profile (--profile):`);
  let totalCoreBytes = 0;
  let totalCoreTokens = 0;
  for (const [layer, stat] of Object.entries(layerStats)) {
    totalCoreBytes += stat.bytes;
    totalCoreTokens += stat.tokens;
    const minKb = stat.files > 0 ? (stat.minBytes / 1024).toFixed(2) : '0.00';
    const maxKb = stat.files > 0 ? (stat.maxBytes / 1024).toFixed(2) : '0.00';
    const avgTokens = stat.files > 0 ? Math.round(stat.tokens / stat.files) : 0;
    console.log(
      `   - ${layer.padEnd(14)} | Files: ${String(stat.files).padStart(2)} | Bytes: ${String(stat.bytes).padStart(7)} | Est. Tokens: ~${String(stat.tokens).padStart(6)} (avg ~${avgTokens}/file, range ${minKb}KB–${maxKb}KB)`
    );
  }
  console.log(
    `   - TOTAL CORE     | Files: ${String(contentFiles.length).padStart(2)} | Bytes: ${String(totalCoreBytes).padStart(7)} | Est. Tokens: ~${String(totalCoreTokens).padStart(6)}`
  );
}

if (uncoveredFiles.length > 0) {
  console.log(`   ⚠️ Content files without shortcut:`);
  uncoveredFiles.forEach(f => console.log(`      - ${f}`));
}

const unusedRules = [...validRuleKeys].filter(r => !usedRules.has(r));
if (unusedRules.length > 0) {
  console.log(`   ⚠️ Unused rules in rules.json: ${unusedRules.join(', ')}`);
}

console.log(`\nErrors found: ${errorCount}`);
if (errorCount > 0) {
  process.exit(1);
} else {
  console.log('✨ All AgentOption rules, skills, and shortcuts are 100% valid!');
}


