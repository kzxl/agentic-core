const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const skillLint = require('../tools/skill-lint.js');

test('skill-lint: tokenize strips negative disambiguation triggers and common stopwords', () => {
  const text = 'Parses JSON web tokens. Use when verifying JWT signatures. Do not use for OAuth 2.0 flows - use oauth-skill.';
  const tokens = skillLint.tokenize(text);

  // Negative trigger text "OAuth 2.0 flows - use oauth-skill" should be stripped
  assert.equal(tokens.includes('oauth-skill'), false, 'Should strip oauth-skill from vector');
  assert.equal(tokens.includes('oauth'), false, 'Should strip oauth from vector');

  // Active descriptive terms should remain
  assert.equal(tokens.includes('parses'), true, 'Should include parses');
  assert.equal(tokens.includes('json'), true, 'Should include json');
  assert.equal(tokens.includes('jwt'), true, 'Should include jwt');
  assert.equal(tokens.includes('signatures'), true, 'Should include signatures');

  // Stopwords should be removed
  assert.equal(tokens.includes('the'), false, 'Should remove "the"');
  assert.equal(tokens.includes('when'), false, 'Should remove "when"');
});

test('skill-lint: lintSkillDescription enforces length and punctuation rules', () => {
  // Test valid description
  const validFm = {
    name: 'test-skill',
    description: 'A well-crafted skill description. Use when testing.'
  };
  const validFindings = skillLint.lintSkillDescription('skills/test-skill/SKILL.md', validFm, true);
  assert.equal(validFindings.filter(f => f.severity === 'error').length, 0);

  // Test missing terminal punctuation canary
  const noPunctFm = {
    name: 'test-skill',
    description: 'A description without ending period'
  };
  const punctFindings = skillLint.lintSkillDescription('skills/test-skill/SKILL.md', noPunctFm, true);
  assert.ok(punctFindings.some(f => f.rule === 'desc-ends-punctuation'));

  // Test description exceeding 1024 chars
  const longFm = {
    name: 'test-skill',
    description: 'A'.repeat(1025) + '.'
  };
  const longFindings = skillLint.lintSkillDescription('skills/test-skill/SKILL.md', longFm, true);
  assert.ok(longFindings.some(f => f.rule === 'desc-max-length' && f.severity === 'error'));

  // Test mismatched folder name for sovereign package
  const mismatchedFm = {
    name: 'different-name',
    description: 'Valid description. Use when testing.'
  };
  const mismatchFindings = skillLint.lintSkillDescription('skills/test-skill/SKILL.md', mismatchedFm, true);
  assert.ok(mismatchFindings.some(f => f.rule === 'name-matches-folder' && f.severity === 'error'));
});

test('skill-lint: detectCollisions detects semantic twin collisions and ignores same-package references', () => {
  const syntheticEntries = [
    {
      file: 'skills/docker-hardening/SKILL.md',
      package: 'docker-hardening',
      isPackage: true,
      frontmatter: {
        name: 'docker-hardening',
        description: 'Hardening Docker daemon and container runtime configurations. Use when securing Docker.'
      }
    },
    {
      file: 'skills/docker-security-audit/SKILL.md',
      package: 'docker-security-audit',
      isPackage: true,
      frontmatter: {
        name: 'docker-security-audit',
        description: 'Hardening Docker daemon and container runtime configurations for security audit. Use when securing Docker.'
      }
    },
    {
      file: 'skills/docker-hardening/references/runtime.md',
      package: 'docker-hardening',
      isPackage: false,
      frontmatter: {
        name: 'docker-hardening-runtime',
        description: 'Hardening Docker daemon and container runtime configurations details.'
      }
    }
  ];

  const corpus = skillLint.buildSkillCorpus(syntheticEntries);
  const collisions = skillLint.detectCollisions(corpus, 0.40);

  // The two distinct packages should collide
  assert.ok(collisions.some(c => c.s1.includes('docker-hardening/SKILL.md') && c.s2.includes('docker-security-audit/SKILL.md')));

  // The reference inside the same package should NOT be reported as collision
  assert.equal(
    collisions.some(c => c.s1.includes('docker-hardening/SKILL.md') && c.s2.includes('docker-hardening/references')),
    false,
    'Should not report collision within the same package'
  );
});

test('skill-lint: auditSkills passes on repository with 0 errors', () => {
  const result = skillLint.auditSkills({ threshold: 0.45 });
  assert.equal(result.errors.length, 0, `Expected 0 errors in skill catalog, got: ${JSON.stringify(result.errors)}`);
  assert.ok(result.totalSkills > 50, 'Expected at least 50 skills in catalog');
});
