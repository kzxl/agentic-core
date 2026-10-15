const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  ROOT_DIR,
  loadRules,
  loadShortcuts,
  findDuplicateJsonKeys,
  parseFrontmatter,
  walkMarkdownFiles,
  parseCliArgs
} = require('../tools/lib/framework-core');

const { parseVector, calculateCvss } = require('../tools/cvss');
const {
  extractHostAndPort,
  isIpInCidr,
  matchDomain,
  validateContractTimestamps
} = require('../tools/scope-guard');
const {
  calculateEntropy,
  detectFileType,
  extractStringsAndIndicators
} = require('../tools/bin-triage');
const {
  renderAgent,
  resolveDestination
} = require('../tools/export-agents');
const { resolveProjectName } = require('../tools/brain');

// ============================================================================
// 1. framework-core.js Tests
// ============================================================================
test('framework-core: parseFrontmatter isolates between --- and normalizes CRLF & desc/description', () => {
  const md = [
    '---',
    'name: sample-skill',
    'description: "Skill description from description key"',
    'category: backend',
    'division: engineering',
    'role: sample-architect',
    'rules: [R_CORE, "R_RUST", \'R_PY\']',
    'shortcuts:',
    '  - RUST_PERF',
    '  - PY_TYPE',
    'tools: [read_file, write_file]',
    '---',
    '# Body Heading',
    'desc: Fake desc inside body should be ignored',
    'rules: [R_FAKE_IN_BODY]',
    '---',
    'More body text'
  ].join('\r\n');

  const fm = parseFrontmatter(md);
  assert.equal(fm.hasFrontmatter, true);
  assert.equal(fm.malformed, false);
  assert.equal(fm.name, 'sample-skill');
  assert.equal(fm.desc, 'Skill description from description key');
  assert.equal(fm.description, 'Skill description from description key');
  assert.equal(fm.category, 'backend');
  assert.equal(fm.division, 'engineering');
  assert.equal(fm.role, 'sample-architect');
  assert.deepEqual(fm.rules, ['R_CORE', 'R_RUST', 'R_PY']);
  assert.deepEqual(fm.shortcuts, ['RUST_PERF', 'PY_TYPE']);
  assert.deepEqual(fm.tools, ['read_file', 'write_file']);
  assert.ok(fm.body.includes('# Body Heading'));
});

test('framework-core: parseFrontmatter handles .project-rule.md key_paths without clobbering rules/shortcuts', () => {
  const prMd = `---
project_name: test-proj
framework_references:
  rules: ["R_CORE", "R_GIT"]
  shortcuts: ["GIT", "TDD"]
key_paths:
  rules: "rules.json"
  shortcuts: "shortcuts.json"
  tools: "tools/"
---
# Project Rule
`;
  const fm = parseFrontmatter(prMd);
  assert.equal(fm.project_name, 'test-proj');
  assert.deepEqual(fm.rules, ['R_CORE', 'R_GIT']);
  assert.deepEqual(fm.shortcuts, ['GIT', 'TDD']);
  assert.equal(fm.key_paths.rules, 'rules.json');
  assert.equal(fm.key_paths.shortcuts, 'shortcuts.json');
  assert.equal(fm.key_paths.tools, 'tools/');
});

test('framework-core: parseFrontmatter detects missing or malformed frontmatter', () => {
  const noFm = parseFrontmatter('# Just a heading\ndesc: in body\nrules: [R_CORE]');
  assert.equal(noFm.hasFrontmatter, false);
  assert.equal(noFm.malformed, false);
  assert.equal(noFm.desc, '');
  assert.deepEqual(noFm.rules, []);

  const malformed = parseFrontmatter('---\ndesc: unclosed frontmatter\nrules: [R_CORE]');
  assert.equal(malformed.hasFrontmatter, true);
  assert.equal(malformed.malformed, true);
});

test('framework-core: findDuplicateJsonKeys detects top-level duplicate keys without false positives on nested keys', () => {
  const rawJson = `{
    "KEY_ONE": { "name": "A", "desc": "B" },
    "KEY_TWO": { "name": "C", "desc": "D" },
    "KEY_ONE": { "name": "E", "desc": "F" }
  }`;
  const dups = findDuplicateJsonKeys(rawJson);
  assert.deepEqual(dups, ['KEY_ONE']);
});

test('framework-core: parseCliArgs normalizes --key=value, --key value, boolean flags, and positional args', () => {
  const parsed = parseCliArgs([
    'pre',
    '--project=my-app',
    '--tags',
    'inventory,wpf',
    '--full',
    'query text here'
  ]);
  assert.equal(parsed.flags.project, 'my-app');
  assert.equal(parsed.flags.tags, 'inventory,wpf');
  assert.equal(parsed.flags.full, true);
  assert.deepEqual(parsed.positional, ['pre', 'query text here']);
});

test('framework-core: walkMarkdownFiles excludes dot-directories and integrations', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-walk-'));
  try {
    fs.mkdirSync(path.join(tmpRoot, '.agents'), { recursive: true });
    fs.mkdirSync(path.join(tmpRoot, 'integrations'), { recursive: true });
    fs.mkdirSync(path.join(tmpRoot, 'skills'), { recursive: true });

    fs.writeFileSync(path.join(tmpRoot, '.agents', 'hidden.md'), '# Hidden');
    fs.writeFileSync(path.join(tmpRoot, 'integrations', 'exported.md'), '# Exported');
    fs.writeFileSync(path.join(tmpRoot, 'skills', 'valid.md'), '# Valid');

    const files = walkMarkdownFiles(tmpRoot);
    assert.equal(files.length, 1);
    assert.ok(files[0].endsWith('valid.md'));
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

// ============================================================================
// 2. cvss.js Tests
// ============================================================================
test('cvss.js: calculates deterministic CVSS v3.1 and preserves CVSS:3.0 version label', () => {
  const v31 = calculateCvss(parseVector('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'));
  assert.equal(v31.version, '3.1');
  assert.equal(v31.baseScore, 9.8);
  assert.equal(v31.severity, 'Critical');
  assert.ok(v31.vector.startsWith('CVSS:3.1/'));

  const v30 = calculateCvss(parseVector('CVSS:3.0/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N'));
  assert.equal(v30.version, '3.0');
  assert.equal(v30.baseScore, 6.5);
  assert.equal(v30.severity, 'Medium');
  assert.ok(v30.vector.startsWith('CVSS:3.0/'));
});

test('cvss.js CLI: supports both --lookup=IDOR and --lookup IDOR', () => {
  const cvssScript = path.join(ROOT_DIR, 'tools', 'cvss.js');

  const resEq = spawnSync(process.execPath, [cvssScript, '--lookup=IDOR'], { encoding: 'utf8' });
  assert.equal(resEq.status, 0);
  assert.ok(resEq.stdout.includes('CWE-639'));

  const resSpace = spawnSync(process.execPath, [cvssScript, '--lookup', 'IDOR'], { encoding: 'utf8' });
  assert.equal(resSpace.status, 0);
  assert.ok(resSpace.stdout.includes('CWE-639'));
});

// ============================================================================
// 3. scope-guard.js Tests
// ============================================================================
test('scope-guard.js: rejects expired contract with exit code 2 and blocks uppercase forbidden domain', () => {
  const scopeScript = path.join(ROOT_DIR, 'tools', 'scope-guard.js');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-scope-'));

  try {
    // 1. Expired contract -> exit code 2
    const expiredContractPath = path.join(tmpDir, 'expired.json');
    fs.writeFileSync(
      expiredContractPath,
      JSON.stringify({
        authorization: {
          client_name: 'Test Corp',
          authorized_by: 'SecOps',
          status: 'granted',
          effective_start: '2020-01-01',
          effective_end: '2020-01-31'
        },
        in_scope: { domains: ['*.example.com'] },
        out_of_scope: { forbidden_targets: ['prod.example.com'] }
      }),
      'utf8'
    );

    const expiredRes = spawnSync(
      process.execPath,
      [scopeScript, 'check', 'api.example.com', `--contract=${expiredContractPath}`],
      { encoding: 'utf8' }
    );
    assert.equal(expiredRes.status, 2);

    // 2. Active contract: uppercase forbidden domain PROD.EXAMPLE.COM -> blocked (exit code 1)
    const activeContractPath = path.join(tmpDir, 'active.json');
    fs.writeFileSync(
      activeContractPath,
      JSON.stringify({
        authorization: {
          client_name: 'Test Corp',
          authorized_by: 'SecOps',
          status: 'granted',
          effective_start: '2020-01-01',
          effective_end: '2099-12-31'
        },
        in_scope: {
          domains: ['*.example.com'],
          ip_ranges: ['192.168.10.0/24', '2001:db8::1']
        },
        out_of_scope: {
          forbidden_targets: ['prod.example.com']
        }
      }),
      'utf8'
    );

    const upperForbiddenRes = spawnSync(
      process.execPath,
      [scopeScript, 'check', 'HTTPS://PROD.EXAMPLE.COM/login', `--contract=${activeContractPath}`],
      { encoding: 'utf8' }
    );
    assert.equal(upperForbiddenRes.status, 1);

    // 3. Allowed subdomain in uppercase -> allowed (exit code 0)
    const allowedRes = spawnSync(
      process.execPath,
      [scopeScript, 'check', 'https://STAGING.EXAMPLE.COM', `--contract=${activeContractPath}`],
      { encoding: 'utf8' }
    );
    assert.equal(allowedRes.status, 0);

    // 4. IPv6 handling: exact IPv6 match allowed, unrelated IPv6 not falsely matching IPv4 CIDR
    assert.equal(isIpInCidr('2001:DB8::1', '2001:db8::1'), true);
    assert.equal(isIpInCidr('2001:db8::2', '192.168.10.0/24'), false);
    assert.deepEqual(extractHostAndPort('HTTPS://API.EXAMPLE.COM:8443/v1'), {
      host: 'api.example.com',
      port: 8443
    });
    assert.equal(matchDomain('SUB.EXAMPLE.COM', '*.example.com'), true);
    assert.equal(validateContractTimestamps({ effective_start: '2099-01-01' }, Date.now()).valid, false);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// 4. bin-triage.js Tests
// ============================================================================
test('bin-triage.js: exits gracefully with code 1 when called with --strings and no file arg, handles truncated PE and EOF URLs', () => {
  const binScript = path.join(ROOT_DIR, 'tools', 'bin-triage.js');

  // 1. --strings without file argument must not throw TypeError in path.resolve(undefined)
  const noFileRes = spawnSync(process.execPath, [binScript, '--strings'], { encoding: 'utf8' });
  assert.equal(noFileRes.status, 1);
  assert.ok(!noFileRes.stderr.includes('TypeError'));

  // 2. Truncated PE header where peOffset + 4 is out of bounds must not throw RangeError
  const truncatedPe = Buffer.alloc(0x44, 0);
  truncatedPe[0] = 0x4D; // 'M'
  truncatedPe[1] = 0x5A; // 'Z'
  truncatedPe.writeUInt32LE(0x40, 0x3C); // peOffset = 0x40 -> buf.length is 0x44 (only +4 bytes, < peOffset + 6)
  truncatedPe.write('PE\0\0', 0x40, 'ascii');
  assert.equal(detectFileType(truncatedPe), 'DOS / Legacy Executable (MZ)');

  // 3. Valid PE header with peOffset + 6 bytes
  const validPe = Buffer.alloc(0x46, 0);
  validPe[0] = 0x4D;
  validPe[1] = 0x5A;
  validPe.writeUInt32LE(0x40, 0x3C);
  validPe.write('PE\0\0', 0x40, 'ascii');
  validPe.writeUInt16LE(0x8664, 0x40 + 4);
  assert.ok(detectFileType(validPe).includes('x86_64'));

  // 4. EOF string extraction classifies URLs and IPs without trailing null/newline
  const eofBuf = Buffer.from('normal_prefix\0https://eof.example.com/payload', 'ascii');
  const { extractedStrings, interestingPatterns } = extractStringsAndIndicators(eofBuf, 6);
  assert.equal(extractedStrings.length, 2);
  assert.ok(interestingPatterns.urls.has('https://eof.example.com/payload'));
  assert.ok(calculateEntropy(eofBuf) > 0);
});

// ============================================================================
// 5. lookup.js, export-agents.js, and brain.js Tests
// ============================================================================
test('lookup.js: resolves rules, shortcuts, and searches agents directory', () => {
  const lookupScript = path.join(ROOT_DIR, 'tools', 'lookup.js');

  const ruleRes = spawnSync(process.execPath, [lookupScript, 'R_CORE'], { encoding: 'utf8' });
  assert.equal(ruleRes.status, 0);
  assert.ok(ruleRes.stdout.includes('[Rule Match: R_CORE]'));

  const agentSearchRes = spawnSync(
    process.execPath,
    [lookupScript, 'architect', '--type=agents'],
    { encoding: 'utf8' }
  );
  assert.equal(agentSearchRes.status, 0);
  assert.ok(agentSearchRes.stdout.includes('agents/'));
});

test('export-agents.js: resolveDestination places antigravity SKILL.md in <out>/<role>/SKILL.md and includes desc/rules/tools', () => {
  const dummyAgent = {
    role: 'rust-systems-architect',
    division: 'engineering',
    desc: 'Rust Low-Latency Architect',
    rules: ['R_CORE', 'R_RUST'],
    shortcuts: ['RUST_PERF'],
    tools: ['read_file', 'run_command'],
    body: '# Persona Body'
  };

  const dest = resolveDestination(dummyAgent, 'antigravity', './custom-out');
  assert.equal(dest, path.join(path.resolve('./custom-out'), 'rust-systems-architect', 'SKILL.md'));

  const renderedAg = renderAgent(dummyAgent, 'antigravity');
  const fm = parseFrontmatter(renderedAg);
  assert.equal(fm.name, 'rust-systems-architect');
  assert.equal(fm.desc, 'Rust Low-Latency Architect');
  assert.deepEqual(fm.rules, ['R_CORE', 'R_RUST']);
  assert.deepEqual(fm.tools, ['read_file', 'run_command']);
});

test('brain.js: resolveProjectName walks up parent directories to find .project-rule.md', () => {
  const subDir = path.join(ROOT_DIR, 'tools', 'lib');
  const resolved = resolveProjectName(subDir, {}, 'pre');
  assert.equal(resolved, 'agentic-core');
});

test('SemanticBrain project-helper & route-decision: infers all 13 stacks and returns recommended_agents', () => {
  const helperPath = 'E:\\Tools\\SemanticBrain\\tools\\project-helper.js';
  const routerPath = 'E:\\Tools\\SemanticBrain\\tools\\route-decision.js';
  if (!fs.existsSync(helperPath) || !fs.existsSync(routerPath)) return;

  const { inferTechTags } = require(helperPath);
  const { decideRoute } = require(routerPath);

  const tags = inferTechTags([
    'M src/lib.rs',
    'M app/main.py',
    'M pkg/worker.go',
    'M src/index.php',
    'M ui/View.tsx',
    'M server/api.js',
    'M native/dsp.cpp',
    'M game/Player.gd',
    'M Views/Main.xaml',
    'M Forms/Main.Designer.cs',
    'M db/mig.sql',
    'M Tests/OrderTests.cs'
  ]);

  for (const expected of [
    'rust',
    'python',
    'golang',
    'php',
    'react',
    'nodejs',
    'cpp',
    'embedded',
    'godot',
    'wpf',
    'winforms',
    'sql',
    'unit-test'
  ]) {
    assert.ok(tags.includes(expected), `Expected inferTechTags to include ${expected}`);
  }

  const routeRes = decideRoute('Optimize Rust zero-allocation SIMD hot loop and C-FFI boundary');
  assert.ok(routeRes.decision.target_rules.includes('R_RUST'));
  assert.ok(Array.isArray(routeRes.decision.recommended_agents));
  assert.ok(routeRes.decision.recommended_agents.some(a => a.shortcut === 'AGT_RUST_ARC'));
});

