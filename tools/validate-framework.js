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
  walkMarkdownFiles
} = require('./lib/framework-core');

console.log('🔍 Validating AgentOption Framework...\n');

let errorCount = 0;
let fileCount = 0;
const usedRules = new Set();
const contentFiles = [];

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

// 5. Recursive Markdown Validator
const CORE_PREFIXES = ['architecture/', 'standards/', 'skills/', 'agents/'];

function isSkillPackageSubResource(relativePath) {
  return /^skills\/[^/]+\/(?:references|examples|resources)\/.+\.md$/.test(relativePath);
}

function validateFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
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
  }

  const content = fs.readFileSync(filePath, 'utf8');
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

// 6. Shortcut Coverage Check (treating skill sub-resources as covered if parent SKILL.md is covered)
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
console.log(`   - Defined Rules: ${validRuleKeys.size} (Used: ${usedRules.size})`);
console.log(`   - Shortcuts Coverage: ${coveredCount}/${contentFiles.length} (${coveragePct}%)`);

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

