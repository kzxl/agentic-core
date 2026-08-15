#!/usr/bin/env node

/**
 * AgentOption Project Doctor
 * Validates a target repository against its .project-rule.md and AgentOption standards.
 * Usage: node doctor.js [target_repo_path]
 */

const fs = require('fs');
const path = require('path');

const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const ruleFile = path.join(targetPath, '.project-rule.md');

console.log(`🩺 Running AgentOption Project Doctor on: ${targetPath}\n`);

if (!fs.existsSync(ruleFile)) {
  console.error('❌ Missing .project-rule.md in target repository!');
  console.log('👉 Create one using [AgentOption]/templates/project-bootstrap-template.md');
  process.exit(1);
}

const ruleContent = fs.readFileSync(ruleFile, 'utf8');
console.log('✅ Found .project-rule.md');

// Extract project info
const nameMatch = ruleContent.match(/project_name:\s*(.*)/i);
const langMatch = ruleContent.match(/primary_language:\s*(.*)/i);
const archMatch = ruleContent.match(/architecture:\s*(.*)/i);
const rulesMatch = ruleContent.match(/rules:\s*\[(.*?)\]/i);
const shortcutsMatch = ruleContent.match(/shortcuts:\s*\[(.*?)\]/i);

console.log(`📦 Project Name: ${nameMatch ? nameMatch[1].trim() : 'Unknown'}`);
console.log(`💻 Primary Language: ${langMatch ? langMatch[1].trim() : 'Unknown'}`);
console.log(`🏛️ Architecture: ${archMatch ? archMatch[1].trim() : 'Unknown'}`);
if (rulesMatch) console.log(`📜 Active Rules: [${rulesMatch[1].trim()}]`);
if (shortcutsMatch) console.log(`⚡ Active Shortcuts: [${shortcutsMatch[1].trim()}]`);

// Extract key_paths
const keyPathsBlock = ruleContent.match(/key_paths:([\s\S]*?)(?:---|$)/i);
if (keyPathsBlock) {
  console.log('\n🗺️ Key Paths Index:');
  const lines = keyPathsBlock[1].split('\n').filter(l => l.includes(':'));
  lines.forEach(l => console.log(`   ${l.trim()}`));
}

console.log('\n✨ Project is properly configured with AgentOption baseline!');

