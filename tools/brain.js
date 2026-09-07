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

const VALID_COMMANDS = ['pre', 'post', 'lookup', 'view', 'curate', 'status'];

if (!command || !VALID_COMMANDS.includes(command)) {
  console.log('⚡ AgentOption SemanticBrain Bridge:');
  console.log('  node brain.js pre "<task_description>" [--tags=<domain>] [--project=<name>] [--full]');
  console.log('  node brain.js post "<question>|<answer>" [--tags=<domain,type>] [--project=<name>] [--pinned] [--force]');
  console.log('  node brain.js view <id>');
  console.log('  node brain.js curate [--project=<name>] [--dry-run] [--mark-stale]');
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

// 2. Resolve Project Name from local .project-rule.md or command argument
function resolveProjectName() {
  const projectArg = args.find(a => a.startsWith('--project='));
  if (projectArg) return projectArg.split('=')[1];

  const localRule = path.join(process.cwd(), '.project-rule.md');
  if (fs.existsSync(localRule)) {
    const content = fs.readFileSync(localRule, 'utf8');
    const match = content.match(/project_name:\s*(.*)/i);
    if (match && match[1].trim()) return match[1].trim();
  }

  // Fallback for global commands (like curate or view)
  if (['view', 'curate', 'status'].includes(command)) {
    return 'global';
  }

  console.error('❌ Could not resolve project name!');
  console.error('👉 Ensure .project-rule.md exists in project root or pass --project=<project_name>.');
  console.error('👉 Use [AgentOption]/templates/project-bootstrap-template.md to create one.');
  process.exit(1);
}

const projectName = resolveProjectName();
const queryText = args[1] || '';
const tagsArg = args.find(a => a.startsWith('--tags=')) || '--tags=general';

if (command === 'status') {
  console.log(`✅ SemanticBrain Bridge Active`);
  console.log(`📁 Brain Root: ${brainRoot}`);
  console.log(`📦 Resolved Project: ${projectName}`);
  try {
    const ame = require(path.join(brainRoot, 'core', 'storage-ame'));
    ame.isAmeAvailable().then(res => {
      console.log(`⚡ AME Cognitive Storage: ${res.available ? `ONLINE (${res.mode})` : 'OFFLINE'}\n`);
      process.exit(0);
    }).catch(() => {
      console.log();
      process.exit(0);
    });
    return;
  } catch {
    console.log();
    process.exit(0);
  }
}

// 3. Dispatch to Target Script
let scriptName = '';
let scriptArgs = [];
const backendArg = args.find(a => a.startsWith('--backend='));

if (command === 'pre') {
  if (!queryText) {
    console.error('❌ Missing query/content text for pre-fetch');
    process.exit(1);
  }
  scriptName = path.join(brainRoot, 'tools', 'find-qa-context.js');
  scriptArgs = [queryText, tagsArg];
  if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
  if (args.includes('--full')) scriptArgs.push('--full');
  if (backendArg) scriptArgs.push(backendArg);
} else if (command === 'post') {
  if (!queryText) {
    console.error('❌ Missing content for post-task harvest');
    process.exit(1);
  }
  scriptName = path.join(brainRoot, 'tools', 'post-task.js');
  scriptArgs = [queryText, tagsArg, '--direct'];
  if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
  if (args.includes('--pinned')) scriptArgs.push('--pinned');
  if (args.includes('--force')) scriptArgs.push('--force');
  if (backendArg) scriptArgs.push(backendArg);
} else if (command === 'lookup') {
  if (!queryText) {
    console.error('❌ Missing query text for lookup');
    process.exit(1);
  }
  scriptName = path.join(brainRoot, 'tools', 'find-qa.js');
  scriptArgs = [queryText, tagsArg];
  if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
  if (backendArg) scriptArgs.push(backendArg);
} else if (command === 'view') {
  const idArg = args[1];
  if (!idArg) {
    console.error('❌ Missing QA ID: node brain.js view <id>');
    process.exit(1);
  }
  scriptName = path.join(brainRoot, 'tools', 'view-qa.js');
  scriptArgs = [idArg];
  if (backendArg) scriptArgs.push(backendArg);
  if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
} else if (command === 'curate') {
  scriptName = path.join(brainRoot, 'tools', 'curate.js');
  scriptArgs = [];
  if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
  if (args.includes('--dry-run')) scriptArgs.push('--dry-run');
  if (args.includes('--mark-stale')) scriptArgs.push('--mark-stale');
  const staleDaysArg = args.find(a => a.startsWith('--stale-days='));
  if (staleDaysArg) scriptArgs.push(staleDaysArg);
}

console.log(`🧠 [SemanticBrain Bridge] -> ${path.basename(scriptName)} (${projectName})`);
const result = spawnSync('node', [scriptName, ...scriptArgs], { stdio: 'inherit' });
process.exit(result.status || 0);
