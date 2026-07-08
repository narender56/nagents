#!/usr/bin/env node
// Structural validation for nagents. No dependencies — Node 18+.
// Checks: agent front-matter, skill front-matter, plugin/marketplace JSON,
// workflow syntax, and that manifest-referenced agent files exist.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const ok = [];

function fail(msg) { errors.push(msg); }
function pass(msg) { ok.push(msg); }

// --- front-matter parsing (minimal YAML: top-level key: value) ------------
function parseFrontMatter(text, file) {
  if (!text.startsWith('---')) { fail(`${file}: missing front-matter block`); return null; }
  const end = text.indexOf('\n---', 3);
  if (end === -1) { fail(`${file}: unterminated front-matter block`); return null; }
  const body = text.slice(3, end);
  const fm = {};
  for (const line of body.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

function requireFields(fm, fields, file) {
  if (!fm) return;
  for (const f of fields) {
    if (!fm[f] || fm[f] === '') fail(`${file}: front-matter missing "${f}"`);
  }
}

// --- agents ---------------------------------------------------------------
const agentsDir = join(root, '.claude/agents');
const agentFiles = existsSync(agentsDir) ? readdirSync(agentsDir).filter(f => f.endsWith('.md')) : [];
if (agentFiles.length === 0) fail('no agent files found in .claude/agents');
for (const f of agentFiles) {
  const p = join(agentsDir, f);
  const fm = parseFrontMatter(readFileSync(p, 'utf8'), `agents/${f}`);
  requireFields(fm, ['name', 'description'], `agents/${f}`);
}
pass(`agents: ${agentFiles.length} checked`);

// --- skills ---------------------------------------------------------------
const skillsDir = join(root, '.claude/skills');
const skillDirs = existsSync(skillsDir)
  ? readdirSync(skillsDir).filter(d => statSync(join(skillsDir, d)).isDirectory())
  : [];
if (skillDirs.length === 0) fail('no skills found in .claude/skills');
for (const d of skillDirs) {
  const p = join(skillsDir, d, 'SKILL.md');
  if (!existsSync(p)) { fail(`skills/${d}: missing SKILL.md`); continue; }
  const fm = parseFrontMatter(readFileSync(p, 'utf8'), `skills/${d}/SKILL.md`);
  requireFields(fm, ['name', 'description'], `skills/${d}/SKILL.md`);
}
pass(`skills: ${skillDirs.length} checked`);

// --- JSON manifests -------------------------------------------------------
function checkJson(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) { fail(`${rel}: not found`); return null; }
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { fail(`${rel}: invalid JSON — ${e.message}`); return null; }
}
const plugin = checkJson('.claude-plugin/plugin.json');
if (plugin) {
  if (!plugin.name) fail('plugin.json: missing required "name"');
  // referenced agent files must exist
  for (const a of plugin.agents || []) {
    if (!existsSync(join(root, a))) fail(`plugin.json: agents entry not found — ${a}`);
  }
  pass('plugin.json: valid');
}
const market = checkJson('.claude-plugin/marketplace.json');
if (market) {
  if (!market.name) fail('marketplace.json: missing required "name"');
  if (!Array.isArray(market.plugins) || market.plugins.length === 0)
    fail('marketplace.json: "plugins" must be a non-empty array');
  pass('marketplace.json: valid');
}

// --- workflow syntax ------------------------------------------------------
const wf = join(root, '.claude/workflows/nagents-pipeline.js');
if (existsSync(wf)) {
  try { execFileSync(process.execPath, ['--check', wf]); pass('workflow: syntax OK'); }
  catch (e) { fail(`workflow: syntax error — ${e.message}`); }
} else {
  fail('workflow: .claude/workflows/nagents-pipeline.js not found');
}

// --- orchestrator ---------------------------------------------------------
const runner = join(root, 'orchestrator/run.mjs');
if (existsSync(runner)) {
  try { execFileSync(process.execPath, ['--check', runner]); pass('orchestrator: run.mjs syntax OK'); }
  catch (e) { fail(`orchestrator: run.mjs syntax error — ${e.message}`); }
  const eng = checkJson('orchestrator/engines.json');
  if (eng && !eng.engines) fail('engines.json: missing "engines" object');
  else if (eng) pass(`orchestrator: ${Object.keys(eng.engines).length} engine(s) defined`);
} else {
  fail('orchestrator: orchestrator/run.mjs not found');
}

// --- report ---------------------------------------------------------------
for (const o of ok) console.log(`  ✓ ${o}`);
if (errors.length) {
  console.error('\n✗ Validation failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✓ All structural checks passed.');
