#!/usr/bin/env node

/**
 * AgentOption SemanticBrain Bridge CLI
 * Provides portable, zero-hardcode wrapper for SemanticBrain PRE-Fetch and POST-Harvest.
 * 
 * Usage:
 *   node brain.js pre "<task_description>" [--tags=<domain>] [--project=<name>]
 *   node brain.js post "<question>|<answer>" [--tags=<domain,type>] [--project=<name>]
 *   node brain.js lookup "<query>" [--tags=<domain>] [--project=<name>]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

if (!command || !['pre', 'post', 'lookup', 'status'].includes(command)) {
  console.log('⚡ AgentOption SemanticBrain Bridge:');
  console.log('  node brain.js pre "<task_description>" [--tags=<domain>] [--project=<name>]');
  console.log('  node brain.js post "<question>|<answer>" [--tags=<domain,type>] [--project=<name>]');
  console.log('  node brain.js lookup "<query>" [--tags=<domain>] [--project=<name>]');
  console.log('  node brain.js status\n');
  process.exit(0);
}

// 1. Resolve SemanticBrain Root Path
function resolveSemanticBrain() {
  const candidates = [
    process.env.SEMANTIC_BRAIN_PATH,
    path.resolve(process.cwd(), '../Tools/SemanticBrain'),
    path.resolve(__dirname, '../../Tools/SemanticBrain'),
    'E:\\Tools\\SemanticBrain',
    'D:\\Tools\\SemanticBrain',
    'C:\\Tools\\SemanticBrain'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'tools', 'find-qa-context.js'))) {
      return candidate;
    }
  }
  return null;
}

const brainRoot = resolveSemanticBrain();
if (!brainRoot) {
  console.error('❌ Could not locate SemanticBrain directory.');
  console.error('👉 Please set the SEMANTIC_BRAIN_PATH environment variable.');
  process.exit(1);
}

// 2. Resolve Project Name from local .project-rule.md if not passed
function resolveProjectName() {
  const projectArg = args.find(a => a.startsWith('--project='));
  if (projectArg) return projectArg.split('=')[1];

  const localRule = path.join(process.cwd(), '.project-rule.md');
  if (fs.existsSync(localRule)) {
    const content = fs.readFileSync(localRule, 'utf8');
    const match = content.match(/project_name:\s*(.*)/i);
    if (match) return match[1].trim();
  }
  return 'default';
}

const projectName = resolveProjectName();
const queryText = args[1] || '';
const tagsArg = args.find(a => a.startsWith('--tags=')) || '--tags=general';

if (command === 'status') {
  console.log(`✅ SemanticBrain Bridge Active`);
  console.log(`📁 Brain Root: ${brainRoot}`);
  console.log(`📦 Resolved Project: ${projectName}\n`);
  process.exit(0);
}

if (!queryText) {
  console.error(`❌ Missing query/content text for command: "${command}"`);
  process.exit(1);
}

// 3. Dispatch to Target Script
let scriptName = '';
let scriptArgs = [];

if (command === 'pre') {
  scriptName = path.join(brainRoot, 'tools', 'find-qa-context.js');
  scriptArgs = [queryText, tagsArg, `--project=${projectName}`];
} else if (command === 'post') {
  scriptName = path.join(brainRoot, 'tools', 'post-task.js');
  scriptArgs = [queryText, tagsArg, `--project=${projectName}`, '--direct'];
} else if (command === 'lookup') {
  scriptName = path.join(brainRoot, 'tools', 'find-qa.js');
  scriptArgs = [queryText, tagsArg, `--project=${projectName}`];
}

console.log(`🧠 [SemanticBrain Bridge] -> ${path.basename(scriptName)} (${projectName})`);
const result = spawnSync('node', [scriptName, ...scriptArgs], { stdio: 'inherit' });
process.exit(result.status || 0);
