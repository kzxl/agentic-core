#!/usr/bin/env node

/**
 * Anti-Slop Linter
 * Enforces the AS-xx rules of standards/universal/ui-anti-ai-slop-standard.md on
 * added lines (--diff, default), whole trees (--all <path>), or token files (--tokens <file>).
 * Exit code 1 when any error-severity finding or token contrast failure exists; warnings never fail.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseFrontmatter, parseCliArgs } = require('./lib/framework-core');

const ERROR = 'error';
const WARN = 'warn';
const DEFAULT_PROFILE = 'enterprise';
const PROFILES = new Set(['enterprise', 'expressive']);
const MIN_TEXT_CONTRAST = 4.5;
const MIN_NON_TEXT_CONTRAST = 3;
const DESKTOP_ROW_HEIGHT = { min: 24, max: 28 };
const PROJECT_RULE_FILE = '.project-rule.md';

const FAMILY_BY_EXTENSION = {
  '.css': 'style',
  '.scss': 'style',
  '.less': 'style',
  '.html': 'markup',
  '.htm': 'markup',
  '.vue': 'markup',
  '.svelte': 'markup',
  '.tsx': 'script',
  '.jsx': 'script',
  '.ts': 'script',
  '.js': 'script',
  '.mjs': 'script',
  '.cjs': 'script',
  '.xaml': 'xaml',
  '.cs': 'csharp',
  '.resx': 'resx'
};

const WEB_FAMILIES = new Set(['style', 'markup', 'script']);
const DESKTOP_FAMILIES = new Set(['xaml', 'csharp']);
const CODE_FAMILIES = new Set(['markup', 'script']);

const LINE_COMMENT_EXTENSIONS = new Set([
  '.scss', '.less', '.html', '.htm', '.vue', '.svelte',
  '.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.cs'
]);
const BLOCK_COMMENT_EXTENSIONS = new Set([
  '.css', '.scss', '.less', '.html', '.htm', '.vue', '.svelte',
  '.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.cs'
]);
const MARKUP_COMMENT_EXTENSIONS = new Set(['.html', '.htm', '.vue', '.svelte', '.xaml', '.resx']);

const WALK_EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'build', 'bin', 'obj', 'coverage', 'out']);

// The linter's own slop fixtures must stay committable without tripping the diff gate.
const DIFF_EXCLUDED_PATH = /(?:^|\/)(?:node_modules|dist|build|bin|obj)\/|\.min\.|(?:^|\/)fixtures\/anti-slop\//;

// Character classes like [x] keep these patterns from matching their own source text.
const PATTERNS = {
  textShadowDeclaration: /(?:text-shadow|textShadow)\s*:/,
  textShadowUtility: /\btext-shadow-(?:2xs|xs|sm|md|lg|xl|\[)/,
  boxShadowDeclaration: /(?:box-shadow|boxShadow)\s*:\s*(.+)$/,
  arbitraryShadowUtility: /\bshadow-\[([^\]]+)\]/g,
  coloredShadowUtility: /\bshadow-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
  dropShadowFilter: /\bdrop-shadow\(((?:[^()]|\([^()]*\))*)\)/g,
  xamlDropShadow: /<DropShadowEffect\b[^>]*\bColor\s*=\s*"([^"]+)"/,
  loopingCssAnimation: /\binfinit[e]\b/,
  animationKeyword: /animation/i,
  loopingUtility: /\banimate-(?:pulse|bounce|ping)\b/,
  spinnerContext: /spin|loader|loading|skeleton|busy|indeterminate|progress/i,
  layoutTransition: /\btransition(?:-property|Property)?\s*:\s*([^;]*)/,
  layoutTransitionUtility: /\btransition-\[[^\]]*\b(?:width|height|top|left|right|bottom|margin|padding)\b/,
  layoutPropertyName: /(?:^|[\s,'"])(?:(?:max-|min-)?(?:width|height)|top|left|right|bottom|margin[\w-]*|padding[\w-]*)\b/,
  gsapLayoutVar: /\b(?:width|height|top|left|right|bottom|margin\w*|padding\w*)\s*:/g,
  jsLoopingRepeat: /\b(?:repeat\s*:\s*(?:-1\b|Infinity\b)|iterations\s*:\s*Infinity\b)/,
  gsapImport: /\bfrom\s+['"]gsap(?:\/[\w-]+)?['"]|\bimport\s+['"]gsap(?:\/[\w-]+)?['"]|\brequire\(\s*['"]gsap(?:\/[\w-]+)?['"]\s*\)/,
  gsapCall: /\bgsap\s*\.\s*(?:to|from|fromTo|timeline|set|registerPlugin|matchMedia|context)\s*\(/,
  gsapTweenInEffect: /\bgsap\s*\.\s*(?:to|from|fromTo|timeline|set)\s*\(/g,
  tweenCall: /\b[\w$]+\s*\.\s*(?:to|from|fromTo)\s*\(/g,
  effectHook: /\buseEffect\s*\(/g,
  animationCleanup: /\.revert\s*\(|\bcontext\s*\(|\.kill\s*\(/,
  reducedMotionGate: /prefers-reduced-motion|matchMedia/,
  pluginImportContext: /\b(?:import|require|registerPlugin)\b/,
  scrollPin: /\bpin\s*:\s*true\b/,
  scrollScrub: /\bscrub\s*:/,
  smootherCreate: /\bScrollSmoother\s*\.\s*create\s*\(/,
  willChange: /will-change\s*:/,
  pillRadius: /\b9{3,}p[x]\b/,
  pillUtility: /\brounded-ful[l](?![\w-])/,
  pillTokenDefinition: /--[\w-]*pill[\w-]*\s*:/,
  pillAllowedContext: /avatar|count|counter|notif|unread|spinner|loader/i,
  emoji: /(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}/u,
  cssGradient: /\b(?:linear|radial|conic)-gradien[t]\s*\(/,
  gradientUtility: /\bbg-gradient-to-[trbl]|\bbg-(?:linear|radial|conic)\b/,
  gradientBrush: /\b(?:Linear|Radial)GradientBrus[h]\b/,
  winFormsGradient: /\bBackColor2\s*=|\bGradientMode\s*=/,
  rowHeight: /\b(?:RowHeight|RowTemplate\.Height)\s*=\s*"?(\d+)/,
  zebraStriping: /\bEnableAppearance(?:Even|Odd)Row\s*=\s*true\b|\bAlternationCount\s*=\s*"[2-9]"|\bAlternatingRowBackground\s*=|\bAlternatingRowsDefaultCellStyle\b/,
  backdropBlur: /(?:backdrop-filter|backdropFilter)\s*:|\bbackdrop-blu[r]\b/,
  removedOutline: /\boutline\s*:\s*['"]?(?:none|0)\b|\boutline-(?:non[e]|0)\b/,
  focusVisible: /focus-visible/,
  hiddenDesktopFocus: /\bFocusRectStyle\s*=\s*[\w.]*\bNon[e]\b|\bFocusVisualStyle\s*=\s*"\{x:Nul[l]\}"/,
  trivialVerbComment: /^\s*(?:get|gets|set|sets|check|checks|return|returns|call|calls|handle|handles|loop|loops|init|initialize|initialise|create|creates|increment|iterate)\b/i,
  agentAttribution: /\b(?:added|modified|fixed|updated|changed|generated|created|written|refactored|edited)\s+(?:by|with|via)\s+(?:an?\s+)?(?:ai|agent|claude|gemini|gpt[\w.-]*|chatgpt|copilot|antigravity|cursor|llm)\b/i,
  agentBracketTag: /\[(?:ai|agent|claude|gemini|gpt|chatgpt|copilot|antigravity|cursor)\]|@(?:ai|agent|claude|gemini|copilot|antigravity)\b/i,
  agentName: /\b(?:ai|agent|claude|gemini|chatgpt|copilot|antigravity|cursor)\b/i,
  isoDate: /\b\d{4}-\d{2}-\d{2}\b/,
  suppression: /anti-slop-ignore\s+(AS-[A-Za-z0-9]+(?:\s*,\s*AS-[A-Za-z0-9]+)*)\s*(?::\s*(.*))?/
};

const FORBIDDEN_ENTERPRISE_PLUGINS = [
  'ScrollSmoother',
  'SplitText',
  'ScrambleTextPlugin',
  'MorphSVGPlugin',
  'DrawSVGPlugin',
  'CustomBounce',
  'CustomWiggle',
  'Physics2DPlugin'
];

const GLOBAL_SELECTOR_PART = /^(?:\*.*|html|body|:root)$/i;

// ---------------------------------------------------------------------------
// Source scanning helpers
// ---------------------------------------------------------------------------

function isInsideQuotes(text, index) {
  let quote = null;
  for (let i = 0; i < index; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') {
        i++;
      } else if (ch === quote) {
        quote = null;
      }
    } else if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
    }
  }
  return quote !== null;
}

function findCommentOpener(text, opener) {
  let idx = text.indexOf(opener);
  while (idx !== -1) {
    const isUrlScheme = opener === '//' && text[idx - 1] === ':';
    if (!isUrlScheme && !isInsideQuotes(text, idx)) return idx;
    idx = text.indexOf(opener, idx + 1);
  }
  return -1;
}

/**
 * Splits every line into its code part and its comment part so style rules ignore
 * comments and comment rules (AS-C1/C2/C3) only inspect comments.
 */
function scanComments(lines, ext) {
  const syntax = {
    line: LINE_COMMENT_EXTENSIONS.has(ext),
    block: BLOCK_COMMENT_EXTENSIONS.has(ext),
    markup: MARKUP_COMMENT_EXTENSIONS.has(ext)
  };
  let openBlock = null;

  return lines.map(line => {
    const trimmed = line.trim();

    if (openBlock) {
      const closeIdx = line.indexOf(openBlock.closer);
      const info = {
        kind: openBlock.kind,
        isDoc: openBlock.isDoc,
        body: closeIdx === -1 ? line : line.slice(0, closeIdx),
        code: closeIdx === -1 ? '' : line.slice(closeIdx + openBlock.closer.length),
        trailing: ''
      };
      if (closeIdx !== -1) openBlock = null;
      return info;
    }

    if (syntax.line && trimmed.startsWith('//')) {
      return {
        kind: 'line',
        isDoc: trimmed.startsWith('///'),
        body: trimmed.replace(/^\/{2,}/, ''),
        code: '',
        trailing: ''
      };
    }

    const blockStart = syntax.block ? trimmed.match(/^\{?\/\*/) : null;
    if (blockStart) {
      const isDoc = /^\{?\/\*\*(?!\/)/.test(trimmed);
      const rest = trimmed.slice(blockStart[0].length);
      const closeIdx = rest.indexOf('*/');
      if (closeIdx === -1) openBlock = { kind: 'block', isDoc, closer: '*/' };
      return {
        kind: 'block',
        isDoc,
        body: closeIdx === -1 ? rest : rest.slice(0, closeIdx),
        code: closeIdx === -1 ? '' : rest.slice(closeIdx + 2).replace(/^\s*\}/, ''),
        trailing: ''
      };
    }

    if (syntax.markup && trimmed.startsWith('<!--')) {
      const rest = trimmed.slice(4);
      const closeIdx = rest.indexOf('-->');
      if (closeIdx === -1) openBlock = { kind: 'markup', isDoc: false, closer: '-->' };
      return {
        kind: 'markup',
        isDoc: false,
        body: closeIdx === -1 ? rest : rest.slice(0, closeIdx),
        code: closeIdx === -1 ? '' : rest.slice(closeIdx + 3),
        trailing: ''
      };
    }

    const openers = [];
    if (syntax.line) openers.push({ opener: '//', closer: null, kind: 'line' });
    if (syntax.block) openers.push({ opener: '/*', closer: '*/', kind: 'block' });
    if (syntax.markup) openers.push({ opener: '<!--', closer: '-->', kind: 'markup' });

    let first = null;
    for (const candidate of openers) {
      const idx = findCommentOpener(line, candidate.opener);
      if (idx !== -1 && (!first || idx < first.idx)) first = { ...candidate, idx };
    }

    if (!first) return { kind: null, isDoc: false, body: '', code: line, trailing: '' };

    let code = line.slice(0, first.idx);
    let trailing = line.slice(first.idx + first.opener.length);
    if (first.closer) {
      const closeIdx = trailing.indexOf(first.closer);
      if (closeIdx === -1) {
        openBlock = { kind: first.kind, isDoc: false, closer: first.closer };
      } else {
        code += ' ' + trailing.slice(closeIdx + first.closer.length);
        trailing = trailing.slice(0, closeIdx);
      }
    }
    return { kind: null, isDoc: false, body: '', code, trailing };
  });
}

function buildLineOffsets(text) {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') offsets.push(i + 1);
  }
  return offsets;
}

function lineNumberAt(offsets, index) {
  let low = 0;
  let high = offsets.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (offsets[mid] <= index) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

/** Returns the index of the parenthesis that closes the one at openIndex, skipping quoted text. */
function findClosingParen(text, openIndex) {
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return text.length - 1;
}

function findCallRanges(text, callPattern) {
  const ranges = [];
  const pattern = new RegExp(callPattern.source, 'g');
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const openIndex = match.index + match[0].length - 1;
    ranges.push({ start: match.index, end: findClosingParen(text, openIndex) });
  }
  return ranges;
}

function extractSelector(code, previousCodeLine) {
  const braceIdx = code.lastIndexOf('{');
  let selector = code.slice(0, braceIdx);
  const boundary = Math.max(selector.lastIndexOf('}'), selector.lastIndexOf(';'));
  selector = selector.slice(boundary + 1).trim();
  return selector || previousCodeLine.trim();
}

function isGlobalSelector(selector) {
  return selector
    .split(',')
    .map(part => part.trim())
    .some(part => GLOBAL_SELECTOR_PART.test(part));
}

// ---------------------------------------------------------------------------
// Color math (WCAG 2.x)
// ---------------------------------------------------------------------------

function parseColor(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (v === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (v === 'black') return { r: 0, g: 0, b: 0, a: 1 };

  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = digits.split('').map(d => d + d).join('');
    }
    if (digits.length !== 6 && digits.length !== 8) return null;
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1
    };
  }

  const rgb = v.match(/^rgba?\(\s*([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = p => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p));
    const alpha = parts[3] === undefined
      ? 1
      : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    const color = { r: channel(parts[0]), g: channel(parts[1]), b: channel(parts[2]), a: alpha };
    return [color.r, color.g, color.b, color.a].some(Number.isNaN) ? null : color;
  }
  return null;
}

function compositeOver(top, bottom) {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1
  };
}

function relativeLuminance(color) {
  const linear = channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b);
}

function toOpaque(color) {
  return color.a < 1 ? compositeOver(color, { r: 255, g: 255, b: 255, a: 1 }) : color;
}

/** WCAG contrast ratio between two colors (hex or rgb[a] strings); translucent colors sit on white. */
function contrastRatio(colorA, colorB) {
  const a = typeof colorA === 'string' ? parseColor(colorA) : colorA;
  const b = typeof colorB === 'string' ? parseColor(colorB) : colorB;
  if (!a || !b) {
    throw new TypeError(`Unsupported color value: ${!a ? colorA : colorB}`);
  }
  const la = relativeLuminance(toOpaque(a));
  const lb = relativeLuminance(toOpaque(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function isNeutralBlack(colorText) {
  const color = parseColor(colorText);
  if (color) return color.r === 0 && color.g === 0 && color.b === 0;
  const hsl = colorText.toLowerCase().match(/^hsla?\(\s*[\d.]+(?:deg)?[\s,]+[\d.]+%[\s,]+([\d.]+)%/);
  if (hsl) return parseFloat(hsl[1]) === 0;
  return colorText.toLowerCase() === 'transparent';
}

// ---------------------------------------------------------------------------
// Shadow analysis (AS-02)
// ---------------------------------------------------------------------------

const SHADOW_COLOR_TOKEN = /rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g;
const NAMED_SHADOW_COLOR = /^(?:red|orange|yellow|green|blue|indigo|violet|purple|pink|cyan|magenta|teal|lime|gold|white|gray|grey|silver)$/i;

function splitTopLevel(value, separator) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map(part => part.trim()).filter(Boolean);
}

function extractDeclarationValue(rawValue) {
  let value = rawValue.trim();
  const quote = value[0];
  if (quote === '"' || quote === "'" || quote === '`') {
    const closeIdx = value.indexOf(quote, 1);
    return closeIdx === -1 ? value.slice(1) : value.slice(1, closeIdx);
  }
  value = value.split(/[;}]/)[0];
  return value.replace(/!important/i, '').trim();
}

/** Returns a violation reason for a shadow value, or null when it is neutral elevation. */
function analyzeShadowValue(value) {
  for (const shadow of splitTopLevel(value, ',')) {
    const colors = shadow.match(SHADOW_COLOR_TOKEN) || [];
    const words = shadow.replace(SHADOW_COLOR_TOKEN, ' ').split(/\s+/).filter(Boolean);
    const namedColors = words.filter(word => NAMED_SHADOW_COLOR.test(word));
    const coloredShadow = colors.some(c => !isNeutralBlack(c)) || namedColors.length > 0;
    if (coloredShadow) return 'colored shadow; use neutral black --elevation-* tokens';

    const isInset = words.some(word => word.toLowerCase() === 'inset');
    const lengths = words
      .filter(word => /^-?\d*\.?\d+(?:px|rem|em)?$/.test(word))
      .map(parseFloat);
    if (!isInset && lengths.length >= 3 && lengths[0] === 0 && lengths[1] === 0 && lengths[2] > 0) {
      return 'zero-offset blurred shadow (glow); use --elevation-* tokens';
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Comment heuristics (AS-C1, AS-C2, AS-C3)
// ---------------------------------------------------------------------------

function looksLikeCode(body) {
  const text = body.replace(/\*\/\s*$/, '').replace(/-->\s*$/, '').replace(/^\s*\*\s?/, '').trim();
  if (text.length < 3) return false;
  if (/^[-=*#~_+/\\\s]+$/.test(text)) return false;
  if (/^(?:TODO|FIXME|NOTE|HACK|XXX|WORKAROUND|SAFETY)\b/i.test(text)) return false;
  if (/^anti-slop-ignore\b/.test(text) || /^https?:\/\//i.test(text)) return false;
  if (/^<\/?[A-Za-z][\w.:-]*(?:\s[^>]*)?\/?>/.test(text)) return true;
  if (/[;{}]\s*$/.test(text)) return true;
  if (/^[\w$]+(?:\.[\w$]+)*\s*\([^()]*\)\s*;?$/.test(text)) return true;

  // Capitalized left-hand sides without a semicolon are usually documented formulas, not code.
  const assignment = text.match(/^((?:(?:const|let|var)\s+)?[A-Za-z_$][\w$.[\]]*)\s*[+\-*/]?=\s*([^=\s>].*)$/);
  if (!assignment) return false;
  const codeLikeTarget = /^(?:const|let|var)\s|^[a-z_$]|[.[]/.test(assignment[1]);
  return codeLikeTarget && !/[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+/.test(assignment[2]);
}

function hasAgentMetadata(rawLine, commentText) {
  if (PATTERNS.agentAttribution.test(rawLine)) return true;
  if (!commentText) return false;
  if (PATTERNS.agentBracketTag.test(commentText)) return true;
  return PATTERNS.isoDate.test(commentText) && PATTERNS.agentName.test(commentText);
}

// ---------------------------------------------------------------------------
// Suppressions
// ---------------------------------------------------------------------------

function parseSuppression(rawLine) {
  const match = rawLine.match(PATTERNS.suppression);
  if (!match) return null;
  const ids = match[1].split(',').map(id => id.trim());
  const reason = (match[2] || '')
    .replace(/\s*(?:\*\/\s*\}?|-->)\s*$/, '')
    .trim();
  return { ids, reason };
}

function suppressionCovers(suppressionId, finding) {
  if (suppressionId === finding.id) return true;
  if (finding.id.startsWith(suppressionId) && /^[a-z]$/.test(finding.id.slice(suppressionId.length))) {
    return true;
  }
  return Array.isArray(finding.related) && finding.related.includes(suppressionId);
}

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

function familyOf(filePath) {
  return FAMILY_BY_EXTENSION[path.extname(filePath).toLowerCase()] || null;
}

/**
 * Lints one file's text.
 * options.profile: 'enterprise' | 'expressive' (default enterprise).
 * options.changedLines: Set<number> limiting findings and suppressions to those 1-based lines.
 * Returns { findings, suppressions }.
 */
function lintText(text, filePath, options = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const family = familyOf(filePath);
  if (!family) return { findings: [], suppressions: [] };

  const profile = PROFILES.has(options.profile) ? options.profile : DEFAULT_PROFILE;
  const isEnterprise = profile === 'enterprise';
  const changedLines = options.changedLines instanceof Set ? options.changedLines : null;
  const displayPath = String(filePath).replace(/\\/g, '/');

  const source = String(text).replace(/^\uFEFF/, '');
  const lines = source.split(/\r?\n/);
  const scanned = scanComments(lines, ext);
  const lineOffsets = buildLineOffsets(source);

  const isWeb = WEB_FAMILIES.has(family);
  const isCode = CODE_FAMILIES.has(family);
  const isDesktop = DESKTOP_FAMILIES.has(family);
  const importsGsap = PATTERNS.gsapImport.test(source);
  const usesGsap = importsGsap || PATTERNS.gsapCall.test(source);
  const hasFocusVisible = PATTERNS.focusVisible.test(source);

  const findings = [];
  const report = (id, severity, lineNumber, column, message, extra = {}) => {
    findings.push({
      id,
      severity,
      file: displayPath,
      line: lineNumber,
      column: Math.max(1, column),
      message,
      excerpt: (lines[lineNumber - 1] || '').trim().slice(0, 160),
      ...extra
    });
  };

  let currentSelector = '';
  let previousCodeLine = '';

  scanned.forEach((info, index) => {
    const lineNumber = index + 1;
    const raw = lines[index];
    const code = info.code;
    const codeColumn = pattern => {
      const match = code.match(pattern);
      return match ? raw.indexOf(match[0]) + 1 : 1;
    };

    if (code.includes('{') && (family === 'style' || family === 'markup')) {
      currentSelector = extractSelector(code, previousCodeLine);
    }
    const nearbyContext = [lines[index - 2] || '', lines[index - 1] || '', code].join(' ');

    if (code.trim()) {
      if (isWeb) checkWebLine();
      if (isDesktop) checkDesktopLine();
      if (PATTERNS.emoji.test(code)) {
        report('AS-05', ERROR, lineNumber, codeColumn(PATTERNS.emoji),
          'Emoji in UI text or chrome; use the project icon set (16px, stroke 1.75) and plain copy (AS-11).',
          { related: ['AS-11'] });
      }
      previousCodeLine = code;
    }

    checkCommentLine();

    function checkWebLine() {
      if (PATTERNS.textShadowDeclaration.test(code) || PATTERNS.textShadowUtility.test(code)) {
        report('AS-02', ERROR, lineNumber, codeColumn(PATTERNS.textShadowDeclaration),
          'Text shadow is not allowed; express hierarchy with size, weight, and text tokens.');
      }

      const boxShadow = code.match(PATTERNS.boxShadowDeclaration);
      if (boxShadow) {
        const reason = analyzeShadowValue(extractDeclarationValue(boxShadow[1]));
        if (reason) report('AS-02', ERROR, lineNumber, codeColumn(PATTERNS.boxShadowDeclaration), `Box shadow: ${reason}.`);
      }
      for (const match of code.matchAll(PATTERNS.arbitraryShadowUtility)) {
        const reason = analyzeShadowValue(match[1].replace(/_/g, ' '));
        if (reason) report('AS-02', ERROR, lineNumber, raw.indexOf(match[0]) + 1, `Shadow utility: ${reason}.`);
      }
      for (const match of code.matchAll(PATTERNS.dropShadowFilter)) {
        const reason = analyzeShadowValue(match[1]);
        if (reason) report('AS-02', ERROR, lineNumber, raw.indexOf(match[0]) + 1, `Drop shadow: ${reason}.`);
      }
      if (PATTERNS.coloredShadowUtility.test(code)) {
        report('AS-02', ERROR, lineNumber, codeColumn(PATTERNS.coloredShadowUtility),
          'Colored shadow utility; use neutral black --elevation-* tokens.');
      }

      const loopingCss = PATTERNS.loopingCssAnimation.test(code) && PATTERNS.animationKeyword.test(code);
      if (loopingCss) {
        const allowContext = family === 'style' && currentSelector ? currentSelector : `${currentSelector} ${nearbyContext}`;
        if (!PATTERNS.spinnerContext.test(allowContext)) {
          report('AS-03', ERROR, lineNumber, codeColumn(PATTERNS.loopingCssAnimation),
            'Looping animation on an idle element; motion runs once, spinners only during active I/O.');
        }
      }
      if (PATTERNS.loopingUtility.test(code) && !PATTERNS.spinnerContext.test(nearbyContext)) {
        report('AS-03', ERROR, lineNumber, codeColumn(PATTERNS.loopingUtility),
          'Looping animation utility on an idle element; motion runs once, spinners or skeletons only during active I/O.');
      }

      const transition = code.match(PATTERNS.layoutTransition);
      if ((transition && PATTERNS.layoutPropertyName.test(` ${transition[1]}`)) || PATTERNS.layoutTransitionUtility.test(code)) {
        report('AS-03a', WARN, lineNumber, codeColumn(PATTERNS.layoutTransition),
          'Transition on a layout property; animate transform or opacity (progress: transform scaleX).');
      }

      if (isCode && PATTERNS.jsLoopingRepeat.test(code)) {
        report('AS-03b', isEnterprise ? ERROR : WARN, lineNumber, codeColumn(PATTERNS.jsLoopingRepeat),
          isEnterprise
            ? 'Endless JS animation loop; motion runs once (enterprise profile).'
            : 'Endless JS animation loop; pause it off-screen and gate it on reduced motion (expressive profile).');
      }

      if (isCode && usesGsap && isEnterprise) {
        const forbiddenPlugin = PATTERNS.pluginImportContext.test(code)
          && FORBIDDEN_ENTERPRISE_PLUGINS.find(name => new RegExp(`\\b${name}\\b`).test(code));
        if (forbiddenPlugin) {
          report('AS-03e', ERROR, lineNumber, raw.indexOf(forbiddenPlugin) + 1,
            `GSAP plugin ${forbiddenPlugin} is forbidden in the enterprise profile.`);
        } else if (PATTERNS.smootherCreate.test(code)) {
          report('AS-03e', ERROR, lineNumber, codeColumn(PATTERNS.smootherCreate),
            'Smooth scrolling is forbidden in the enterprise profile.');
        }
        if (PATTERNS.scrollPin.test(code) || PATTERNS.scrollScrub.test(code)) {
          report('AS-03e', ERROR, lineNumber, codeColumn(PATTERNS.scrollPin.test(code) ? PATTERNS.scrollPin : PATTERNS.scrollScrub),
            'ScrollTrigger pin or scrub hijacks data navigation; forbidden in the enterprise profile.');
        }
      }

      if (PATTERNS.willChange.test(code)) {
        const selector = code.includes('{') ? extractSelector(code, previousCodeLine) : currentSelector;
        if (isGlobalSelector(selector)) {
          report('AS-03f', WARN, lineNumber, codeColumn(PATTERNS.willChange),
            'will-change on a global selector; apply it only to elements while they animate.');
        }
      }

      const pill = code.match(PATTERNS.pillRadius) || code.match(PATTERNS.pillUtility);
      if (pill && !PATTERNS.pillTokenDefinition.test(code)) {
        const pillContext = `${currentSelector} ${lines[index - 1] || ''} ${code}`;
        if (!PATTERNS.pillAllowedContext.test(pillContext)) {
          report('AS-04', ERROR, lineNumber, raw.indexOf(pill[0]) + 1,
            'Pill radius outside avatars and notification counts; use --radius-xs/sm/md/lg.');
        }
      }

      if (PATTERNS.cssGradient.test(code) || PATTERNS.gradientUtility.test(code)) {
        report('AS-06', ERROR, lineNumber, codeColumn(PATTERNS.cssGradient.test(code) ? PATTERNS.cssGradient : PATTERNS.gradientUtility),
          'Gradient fill; use flat canvas/surface/elevated tokens (progress bars included).');
      }

      if (PATTERNS.backdropBlur.test(code)) {
        report('AS-08', ERROR, lineNumber, codeColumn(PATTERNS.backdropBlur),
          'Backdrop blur (glassmorphism) lowers contrast; use an opaque surface token (>= 90% opacity).');
      }

      if (!hasFocusVisible && PATTERNS.removedOutline.test(code)) {
        report('AS-09', ERROR, lineNumber, codeColumn(PATTERNS.removedOutline),
          'Focus outline removed without a :focus-visible replacement in this file.');
      }
    }

    function checkDesktopLine() {
      if (PATTERNS.gradientBrush.test(code) || PATTERNS.winFormsGradient.test(code)) {
        report('AS-06', ERROR, lineNumber, codeColumn(PATTERNS.gradientBrush.test(code) ? PATTERNS.gradientBrush : PATTERNS.winFormsGradient),
          'Gradient brush; use flat surface colors from the token palette.');
      }

      const rowHeight = code.match(PATTERNS.rowHeight);
      if (rowHeight) {
        const height = parseInt(rowHeight[1], 10);
        if (height < DESKTOP_ROW_HEIGHT.min || height > DESKTOP_ROW_HEIGHT.max) {
          report('AS-07', WARN, lineNumber, codeColumn(PATTERNS.rowHeight),
            `Desktop row height ${height}px is outside the ${DESKTOP_ROW_HEIGHT.min}-${DESKTOP_ROW_HEIGHT.max}px band (default 28).`);
        }
      }

      if (PATTERNS.zebraStriping.test(code)) {
        report('AS-07z', WARN, lineNumber, codeColumn(PATTERNS.zebraStriping),
          'Zebra striping is opt-in only for read-only grids with >= 8 visible columns (tint: --bg-elevated).');
      }

      if (PATTERNS.hiddenDesktopFocus.test(code)) {
        report('AS-09', ERROR, lineNumber, codeColumn(PATTERNS.hiddenDesktopFocus),
          'Native focus cue disabled; keep the platform focus rectangle visible.');
      }

      const dropShadow = code.match(PATTERNS.xamlDropShadow);
      if (dropShadow && !isNeutralBlack(dropShadow[1]) && !/^#?(?:FF)?000000$/i.test(dropShadow[1]) && dropShadow[1].toLowerCase() !== 'black') {
        report('AS-02', ERROR, lineNumber, codeColumn(PATTERNS.xamlDropShadow),
          'Colored drop shadow; elevation uses neutral black only.');
      }
    }

    function checkCommentLine() {
      const commentText = info.kind ? info.body : info.trailing;
      if (hasAgentMetadata(raw, commentText)) {
        report('AS-C3', ERROR, lineNumber, 1,
          'Agent metadata or changelog in source; provenance lives in git history.');
      }
      if (!info.kind || info.isDoc) return;
      if (looksLikeCode(info.body)) {
        report('AS-C2', ERROR, lineNumber, 1, 'Commented-out code (Dead Code); delete it, git keeps history.');
      } else if (info.kind === 'line' && PATTERNS.trivialVerbComment.test(info.body)) {
        report('AS-C1', WARN, lineNumber, 1,
          'Comment restates the code; use a self-documenting name or state the non-obvious WHY.');
      }
    }
  });

  if (isCode && importsGsap && !PATTERNS.reducedMotionGate.test(source)) {
    const importLine = lineNumberAt(lineOffsets, source.search(PATTERNS.gsapImport));
    report('AS-03c', WARN, importLine, 1,
      'GSAP is imported without reduced-motion gating (gsap.matchMedia with prefers-reduced-motion).');
  }

  if (isCode && usesGsap) {
    for (const range of findCallRanges(source, PATTERNS.effectHook)) {
      const effectBody = source.slice(range.start, range.end + 1);
      if (PATTERNS.animationCleanup.test(effectBody)) continue;
      for (const tween of effectBody.matchAll(PATTERNS.gsapTweenInEffect)) {
        report('AS-03d', WARN, lineNumberAt(lineOffsets, range.start + tween.index), 1,
          'GSAP animation inside useEffect without cleanup; use useGSAP or gsap.context().revert().');
      }
    }

    for (const range of findCallRanges(source, PATTERNS.tweenCall)) {
      const tweenText = source.slice(range.start, range.end + 1);
      for (const prop of tweenText.matchAll(PATTERNS.gsapLayoutVar)) {
        report('AS-03a', WARN, lineNumberAt(lineOffsets, range.start + prop.index), 1,
          'GSAP tween animates a layout property; use x/y/scale/autoAlpha.');
      }
    }
  }

  return applySuppressions(findings, lines, displayPath, changedLines);
}

function applySuppressions(rawFindings, lines, displayPath, changedLines) {
  const inScope = lineNumber => !changedLines || changedLines.has(lineNumber);
  const unique = new Map();
  for (const finding of rawFindings) {
    const key = `${finding.id}:${finding.line}`;
    if (inScope(finding.line) && !unique.has(key)) unique.set(key, finding);
  }

  const findings = [];
  const suppressions = [];
  const suppressionByLine = new Map();

  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    if (!inScope(lineNumber)) return;
    const suppression = parseSuppression(raw);
    if (!suppression) return;
    if (!suppression.reason) {
      findings.push({
        id: 'AS-SUPPRESS',
        severity: ERROR,
        file: displayPath,
        line: lineNumber,
        column: raw.indexOf('anti-slop-ignore') + 1,
        message: 'Suppression without a reason; write anti-slop-ignore <ID>: <reason>.',
        excerpt: raw.trim().slice(0, 160)
      });
      return;
    }
    const entry = { file: displayPath, line: lineNumber, ids: suppression.ids, reason: suppression.reason, suppressed: [] };
    suppressions.push(entry);
    suppressionByLine.set(lineNumber, entry);
  });

  for (const finding of unique.values()) {
    const entry = suppressionByLine.get(finding.line);
    if (entry && entry.ids.some(id => suppressionCovers(id, finding))) {
      entry.suppressed.push(finding.id);
    } else {
      findings.push(finding);
    }
  }

  findings.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));
  return { findings, suppressions };
}

// ---------------------------------------------------------------------------
// Token contrast audit (AS-08)
// ---------------------------------------------------------------------------

const SURFACE_KEYWORDS = new Set(['bg', 'background', 'surface', 'canvas', 'elevated', 'hover']);
const TEXT_KEYWORDS = new Set(['text', 'fg', 'foreground']);
const NEUTRAL_PREFIXES = new Set(['color', 'clr', 'theme']);
const NON_COLOR_SEGMENTS = new Set(['border', 'shadow', 'elevation', 'ring', 'outline', 'radius', 'duration']);

function classifyToken(name) {
  const segments = name.replace(/^--/, '').toLowerCase().split('-').filter(Boolean);
  while (segments.length > 1 && NEUTRAL_PREFIXES.has(segments[0])) segments.shift();
  if (segments.includes('disabled') || segments.includes('on')) return null;

  // Decorative borders are exempt; only input borders and focus indicators must stay perceivable.
  const joined = segments.join('-');
  if (joined.includes('border-input') || segments.includes('focus')) return { role: 'non-text', group: '' };
  if (segments.some(segment => NON_COLOR_SEGMENTS.has(segment))) return null;

  const textIdx = segments.findIndex(segment => TEXT_KEYWORDS.has(segment));
  if (textIdx !== -1) return { role: 'text', group: segments.slice(0, textIdx).join('-') };

  const surfaceIdx = segments.findIndex(segment => SURFACE_KEYWORDS.has(segment));
  if (surfaceIdx !== -1) {
    return {
      role: 'surface',
      group: segments.slice(0, surfaceIdx).join('-'),
      isPrimarySurface: segments.includes('surface')
    };
  }
  return null;
}

function parseTokenScopes(cssText) {
  const clean = String(cssText).replace(/\/\*[\s\S]*?\*\//g, '');
  const scopes = [];
  const blockPattern = /([^{}]*)\{([^{}]*)\}/g;
  let atRule = '';
  let lastEnd = 0;
  let match;
  while ((match = blockPattern.exec(clean)) !== null) {
    const gap = clean.slice(lastEnd, match.index);
    if (gap.includes('}')) atRule = '';
    const header = gap.match(/(@[^{};]+)\{\s*$/);
    if (header) atRule = header[1].trim();
    lastEnd = blockPattern.lastIndex;

    const tokens = new Map();
    for (const decl of match[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      tokens.set(decl[1], decl[2].replace(/!important/i, '').trim());
    }
    if (tokens.size === 0) continue;
    const selector = match[1].trim();
    scopes.push({ label: atRule ? `${atRule} ${selector}` : selector, atRule, selector, tokens });
  }
  return scopes;
}

function resolveTokenValue(name, tokens, depth = 0) {
  const value = tokens.get(name);
  if (value === undefined || depth > 8) return null;
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (whole, refName, fallback) => {
    const resolved = resolveTokenValue(refName, tokens, depth + 1);
    return resolved !== null ? resolved : (fallback || '').trim();
  });
}

/**
 * Checks text-like tokens (text/fg) against surface-like tokens (bg/surface/canvas/elevated/hover)
 * for >= 4.5:1 in every declaration scope. Neutral text pairs with neutral surfaces; a semantic
 * foreground (e.g. --success-fg) pairs with neutral surfaces and its own tint (--success-bg).
 * Input-border and focus tokens need >= 3:1 against neutral surfaces. Disabled tokens are exempt.
 * Translucent surfaces are composited over the scope's surface token.
 */
function auditTokens(cssText) {
  const scopes = parseTokenScopes(cssText);
  const baseScope = scopes.find(scope => !scope.atRule && scope.selector.includes(':root')) || scopes[0];
  const checked = [];
  const failures = [];
  if (!baseScope) return { checked, failures, passed: true };

  for (const scope of scopes) {
    const effective = scope === baseScope ? scope.tokens : new Map([...baseScope.tokens, ...scope.tokens]);
    const texts = [];
    const surfaces = [];
    for (const name of effective.keys()) {
      const role = classifyToken(name);
      const color = role ? parseColor(resolveTokenValue(name, effective) || '') : null;
      if (!color) continue;
      if (role.role === 'surface') {
        surfaces.push({ name, group: role.group, color, isPrimarySurface: role.isPrimarySurface });
      } else {
        const minimum = role.role === 'text' ? MIN_TEXT_CONTRAST : MIN_NON_TEXT_CONTRAST;
        texts.push({ name, group: role.group, color, kind: role.role, minimum });
      }
    }

    const backdrop = (surfaces.find(s => s.group === '' && s.isPrimarySurface && s.color.a === 1)
      || surfaces.find(s => s.group === '' && s.color.a === 1)
      || { color: { r: 255, g: 255, b: 255, a: 1 } }).color;

    for (const text of texts) {
      for (const surface of surfaces) {
        const pairsSemantically = surface.group === '' || surface.group === text.group;
        const declaredHere = scope === baseScope || scope.tokens.has(text.name) || scope.tokens.has(surface.name);
        if (!pairsSemantically || !declaredHere) continue;

        const surfaceColor = surface.color.a < 1 ? compositeOver(surface.color, backdrop) : surface.color;
        const textColor = text.color.a < 1 ? compositeOver(text.color, surfaceColor) : text.color;
        const ratio = contrastRatio(textColor, surfaceColor);
        const result = {
          scope: scope.label,
          kind: text.kind,
          text: text.name,
          surface: surface.name,
          ratio: Math.round(ratio * 100) / 100,
          minimum: text.minimum,
          passed: ratio >= text.minimum
        };
        checked.push(result);
        if (!result.passed) failures.push(result);
      }
    }
  }

  return { checked, failures, passed: failures.length === 0 };
}

// ---------------------------------------------------------------------------
// Git diff scope
// ---------------------------------------------------------------------------

/** Maps each changed file (repo-relative, forward slashes) to the Set of added 1-based line numbers. */
function parseUnifiedDiff(diffText) {
  const changed = new Map();
  let currentFile = null;
  let nextLine = 0;
  for (const line of String(diffText).split(/\r?\n/)) {
    if (line.startsWith('+++ ')) {
      const target = line.slice(4).trim().replace(/^"(.*)"$/, '$1');
      currentFile = target === '/dev/null' ? null : target.replace(/^b\//, '');
      if (currentFile && !changed.has(currentFile)) changed.set(currentFile, new Set());
      continue;
    }
    if (line.startsWith('--- ')) continue;
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      nextLine = parseInt(hunk[1], 10);
      continue;
    }
    if (!currentFile) continue;
    if (line.startsWith('+')) {
      changed.get(currentFile).add(nextLine);
      nextLine++;
    } else if (line.startsWith(' ')) {
      nextLine++;
    }
  }
  for (const [file, addedLines] of changed) {
    if (addedLines.size === 0) changed.delete(file);
  }
  return changed;
}

function runGit(args, cwd) {
  const result = spawnSync('git', ['-c', 'core.quotepath=off', ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true
  });
  if (result.error || result.status !== 0) {
    const detail = result.error ? result.error.message : (result.stderr || '').trim();
    throw new Error(`git ${args.join(' ')} failed: ${detail}`);
  }
  return result.stdout;
}

// ---------------------------------------------------------------------------
// Profile resolution
// ---------------------------------------------------------------------------

function resolveProfile(startPath) {
  let dir = path.resolve(startPath);
  if (fs.existsSync(dir) && fs.statSync(dir).isFile()) dir = path.dirname(dir);
  while (true) {
    const candidate = path.join(dir, PROJECT_RULE_FILE);
    if (fs.existsSync(candidate)) {
      const declared = parseFrontmatter(fs.readFileSync(candidate, 'utf8')).ui_profile;
      return PROFILES.has(declared) ? declared : DEFAULT_PROFILE;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return DEFAULT_PROFILE;
    dir = parent;
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const USAGE = `Usage: node tools/anti-slop-lint.js [--diff | --all <path> | --tokens <file>] [--json] [--profile enterprise|expressive]

  --diff               Lint added lines of staged changes; falls back to unstaged changes (default).
  --all <path>         Lint every supported file under <path> (deliberate cleanup audit).
  --tokens <file>      Audit CSS custom properties for text contrast >= 4.5:1.
  --json               Machine-readable output.
  --profile <name>     Motion profile; default reads ui_profile from the nearest ${PROJECT_RULE_FILE}.

Suppress one line with a trailing comment: anti-slop-ignore <ID>: <reason> (reason mandatory).`;

function collectFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return familyOf(target) ? [target] : [];
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || WALK_EXCLUDED_DIRS.has(entry.name)) continue;
        walk(fullPath);
      } else if (entry.isFile() && familyOf(entry.name) && !entry.name.includes('.min.')) {
        files.push(fullPath);
      }
    }
  };
  walk(target);
  return files.sort();
}

function toDisplayPath(absPath) {
  const relative = path.relative(process.cwd(), absPath);
  return (relative && !relative.startsWith('..') ? relative : absPath).replace(/\\/g, '/');
}

function buildReport(results, meta) {
  const findings = results.flatMap(result => result.findings);
  const suppressions = results.flatMap(result => result.suppressions);
  const errors = findings.filter(f => f.severity === ERROR).length;
  return {
    ...meta,
    findings,
    suppressions,
    summary: {
      files: results.length,
      errors,
      warnings: findings.length - errors,
      suppressions: suppressions.length
    }
  };
}

function printReport(report, asJson) {
  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const scope = report.mode === 'diff' ? `diff (${report.source})` : `all (${report.target})`;
  console.log(`Anti-slop lint: ${scope}, profile ${report.profile}`);
  for (const f of report.findings) {
    console.log(`${f.file}:${f.line}:${f.column}  ${f.severity.padEnd(5)}  ${f.id.padEnd(11)} ${f.message}`);
  }
  if (report.suppressions.length > 0) {
    console.log(`\nSuppressions (${report.suppressions.length}):`);
    for (const s of report.suppressions) {
      const hit = s.suppressed.length > 0 ? s.suppressed.join(', ') : 'nothing matched';
      console.log(`  ${s.file}:${s.line}  ${s.ids.join(', ')} [${hit}]  ${s.reason}`);
    }
  }
  const { files, errors, warnings, suppressions } = report.summary;
  console.log(`\nSummary: ${files} file(s), ${errors} error(s), ${warnings} warning(s), ${suppressions} suppression(s)`);
}

function runAll(target, profileFlag, asJson) {
  const absTarget = path.resolve(target);
  if (!fs.existsSync(absTarget)) {
    console.error(`Path not found: ${target}`);
    return 2;
  }
  const profile = profileFlag || resolveProfile(absTarget);
  const results = collectFiles(absTarget).map(file =>
    lintText(fs.readFileSync(file, 'utf8'), toDisplayPath(file), { profile })
  );
  const report = buildReport(results, { mode: 'all', target: toDisplayPath(absTarget), profile });
  printReport(report, asJson);
  return report.summary.errors > 0 ? 1 : 0;
}

function runDiff(profileFlag, asJson) {
  let topLevel;
  let changed;
  let source = 'staged';
  try {
    topLevel = runGit(['rev-parse', '--show-toplevel'], process.cwd()).trim();
    const diffArgs = ['diff', '-U0', '--no-color', '--no-ext-diff', '--diff-filter=ACMR'];
    changed = parseUnifiedDiff(runGit([...diffArgs.slice(0, 1), '--cached', ...diffArgs.slice(1)], topLevel));
    if (changed.size === 0) {
      source = 'unstaged';
      changed = parseUnifiedDiff(runGit(diffArgs, topLevel));
    }
  } catch (err) {
    console.error(`${err.message}\nRun inside a git repository, or use --all <path>.`);
    return 2;
  }

  const profile = profileFlag || resolveProfile(process.cwd());
  const results = [];
  for (const [relPath, addedLines] of changed) {
    if (!familyOf(relPath) || DIFF_EXCLUDED_PATH.test(relPath)) continue;
    const absPath = path.join(topLevel, relPath);
    const content = source === 'staged'
      ? runGit(['show', `:${relPath}`], topLevel)
      : fs.readFileSync(absPath, 'utf8');
    results.push(lintText(content, toDisplayPath(absPath), { profile, changedLines: addedLines }));
  }

  const report = buildReport(results, { mode: 'diff', source, profile });
  printReport(report, asJson);
  return report.summary.errors > 0 ? 1 : 0;
}

function runTokens(file, asJson) {
  if (typeof file !== 'string' || !fs.existsSync(file)) {
    console.error(`Token file not found: ${file === true ? '(missing value)' : file}`);
    return 2;
  }
  const audit = auditTokens(fs.readFileSync(file, 'utf8'));
  if (asJson) {
    console.log(JSON.stringify({ mode: 'tokens', file: toDisplayPath(path.resolve(file)), ...audit }, null, 2));
  } else {
    console.log(`Token contrast audit: ${toDisplayPath(path.resolve(file))} (text ${MIN_TEXT_CONTRAST}:1, input border/focus ${MIN_NON_TEXT_CONTRAST}:1)`);
    for (const f of audit.failures) {
      console.log(`  error  AS-08  ${f.text} on ${f.surface}: ${f.ratio.toFixed(2)}:1, needs ${f.minimum}:1  [${f.scope}]`);
    }
    console.log(`\nSummary: ${audit.checked.length} pair(s) checked, ${audit.failures.length} failure(s)`);
  }
  if (audit.checked.length === 0) {
    if (!asJson) console.error('No text/surface color token pairs found.');
    return 2;
  }
  return audit.passed ? 0 : 1;
}

function main(argv) {
  const { flags, positional } = parseCliArgs(argv, {
    valueFlags: ['all', 'tokens', 'profile'],
    booleanFlags: ['diff', 'json', 'help']
  });
  if (flags.help || flags.h) {
    console.log(USAGE);
    return 0;
  }
  const asJson = Boolean(flags.json);

  if (flags.tokens !== undefined) return runTokens(flags.tokens, asJson);

  const profileFlag = flags.profile;
  if (profileFlag !== undefined && !PROFILES.has(profileFlag)) {
    console.error(`Invalid --profile value: ${profileFlag}. Expected enterprise or expressive.`);
    return 2;
  }

  if (flags.all !== undefined) {
    const target = flags.all === true ? positional[0] || process.cwd() : flags.all;
    return runAll(target, profileFlag, asJson);
  }
  return runDiff(profileFlag, asJson);
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  lintText,
  auditTokens,
  contrastRatio,
  parseUnifiedDiff,
  parseColor,
  resolveProfile
};
