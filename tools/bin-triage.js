#!/usr/bin/env node

/**
 * AgentOption Binary Triage & Shannon Entropy Inspector
 * Performs static binary profiling, entropy calculation, magic byte detection,
 * and string extraction without third-party dependencies.
 *
 * Usage:
 *   node tools/bin-triage.js <filepath> [--strings] [--min-len=6] [--blocks]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function printUsage() {
  console.log(`
🔬 AgentOption Binary Triage & Shannon Entropy Scanner
Usage:
  node tools/bin-triage.js <file_path> [options]

Options:
  --strings       Extract and print printable ASCII/UTF-8 strings
  --min-len=N     Minimum string length for extraction (default: 6)
  --blocks        Print entropy distribution across 4KB blocks
  --json          Output result as structured JSON
  --help          Show this help message
`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const targetPath = path.resolve(args.find(a => !a.startsWith('--')));
const showStrings = args.includes('--strings');
const showBlocks = args.includes('--blocks');
const outputJson = args.includes('--json');

let minLen = 6;
const minLenArg = args.find(a => a.startsWith('--min-len='));
if (minLenArg) {
  minLen = parseInt(minLenArg.split('=')[1], 10) || 6;
}

if (!fs.existsSync(targetPath)) {
  console.error(`❌ Target file not found: ${targetPath}`);
  process.exit(1);
}

const stats = fs.statSync(targetPath);
if (!stats.isFile()) {
  console.error(`❌ Target is not a regular file: ${targetPath}`);
  process.exit(1);
}

const buffer = fs.readFileSync(targetPath);
const fileSize = buffer.length;

// 1. Calculate Hashes
const md5 = crypto.createHash('md5').update(buffer).digest('hex');
const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

// 2. Calculate Shannon Entropy
function calculateEntropy(buf) {
  if (buf.length === 0) return 0;
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < buf.length; i++) {
    frequencies[buf[i]]++;
  }
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / buf.length;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

const overallEntropy = calculateEntropy(buffer);

// Entropy classification
let entropyVerdict = 'Low (Plaintext / Sparsely encoded)';
let isLikelyPacked = false;
if (overallEntropy >= 7.2) {
  entropyVerdict = 'CRITICAL: Very High Entropy (Likely Packed, Encrypted, or Compressed)';
  isLikelyPacked = true;
} else if (overallEntropy >= 6.8) {
  entropyVerdict = 'High: Dense Code / Obfuscated / Compressed Assets';
} else if (overallEntropy >= 5.0) {
  entropyVerdict = 'Moderate: Standard Compiled Native Code';
}

// 3. Magic Bytes Identification
function detectFileType(buf) {
  if (buf.length < 4) return 'Unknown (file too small)';

  // Windows PE (MZ)
  if (buf[0] === 0x4D && buf[1] === 0x5A) {
    if (buf.length >= 0x40) {
      const peOffset = buf.readUInt32LE(0x3C);
      if (buf.length >= peOffset + 4 && buf.toString('ascii', peOffset, peOffset + 2) === 'PE') {
        const machine = buf.readUInt16LE(peOffset + 4);
        const arch = machine === 0x8664 ? 'x86_64' : (machine === 0x14C ? 'x86' : (machine === 0xAA64 ? 'ARM64' : 'Unknown'));
        return `Windows Portable Executable (PE32/PE32+) [Arch: ${arch}]`;
      }
    }
    return 'DOS / Legacy Executable (MZ)';
  }

  // Linux ELF
  if (buf[0] === 0x7F && buf[1] === 0x45 && buf[2] === 0x4C && buf[3] === 0x46) {
    const is64 = buf[4] === 2;
    const isLittleEndian = buf[5] === 1;
    return `Linux Executable and Linkable Format (ELF) [${is64 ? '64-bit' : '32-bit'}, ${isLittleEndian ? 'LSB' : 'MSB'}]`;
  }

  // macOS Mach-O
  if (buf.readUInt32BE(0) === 0xFEEDFACE || buf.readUInt32BE(0) === 0xFEEDFACF) {
    return 'macOS Mach-O Binary (Big-Endian)';
  }
  if (buf.readUInt32LE(0) === 0xFEEDFACE || buf.readUInt32LE(0) === 0xFEEDFACF) {
    return 'macOS Mach-O Binary (Little-Endian)';
  }

  // Unity global-metadata.dat
  if (buf.length >= 8 && buf.readUInt32LE(0) === 0xFAB11BAF) {
    const version = buf.readUInt32LE(4);
    return `Unity IL2CPP global-metadata.dat [Version: ${version}]`;
  }

  // Java Class
  if (buf.readUInt32BE(0) === 0xCAFEBABE) {
    return 'Java Bytecode (.class)';
  }

  // Android DEX
  if (buf.toString('ascii', 0, 4) === 'dex\n') {
    const version = buf.toString('ascii', 4, 7);
    return `Android Dalvik Executable (DEX) [Version: ${version}]`;
  }

  // ZIP / APK / JAR
  if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) {
    return 'ZIP Archive / Android APK / Java JAR';
  }

  // U-Boot uImage
  if (buf.readUInt32BE(0) === 0x27051956) {
    return 'U-Boot Legacy Image Header (uImage)';
  }

  // Device Tree Blob (DTB)
  if (buf.readUInt32BE(0) === 0xD00DFEED) {
    return 'Flattened Device Tree Blob (DTB)';
  }

  // SQLite Database
  if (buf.toString('ascii', 0, 15) === 'SQLite format 3') {
    return 'SQLite 3 Database File';
  }

  // GZIP
  if (buf[0] === 0x1F && buf[1] === 0x8B) {
    return 'GZIP Compressed Archive';
  }

  // PDF
  if (buf.toString('ascii', 0, 4) === '%PDF') {
    return 'Adobe Portable Document Format (PDF)';
  }

  // Shell script / text
  if (buf.toString('ascii', 0, 2) === '#!') {
    return 'Script executable (Shebang detected)';
  }

  return 'Unknown / Raw Binary Blob';
}

const fileType = detectFileType(buffer);

// 4. Block Entropy Profile (4KB chunks)
const blockSize = 4096;
const blockCount = Math.ceil(fileSize / blockSize);
const blockEntropies = [];

if (showBlocks || outputJson) {
  for (let i = 0; i < blockCount; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, fileSize);
    const chunk = buffer.subarray(start, end);
    blockEntropies.push({
      block: i,
      offsetHex: '0x' + start.toString(16).padStart(8, '0'),
      entropy: parseFloat(calculateEntropy(chunk).toFixed(3))
    });
  }
}

// 5. String Extraction & Patterns
const extractedStrings = [];
const interestingPatterns = {
  ips: new Set(),
  urls: new Set(),
  paths: new Set()
};

if (showStrings || outputJson) {
  let currentStr = '';
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte >= 32 && byte <= 126) {
      currentStr += String.fromCharCode(byte);
    } else {
      if (currentStr.length >= minLen) {
        extractedStrings.push(currentStr);
        // Check patterns
        if (/https?:\/\/[^\s"']+/.test(currentStr)) {
          const match = currentStr.match(/https?:\/\/[^\s"']+/);
          if (match) interestingPatterns.urls.add(match[0]);
        }
        if (/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(currentStr)) {
          const match = currentStr.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
          if (match) interestingPatterns.ips.add(match[0]);
        }
        if (/(?:[a-zA-Z]:\\[^<>:"/\\|?*\n\r]+|\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)+)/.test(currentStr)) {
          const match = currentStr.match(/(?:[a-zA-Z]:\\[^<>:"/\\|?*\n\r]+|\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)+)/);
          if (match) interestingPatterns.paths.add(match[0]);
        }
      }
      currentStr = '';
    }
  }
  if (currentStr.length >= minLen) {
    extractedStrings.push(currentStr);
  }
}

// Output Formatting
if (outputJson) {
  const result = {
    file: targetPath,
    size: fileSize,
    hashes: { md5, sha1, sha256 },
    fileType,
    entropy: {
      score: parseFloat(overallEntropy.toFixed(3)),
      verdict: entropyVerdict,
      isLikelyPacked
    },
    blocks: showBlocks ? blockEntropies : undefined,
    interestingStrings: {
      urls: [...interestingPatterns.urls],
      ips: [...interestingPatterns.ips],
      paths: [...interestingPatterns.paths]
    },
    stringCount: extractedStrings.length
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(`\n================================================================`);
console.log(`🔬 BINARY TRIAGE REPORT: ${path.basename(targetPath)}`);
console.log(`================================================================`);
console.log(`📁 Path:       ${targetPath}`);
console.log(`📊 Size:       ${fileSize.toLocaleString()} bytes (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`🔍 File Type:  ${fileType}`);
console.log(`----------------------------------------------------------------`);
console.log(`🔑 Hashes:`);
console.log(`   MD5:        ${md5}`);
console.log(`   SHA-1:      ${sha1}`);
console.log(`   SHA-256:    ${sha256}`);
console.log(`----------------------------------------------------------------`);
console.log(`📈 Shannon Entropy: ${overallEntropy.toFixed(3)} / 8.000`);
console.log(`   Verdict:    ${entropyVerdict}`);
if (isLikelyPacked) {
  console.log(`   ⚠️ ADVISORY: Entropy >= 7.2 indicates packed/encrypted code.`);
  console.log(`      Recommend running OEP discovery (REV_UNPACK) or in-memory dynamic dump.`);
}

if (showBlocks) {
  console.log(`\n📊 Block Entropy Map (4KB chunks):`);
  const step = Math.max(1, Math.floor(blockCount / 32));
  for (let i = 0; i < blockCount; i += step) {
    const b = blockEntropies[i];
    const barLen = Math.round((b.entropy / 8) * 20);
    const bar = '█'.repeat(barLen) + '░'.repeat(20 - barLen);
    console.log(`   ${b.offsetHex}: [${bar}] ${b.entropy.toFixed(2)}`);
  }
}

if (interestingPatterns.urls.size > 0 || interestingPatterns.ips.size > 0 || interestingPatterns.paths.size > 0) {
  console.log(`\n🌐 Extracted Indicators & Artifacts:`);
  if (interestingPatterns.urls.size > 0) {
    console.log(`   URLs (${interestingPatterns.urls.size}):`);
    [...interestingPatterns.urls].slice(0, 10).forEach(u => console.log(`     - ${u}`));
  }
  if (interestingPatterns.ips.size > 0) {
    console.log(`   IPs (${interestingPatterns.ips.size}):`);
    [...interestingPatterns.ips].slice(0, 10).forEach(ip => console.log(`     - ${ip}`));
  }
  if (interestingPatterns.paths.size > 0) {
    console.log(`   Paths (${interestingPatterns.paths.size}):`);
    [...interestingPatterns.paths].slice(0, 5).forEach(p => console.log(`     - ${p}`));
  }
}

if (showStrings) {
  console.log(`\n📝 Extracted Strings (Total: ${extractedStrings.length}, MinLen: ${minLen}):`);
  extractedStrings.slice(0, 50).forEach(s => console.log(`   ${s}`));
  if (extractedStrings.length > 50) {
    console.log(`   ... [truncated ${extractedStrings.length - 50} additional strings]`);
  }
}

console.log(`================================================================\n`);
