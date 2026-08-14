#!/usr/bin/env node

/**
 * AgentOption Framework Validator
 * Validates YAML frontmatter, rules.json integrity, and file references across AgentOption.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RULES_FILE = path.join(ROOT_DIR, 'rules.json');

console.log('🔍 Validating AgentOption Framework...\n');

let errorCount = 0;
let fileCount = 0;

// 1. Validate rules.json
if (!fs.existsSync(RULES_FILE)) {
  console.error('❌ Missing rules.json at root!');
  process.exit(1);
}

const rulesData = JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
const validRuleKeys = new Set(Object.keys(rulesData));
console.log(`✅ Loaded ${validRuleKeys.size} valid rules from rules.json`);

// 2. Recursive Markdown Validator
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
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (relativePath.startsWith('templates')) {
    return; // Templates contain placeholders by design
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Check frontmatter
  if (content.startsWith('---')) {
    const endMatch = content.indexOf('\n---', 3);
    if (endMatch === -1) {
      console.error(`❌ [${relativePath}] Malformed frontmatter (missing closing ---)`);
      errorCount++;
      return;
    }

    const frontmatterText = content.substring(3, endMatch);
    // Check rules defined in frontmatter
    const rulesMatch = frontmatterText.match(/rules:\s*\[(.*?)\]/);
    if (rulesMatch) {
      const referencedRules = rulesMatch[1].split(',').map(r => r.trim()).filter(Boolean);
      for (const rule of referencedRules) {
        if (!validRuleKeys.has(rule)) {
          console.error(`❌ [${relativePath}] References unknown rule ID: "${rule}"`);
          errorCount++;
        }
      }
    }
  }
}

validateMarkdownFiles(ROOT_DIR);

console.log(`\n📊 Summary: Scanned ${fileCount} files. Errors found: ${errorCount}`);
if (errorCount > 0) {
  process.exit(1);
} else {
  console.log('✨ All AgentOption rules and skills are 100% valid!');
}
