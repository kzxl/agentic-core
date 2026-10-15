#!/usr/bin/env node

/**
 * AgentOption Multi-Tool Agent Exporter & Skill Synchronizer
 * Exports AgentOption Agent Personas into ready-to-use configurations for:
 *   - Claude Code (.claude/agents/)
 *   - Cursor IDE (.cursor/rules/)
 *   - Antigravity IDE (skills/)
 *   - Standalone Markdown System Prompt
 * Also synchronizes AgentOption skill packages (skills/<name>/SKILL.md + subdirectories)
 * to Antigravity global skills directory via --sync-skills.
 *
 * Usage:
 *   node tools/export-agents.js --list
 *   node tools/export-agents.js --agent=winforms-modernizer [--target=prompt|claude|cursor|antigravity] [--out=<dir>] [--dry-run]
 *   node tools/export-agents.js --all --target=claude --out=./output
 *   node tools/export-agents.js --sync-skills [--out=<globalSkillsDir>]
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  ROOT_DIR,
  loadRules,
  loadShortcuts,
  parseFrontmatter,
  walkMarkdownFiles,
  parseCliArgs
} = require('./lib/framework-core');

const AGENTS_DIR = path.join(ROOT_DIR, 'agents');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const DEFAULT_GLOBAL_SKILLS_DIR = path.join(os.homedir(), '.gemini', 'config', 'skills');

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

function parseAgent(filePath, content) {
  const fm = parseFrontmatter(content);
  if (!fm.hasFrontmatter || fm.malformed) return null;

  return {
    filePath,
    relativePath: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
    desc: fm.desc || fm.description || '',
    division: fm.division || 'general',
    role: fm.role || path.basename(filePath, '.md'),
    rules: fm.rules || [],
    shortcuts: fm.shortcuts || [],
    tools: fm.tools || [],
    body: fm.body || ''
  };
}

function scanAgents(dir = AGENTS_DIR) {
  const list = [];
  if (!fs.existsSync(dir)) return list;
  walkMarkdownFiles(dir, {
    onFile: fullPath => {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseAgent(fullPath, content);
      if (parsed) list.push(parsed);
    }
  });
  return list;
}

function renderAntigravitySkill(agent, boundRules, boundShortcuts, boundTools) {
  const escapedDesc = (agent.desc || '').replace(/"/g, '\\"');
  return `---
name: ${agent.role}
description: "${escapedDesc}"
desc: "${escapedDesc}"
rules: [${agent.rules.join(', ')}]
tools: [${agent.tools.map(t => `"${t}"`).join(', ')}]
---

# ${agent.role}

${agent.body}

## Permitted Tools
${boundTools}

## Enforced Invariants
${boundRules}

## Reference Standards
${boundShortcuts}
`;
}

function renderAgent(agent, target) {
  const boundRules = agent.rules.map(r => `- **${r}:** ${rulesMap[r] || 'Active Constraint'}`).join('\n');
  const boundShortcuts = agent.shortcuts.map(s => {
    const item = shortcutsMap[s];
    return item ? `- **${s}** (${item.name}): ${item.desc} \`[${item.target}]\`` : `- **${s}**`;
  }).join('\n');
  const boundTools = agent.tools.length > 0
    ? agent.tools.map(t => `- \`${t}\``).join('\n')
    : '- Standard read/write/search toolchain';
  const escapedDesc = (agent.desc || '').replace(/"/g, '\\"');

  if (target === 'claude') {
    return `---
name: ${agent.role}
description: "${escapedDesc}"
tools: [${agent.tools.map(t => `"${t}"`).join(', ')}]
---

# ${agent.role} (${agent.division.toUpperCase()})

${agent.body}

---

## 🛠️ Permitted Tools
${boundTools}

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
tools: [${agent.tools.map(t => `"${t}"`).join(', ')}]
---

# ${agent.role}

${agent.body}

### Permitted Tools
${boundTools}

### Enforced Rules
${boundRules}

### Standards & Skills
${boundShortcuts}
`;
  }

  if (target === 'antigravity') {
    return renderAntigravitySkill(agent, boundRules, boundShortcuts, boundTools);
  }

  // Default: prompt format
  return `# AGENT IDENTITY: ${agent.role.toUpperCase()}
# DIVISION: ${agent.division.toUpperCase()}
# DESCRIPTION: ${agent.desc}
# TOOLS: ${agent.tools.join(', ')}

${agent.body}

============================================================
PERMITTED TOOLS:
============================================================
${boundTools}

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
    if (target === 'antigravity') {
      return path.join(path.resolve(customOut), agent.role, 'SKILL.md');
    }
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

function syncSkillPackages(destRoot = DEFAULT_GLOBAL_SKILLS_DIR, isDryRun = false) {
  if (!fs.existsSync(SKILLS_DIR)) {
    throw new Error(`Skills directory not found: ${SKILLS_DIR}`);
  }

  const resolvedDestRoot = path.resolve(destRoot);
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const synced = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgDir = path.join(SKILLS_DIR, entry.name);
    const skillFile = path.join(pkgDir, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const targetPkgDir = path.join(resolvedDestRoot, entry.name);
    if (!isDryRun) {
      fs.mkdirSync(targetPkgDir, { recursive: true });
      fs.cpSync(pkgDir, targetPkgDir, { recursive: true, force: true });
    }
    synced.push({ name: entry.name, source: pkgDir, destination: targetPkgDir });
  }

  return synced;
}

if (require.main === module) {
  const parsedArgs = parseCliArgs(process.argv.slice(2));
  const flags = parsedArgs.flags;

  const isList = Boolean(flags.list || flags.l);
  const isAll = Boolean(flags.all);
  const isDryRun = Boolean(flags['dry-run']);
  const isSyncSkills = Boolean(flags['sync-skills']);

  const targetArg = typeof flags.target === 'string' ? flags.target.toLowerCase() : 'prompt';
  const agentArg = typeof flags.agent === 'string' ? flags.agent.toLowerCase() : undefined;
  const outArg = typeof flags.out === 'string' ? flags.out : undefined;

  if (isSyncSkills) {
    const destRoot = outArg ? path.resolve(outArg) : DEFAULT_GLOBAL_SKILLS_DIR;
    console.log(`🔄 Synchronizing SKILL.md packages to: ${destRoot}\n`);
    const synced = syncSkillPackages(destRoot, isDryRun);
    for (const item of synced) {
      console.log(`   📦 ${item.name} -> ${item.destination}${isDryRun ? ' [DRY-RUN]' : ' ✅'}`);
    }
    console.log(`\n✨ Synchronized ${synced.length} skill package(s)!`);
    process.exit(0);
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
        Tools: a.tools.join(', '),
        Description: a.desc
      }))
    );
    process.exit(0);
  }

  if (!agentArg && !isAll) {
    console.log('Usage:');
    console.log('  node tools/export-agents.js --list');
    console.log('  node tools/export-agents.js --agent=<role> [--target=prompt|claude|cursor|antigravity] [--out=<dir>] [--dry-run]');
    console.log('  node tools/export-agents.js --all --target=<target> [--out=<dir>]');
    console.log('  node tools/export-agents.js --sync-skills [--out=<globalSkillsDir>]\n');
    process.exit(0);
  }

  const selectedAgents = isAll
    ? agents
    : agents.filter(a => a.role.toLowerCase() === agentArg || path.basename(a.filePath, '.md').toLowerCase() === agentArg);

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
}

module.exports = {
  parseAgent,
  scanAgents,
  renderAgent,
  renderAntigravitySkill,
  resolveDestination,
  syncSkillPackages
};

