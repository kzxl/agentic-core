#!/usr/bin/env node

/**
 * AgentOption SemanticBrain Bridge CLI
 * Provides portable, zero-hardcode wrapper for SemanticBrain PRE-Fetch and POST-Harvest.
 * 
 * Usage:
 *   node brain.js pre "<task_description>" [--tags=<domain>] [--project=<name>] [--all-projects]
 *   node brain.js post "<problem> | <cause> | <fix>" [--tags=<domain,type>] [--project=<name>] [--trust=...]
 *   node brain.js ingest --file=atoms.json [--project=<name>] [--tags=<domain>]
 *   node brain.js lookup "<query>" [--tags=<domain>] [--project=<name>] [--all-projects]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseFrontmatter, parseCliArgs } = require('./lib/framework-core');

const VALID_COMMANDS = ['pre', 'post', 'ingest', 'lookup', 'view', 'curate', 'status', 'route'];

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

// 2. Resolve Project Name from command argument or by walking up parent directories for .project-rule.md
function resolveProjectName(startDir = process.cwd(), cliFlags = {}, cmd = '') {
  if (typeof cliFlags.project === 'string' && cliFlags.project.trim()) {
    return cliFlags.project.trim();
  }

  let currentDir = path.resolve(startDir);
  while (true) {
    const candidateRule = path.join(currentDir, '.project-rule.md');
    if (fs.existsSync(candidateRule)) {
      const content = fs.readFileSync(candidateRule, 'utf8');
      const fm = parseFrontmatter(content);
      if (fm.project_name) return fm.project_name.trim();
      const match = content.match(/project_name:\s*(.*)/i);
      if (match && match[1].trim()) return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  // Fallback for global commands (like curate, view, status, route, ingest)
  if (['view', 'curate', 'status', 'route', 'ingest'].includes(cmd)) {
    return 'global';
  }

  console.error('❌ Could not resolve project name!');
  console.error('👉 Ensure .project-rule.md exists in project root or pass --project=<project_name>.');
  console.error('👉 Use [AgentOption]/templates/project-bootstrap-template.md to create one.');
  process.exit(1);
}

function looksLikeAtoms(text) {
  if (!text || typeof text !== 'string') return false;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed)
      || (parsed && Array.isArray(parsed.atoms))
      || (parsed && parsed.question && parsed.answer);
  } catch {
    return false;
  }
}

function appendProvenance(args, flags) {
  if (typeof flags.trust === 'string') args.push(`--trust=${flags.trust}`);
  if (typeof flags.verifier === 'string') args.push(`--verifier=${flags.verifier}`);
  if (typeof flags.evidence === 'string') args.push(`--evidence=${flags.evidence}`);
  if (typeof flags.scope === 'string') args.push(`--scope=${flags.scope}`);
  if (typeof flags['valid-from'] === 'string') args.push(`--valid-from=${flags['valid-from']}`);
  if (typeof flags['valid-to'] === 'string') args.push(`--valid-to=${flags['valid-to']}`);
}

if (require.main === module) {
  const parsedArgs = parseCliArgs(process.argv.slice(2));
  const flags = parsedArgs.flags;
  const command = parsedArgs.positional[0]?.toLowerCase();

  if (!command || !VALID_COMMANDS.includes(command)) {
    console.log('⚡ AgentOption SemanticBrain Bridge:');
    console.log('  node brain.js route "<task_description>" [--json]');
    console.log('  node brain.js pre "<task_description>" [--tags=<domain>] [--project=<name>] [--all-projects] [--full]');
    console.log('  node brain.js post "<problem> | <cause> | <fix>" [--tags=<domain>] [--project=<name>] [--trust=<level>] [--pinned]');
    console.log('  node brain.js ingest --file=atoms.json [--project=<name>] [--tags=<domain>] [--trust=<level>]');
    console.log('  node brain.js view <id>');
    console.log('  node brain.js curate [--project=<name>] [--dry-run] [--mark-stale]');
    console.log('  node brain.js lookup "<query>" [--tags=<domain>] [--project=<name>] [--all-projects]');
    console.log('  node brain.js status\n');
    process.exit(0);
  }

  const brainRoot = resolveSemanticBrain();
  if (!brainRoot) {
    console.error('❌ Could not locate SemanticBrain directory.');
    console.error('👉 Please set the SEMANTIC_BRAIN_PATH environment variable.');
    process.exit(1);
  }

  const projectName = resolveProjectName(process.cwd(), flags, command);
  const queryText = parsedArgs.positional[1] || '';
  const tagsArg = typeof flags.tags === 'string' ? `--tags=${flags.tags}` : '--tags=general';

  if (command === 'status') {
    console.log(`✅ SemanticBrain Bridge Active`);
    console.log(`📁 Brain Root: ${brainRoot}`);
    console.log(`📦 Resolved Project: ${projectName}`);
    console.log(`🗄️ Canonical Storage: PostgreSQL/pgvector (BGE-M3 1024-d)`);
    try {
      const ame = require(path.join(brainRoot, 'core', 'storage-ame'));
      ame.isAmeAvailable().then(res => {
        console.log(`⚡ AME optional archive: ${res.available ? `ONLINE (${res.mode})` : 'OFFLINE'}\n`);
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
  const backendArg = typeof flags.backend === 'string' ? `--backend=${flags.backend}` : null;

  if (command === 'pre') {
    if (!queryText) {
      console.error('❌ Missing query/content text for pre-fetch');
      process.exit(1);
    }
    scriptName = path.join(brainRoot, 'tools', 'find-qa-context.js');
    scriptArgs = [queryText, tagsArg];
    if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
    if (flags['all-projects']) scriptArgs.push('--all-projects');
    if (flags.full) scriptArgs.push('--full');
    if (backendArg) scriptArgs.push(backendArg);
  } else if (command === 'post') {
    const jsonFlag = typeof flags.json === 'string' ? flags.json : null;
    const fileFlag = typeof flags.file === 'string' ? flags.file : null;
    const positionalJson = looksLikeAtoms(queryText) ? queryText : null;

    if (fileFlag || jsonFlag !== null || positionalJson) {
      scriptName = path.join(brainRoot, 'tools', 'ingest-knowledge.js');
      if (fileFlag) scriptArgs.push(`--file=${fileFlag}`);
      else if (jsonFlag !== null) scriptArgs.push(`--json=${jsonFlag}`);
      else scriptArgs.push(`--json=${positionalJson}`);
      if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
      if (typeof flags.tags === 'string') scriptArgs.push(`--tags=${flags.tags}`);
      appendProvenance(scriptArgs, flags);
      if (flags['dry-run']) scriptArgs.push('--dry-run');
    } else {
      if (!queryText) {
        console.error('❌ Missing content for post-task harvest');
        process.exit(1);
      }
      scriptName = path.join(brainRoot, 'tools', 'post-task.js');
      scriptArgs = [queryText, tagsArg, '--direct'];
      if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
      if (flags.pinned) scriptArgs.push('--pinned');
      if (flags.force) scriptArgs.push('--force');
      appendProvenance(scriptArgs, flags);
      if (backendArg) scriptArgs.push(backendArg);
    }
  } else if (command === 'ingest') {
    const fileFlag = typeof flags.file === 'string' ? flags.file : null;
    const jsonFlag = typeof flags.json === 'string' ? flags.json : null;
    const positionalJson = looksLikeAtoms(queryText) ? queryText : null;
    if (!fileFlag && jsonFlag === null && !positionalJson) {
      console.error('❌ Missing atomic payload: use --file=atoms.json or --json=\'{"atoms":[...]}\'');
      process.exit(1);
    }
    scriptName = path.join(brainRoot, 'tools', 'ingest-knowledge.js');
    if (fileFlag) scriptArgs.push(`--file=${fileFlag}`);
    else if (jsonFlag !== null) scriptArgs.push(`--json=${jsonFlag}`);
    else scriptArgs.push(`--json=${positionalJson}`);
    if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
    if (typeof flags.tags === 'string') scriptArgs.push(`--tags=${flags.tags}`);
    appendProvenance(scriptArgs, flags);
    if (flags['dry-run']) scriptArgs.push('--dry-run');
  } else if (command === 'lookup') {
    if (!queryText) {
      console.error('❌ Missing query text for lookup');
      process.exit(1);
    }
    scriptName = path.join(brainRoot, 'tools', 'find-qa.js');
    scriptArgs = [queryText, tagsArg];
    if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
    if (flags['all-projects']) scriptArgs.push('--all-projects');
    if (backendArg) scriptArgs.push(backendArg);
  } else if (command === 'view') {
    const idArg = parsedArgs.positional[1];
    if (!idArg) {
      console.error('❌ Missing QA ID: node brain.js view <id>');
      process.exit(1);
    }
    scriptName = path.join(brainRoot, 'tools', 'view-qa.js');
    scriptArgs = [idArg];
    if (backendArg) scriptArgs.push(backendArg);
    if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
  } else if (command === 'route') {
    if (!queryText) {
      console.error('❌ Missing task description: node brain.js route "<task>"');
      process.exit(1);
    }
    scriptName = path.join(brainRoot, 'tools', 'route-decision.js');
    scriptArgs = [queryText];
    if (flags.json) scriptArgs.push('--json');
  } else if (command === 'curate') {
    scriptName = path.join(brainRoot, 'tools', 'curate.js');
    scriptArgs = [];
    if (projectName !== 'global') scriptArgs.push(`--project=${projectName}`);
    if (flags['dry-run']) scriptArgs.push('--dry-run');
    if (flags['mark-stale']) scriptArgs.push('--mark-stale');
    if (typeof flags['stale-days'] === 'string') {
      scriptArgs.push(`--stale-days=${flags['stale-days']}`);
    }
  }

  console.log(`🧠 [SemanticBrain Bridge] -> ${path.basename(scriptName)} (${projectName})`);
  const result = spawnSync('node', [scriptName, ...scriptArgs], { stdio: 'inherit' });
  process.exit(result.status || 0);
}

module.exports = {
  resolveSemanticBrain,
  resolveProjectName
};

