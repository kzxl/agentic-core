const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  lintText,
  auditTokens,
  contrastRatio,
  parseUnifiedDiff
} = require('../tools/anti-slop-lint');

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'anti-slop');
const LINTER = path.join(__dirname, '..', 'tools', 'anti-slop-lint.js');

function lintFixture(relativePath, profile = 'enterprise') {
  const fullPath = path.join(FIXTURE_DIR, relativePath);
  return lintText(fs.readFileSync(fullPath, 'utf8'), fullPath, { profile });
}

function idsOf(result) {
  return result.findings.map(finding => finding.id);
}

function runLinter(args) {
  return spawnSync(process.execPath, [LINTER, ...args], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
}

// ============================================================================
// 1. One failing fixture per rule
// ============================================================================
const SLOP_CASES = [
  ['slop/as-02-glow.css', 'AS-02', 'error'],
  ['slop/as-03-infinite.css', 'AS-03', 'error'],
  ['slop/as-03-looping-utility.tsx', 'AS-03', 'error'],
  ['slop/as-03a-layout-transition.css', 'AS-03a', 'warn'],
  ['slop/as-03b-repeat.tsx', 'AS-03b', 'error'],
  ['slop/as-03c-no-reduced-motion.ts', 'AS-03c', 'warn'],
  ['slop/as-03d-no-cleanup.tsx', 'AS-03d', 'warn'],
  ['slop/as-03e-forbidden-plugin.tsx', 'AS-03e', 'error'],
  ['slop/as-03f-will-change.css', 'AS-03f', 'warn'],
  ['slop/as-04-pill.css', 'AS-04', 'error'],
  ['slop/as-04-pill.tsx', 'AS-04', 'error'],
  ['slop/as-05-emoji.tsx', 'AS-05', 'error'],
  ['slop/as-05-emoji.xaml', 'AS-05', 'error'],
  ['slop/as-06-gradient.css', 'AS-06', 'error'],
  ['slop/as-06-gradient.cs', 'AS-06', 'error'],
  ['slop/as-07-row-height.cs', 'AS-07', 'warn'],
  ['slop/as-07z-zebra.cs', 'AS-07z', 'warn'],
  ['slop/as-08-backdrop.css', 'AS-08', 'error'],
  ['slop/as-09-outline.css', 'AS-09', 'error'],
  ['slop/as-c1-trivial-comment.ts', 'AS-C1', 'warn'],
  ['slop/as-c2-dead-code.ts', 'AS-C2', 'error'],
  ['slop/as-c3-agent-tag.cs', 'AS-C3', 'error']
];

for (const [fixture, expectedId, expectedSeverity] of SLOP_CASES) {
  test(`anti-slop-lint: ${fixture} reports ${expectedId} as ${expectedSeverity}`, () => {
    const match = lintFixture(fixture).findings.find(finding => finding.id === expectedId);
    assert.ok(match, `expected ${expectedId} in ${fixture}`);
    assert.equal(match.severity, expectedSeverity);
    assert.ok(match.line >= 1);
  });
}

// ============================================================================
// 2. Clean fixtures
// ============================================================================
for (const fixture of ['clean/clean.css', 'clean/clean.tsx', 'clean/Clean.cs', 'clean/Clean.xaml']) {
  test(`anti-slop-lint: ${fixture} has zero findings`, () => {
    assert.deepEqual(lintFixture(fixture).findings, []);
  });
}

test('anti-slop-lint: allowlisted contexts pass (avatar pill, loading spinner, focus-visible replacement)', () => {
  const ids = idsOf(lintFixture('clean/clean.css'));
  assert.ok(!ids.includes('AS-04'));
  assert.ok(!ids.includes('AS-03'));
  assert.ok(!ids.includes('AS-09'));
});

// ============================================================================
// 3. Suppressions
// ============================================================================
test('anti-slop-lint: suppression with reason silences the finding and is listed', () => {
  const result = lintFixture('slop/suppression.css');
  assert.ok(!result.findings.some(finding => finding.line === 2));
  assert.equal(result.suppressions.length, 1);
  assert.equal(result.suppressions[0].line, 2);
  assert.deepEqual(result.suppressions[0].suppressed, ['AS-04']);
  assert.match(result.suppressions[0].reason, /presence dot/);
});

test('anti-slop-lint: suppression without reason keeps the finding and adds AS-SUPPRESS', () => {
  const lineSix = lintFixture('slop/suppression.css').findings.filter(finding => finding.line === 6);
  assert.deepEqual(lineSix.map(finding => finding.id).sort(), ['AS-04', 'AS-SUPPRESS']);
  assert.ok(lineSix.every(finding => finding.severity === 'error'));
});

// ============================================================================
// 4. Motion profiles
// ============================================================================
test('anti-slop-lint: AS-03e is an error in enterprise and silent in expressive', () => {
  assert.ok(idsOf(lintFixture('slop/as-03e-forbidden-plugin.tsx', 'enterprise')).includes('AS-03e'));
  assert.ok(!idsOf(lintFixture('slop/as-03e-forbidden-plugin.tsx', 'expressive')).includes('AS-03e'));
});

test('anti-slop-lint: AS-03b downgrades to a warning in expressive', () => {
  const expressive = lintFixture('slop/as-03b-repeat.tsx', 'expressive').findings.find(f => f.id === 'AS-03b');
  assert.equal(expressive.severity, 'warn');
});

// ============================================================================
// 5. Diff scoping and comment heuristics
// ============================================================================
test('anti-slop-lint: changedLines limits findings to added lines', () => {
  const fullPath = path.join(FIXTURE_DIR, 'slop', 'as-02-glow.css');
  const text = fs.readFileSync(fullPath, 'utf8');
  const result = lintText(text, fullPath, { changedLines: new Set([6]) });
  assert.deepEqual(result.findings.map(finding => finding.line), [6]);
});

test('anti-slop-lint: parseUnifiedDiff maps added line numbers per file', () => {
  const diff = [
    'diff --git a/src/app.css b/src/app.css',
    '--- a/src/app.css',
    '+++ b/src/app.css',
    '@@ -3,0 +4,2 @@',
    '+.a {}',
    '+.b {}',
    '@@ -10 +12 @@',
    '-old',
    '+new',
    'diff --git a/gone.css b/gone.css',
    '--- a/gone.css',
    '+++ /dev/null',
    '@@ -1 +0,0 @@',
    '-removed'
  ].join('\n');
  const changed = parseUnifiedDiff(diff);
  assert.deepEqual([...changed.keys()], ['src/app.css']);
  assert.deepEqual([...changed.get('src/app.css')], [4, 5, 12]);
});

test('anti-slop-lint: doc comments, banners, and documented formulas are not dead code', () => {
  const text = [
    '/// <summary>Rounds invoice totals to cents.</summary>',
    '// ---------------------------------------------------------------',
    '// ISS = 1 - [ (1 - ImpactConf) * (1 - ImpactInteg) ]',
    '// Retry once because the gateway drops the first TLS handshake.'
  ].join('\n');
  assert.deepEqual(lintText(text, 'Sample.cs').findings, []);
});

test('anti-slop-lint: unsupported extensions are ignored', () => {
  assert.deepEqual(lintText('anything', 'notes.md'), { findings: [], suppressions: [] });
});

// ============================================================================
// 6. Contrast math and token audit
// ============================================================================
test('anti-slop-lint: contrastRatio matches known WCAG values', () => {
  assert.ok(Math.abs(contrastRatio('#ffffff', '#005496') - 7.75) < 0.01);
  assert.ok(Math.abs(contrastRatio('#60687a', '#151822') - 3.17) < 0.01);
  assert.ok(contrastRatio('#868ea0', '#222736') >= 4.5);
  assert.equal(contrastRatio('#000', '#fff'), 21);
  assert.throws(() => contrastRatio('not-a-color', '#fff'), TypeError);
});

test('anti-slop-lint: binding contract tokens pass the audit', () => {
  const audit = auditTokens(fs.readFileSync(path.join(FIXTURE_DIR, 'tokens-valid.css'), 'utf8'));
  assert.equal(audit.passed, true, JSON.stringify(audit.failures));
  assert.ok(audit.checked.length > 0);
  assert.ok(!audit.checked.some(pair => pair.text === '--text-disabled'));
  const inputBorders = audit.checked.filter(pair => pair.text === '--border-input');
  assert.equal(inputBorders.length, 8);
  assert.ok(inputBorders.every(pair => pair.minimum === 3 && pair.ratio >= 3));
});

test('anti-slop-lint: legacy tokens fail the audit', () => {
  const audit = auditTokens(fs.readFileSync(path.join(FIXTURE_DIR, 'tokens-invalid.css'), 'utf8'));
  assert.equal(audit.passed, false);
  const dimOnSurface = audit.failures.find(f => f.text === '--text-dim' && f.surface === '--bg-surface');
  assert.equal(dimOnSurface.ratio, 3.17);
});

test('anti-slop-lint: old light muted #64748b fails on canvas and hover', () => {
  const audit = auditTokens(':root { --bg-canvas: #f4f6f9; --bg-surface: #ffffff; --bg-hover: #f1f5f9; --text-muted: #64748b; }');
  assert.deepEqual(audit.failures.map(f => f.surface).sort(), ['--bg-canvas', '--bg-hover']);
});

test('anti-slop-lint: semantic tints composite over the surface and pair only with their own fg', () => {
  const css = [
    ':root { --bg-surface: #151822; --success-fg: #5ba171; --success-bg: rgba(91, 161, 113, 0.12); --danger-bg: #ffffff; }'
  ].join('\n');
  const audit = auditTokens(css);
  assert.ok(audit.checked.some(pair => pair.surface === '--success-bg' && pair.passed));
  assert.ok(!audit.checked.some(pair => pair.surface === '--danger-bg'));
});

// ============================================================================
// 7. CLI
// ============================================================================
test('anti-slop-lint CLI: --all reports findings only for slop fixtures', () => {
  const result = runLinter(['--all', 'tests/fixtures/anti-slop', '--json', '--profile', 'enterprise']);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.length > 0);
  assert.ok(report.findings.every(finding => finding.file.includes('/slop/')));
});

test('anti-slop-lint CLI: --all on clean fixtures exits 0', () => {
  const result = runLinter(['--all', 'tests/fixtures/anti-slop/clean']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('anti-slop-lint CLI: --tokens exits 0 for valid and 1 for invalid tokens', () => {
  assert.equal(runLinter(['--tokens', 'tests/fixtures/anti-slop/tokens-valid.css']).status, 0);
  assert.equal(runLinter(['--tokens', 'tests/fixtures/anti-slop/tokens-invalid.css']).status, 1);
});

test('anti-slop-lint CLI: rejects an unknown profile', () => {
  assert.equal(runLinter(['--all', 'tests/fixtures/anti-slop/clean', '--profile', 'flashy']).status, 2);
});
