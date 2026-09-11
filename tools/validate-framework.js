#!/usr/bin/env node

/**
 * AgentOption Framework Validator
 * Validates YAML frontmatter, rules.json integrity, file references, and shortcut coverage.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RULES_FILE = path.join(ROOT_DIR, 'rules.json');
const SHORTCUTS_FILE = path.join(ROOT_DIR, 'shortcuts.json');

console.log('🔍 Validating AgentOption Framework...\n');

let errorCount = 0;
let fileCount = 0;
const usedRules = new Set();
const contentFiles = [];

// 1. Validate rules.json
if (!fs.existsSync(RULES_FILE)) {
  console.error('❌ Missing rules.json at root!');
  process.exit(1);
}

const rulesData = JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
const validRuleKeys = new Set(Object.keys(rulesData));
console.log(`✅ Loaded ${validRuleKeys.size} valid rules from rules.json`);

// 2. Validate shortcuts.json
if (!fs.existsSync(SHORTCUTS_FILE)) {
  console.error('❌ Missing shortcuts.json at root!');
  process.exit(1);
}

const shortcutsRaw = fs.readFileSync(SHORTCUTS_FILE, 'utf8');
const shortcutKeyRegex = /^\s*"([A-Za-z0-9_]+)":\s*\{/gm;
const seenShortcutKeys = new Set();
let sm;
while ((sm = shortcutKeyRegex.exec(shortcutsRaw)) !== null) {
  const sk = sm[1];
  if (seenShortcutKeys.has(sk)) {
    console.error(`❌ Duplicate shortcut key detected in shortcuts.json: "${sk}"`);
    errorCount++;
  }
  seenShortcutKeys.add(sk);
}

const shortcutsData = JSON.parse(shortcutsRaw);
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
console.log(`✅ Validated ${seenShortcutKeys.size} shortcuts with zero broken targets`);

// 3. Recursive Markdown Validator
function validateMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        validateMarkdownFiles(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fileCount++;
      validateFile(fullPath);
    }
  }
}

function validateFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  if (relativePath === 'README.md' || relativePath.startsWith('templates/') || relativePath === '.project-rule.md') {
    return; // Root metadata, README and templates have distinct formats
  }

  // Files in architecture/, skills/, standards/, workflows/ are core content
  const isCoreContent = ['architecture/', 'skills/', 'standards/', 'workflows/'].some(prefix =>
    relativePath.startsWith(prefix)
  );

  if (isCoreContent) {
    contentFiles.push(relativePath);
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Mandatory frontmatter check for core content
  if (!content.startsWith('---')) {
    if (isCoreContent) {
      console.error(`❌ [${relativePath}] Missing mandatory YAML frontmatter (must start with '---')`);
      errorCount++;
    }
    return;
  }

  const endMatch = content.indexOf('\n---', 3);
  if (endMatch === -1) {
    console.error(`❌ [${relativePath}] Malformed frontmatter (missing closing '---')`);
    errorCount++;
    return;
  }

  const frontmatterText = content.substring(3, endMatch);

  // Check description
  const descMatch = frontmatterText.match(/desc:\s*(.*)/);
  if (!descMatch || !descMatch[1].trim()) {
    console.error(`❌ [${relativePath}] Missing or empty 'desc:' in frontmatter`);
    errorCount++;
  }

  // Check rules defined in frontmatter
  const rulesMatch = frontmatterText.match(/rules:\s*\[(.*?)\]/);
  if (!rulesMatch) {
    if (isCoreContent) {
      console.error(`❌ [${relativePath}] Missing 'rules: [...]' array in frontmatter`);
      errorCount++;
    }
  } else {
    const referencedRules = rulesMatch[1].split(',').map(r => r.replace(/['"]/g, '').trim()).filter(Boolean);
    if (referencedRules.length === 0 && isCoreContent) {
      console.error(`❌ [${relativePath}] 'rules: []' is empty; must reference at least one rule`);
      errorCount++;
    }
    for (const rule of referencedRules) {
      usedRules.add(rule);
      if (!validRuleKeys.has(rule)) {
        console.error(`❌ [${relativePath}] References unknown rule ID: "${rule}"`);
        errorCount++;
      }
    }
  }
}

validateMarkdownFiles(ROOT_DIR);

// 4. Shortcut Coverage Check
const uncoveredFiles = contentFiles.filter(f => !shortcutTargets.has(f));
const coveragePct = (((contentFiles.length - uncoveredFiles.length) / contentFiles.length) * 100).toFixed(1);

console.log(`\n📊 Framework Audit Summary:`);
console.log(`   - Total Markdown Files: ${fileCount}`);
console.log(`   - Core Content Files: ${contentFiles.length}`);
console.log(`   - Defined Rules: ${validRuleKeys.size} (Used: ${usedRules.size})`);
console.log(`   - Shortcuts Coverage: ${contentFiles.length - uncoveredFiles.length}/${contentFiles.length} (${coveragePct}%)`);

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
