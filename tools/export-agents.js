#!/usr/bin/env node

/**
 * AgentOption Multi-Tool Agent Exporter
 * Exports AgentOption Agent Personas into ready-to-use configurations for:
 *   - Claude Code (.claude/agents/)
 *   - Cursor IDE (.cursor/rules/)
 *   - Antigravity IDE (skills/)
 *   - Standalone Markdown System Prompt
 * 
 * Usage:
 *   node tools/export-agents.js --list
 *   node tools/export-agents.js --agent=winforms-modernizer [--target=prompt|claude|cursor|antigravity] [--out=<dir>] [--dry-run]
 *   node tools/export-agents.js --all --target=claude --out=./output
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT_DIR, 'agents');
const RULES_FILE = path.join(ROOT_DIR, 'rules.json');
const SHORTCUTS_FILE = path.join(ROOT_DIR, 'shortcuts.json');

const args = process.argv.slice(2);
const isList = args.includes('--list') || args.includes('-l');
const isAll = args.includes('--all');
const isDryRun = args.includes('--dry-run');

const targetArg = args.find(a => a.startsWith('--target='))?.split('=')[1]?.toLowerCase() || 'prompt';
const agentArg = args.find(a => a.startsWith('--agent='))?.split('=')[1]?.toLowerCase();
const outArg = args.find(a => a.startsWith('--out='))?.split('=')[1];

// Load rules and shortcuts
const rulesMap = fs.existsSync(RULES_FILE) ? JSON.parse(fs.readFileSync(RULES_FILE, 'utf8')) : {};
const shortcutsMap = fs.existsSync(SHORTCUTS_FILE) ? JSON.parse(fs.readFileSync(SHORTCUTS_FILE, 'utf8')) : {};

// Scan all agents
function scanAgents(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanAgents(fullPath, list);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseAgent(fullPath, content);
      if (parsed) list.push(parsed);
    }
  }
  return list;
}

function parseAgent(filePath, content) {
  if (!content.startsWith('---')) return null;
  const endMatch = content.indexOf('\n---', 3);
  if (endMatch === -1) return null;

  const frontmatter = content.substring(3, endMatch);
  const body = content.substring(endMatch + 4).trim();

  const desc = frontmatter.match(/desc:\s*(.*)/)?.[1]?.trim() || '';
  const division = frontmatter.match(/division:\s*(.*)/)?.[1]?.trim() || 'general';
  const role = frontmatter.match(/role:\s*(.*)/)?.[1]?.trim() || path.basename(filePath, '.md');
  
  const rulesMatch = frontmatter.match(/rules:\s*\[(.*?)\]/);
  const rules = rulesMatch ? rulesMatch[1].split(',').map(r => r.replace(/['"]/g, '').trim()).filter(Boolean) : [];

  const shortcutsMatch = frontmatter.match(/shortcuts:\s*\[(.*?)\]/);
  const shortcuts = shortcutsMatch ? shortcutsMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim()).filter(Boolean) : [];

  const toolsMatch = frontmatter.match(/tools:\s*\[(.*?)\]/);
  const tools = toolsMatch ? toolsMatch[1].split(',').map(t => t.replace(/['"]/g, '').trim()).filter(Boolean) : [];

  return {
    filePath,
    relativePath: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
    desc,
    division,
    role,
    rules,
    shortcuts,
    tools,
    body
  };
}

const agents = scanAgents(AGENTS_DIR);

if (isList) {
  console.log(`\n🎭 Registered Agent Personas in AgentOption (${agents.length} agents):\n`);
  console.table(
    agents.map(a => ({
      Role: a.role,
      Division: a.division,
      Rules: a.rules.join(', '),
      Shortcuts: a.shortcuts.join(', '),
      Description: a.desc
    }))
  );
  process.exit(0);
}

if (!agentArg && !isAll) {
  console.log('Usage:');
  console.log('  node tools/export-agents.js --list');
  console.log('  node tools/export-agents.js --agent=<role> [--target=prompt|claude|cursor|antigravity] [--out=<dir>] [--dry-run]');
  console.log('  node tools/export-agents.js --all --target=<target> [--out=<dir>]\n');
  process.exit(0);
}

const selectedAgents = isAll ? agents : agents.filter(a => a.role === agentArg || path.basename(a.filePath, '.md') === agentArg);

if (selectedAgents.length === 0) {
  console.error(`❌ Agent "${agentArg}" not found! Run with --list to see available agents.`);
  process.exit(1);
}

console.log(`🚀 Exporting ${selectedAgents.length} agent(s) to target: [${targetArg.toUpperCase()}]...\n`);

for (const agent of selectedAgents) {
  const rendered = renderAgent(agent, targetArg);
  const destPath = resolveDestination(agent, targetArg, outArg);

  console.log(`📦 Agent: ${agent.role} (${agent.division})`);
  console.log(`   ➡️ Target Path: ${destPath}`);

  if (isDryRun) {
    console.log(`   [DRY-RUN] Preview (first 10 lines):`);
    console.log(rendered.split('\n').slice(0, 10).map(l => `      | ${l}`).join('\n'));
    console.log(`   ... (${rendered.split('\n').length} lines total)\n`);
  } else {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, rendered, 'utf8');
    console.log(`   ✅ Successfully exported!\n`);
  }
}

function renderAgent(agent, target) {
  const boundRules = agent.rules.map(r => `- **${r}:** ${rulesMap[r] || 'Active Constraint'}`).join('\n');
  const boundShortcuts = agent.shortcuts.map(s => {
    const item = shortcutsMap[s];
    return item ? `- **${s}** (${item.name}): ${item.desc} \`[${item.target}]\`` : `- **${s}**`;
  }).join('\n');

  if (target === 'claude') {
    return `---
name: ${agent.role}
description: "${agent.desc}"
tools: [${agent.tools.map(t => `"${t}"`).join(', ')}]
---

# ${agent.role} (${agent.division.toUpperCase()})

${agent.body}

---

## 📜 Invariant Rules Enforced
${boundRules}

## ⚡ Bound Standards & Skills
${boundShortcuts}
`;
  }

  if (target === 'cursor') {
    return `---
description: ${agent.desc}
globs: ["*"]
alwaysApply: false
---

# ${agent.role}

${agent.body}

### Enforced Rules
${boundRules}

### Standards & Skills
${boundShortcuts}
`;
  }

  if (target === 'antigravity') {
    return `---
name: ${agent.role}
description: "${agent.desc}"
---

# ${agent.role}

${agent.body}

## Enforced Invariants
${boundRules}

## Reference Standards
${boundShortcuts}
`;
  }

  // Default: prompt format
  return `# AGENT IDENTITY: ${agent.role.toUpperCase()}
# DIVISION: ${agent.division.toUpperCase()}
# DESCRIPTION: ${agent.desc}

${agent.body}

============================================================
HARD ARCHITECTURAL CONSTRAINTS & INVARIANTS:
============================================================
${boundRules}

============================================================
REFERENCED STANDARDS & PATTERNS:
============================================================
${boundShortcuts}
`;
}

function resolveDestination(agent, target, customOut) {
  if (customOut) {
    const ext = target === 'cursor' ? '.mdc' : '.md';
    return path.resolve(customOut, `${agent.role}${ext}`);
  }

  if (target === 'claude') {
    return path.join(ROOT_DIR, 'integrations', 'claude', `${agent.role}.md`);
  }
  if (target === 'cursor') {
    return path.join(ROOT_DIR, 'integrations', 'cursor', `${agent.role}.mdc`);
  }
  if (target === 'antigravity') {
    return path.join(ROOT_DIR, 'integrations', 'antigravity', agent.role, 'SKILL.md');
  }

  return path.join(ROOT_DIR, 'integrations', 'prompts', `${agent.role}.md`);
}
