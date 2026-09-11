#!/usr/bin/env node

/**
 * AgentOption CVSS v3.1 Calculator & CWE Taxonomy Mapper
 * Computes deterministic CVSS v3.1 scores, sub-scores, and CWE mappings
 * adhering strictly to the FIRST.org mathematical standard.
 *
 * Usage:
 *   node tools/cvss.js "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
 *   node tools/cvss.js "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N" --markdown
 *   node tools/cvss.js --lookup "IDOR"
 */

const fs = require('fs');

function printUsage() {
  console.log(`
🧮 AgentOption CVSS v3.1 Deterministic Calculator
Usage:
  node tools/cvss.js <vector_string> [options]
  node tools/cvss.js --lookup <vulnerability_name>

Options:
  --markdown       Output as formatted markdown for vulnerability reports
  --json           Output as raw structured JSON
  --lookup <type>  Search suggested CVSS vectors and CWE IDs for vulnerability type
  --help           Show this help message

Example:
  node tools/cvss.js "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"
  node tools/cvss.js "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H" --markdown
`);
}

// Common Vulnerability Knowledge Base (Vector + CWE)
const VULN_CATALOG = [
  {
    name: 'BOLA / IDOR (Broken Object Level Authorization)',
    aliases: ['idor', 'bola', 'authorization bypass', 'insecure direct object reference'],
    cwe: 'CWE-639',
    cweName: 'Authorization Bypass Through User-Controlled Key',
    owasp: 'API1:2023 - Broken Object Level Authorization',
    suggestedVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N',
    desc: 'Unauthenticated or low-privilege user accesses resources of other tenants by manipulating entity ID in API.'
  },
  {
    name: 'SQL Injection (SQLi) - Unauthenticated Blind/Error',
    aliases: ['sqli', 'sql injection', 'database injection'],
    cwe: 'CWE-89',
    cweName: 'Improper Neutralization of Special Elements used in an SQL Command',
    owasp: 'A03:2021 - Injection',
    suggestedVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    desc: 'Attacker injects arbitrary SQL syntax, allowing full database read/write/administrative compromise.'
  },
  {
    name: 'Server-Side Request Forgery (SSRF) - Internal Metadata',
    aliases: ['ssrf', 'server-side request forgery', 'metadata ssrf'],
    cwe: 'CWE-918',
    cweName: 'Server-Side Request Forgery (SSRF)',
    owasp: 'A10:2021 - Server-Side Request Forgery',
    suggestedVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N',
    desc: 'Web server fetches internal resources on behalf of user, exposing Cloud Instance Metadata (IMDSv1) credentials.'
  },
  {
    name: 'Stored Cross-Site Scripting (Stored XSS)',
    aliases: ['xss', 'stored xss', 'persistent xss'],
    cwe: 'CWE-79',
    cweName: 'Improper Neutralization of Input During Web Page Generation',
    owasp: 'A03:2021 - Injection',
    suggestedVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N',
    desc: 'Malicious scripts stored in database execute in the browser context of other authenticated users.'
  },
  {
    name: 'Remote Code Execution (RCE) / Command Injection',
    aliases: ['rce', 'command injection', 'os command injection'],
    cwe: 'CWE-78',
    cweName: 'Improper Neutralization of Special Elements used in an OS Command',
    owasp: 'A03:2021 - Injection',
    suggestedVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    desc: 'Arbitrary system command execution on underlying host operating system.'
  },
  {
    name: 'Race Condition / Limit-Overrun (TOCTOU)',
    aliases: ['race condition', 'toctou', 'concurrency', 'double spend'],
    cwe: 'CWE-362',
    cweName: 'Concurrent Execution using Shared Resource with Improper Synchronization',
    owasp: 'A04:2021 - Insecure Design',
    suggestedVector: 'CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:H/A:N',
    desc: 'High-concurrency requests exploit collision window between check and mutation to double-spend funds or vouchers.'
  },
  {
    name: 'Broken Function Level Authorization (BFLA)',
    aliases: ['bfla', 'privilege escalation', 'admin endpoint bypass'],
    cwe: 'CWE-285',
    cweName: 'Improper Authorization',
    owasp: 'API5:2023 - Broken Function Level Authorization',
    suggestedVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
    desc: 'Regular user accesses administrative endpoints due to missing method-level role verification.'
  }
];

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

// 1. Check Lookup Mode
const lookupIdx = args.indexOf('--lookup');
if (lookupIdx !== -1 && args[lookupIdx + 1]) {
  const query = args[lookupIdx + 1].toLowerCase();
  const matches = VULN_CATALOG.filter(v => 
    v.name.toLowerCase().includes(query) ||
    v.aliases.some(a => a.includes(query)) ||
    v.cwe.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    console.log(`❌ No vulnerability templates found matching "${query}".`);
    process.exit(0);
  }

  console.log(`\n🔎 Found ${matches.length} matching vulnerability template(s):\n`);
  matches.forEach((m, idx) => {
    console.log(`[${idx + 1}] ${m.name}`);
    console.log(`    🆔 CWE:       ${m.cwe}: ${m.cweName}`);
    console.log(`    🛡️ OWASP:     ${m.owasp}`);
    console.log(`    📊 Vector:    ${m.suggestedVector}`);
    console.log(`    📝 Overview:  ${m.desc}\n`);
  });
  process.exit(0);
}

const vectorRaw = args.find(a => !a.startsWith('--'));
if (!vectorRaw) {
  printUsage();
  process.exit(1);
}

const showMarkdown = args.includes('--markdown');
const showJson = args.includes('--json');

// 2. CVSS v3.1 Metric Weight Constants (FIRST.org SSoT)
const METRICS = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.20 },
  AC: { L: 0.77, H: 0.44 },
  PR: {
    U: { N: 0.85, L: 0.62, H: 0.27 }, // Scope Unchanged
    C: { N: 0.85, L: 0.68, H: 0.50 }  // Scope Changed
  },
  UI: { N: 0.85, R: 0.62 },
  S:  { U: 'Unchanged', C: 'Changed' },
  C:  { N: 0.0, L: 0.22, H: 0.56 },
  I:  { N: 0.0, L: 0.22, H: 0.56 },
  A:  { N: 0.0, L: 0.22, H: 0.56 }
};

// 3. Parse Vector String
function parseVector(vStr) {
  let cleanStr = vStr.trim();
  if (cleanStr.startsWith('CVSS:3.1/')) {
    cleanStr = cleanStr.substring(9);
  } else if (cleanStr.startsWith('CVSS:3.0/')) {
    cleanStr = cleanStr.substring(9);
  }

  const parts = cleanStr.split('/');
  const parsed = {};
  for (const part of parts) {
    const [k, v] = part.split(':');
    if (k && v) {
      parsed[k.toUpperCase()] = v.toUpperCase();
    }
  }

  // Required Base Metrics
  const required = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'];
  const missing = required.filter(r => !parsed[r]);
  if (missing.length > 0) {
    throw new Error(`Incomplete CVSS vector. Missing mandatory metrics: ${missing.join(', ')}`);
  }

  // Value Validation
  for (const r of required) {
    const val = parsed[r];
    if (r === 'PR') {
      if (!['N', 'L', 'H'].includes(val)) throw new Error(`Invalid value for PR: ${val}`);
    } else if (r === 'S') {
      if (!['U', 'C'].includes(val)) throw new Error(`Invalid value for S: ${val}`);
    } else if (!METRICS[r][val] && METRICS[r][val] !== 0) {
      throw new Error(`Invalid value for ${r}: ${val}`);
    }
  }

  return parsed;
}

// 4. Calculate CVSS 3.1 Score
function calculateCvss(p) {
  const av = METRICS.AV[p.AV];
  const ac = METRICS.AC[p.AC];
  const pr = METRICS.PR[p.S][p.PR];
  const ui = METRICS.UI[p.UI];
  const scopeChanged = p.S === 'C';

  const c = METRICS.C[p.C];
  const i = METRICS.I[p.I];
  const a = METRICS.A[p.A];

  // ISS = 1 - [ (1 - ImpactConf) * (1 - ImpactInteg) * (1 - ImpactAvail) ]
  const iss = 1.0 - ((1.0 - c) * (1.0 - i) * (1.0 - a));

  // Impact
  let impact = 0;
  if (scopeChanged) {
    impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow((iss - 0.02), 15);
  } else {
    impact = 6.42 * iss;
  }

  // Exploitability = 8.22 * AV * AC * PR * UI
  const exploitability = 8.22 * av * ac * pr * ui;

  // RoundUp Macro (Ceiling to 1 decimal place with floating-point tolerance)
  function roundUp(val) {
    const rounded = Math.round(val * 100000);
    return (Math.ceil(rounded / 10000) / 10);
  }

  let baseScore = 0;
  if (impact <= 0) {
    baseScore = 0;
  } else if (!scopeChanged) {
    baseScore = roundUp(Math.min(impact + exploitability, 10));
  } else {
    baseScore = roundUp(Math.min(1.08 * (impact + exploitability), 10));
  }

  // Severity Rating
  let severity = 'None';
  if (baseScore >= 9.0) severity = 'Critical';
  else if (baseScore >= 7.0) severity = 'High';
  else if (baseScore >= 4.0) severity = 'Medium';
  else if (baseScore >= 0.1) severity = 'Low';

  const normalizedVector = `CVSS:3.1/AV:${p.AV}/AC:${p.AC}/PR:${p.PR}/UI:${p.UI}/S:${p.S}/C:${p.C}/I:${p.I}/A:${p.A}`;

  return {
    vector: normalizedVector,
    baseScore: parseFloat(baseScore.toFixed(1)),
    severity,
    impactSubScore: parseFloat(impact.toFixed(1)),
    exploitabilitySubScore: parseFloat(exploitability.toFixed(1)),
    metrics: {
      attackVector: { code: p.AV, label: p.AV === 'N' ? 'Network' : (p.AV === 'A' ? 'Adjacent' : (p.AV === 'L' ? 'Local' : 'Physical')) },
      attackComplexity: { code: p.AC, label: p.AC === 'L' ? 'Low' : 'High' },
      privilegesRequired: { code: p.PR, label: p.PR === 'N' ? 'None' : (p.PR === 'L' ? 'Low' : 'High') },
      userInteraction: { code: p.UI, label: p.UI === 'N' ? 'None' : 'Required' },
      scope: { code: p.S, label: p.S === 'U' ? 'Unchanged' : 'Changed' },
      confidentiality: { code: p.C, label: p.C === 'H' ? 'High' : (p.C === 'L' ? 'Low' : 'None') },
      integrity: { code: p.I, label: p.I === 'H' ? 'High' : (p.I === 'L' ? 'Low' : 'None') },
      availability: { code: p.A, label: p.A === 'H' ? 'High' : (p.A === 'L' ? 'Low' : 'None') }
    }
  };
}

let result;
try {
  const parsed = parseVector(vectorRaw);
  result = calculateCvss(parsed);
} catch (err) {
  console.error(`❌ CVSS Error: ${err.message}`);
  process.exit(1);
}

if (showJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (showMarkdown) {
  console.log(`
### Vulnerability Severity Rating (CVSS v3.1)

| Metric | Score / Value | Evaluation |
| :--- | :---: | :--- |
| **Base Score** | **${result.baseScore}** | **${result.severity.toUpperCase()}** |
| **CVSS Vector** | \`${result.vector}\` | Standard FIRST.org v3.1 |
| **Impact Sub-score** | ${result.impactSubScore} | Conf: ${result.metrics.confidentiality.label}, Integ: ${result.metrics.integrity.label}, Avail: ${result.metrics.availability.label} |
| **Exploitability Sub-score** | ${result.exploitabilitySubScore} | Vector: ${result.metrics.attackVector.label}, Compl: ${result.metrics.attackComplexity.label}, Priv: ${result.metrics.privilegesRequired.label}, UI: ${result.metrics.userInteraction.label} |
| **Scope Impact** | ${result.metrics.scope.label} | ${result.metrics.scope.code === 'C' ? 'Vulnerability breaks component security boundary' : 'Impact contained to vulnerable component'} |
`);
  process.exit(0);
}

// Default CLI Output
console.log(`\n================================================================`);
console.log(`🧮 CVSS v3.1 CALCULATION REPORT`);
console.log(`================================================================`);
console.log(`📊 Vector:         ${result.vector}`);
console.log(`🎯 Base Score:      ${result.baseScore} / 10.0`);
console.log(`🔥 Severity:        ${result.severity.toUpperCase()}`);
console.log(`----------------------------------------------------------------`);
console.log(`💥 Sub-scores:`);
console.log(`   Impact:         ${result.impactSubScore} / 10.0`);
console.log(`   Exploitability: ${result.exploitabilitySubScore} / 10.0`);
console.log(`----------------------------------------------------------------`);
console.log(`🧩 Metrics Breakdown:`);
console.log(`   Attack Vector (AV):        ${result.metrics.attackVector.code} (${result.metrics.attackVector.label})`);
console.log(`   Attack Complexity (AC):    ${result.metrics.attackComplexity.code} (${result.metrics.attackComplexity.label})`);
console.log(`   Privileges Required (PR):  ${result.metrics.privilegesRequired.code} (${result.metrics.privilegesRequired.label})`);
console.log(`   User Interaction (UI):     ${result.metrics.userInteraction.code} (${result.metrics.userInteraction.label})`);
console.log(`   Scope (S):                 ${result.metrics.scope.code} (${result.metrics.scope.label})`);
console.log(`   Confidentiality (C):       ${result.metrics.confidentiality.code} (${result.metrics.confidentiality.label})`);
console.log(`   Integrity (I):             ${result.metrics.integrity.code} (${result.metrics.integrity.label})`);
console.log(`   Availability (A):          ${result.metrics.availability.code} (${result.metrics.availability.label})`);
console.log(`================================================================\n`);
