#!/usr/bin/env node

/**
 * AgentOption Shared Framework Core Library (Enforcing R_REUSE)
 * Centralizes rules/shortcuts loading, duplicate key inspection, isolated CRLF-safe
 * YAML frontmatter parsing, directory walking, and CLI argument normalization.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

const DEFAULT_EXCLUDED_DIRS = new Set([
  'node_modules',
  'integrations',
  '.git',
  '.agents',
  '.cache',
  '.vscode',
  '.idea'
]);

const KNOWN_BOOLEAN_FLAGS = new Set([
  'help',
  'h',
  'json',
  'markdown',
  'list',
  'l',
  'list-shortcuts',
  'shortcuts',
  'list-rules',
  'rules',
  'list-agents',
  'agents',
  'dense',
  'compact',
  'all',
  'dry-run',
  'sync-skills',
  'full',
  'pinned',
  'force',
  'mark-stale',
  'strings',
  'blocks',
  'explain',
  'init'
]);

function stripQuotes(val) {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/**
 * Detects duplicate top-level keys (depth === 1) in a raw JSON object string.
 */
function findDuplicateJsonKeys(rawJson) {
  const seen = new Set();
  const duplicates = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let currentString = '';
  let stringStartDepth = 0;

  for (let i = 0; i < rawJson.length; i++) {
    const ch = rawJson[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        currentString += ch;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
        if (stringStartDepth === 1) {
          // Look ahead for colon to confirm this string is an object key
          let j = i + 1;
          while (j < rawJson.length && /\s/.test(rawJson[j])) j++;
          if (rawJson[j] === ':') {
            if (seen.has(currentString)) {
              duplicates.push(currentString);
            }
            seen.add(currentString);
          }
        }
      } else {
        currentString += ch;
      }
    } else {
      if (ch === '"') {
        inString = true;
        escaped = false;
        currentString = '';
        stringStartDepth = depth;
      } else if (ch === '{' || ch === '[') {
        depth++;
      } else if (ch === '}' || ch === ']') {
        depth--;
      }
    }
  }

  return duplicates;
}

function loadRules(rootDir = ROOT_DIR) {
  const rulesFile = path.join(rootDir, 'rules.json');
  if (!fs.existsSync(rulesFile)) {
    throw new Error(`Missing rules.json at ${rulesFile}`);
  }
  const raw = fs.readFileSync(rulesFile, 'utf8');
  const duplicates = findDuplicateJsonKeys(raw);
  const data = JSON.parse(raw);
  Object.defineProperty(data, '_duplicates', { value: duplicates, enumerable: false });
  Object.defineProperty(data, '_raw', { value: raw, enumerable: false });
  return data;
}

function loadShortcuts(rootDir = ROOT_DIR) {
  const shortcutsFile = path.join(rootDir, 'shortcuts.json');
  if (!fs.existsSync(shortcutsFile)) {
    throw new Error(`Missing shortcuts.json at ${shortcutsFile}`);
  }
  const raw = fs.readFileSync(shortcutsFile, 'utf8');
  const duplicates = findDuplicateJsonKeys(raw);
  const data = JSON.parse(raw);
  Object.defineProperty(data, '_duplicates', { value: duplicates, enumerable: false });
  Object.defineProperty(data, '_raw', { value: raw, enumerable: false });
  return data;
}

/**
 * Strictly isolates YAML frontmatter between opening and closing '---' (CRLF-safe).
 * Parses scalar fields and inline/multiline list arrays (rules, shortcuts, tools),
 * as well as key_paths mappings. Normalizes desc = fm.desc || fm.description.
 */
function parseFrontmatter(content) {
  const emptyResult = {
    hasFrontmatter: false,
    malformed: false,
    name: '',
    title: '',
    desc: '',
    description: '',
    category: '',
    division: '',
    role: '',
    rules: [],
    shortcuts: [],
    tools: [],
    hasRules: false,
    hasShortcuts: false,
    hasTools: false,
    key_paths: {},
    raw: '',
    body: typeof content === 'string' ? content : ''
  };

  if (typeof content !== 'string' || !content) {
    return emptyResult;
  }

  const clean = content.replace(/^\uFEFF/, '');
  if (!/^---[ \t]*(?:\r?\n|$)/.test(clean)) {
    return emptyResult;
  }

  const match = clean.match(/^---[ \t]*\r?\n([\s\S]*?)(?:\r?\n)?---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (!match) {
    return {
      ...emptyResult,
      hasFrontmatter: true,
      malformed: true
    };
  }

  const rawFrontmatter = match[1] || '';
  const body = (match[2] || '').trim();

  const scalars = {};
  const arrays = {
    rules: [],
    shortcuts: [],
    tools: []
  };
  const hasArrayKey = {
    rules: false,
    shortcuts: false,
    tools: false
  };
  const key_paths = {};

  let currentSection = null;
  let currentListKey = null;

  const lines = rawFrontmatter.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.match(/^\s*/)[0].length;

    if (trimmed.startsWith('- ') && currentListKey) {
      const itemVal = stripQuotes(trimmed.slice(2));
      if (itemVal) {
        arrays[currentListKey].push(itemVal);
      }
      continue;
    }

    if (indent === 0) {
      currentSection = null;
      currentListKey = null;
    }

    const kvMatch = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1];
    const rawVal = kvMatch[2].trim();

    if (rawVal === '') {
      if (key === 'key_paths' || key === 'framework_references') {
        currentSection = key;
        currentListKey = null;
      } else if (key === 'rules' || key === 'shortcuts' || key === 'tools') {
        currentListKey = key;
        hasArrayKey[key] = true;
      }
      continue;
    }

    if (currentSection === 'key_paths' && indent > 0) {
      key_paths[key] = stripQuotes(rawVal);
      continue;
    }

    if (key === 'rules' || key === 'shortcuts' || key === 'tools') {
      currentListKey = null;
      if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
        hasArrayKey[key] = true;
        const inner = rawVal.slice(1, -1).trim();
        arrays[key] = inner
          ? inner.split(',').map(item => stripQuotes(item)).filter(Boolean)
          : [];
        continue;
      }
    }

    scalars[key] = stripQuotes(rawVal);
  }

  // Fallback for multiline bracketed arrays [ ... ]
  for (const arrKey of ['rules', 'shortcuts', 'tools']) {
    if (!hasArrayKey[arrKey]) {
      const multiMatch = rawFrontmatter.match(
        new RegExp(`(?:^|\\r?\\n)\\s*${arrKey}\\s*:\\s*\\[([\\s\\S]*?)\\]`)
      );
      if (multiMatch) {
        hasArrayKey[arrKey] = true;
        const inner = multiMatch[1].trim();
        arrays[arrKey] = inner
          ? inner.split(',').map(item => stripQuotes(item)).filter(Boolean)
          : [];
      }
    }
  }

  const normalizedDesc = scalars.desc || scalars.description || '';
  const normalizedDescription = scalars.description || scalars.desc || '';

  return {
    ...scalars,
    hasFrontmatter: true,
    malformed: false,
    name: scalars.name || '',
    title: scalars.title || '',
    desc: normalizedDesc,
    description: normalizedDescription,
    category: scalars.category || '',
    division: scalars.division || '',
    role: scalars.role || '',
    rules: arrays.rules,
    shortcuts: arrays.shortcuts,
    tools: arrays.tools,
    hasRules: hasArrayKey.rules,
    hasShortcuts: hasArrayKey.shortcuts,
    hasTools: hasArrayKey.tools,
    key_paths,
    raw: rawFrontmatter,
    body
  };
}

/**
 * Recursively walks directory and collects .md files, excluding dot-directories
 * (.git, .agents, .cache, .vscode, .idea, etc.), node_modules, and integrations.
 */
function walkMarkdownFiles(dir, options = {}) {
  const results = [];
  if (!dir || !fs.existsSync(dir)) return results;

  const excludeDirs = options.excludeDirs
    ? new Set(options.excludeDirs)
    : DEFAULT_EXCLUDED_DIRS;
  const includeDotDirs = Boolean(options.includeDotDirs);

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!includeDotDirs && entry.name.startsWith('.')) continue;
        if (excludeDirs.has(entry.name)) continue;
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
        if (typeof options.onFile === 'function') {
          options.onFile(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Normalizes CLI arguments supporting both '--key=value' and '--key value',
 * boolean flags, short flags (-l, -h), and positional arguments.
 */
function parseCliArgs(argv = process.argv.slice(2), options = {}) {
  let rawArgs = Array.isArray(argv) ? argv.slice() : [];
  if (
    rawArgs.length >= 2 &&
    /(?:^|[\\/])node(?:\.exe)?$/i.test(rawArgs[0]) &&
    /\.(?:js|cjs|mjs)$/i.test(rawArgs[1])
  ) {
    rawArgs = rawArgs.slice(2);
  }

  const booleanFlags = new Set([
    ...KNOWN_BOOLEAN_FLAGS,
    ...(options.booleanFlags || [])
  ]);
  const valueFlags = new Set(options.valueFlags || []);

  const flags = {};
  const positional = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = String(rawArgs[i]);

    if (arg === '--') {
      positional.push(...rawArgs.slice(i + 1).map(String));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx).trim();
        const val = arg.slice(eqIdx + 1);
        flags[key] = val;
      } else {
        const key = arg.slice(2).trim();
        const nextArg = i + 1 < rawArgs.length ? String(rawArgs[i + 1]) : null;
        const isExplicitBool = booleanFlags.has(key) && !valueFlags.has(key);

        if (!isExplicitBool && nextArg !== null && !nextArg.startsWith('-')) {
          flags[key] = nextArg;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const shortKey = arg.slice(1);
      flags[shortKey] = true;
    } else {
      positional.push(arg);
    }
  }

  return {
    flags,
    options: flags,
    positional,
    _: positional
  };
}

module.exports = {
  ROOT_DIR,
  loadRules,
  loadShortcuts,
  findDuplicateJsonKeys,
  parseFrontmatter,
  walkMarkdownFiles,
  parseCliArgs
};
