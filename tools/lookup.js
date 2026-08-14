#!/usr/bin/env node

/**
 * AgentOption Fast Skill & Blueprint Lookup CLI
 * Usage: 
 *   node lookup.js "<keyword>" [--lang=<lang>] [--type=<architecture|skills|standards>]
 *   node lookup.js <code> (e.g. DBS, HND, TDD, RES, MFE, ABRT)
 *   node lookup.js --list-shortcuts
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SHORTCUTS_FILE = path.join(ROOT_DIR, 'shortcuts.json');
const args = process.argv.slice(2);

const showShortcuts = args.includes('--list-shortcuts') || args.includes('--shortcuts');
const query = args.find(a => !a.startsWith('--')) || '';
const langFilter = args.find(a => a.startsWith('--lang='))?.split('=')[1]?.toLowerCase();
const typeFilter = args.find(a => a.startsWith('--type='))?.split('=')[1]?.toLowerCase();

// Load Shortcuts
let shortcutsMap = {};
if (fs.existsSync(SHORTCUTS_FILE)) {
  shortcutsMap = JSON.parse(fs.readFileSync(SHORTCUTS_FILE, 'utf8'));
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
  console.log('  node lookup.js "<query>" [--lang=nodejs|react|csharp] [--type=skills|architecture|standards]');
  console.log('  node lookup.js <code>       (e.g., node lookup.js DBS / HND / TDD / RES / MFE)');
  console.log('  node lookup.js --list-shortcuts\n');
  process.exit(0);
}

// 1. Direct Shortcut Match
const upperQuery = query.toUpperCase();
if (shortcutsMap[upperQuery]) {
  const item = shortcutsMap[upperQuery];
  console.log(`⚡ [Shortcut Match: ${upperQuery}] ${item.name}`);
  console.log(`    📁 File: [AgentOption]/${item.target}`);
  console.log(`    📝 Summary: ${item.desc}\n`);
  process.exit(0);
}

// 2. Full-Text Directory Search
const lowerQuery = query.toLowerCase();
console.log(`🔎 Searching AgentOption for: "${query}" (lang: ${langFilter || 'all'}, type: ${typeFilter || 'all'})...\n`);

const results = [];

function searchDir(dir, typeName) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath, typeName);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (typeFilter && typeName !== typeFilter) continue;
      if (langFilter && !fullPath.toLowerCase().includes(langFilter)) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes(lowerQuery) || entry.name.toLowerCase().includes(lowerQuery)) {
        const descMatch = content.match(/desc:\s*(.*)/i);
        const titleMatch = content.match(/^#\s*(.*)/m);

        results.push({
          file: path.relative(ROOT_DIR, fullPath),
          title: titleMatch ? titleMatch[1] : entry.name,
          desc: descMatch ? descMatch[1] : 'No description',
          fullPath
        });
      }
    }
  }
}

searchDir(path.join(ROOT_DIR, 'architecture'), 'architecture');
searchDir(path.join(ROOT_DIR, 'standards'), 'standards');
searchDir(path.join(ROOT_DIR, 'skills'), 'skills');

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
