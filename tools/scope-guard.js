#!/usr/bin/env node

/**
 * AgentOption Security Scope Guard & Pre-Flight Gate
 * Enforces R_SEC and R_PENTEST invariants by asserting that all target URLs,
 * hostnames, and IP addresses reside strictly within an authorized Scope Contract.
 *
 * Usage:
 *   node tools/scope-guard.js check <target> [--contract=.scope-contract.json]
 *   node tools/scope-guard.js --init
 */

const fs = require('fs');
const path = require('path');
const url = require('url');
const net = require('net');

function printUsage() {
  console.log(`
🛡️ AgentOption Security Scope Guard & Pre-Flight Gate
Usage:
  node tools/scope-guard.js check <target_url_or_host> [options]
  node tools/scope-guard.js --init [path]

Options:
  --contract=<path>  Path to .scope-contract.json (default: ./.scope-contract.json or root)
  --json             Output result in JSON format
  --help             Show this help message

Invariants Enforced:
  • R_SEC: Strict scope gate (auth.status=granted required before target ACT)
  • R_PENTEST: Zero-unauthorized probing (authorized scope contract required)
`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

// 1. Initialize Contract Template Mode
if (args.includes('--init')) {
  const initPath = args.find(a => !a.startsWith('--') && a !== 'check') || '.scope-contract.json';
  const targetFile = path.resolve(initPath);

  if (fs.existsSync(targetFile)) {
    console.error(`⚠️ Scope contract already exists at: ${targetFile}`);
    process.exit(1);
  }

  const template = {
    contract_version: "1.0",
    authorization: {
      client_name: "Example Organization Inc.",
      authorized_by: "Security Operations Officer",
      status: "granted",
      effective_start: new Date().toISOString().split('T')[0],
      effective_end: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    },
    in_scope: {
      domains: [
        "*.test.example.com",
        "api-staging.example.com"
      ],
      ip_ranges: [
        "192.168.100.0/24",
        "10.10.10.50"
      ],
      allowed_ports: [80, 443, 8080, 8443]
    },
    out_of_scope: {
      forbidden_targets: [
        "prod.example.com",
        "database.example.com",
        "192.168.100.1"
      ],
      prohibited_actions: [
        "Denial of Service (DDoS/Stress Testing)",
        "Destructive Database Modifications (DROP/TRUNCATE)",
        "Social Engineering / Phishing Internal Personnel"
      ]
    }
  };

  fs.writeFileSync(targetFile, JSON.stringify(template, null, 2), 'utf8');
  console.log(`✅ Created starter Scope Contract at: ${targetFile}`);
  process.exit(0);
}

// 2. Check Target Mode
const checkIdx = args.indexOf('check');
let targetInput = args.find((a, idx) => !a.startsWith('--') && idx !== checkIdx);
if (!targetInput) {
  printUsage();
  process.exit(1);
}

const outputJson = args.includes('--json');

// Locate Contract File
let contractPath = '.scope-contract.json';
const contractArg = args.find(a => a.startsWith('--contract='));
if (contractArg) {
  contractPath = contractArg.split('=')[1];
}

const resolvedContract = path.resolve(contractPath);
if (!fs.existsSync(resolvedContract)) {
  const rootContract = path.resolve(__dirname, '..', '.scope-contract.json');
  if (fs.existsSync(rootContract)) {
    contractPath = rootContract;
  } else {
    console.error(`🛑 BLOCKED: Missing Scope Contract file (.scope-contract.json)!`);
    console.error(`   Per R_PENTEST & R_SEC, security testing is FORBIDDEN without an explicit Scope Contract.`);
    console.error(`   👉 Run: node tools/scope-guard.js --init to bootstrap one.`);
    process.exit(1);
  }
}

let contract;
try {
  contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
} catch (err) {
  console.error(`❌ Malformed Scope Contract JSON: ${err.message}`);
  process.exit(2);
}

// Verify Authorization Status
if (!contract.authorization || contract.authorization.status !== 'granted') {
  console.error(`🛑 BLOCKED: Scope Contract authorization status is NOT 'granted' (Current: "${contract.authorization ? contract.authorization.status : 'missing'}").`);
  process.exit(1);
}

// Normalize Target (strip http/https/port/path)
function extractHostAndPort(raw) {
  let host = raw.trim();
  let port = null;

  if (host.includes('://')) {
    try {
      const parsed = new url.URL(host);
      host = parsed.hostname;
      port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    } catch (e) {
      host = host.split('://')[1].split('/')[0];
    }
  } else {
    if (host.includes('/')) host = host.split('/')[0];
    if (host.includes(':')) {
      const parts = host.split(':');
      host = parts[0];
      port = parseInt(parts[1], 10);
    }
  }
  return { host, port };
}

const { host: targetHost, port: targetPort } = extractHostAndPort(targetInput);

// IP & CIDR Helpers
function ipToLong(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIpInCidr(ip, cidr) {
  if (!cidr.includes('/')) {
    return ip === cidr;
  }
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1) >>> 0;
  return (ipToLong(ip) & mask) === (ipToLong(range) & mask);
}

// Domain Wildcard Matching (*.example.com)
function matchDomain(domain, pattern) {
  if (domain === pattern) return true;
  if (pattern.startsWith('*.')) {
    const rootPattern = pattern.substring(2);
    if (domain === rootPattern || domain.endsWith('.' + rootPattern)) {
      return true;
    }
  }
  return false;
}

// 3. Evaluate Target
const isIp = net.isIP(targetHost);
let isExplicitlyForbidden = false;
let forbiddenReason = '';

// Check Out-of-Scope (Forbidden List)
const forbidden = contract.out_of_scope ? (contract.out_of_scope.forbidden_targets || []) : [];
for (const fb of forbidden) {
  if (isIp && isIpInCidr(targetHost, fb)) {
    isExplicitlyForbidden = true;
    forbiddenReason = `Matches out-of-scope forbidden target: ${fb}`;
    break;
  } else if (!isIp && matchDomain(targetHost, fb)) {
    isExplicitlyForbidden = true;
    forbiddenReason = `Matches out-of-scope forbidden domain: ${fb}`;
    break;
  }
}

if (isExplicitlyForbidden) {
  if (outputJson) {
    console.log(JSON.stringify({ allowed: false, target: targetInput, host: targetHost, reason: forbiddenReason }, null, 2));
  } else {
    console.log(`\n================================================================`);
    console.log(`🛑 SCOPE GATE: FORBIDDEN TARGET [BLOCKED]`);
    console.log(`================================================================`);
    console.log(`🎯 Target:       ${targetInput} (Resolved Host: ${targetHost})`);
    console.log(`🚫 Reason:       ${forbiddenReason}`);
    console.log(`⚠️ VIOLATION:    Target is explicitly registered in out_of_scope!`);
    console.log(`================================================================\n`);
  }
  process.exit(1);
}

// Check In-Scope
let isInScope = false;
let matchedRule = '';

if (isIp) {
  const allowedIps = contract.in_scope.ip_ranges || [];
  for (const range of allowedIps) {
    if (isIpInCidr(targetHost, range)) {
      isInScope = true;
      matchedRule = `IP matches allowed range: ${range}`;
      break;
    }
  }
} else {
  const allowedDomains = contract.in_scope.domains || [];
  for (const dom of allowedDomains) {
    if (matchDomain(targetHost, dom)) {
      isInScope = true;
      matchedRule = `Domain matches allowed pattern: ${dom}`;
      break;
    }
  }
}

// Check Port if specified
let portAllowed = true;
if (targetPort && contract.in_scope.allowed_ports) {
  if (!contract.in_scope.allowed_ports.includes(targetPort)) {
    portAllowed = false;
  }
}

if (!isInScope) {
  const reason = `Target ${targetHost} is not covered by any allowed in_scope domain or IP range`;
  if (outputJson) {
    console.log(JSON.stringify({ allowed: false, target: targetInput, host: targetHost, reason }, null, 2));
  } else {
    console.log(`\n================================================================`);
    console.log(`🛑 SCOPE GATE: TARGET OUT-OF-SCOPE [BLOCKED]`);
    console.log(`================================================================`);
    console.log(`🎯 Target:       ${targetInput} (Host: ${targetHost})`);
    console.log(`🚫 Reason:       ${reason}`);
    console.log(`📜 Contract:     ${contractPath}`);
    console.log(`⚠️ ACTION REQUIRED: Update .scope-contract.json or abort operation.`);
    console.log(`================================================================\n`);
  }
  process.exit(1);
}

if (!portAllowed) {
  const reason = `Port ${targetPort} is not in allowed_ports: [${contract.in_scope.allowed_ports.join(', ')}]`;
  if (outputJson) {
    console.log(JSON.stringify({ allowed: false, target: targetInput, port: targetPort, reason }, null, 2));
  } else {
    console.log(`\n🛑 SCOPE GATE: Port ${targetPort} is NOT permitted by Scope Contract!`);
  }
  process.exit(1);
}

// Allowed
if (outputJson) {
  console.log(JSON.stringify({
    allowed: true,
    target: targetInput,
    host: targetHost,
    port: targetPort,
    matchedRule,
    authorizedBy: contract.authorization.authorized_by,
    contractFile: contractPath
  }, null, 2));
} else {
  console.log(`\n================================================================`);
  console.log(`✅ SCOPE GATE: TARGET AUTHORIZED [ALLOWED]`);
  console.log(`================================================================`);
  console.log(`🎯 Target:         ${targetInput}`);
  console.log(`🌐 Resolved Host:  ${targetHost}${targetPort ? ':' + targetPort : ''}`);
  console.log(`📜 Matched Rule:   ${matchedRule}`);
  console.log(`✍️ Authorized By:  ${contract.authorization.authorized_by} (${contract.authorization.client_name})`);
  console.log(`📅 Validity:       ${contract.authorization.effective_start} -> ${contract.authorization.effective_end}`);
  console.log(`================================================================\n`);
}
process.exit(0);
