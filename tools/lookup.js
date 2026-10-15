#!/usr/bin/env node

/**
 * AgentOption Fast Skill & Blueprint Lookup CLI
 * Usage: 
 *   node lookup.js "<keyword>" [--lang=<lang>] [--type=<architecture|skills|standards|agents>]
 *   node lookup.js <code> (e.g. DBS, HND, TDD, RES, MFE, ABRT)
 *   node lookup.js --list-shortcuts
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

const parsedArgs = parseCliArgs(process.argv.slice(2));
const flags = parsedArgs.flags;

const showShortcuts = Boolean(flags['list-shortcuts'] || flags.shortcuts);
const showRules = Boolean(flags.rules || flags['list-rules']);
const showAgents = Boolean(flags.agents || flags['list-agents']);
const showDense = Boolean(flags.dense || flags.compact);
const query = parsedArgs.positional[0] || '';
const langFilter = typeof flags.lang === 'string' ? flags.lang.toLowerCase() : undefined;
const typeFilter = typeof flags.type === 'string' ? flags.type.toLowerCase() : undefined;

// Load Rules and Shortcuts
let rulesMap = {};
try {
  rulesMap = loadRules(ROOT_DIR);
} catch {
  rulesMap = {};
}

let shortcutsMap = {};
try {
  shortcutsMap = loadShortcuts(ROOT_DIR);
} catch {
  shortcutsMap = {};
}

if (showDense) {
  console.log('⚡ AGY_DENSE_REGISTRY (Token-Optimized RAM Context):');
  console.log('--- RULES (Hard Constraints) ---');
  Object.entries(rulesMap).forEach(([k, v]) => console.log(`${k}: ${v}`));
  console.log('--- ACRONYMS (Design Patterns & Skills) ---');
  Object.entries(shortcutsMap).forEach(([k, v]) => console.log(`${k}: ${v.desc} -> [AgentOption]/${v.target.replace(/\\/g, '/')}`));
  process.exit(0);
}

if (showRules) {
  console.log('📜 AgentOption Rules Registry (rules.json):\n');
  console.table(
    Object.entries(rulesMap).map(([id, desc]) => ({
      RuleID: id,
      Description: desc
    }))
  );
  process.exit(0);
}

if (showAgents) {
  console.log('🎭 AgentOption Agent Personas Index (agents/):\n');
  const agentEntries = Object.entries(shortcutsMap).filter(([_, item]) => item.target.startsWith('agents/'));
  console.table(
    agentEntries.map(([code, item]) => ({
      Code: code,
      Name: item.name,
      Target: item.target,
      Description: item.desc
    }))
  );
  process.exit(0);
}

if (showShortcuts) {
  console.log('⚡ AgentOption Acronym & Shortcut Index:\n');
  console.table(
    Object.entries(shortcutsMap).map(([code, item]) => ({
      Code: code,
      Name: item.name,
      Target: item.target,
      Description: item.desc
    }))
  );
  process.exit(0);
}

if (!query) {
  console.log('Usage:');
  console.log('  node lookup.js "<query>" [--lang=nodejs|react|csharp] [--type=skills|architecture|standards|agents]');
  console.log('  node lookup.js <code>       (e.g., node lookup.js DBS / HND / TDD / RES / MFE / AGT_CS_ARC / ERP_INV)');
  console.log('  node lookup.js --agents     (List all registered Agent Personas)');
  console.log('  node lookup.js --dense      (Output dense RAM registry for subagents / system context)');
  console.log('  node lookup.js --rules      (List all R_* hard rules)');
  console.log('  node lookup.js --shortcuts  (List all acronym shortcuts)\n');
  process.exit(0);
}

// 1. Direct Rule or Shortcut Match
const upperQuery = query.toUpperCase();
if (rulesMap[upperQuery]) {
  console.log(`📜 [Rule Match: ${upperQuery}]`);
  console.log(`    📝 Definition: ${rulesMap[upperQuery]}\n`);
  process.exit(0);
}
if (shortcutsMap[upperQuery]) {
  const item = shortcutsMap[upperQuery];
  console.log(`⚡ [Shortcut Match: ${upperQuery}] ${item.name}`);
  console.log(`    📁 File: [AgentOption]/${item.target.replace(/\\/g, '/')}`);
  console.log(`    📝 Summary: ${item.desc}\n`);
  process.exit(0);
}

// 2. Full-Text Directory Search
const lowerQuery = query.toLowerCase();
console.log(`🔎 Searching AgentOption for: "${query}" (lang: ${langFilter || 'all'}, type: ${typeFilter || 'all'})...\n`);

const results = [];

function searchDir(dir, typeName) {
  if (!fs.existsSync(dir)) return;
  if (typeFilter && typeName !== typeFilter) return;

  walkMarkdownFiles(dir, {
    onFile: fullPath => {
      if (langFilter && !fullPath.toLowerCase().includes(langFilter)) return;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lowerContent = content.toLowerCase();
      const baseName = path.basename(fullPath);

      if (lowerContent.includes(lowerQuery) || baseName.toLowerCase().includes(lowerQuery)) {
        const fm = parseFrontmatter(content);
        const titleMatch = content.match(/^#\s*(.*)/m);

        results.push({
          file: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'),
          title: titleMatch ? titleMatch[1].trim() : (fm.title || fm.name || baseName),
          desc: fm.desc || fm.description || 'No description',
          fullPath
        });
      }
    }
  });
}

searchDir(path.join(ROOT_DIR, 'architecture'), 'architecture');
searchDir(path.join(ROOT_DIR, 'standards'), 'standards');
searchDir(path.join(ROOT_DIR, 'skills'), 'skills');
searchDir(path.join(ROOT_DIR, 'agents'), 'agents');

if (results.length === 0) {
  console.log('❌ No matching skills or blueprints found.');
} else {
  console.log(`✨ Found ${results.length} matching item(s):\n`);
  results.forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.title}`);
    console.log(`    📁 File: [AgentOption]/${r.file}`);
    console.log(`    📝 Summary: ${r.desc}\n`);
  });
}

