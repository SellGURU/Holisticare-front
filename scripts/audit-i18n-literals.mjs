/**
 * Scans TSX for likely user-facing English literals.
 * Usage: node scripts/audit-i18n-literals.mjs [--out audit-i18n.csv]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');

const AREA_RULES = [
  { prefix: 'Components/RepoerAnalyse', area: 'report' },
  { prefix: 'Components/TreatmentPlan', area: 'holistic_plan' },
  { prefix: 'pages/generateRecommendation', area: 'generate_recommendation' },
  { prefix: 'pages/NewGenerateHolisticPlan', area: 'generate_holistic' },
  { prefix: 'Components/NewGenerateActionPlan', area: 'generate_action' },
  { prefix: 'Components/RepoerAnalyse/UploadTestV2', area: 'upload' },
  { prefix: 'pages/settings', area: 'settings' },
  { prefix: 'Components/LibraryThreePages', area: 'library' },
  { prefix: 'Components/Action-plan', area: 'action_plan' },
  { prefix: 'pages/clientList', area: 'client_list' },
  { prefix: 'Components/coverageCard', area: 'coverage' },
];

const ATTR_PATTERNS = [
  /(?:placeholder|title|aria-label)=\{?['"`]([^'"`]{3,})['"`]/g,
  /(?:placeholder|title|aria-label)=['"`]([^'"`]{3,})['"`]/g,
];

const JSX_TEXT = />\s*([A-Za-z][^<{]{2,}?)\s*</g;

const SKIP_DIRS = new Set(['node_modules', 'dist', '.test.', '__mocks__']);
const SKIP_FILE = /\.(test|spec)\.(tsx?|jsx?)$/;

function areaFor(fileRel) {
  const normalized = fileRel.replace(/\\/g, '/');
  for (const rule of AREA_RULES) {
    if (normalized.includes(rule.prefix)) return rule.area;
  }
  return 'other';
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (name.endsWith('.tsx') && !SKIP_FILE.test(name)) files.push(full);
  }
  return files;
}

function suggestKey(text) {
  const slug = text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return slug || 'text';
}

function extractFromLine(line) {
  const found = [];
  for (const re of ATTR_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line))) {
      if (/^[A-Za-z]/.test(m[1]) && !m[1].includes('${')) found.push(m[1]);
    }
  }
  JSX_TEXT.lastIndex = 0;
  let m;
  while ((m = JSX_TEXT.exec(line))) {
    const t = m[1].trim();
    if (t.length > 2 && /^[A-Za-z]/.test(t) && !t.includes('{')) found.push(t);
  }
  return found;
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

const outArg = process.argv.indexOf('--out');
const outPath =
  outArg >= 0
    ? process.argv[outArg + 1]
    : path.join(__dirname, 'audit-i18n.csv');

const rows = [['area', 'file', 'line', 'string', 'suggestedKey']];
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  const area = areaFor(rel);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (
      line.includes('uiText(') ||
      line.includes("t('") ||
      line.includes('t("')
    )
      return;
    for (const text of extractFromLine(line)) {
      rows.push([area, rel, String(index + 1), text, suggestKey(text)]);
    }
  });
}

const body = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
fs.writeFileSync(outPath, body, 'utf8');
console.log(`Wrote ${rows.length - 1} findings to ${outPath}`);
