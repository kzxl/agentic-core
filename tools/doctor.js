#!/usr/bin/env node

/**
 * AgentOption Project Doctor
 * Validates a target repository against its .project-rule.md and AgentOption standards.
 * Usage: node doctor.js [target_repo_path]
 */

const fs = require('fs');
const path = require('path');
const {
  ROOT_DIR,
  loadRules,
  loadShortcuts,
  parseFrontmatter,
  parseCliArgs
} = require('./lib/framework-core');

const parsedArgs = parseCliArgs(process.argv.slice(2));
const targetPath = parsedArgs.positional[0]
  ? path.resolve(parsedArgs.positional[0])
  : process.cwd();
const ruleFile = path.join(targetPath, '.project-rule.md');

console.log(`🩺 Running AgentOption Project Doctor on: ${targetPath}\n`);

if (!fs.existsSync(ruleFile)) {
  console.error('❌ Missing .project-rule.md in target repository!');
  console.log('👉 Create one using [AgentOption]/templates/project-bootstrap-template.md');
  process.exit(1);
}

let errorCount = 0;
const ruleContent = fs.readFileSync(ruleFile, 'utf8');
console.log('✅ Found .project-rule.md');

const fm = parseFrontmatter(ruleContent);
if (!fm.hasFrontmatter || fm.malformed) {
  console.error('❌ Malformed or missing YAML frontmatter in .project-rule.md');
  process.exit(1);
}

let rulesMap = {};
let shortcutsMap = {};
try {
  rulesMap = loadRules(ROOT_DIR);
  shortcutsMap = loadShortcuts(ROOT_DIR);
} catch (err) {
  console.error(`❌ Failed to load AgentOption registries: ${err.message}`);
  process.exit(1);
}

const projectName = fm.project_name || '';
const primaryLang = fm.primary_language || 'Unknown';
const architecture = fm.architecture || 'Unknown';

if (!projectName) {
  console.error('❌ Missing mandatory "project_name" in .project-rule.md');
  errorCount++;
}

console.log(`📦 Project Name: ${projectName || 'Unknown'}`);
console.log(`💻 Primary Language: ${primaryLang}`);
console.log(`🏛️ Architecture: ${architecture}`);

// Verify bound rules
if (!fm.hasRules || fm.rules.length === 0) {
  console.error('❌ Missing or empty "rules: [...]" in .project-rule.md');
  errorCount++;
} else {
  console.log(`📜 Active Rules (${fm.rules.length}): [${fm.rules.join(', ')}]`);
  for (const r of fm.rules) {
    if (!rulesMap[r]) {
      console.error(`   ❌ Unknown rule bound in .project-rule.md: "${r}"`);
      errorCount++;
    }
  }
}

// Verify bound shortcuts
if (fm.shortcuts.length > 0) {
  console.log(`⚡ Active Shortcuts (${fm.shortcuts.length}): [${fm.shortcuts.join(', ')}]`);
  for (const s of fm.shortcuts) {
    if (!shortcutsMap[s]) {
      console.error(`   ❌ Unknown shortcut bound in .project-rule.md: "${s}"`);
      errorCount++;
    }
  }
}

// Verify key_paths existence on disk
const keyPaths = fm.key_paths || {};
const keyPathEntries = Object.entries(keyPaths);
if (keyPathEntries.length > 0) {
  console.log('\n🗺️ Key Paths Index:');
  for (const [k, relPath] of keyPathEntries) {
    const resolvedPath = path.resolve(targetPath, relPath);
    if (fs.existsSync(resolvedPath)) {
      console.log(`   ✅ ${k}: ${relPath}`);
    } else {
      console.error(`   ❌ ${k}: ${relPath} (NOT FOUND on disk)`);
      errorCount++;
    }
  }
}

if (errorCount > 0) {
  console.error(`\n❌ Doctor detected ${errorCount} compliance error(s)!`);
  process.exit(1);
}

console.log('\n✨ Project is properly configured and 100% compliant with AgentOption baseline!');
process.exit(0);


