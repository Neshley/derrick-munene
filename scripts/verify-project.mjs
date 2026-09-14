#!/usr/bin/env node
/** Lightweight dependency-free project verification for CI and release checks. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const check = (name, condition, detail = '') => {
  checks.push(name);
  if (!condition) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const pkg = JSON.parse(read('package.json'));
check('package version is current', pkg.version === '2.9.0', `found ${pkg.version}`);
check('test script exists', typeof pkg.scripts?.test === 'string');
check('lint script exists', typeof pkg.scripts?.lint === 'string');
check('dependency-free verification script is registered', pkg.scripts?.verify === 'node scripts/verify-project.mjs');

for (const file of [
  'src/App.tsx',
  'src/index.css',
  'src/audio/styParser.ts',
  'src/audio/styleMidiExporter.ts',
  'src/audio/styleTemplates.ts',
  'src/types/arranger.ts',
  'tests/styleMidiExporter.test.ts',
  'tests/styParserRobustness.test.ts',
  'index.html',
  'vercel.json',
]) check(`required file: ${file}`, exists(file));

const exporter = read('src/audio/styleMidiExporter.ts');
const parser = read('src/audio/styParser.ts');
const css = read('src/index.css');
const app = read('src/App.tsx');

check('exporter emits SFF1 marker', exporter.includes("['SFF1']") || exporter.includes("SFF1"));
check('exporter emits SInt marker', exporter.includes('SInt'));
check('exporter builds CASM CSEG records', exporter.includes('CSEG') && exporter.includes('Ctab') && exporter.includes('Cntt'));
check('exporter uses valid SMF SysEx length', exporter.includes('0xf0, 0x05, 0x7e, 0x7f, 0x09, 0x01, 0xf7'));
check('parser has bounded track parsing', parser.includes('trackEnd') || parser.includes('trackEndOffset'));
check('parser normalizes Yamaha break/fill markers', parser.includes("'fill in ba': 'break'") && parser.includes("'break': 'break'"));
check('parser has CASM-aware mapping', parser.includes('CASM') && parser.includes('destination') && parser.includes('standardDestinationTracks'));
check('UI has workstation shell', app.includes('WorkstationHeader') && app.includes('WorkstationSidebar'));
check('UI has Style Creator', app.includes('StyleCreatorModal'));
check('UI has reduced-motion support', css.includes('prefers-reduced-motion'));
check('UI has visible keyboard focus treatment', css.includes('focus-visible'));
check('no dangerous HTML injection API', !(/dangerouslySetInnerHTML|\.innerHTML\s*=|new Function\s*\(|\beval\s*\(/).test(
  [app, exporter, parser, css].join('\n')
));

const tsxFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel);
    else if (entry.name.endsWith('.tsx')) tsxFiles.push(rel);
  }
};
walk('src');
const selectCount = tsxFiles.reduce((n, file) => n + (read(file).match(/<select\b/g) || []).length, 0);
check('native selects are present and centrally styled', selectCount > 0 && css.includes('select:not([multiple])'));

console.log(`DM ARRANGIA verification: ${checks.length - failures.length}/${checks.length} checks passed`);
if (failures.length) {
  console.error('\nFailures:');
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
console.log('✓ Static release invariants passed');
