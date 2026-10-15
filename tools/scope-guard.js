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
const { parseCliArgs } = require('./lib/framework-core');

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

// Normalize Target (strip http/https/port/path, lowercase hostname, handle IPv6 brackets)
function extractHostAndPort(raw) {
  let host = String(raw || '').trim();
  let port = null;

  if (host.includes('://')) {
    try {
      const parsed = new url.URL(host);
      host = parsed.hostname;
      port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    } catch {
      host = host.split('://')[1].split('/')[0];
    }
  } else {
    if (host.includes('/')) host = host.split('/')[0];
    if (host.startsWith('[')) {
      const m = host.match(/^\[([^\]]+)\](?::(\d+))?$/);
      if (m) {
        host = m[1];
        if (m[2]) port = parseInt(m[2], 10);
      }
    } else if (!net.isIPv6(host) && host.split(':').length === 2) {
      const parts = host.split(':');
      host = parts[0];
      port = parseInt(parts[1], 10);
    }
  }

  host = host.replace(/^\[|\]$/g, '').toLowerCase();
  return { host, port };
}

// IP & CIDR Helpers
function ipToLong(ip) {
  if (!net.isIPv4(ip)) return 0;
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIpInCidr(targetHost, cidrOrIp) {
  const cleanTarget = String(targetHost || '').trim().replace(/^\[|\]$/g, '').toLowerCase();
  const cleanRule = String(cidrOrIp || '').trim().replace(/^\[|\]$/g, '').toLowerCase();

  if (!cleanRule.includes('/')) {
    if (net.isIPv4(cleanTarget) && net.isIPv4(cleanRule)) {
      return cleanTarget === cleanRule;
    }
    if (net.isIPv6(cleanTarget) && net.isIPv6(cleanRule)) {
      return cleanTarget === cleanRule;
    }
    return false;
  }

  const [ip, bitsStr] = cleanRule.split('/');
  if (!net.isIPv4(cleanTarget) || !net.isIPv4(ip)) {
    return false;
  }

  const bits = parseInt(bitsStr, 10);
  if (Number.isNaN(bits) || bits < 0 || bits > 32) return false;
  const mask = bits === 0 ? 0 : (~(2 ** (32 - bits) - 1) >>> 0);
  return (ipToLong(cleanTarget) & mask) === (ipToLong(ip) & mask);
}

// Domain Wildcard Matching (*.example.com), case-insensitive
function matchDomain(domain, pattern) {
  const d = String(domain || '').trim().toLowerCase();
  const p = String(pattern || '').trim().toLowerCase();
  if (!d || !p) return false;
  if (d === p) return true;
  if (p.startsWith('*.')) {
    const rootPattern = p.substring(2);
    if (d === rootPattern || d.endsWith('.' + rootPattern)) {
      return true;
    }
  }
  return false;
}

function validateContractTimestamps(authorization, nowMs = Date.now()) {
  if (!authorization) {
    return { valid: false, reason: 'Missing authorization block' };
  }

  if (authorization.effective_start) {
    const rawStart = String(authorization.effective_start).trim();
    const startMs = /^\d{4}-\d{2}-\d{2}$/.test(rawStart)
      ? Date.parse(`${rawStart}T00:00:00.000Z`)
      : Date.parse(rawStart);
    if (Number.isNaN(startMs)) {
      return { valid: false, reason: `Malformed effective_start timestamp: "${rawStart}"` };
    }
    if (nowMs < startMs) {
      return { valid: false, reason: `Scope Contract is not yet active (effective_start: ${rawStart})` };
    }
  }

  if (authorization.effective_end) {
    const rawEnd = String(authorization.effective_end).trim();
    const endMs = /^\d{4}-\d{2}-\d{2}$/.test(rawEnd)
      ? Date.parse(`${rawEnd}T23:59:59.999Z`)
      : Date.parse(rawEnd);
    if (Number.isNaN(endMs)) {
      return { valid: false, reason: `Malformed effective_end timestamp: "${rawEnd}"` };
    }
    if (nowMs > endMs) {
      return { valid: false, reason: `Scope Contract has EXPIRED (effective_end: ${rawEnd})` };
    }
  }

  return { valid: true };
}

if (require.main === module) {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0 || rawArgs.includes('--help')) {
    printUsage();
    process.exit(rawArgs.length === 0 ? 1 : 0);
  }

  const parsedArgs = parseCliArgs(rawArgs);
  const flags = parsedArgs.flags;

  // 1. Initialize Contract Template Mode
  if (flags.init) {
    const initPath = typeof flags.init === 'string'
      ? flags.init
      : (parsedArgs.positional.find(a => a !== 'check') || '.scope-contract.json');
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
  const targetInput = parsedArgs.positional.find(a => a !== 'check');
  if (!targetInput) {
    printUsage();
    process.exit(1);
  }

  const outputJson = Boolean(flags.json);

  // Locate Contract File
  let contractPath = typeof flags.contract === 'string' ? flags.contract : '.scope-contract.json';
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
  } else {
    contractPath = resolvedContract;
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

  // Verify Effective Start & Effective End Timestamps against Date.now()
  const timeCheck = validateContractTimestamps(contract.authorization, Date.now());
  if (!timeCheck.valid) {
    if (outputJson) {
      console.log(JSON.stringify({ allowed: false, target: targetInput, reason: timeCheck.reason }, null, 2));
    }
    console.error(`🛑 BLOCKED: ${timeCheck.reason}`);
    process.exit(2);
  }

  const { host: targetHost, port: targetPort } = extractHostAndPort(targetInput);

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
    const allowedIps = (contract.in_scope && contract.in_scope.ip_ranges) || [];
    for (const range of allowedIps) {
      if (isIpInCidr(targetHost, range)) {
        isInScope = true;
        matchedRule = `IP matches allowed range: ${range}`;
        break;
      }
    }
  } else {
    const allowedDomains = (contract.in_scope && contract.in_scope.domains) || [];
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
  if (targetPort && contract.in_scope && contract.in_scope.allowed_ports) {
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
}

module.exports = {
  extractHostAndPort,
  ipToLong,
  isIpInCidr,
  matchDomain,
  validateContractTimestamps
};

