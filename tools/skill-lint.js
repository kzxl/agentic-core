#!/usr/bin/env node
/**
 * AgentOption Skill Catalog & Description Quality Linter
 * 
 * Verifies that all agent skills have high-quality, routable descriptions and
 * detects semantic "Skill Collisions" (TF-IDF cosine similarity) that could cause
 * an LLM agent to misroute between sibling skills.
 * 
 * Inspired by agentskills.io, Anthropic Cybersecurity Skills, and Microsoft .NET Skills.
 * 
 * Rules:
 *   - name-matches-folder: Sovereign package frontmatter 'name' must match directory name.
 *   - desc-max-length: Frontmatter 'description' must be <= 1024 characters.
 *   - desc-ends-punctuation: Description must terminate with [.!?)"'] (truncation canary).
 *   - desc-has-use-when: Sovereign package descriptions must contain an explicit trigger clause ('Use when', 'USE FOR:').
 *   - desc-collision: Independent skill descriptions must not collide (TF-IDF cosine similarity < threshold, default 0.45).
 */

const fs = require('fs');
const path = require('path');
const core = require('./lib/framework-core.js');

const DEFAULT_COLLISION_THRESHOLD = 0.45;
const MAX_DESC_LENGTH = 1024;
const SENTENCE_ENDINGS = new Set(['.', '!', '?', ')', '"', "'"]);

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'with', 'using',
  'use', 'uses', 'used', 'when', 'this', 'that', 'is', 'are', 'be', 'by', 'from',
  'as', 'it', 'its', 'into', 'via', 'at', 'not', 'skill', 'agent', 'guide', 'workflow',
  'rule', 'standard', 'reference', 'patterns', 'pattern', 'module'
]);

// Strip negative disambiguation phrases so quoting an exclusion does not falsely raise similarity
const DISAMBIGUATION_RE = /\b(?:do\s+not\s+use|don'?t\s+use|not\s+for\b|avoid\s+(?:this\s+)?(?:skill\s+)?for)\b.*/is;

// Triggers for active routing
const TRIGGER_RE = /\b(?:use\s+(?:only\s+)?(?:this\s+)?(?:skill\s+)?(?:when|whenever|for|during|after|before|to)|use\s+for:|activates?\s+(?:when|for))\b/i;

/**
 * Tokenize text for TF-IDF calculation, stripping negative triggers and stopwords.
 */
function tokenize(text) {
  const cleaned = text.replace(DISAMBIGUATION_RE, ' ');
  const words = cleaned.toLowerCase().match(/[a-z0-9_-]{2,}/g) || [];
  return words.filter(w => !STOPWORDS.has(w));
}

/**
 * Lint an individual skill's frontmatter and description.
 */
function lintSkillDescription(filePath, frontmatter, isSovereignPackage = false) {
  const findings = [];
  const desc = (frontmatter.description || frontmatter.desc || '').trim();
  const relPath = path.relative(core.ROOT_DIR, filePath).replace(/\\/g, '/');

  if (isSovereignPackage) {
    const parentDir = path.basename(path.dirname(filePath));
    if (frontmatter.name && frontmatter.name !== parentDir) {
      findings.push({
        rule: 'name-matches-folder',
        severity: 'error',
        file: relPath,
        message: `Package frontmatter name '${frontmatter.name}' does not match directory name '${parentDir}'`
      });
    }
  }

  if (!desc) {
    findings.push({
      rule: 'desc-required',
      severity: 'error',
      file: relPath,
      message: 'Skill description is missing or empty'
    });
    return findings;
  }

  if (desc.length > MAX_DESC_LENGTH) {
    findings.push({
      rule: 'desc-max-length',
      severity: 'error',
      file: relPath,
      message: `Description length (${desc.length} chars) exceeds maximum allowed ${MAX_DESC_LENGTH} characters`
    });
  }

  const lastChar = desc[desc.length - 1];
  if (!SENTENCE_ENDINGS.has(lastChar)) {
    findings.push({
      rule: 'desc-ends-punctuation',
      severity: isSovereignPackage ? 'error' : 'warn',
      file: relPath,
      message: `Description does not end in terminal punctuation [.!?)"'] (truncation canary): '...${desc.slice(-15)}'`
    });
  }

  if (isSovereignPackage && !TRIGGER_RE.test(desc)) {
    findings.push({
      rule: 'desc-has-use-when',
      severity: 'warn',
      file: relPath,
      message: "Description lacks an explicit routing trigger clause ('Use when...', 'USE FOR:...')"
    });
  }

  return findings;
}

function inferPackage(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  // Match skills/<pkg>/SKILL.md or skills/<pkg>/(references|examples|resources)/...
  const match = normalized.match(/skills\/([^/]+)\/(?:SKILL\.md|(?:references|examples|resources)\/)/);
  if (match) return match[1];
  return null;
}

/**
 * Build TF-IDF representations for all skills.
 */
function buildSkillCorpus(skillEntries) {
  const docs = skillEntries.map(entry => {
    const name = entry.frontmatter.name || path.basename(entry.file, '.md');
    const desc = (entry.frontmatter.description || entry.frontmatter.desc || '').trim();
    const tokens = tokenize(`${name} ${desc}`);
    const pkg = entry.package || inferPackage(entry.file);
    return {
      file: entry.file,
      name,
      package: pkg,
      isPackage: entry.isPackage,
      desc,
      tokens
    };
  });

  const df = {};
  for (const doc of docs) {
    const seen = new Set(doc.tokens);
    for (const t of seen) {
      df[t] = (df[t] || 0) + 1;
    }
  }

  const N = docs.length;
  for (const doc of docs) {
    const tf = {};
    for (const t of doc.tokens) {
      tf[t] = (tf[t] || 0) + 1;
    }
    const vec = {};
    let norm = 0;
    for (const [t, count] of Object.entries(tf)) {
      // Skip terms appearing across > 40% of docs (minimum 5 docs) as domain background noise
      const maxDocFreq = Math.max(5, N * 0.4);
      if (df[t] > maxDocFreq) continue;
      const idf = Math.log(1 + (N / (1 + df[t])));
      const score = count * idf;
      vec[t] = score;
      norm += score * score;
    }
    doc.vec = vec;
    doc.norm = Math.sqrt(norm);
  }

  return docs;
}

/**
 * Detect skill collisions using pairwise cosine similarity.
 */
function detectCollisions(corpus, threshold = DEFAULT_COLLISION_THRESHOLD) {
  const collisions = [];

  for (let i = 0; i < corpus.length; i++) {
    for (let j = i + 1; j < corpus.length; j++) {
      const d1 = corpus[i];
      const d2 = corpus[j];

      // Exclude references belonging to the exact same package folder
      if (d1.package && d2.package && d1.package === d2.package) continue;
      if (d1.norm === 0 || d2.norm === 0) continue;

      let dot = 0;
      for (const [t, score] of Object.entries(d1.vec)) {
        if (d2.vec[t]) {
          dot += score * d2.vec[t];
        }
      }

      const sim = dot / (d1.norm * d2.norm);
      if (sim >= threshold) {
        collisions.push({
          s1: d1.file,
          s2: d2.file,
          similarity: Math.round(sim * 1000) / 1000
        });
      }
    }
  }

  collisions.sort((a, b) => b.similarity - a.similarity);
  return collisions;
}

/**
 * Scan all skills in the repository.
 */
function auditSkills(options = {}) {
  const threshold = parseFloat(options.threshold) || DEFAULT_COLLISION_THRESHOLD;
  const skillsDir = path.join(core.ROOT_DIR, 'skills');
  const allFiles = core.walkMarkdownFiles(skillsDir);

  const findings = [];
  const corpusEntries = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = core.parseFrontmatter(content);
    const relPath = path.relative(core.ROOT_DIR, filePath).replace(/\\/g, '/');
    const isSovereign = path.basename(filePath) === 'SKILL.md';

    const itemFindings = lintSkillDescription(filePath, fm, isSovereign);
    findings.push(...itemFindings);

    corpusEntries.push({
      file: relPath,
      frontmatter: fm,
      isPackage: isSovereign
    });
  }

  const corpus = buildSkillCorpus(corpusEntries);
  const collisions = detectCollisions(corpus, threshold);

  for (const col of collisions) {
    findings.push({
      rule: 'desc-collision',
      severity: col.similarity >= 0.60 ? 'error' : 'warn',
      file: `${col.s1} <--> ${col.s2}`,
      message: `Potential skill collision (TF-IDF similarity: ${col.similarity} >= ${threshold})`
    });
  }

  const errors = findings.filter(f => f.severity === 'error');
  const warnings = findings.filter(f => f.severity === 'warn');

  return {
    totalSkills: corpusEntries.length,
    sovereignPackages: corpusEntries.filter(c => c.isPackage).length,
    findings,
    errors,
    warnings,
    collisions
  };
}

// CLI entry point
if (require.main === module) {
  const args = core.parseCliArgs(process.argv.slice(2));
  const threshold = parseFloat(args.threshold) || DEFAULT_COLLISION_THRESHOLD;
  const asJson = Boolean(args.json);

  const result = auditSkills({ threshold });

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.errors.length > 0 ? 1 : 0);
  }

  console.log('🔍 Auditing AgentOption Skill Catalog & Descriptions...\n');
  console.log(`📊 Scanned ${result.totalSkills} skills (${result.sovereignPackages} sovereign packages)`);
  console.log(`🎯 Collision threshold: ${threshold}`);

  if (result.findings.length === 0) {
    console.log('✨ All skills passed description quality & zero collisions detected!\n');
    process.exit(0);
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    for (const w of result.warnings) {
      console.log(`   [${w.rule}] ${w.file}: ${w.message}`);
    }
  }

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    for (const err of result.errors) {
      console.log(`   [${err.rule}] ${err.file}: ${err.message}`);
    }
    console.log(`\n💥 Failed with ${result.errors.length} error(s).`);
    process.exit(1);
  }

  console.log(`\n✅ 0 errors (clean bill of health with ${result.warnings.length} advisory warning(s)).\n`);
  process.exit(0);
}

module.exports = {
  DEFAULT_COLLISION_THRESHOLD,
  MAX_DESC_LENGTH,
  tokenize,
  lintSkillDescription,
  buildSkillCorpus,
  detectCollisions,
  auditSkills
};
