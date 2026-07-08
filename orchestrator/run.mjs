#!/usr/bin/env node
/**
 * nagents — tool-agnostic orchestrator.
 *
 * Drives the full pipeline (discovery → stack → training → PRD → backlog →
 * dev/review/QA per task) against ANY coding-agent CLI: Claude Code, OpenAI
 * Codex, Gemini CLI, Aider, … The roles, skills, memory protocol, and gates
 * are identical to the Claude-native Workflow — this runner just *is* the
 * orchestration engine that non-Claude tools don't have.
 *
 * How it stays engine-agnostic:
 *   - Roles + skills are plain markdown; the runner INLINES them into each
 *     prompt (other tools can't auto-load skills the way Claude Code does).
 *   - Shared memory + artifacts are plain files in .nagents/; every tool reads
 *     and writes them the same way.
 *   - Execution is SEQUENTIAL (one role at a time) so there are never two
 *     writers on the same file — the conflict-avoidance guarantee holds on
 *     every engine.
 *
 * Usage:
 *   node orchestrator/run.mjs --engine codex --idea "a habit tracker"
 *   node orchestrator/run.mjs --engine claude --idea "..." --platform mobile --stack "Flutter + Firebase"
 *   node orchestrator/run.mjs --engine codex --from build          # resume at a phase
 *   node orchestrator/run.mjs --engine echo  --idea "x" --dry-run  # print prompts, don't execute
 *
 * Flags:
 *   --engine <name>   engine key from orchestrator/engines.json (default: claude)
 *   --idea "<text>"   the product idea (required unless resuming past discovery)
 *   --platform <p>    target platform hint (optional)
 *   --stack "<s>"     pre-chosen stack; skips the proposal (optional)
 *   --from <phase>    start at: discovery|stack|training|prd|backlog|build
 *   --max-rework <n>  dev↔review rounds before giving up (default 3)
 *   --dry-run         compose and print prompts without invoking the engine
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const SELF = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SELF, '..');            // the nagents project root
const CWD = process.cwd();                    // where the target project lives (usually ROOT)

// ── args ──────────────────────────────────────────────────────────────────
function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}
const engineName = arg('engine', 'claude');
const idea = arg('idea', null);
const platform = arg('platform', null);
const chosenStack = arg('stack', null);
const fromPhase = arg('from', 'discovery');
const maxRework = parseInt(arg('max-rework', '3'), 10);
const dryRun = !!arg('dry-run', false);

const PHASES = ['discovery', 'stack', 'training', 'prd', 'backlog', 'build'];
if (!PHASES.includes(fromPhase)) fail(`--from must be one of: ${PHASES.join(', ')}`);
if (!idea && PHASES.indexOf(fromPhase) < PHASES.indexOf('prd'))
  fail('--idea is required (unless resuming at prd/backlog/build with artifacts already present)');

// ── engine ─────────────────────────────────────────────────────────────────
const engines = JSON.parse(readFileSync(join(SELF, 'engines.json'), 'utf8')).engines;
const engine = engines[engineName];
if (!engine) fail(`unknown engine "${engineName}". Available: ${Object.keys(engines).join(', ')}`);

// ── content loaders ─────────────────────────────────────────────────────────
const stripFm = (t) => t.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
function firstExisting(paths) {
  return paths.find((p) => existsSync(p)) || null;
}
function roleBody(role) {
  const p = firstExisting([
    join(CWD, '.claude/agents', `${role}.md`),
    join(ROOT, '.claude/agents', `${role}.md`),
  ]);
  if (!p) fail(`missing role file for ${role}`);
  return stripFm(readFileSync(p, 'utf8'));
}
function skillBody(name) {
  const p = firstExisting([
    join(CWD, '.claude/skills', name, 'SKILL.md'),
    join(ROOT, '.claude/skills', name, 'SKILL.md'),
  ]);
  return p ? stripFm(readFileSync(p, 'utf8')) : '';
}
function readIf(rel) {
  const p = join(CWD, rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}
function memoryBlock() {
  const parts = [];
  for (const f of ['project-memory.md', 'decisions.md', 'state.md']) {
    const c = readIf(`.nagents/memory/${f}`);
    if (c) parts.push(`### .nagents/memory/${f}\n${c}`);
  }
  return parts.length ? `## Current shared memory (read before acting; follow the team-memory protocol)\n${parts.join('\n\n')}` : '';
}

const SKILLS_FOR = {
  'solution-architect': ['team-memory'],
  'product-owner': ['team-memory'],
  'scrum-master': ['team-memory'],
  'developer': ['team-memory', 'stack-profile', 'solid-principles', 'design-patterns', 'atomic-design', 'component-structure', 'coding-standards'],
  'code-reviewer': ['team-memory', 'stack-profile', 'solid-principles', 'design-patterns', 'atomic-design', 'component-structure', 'coding-standards'],
  'qa-engineer': ['team-memory', 'coding-standards'],
};

function buildPrompt(role, instruction) {
  const skills = (SKILLS_FOR[role] || [])
    .map((s) => ({ s, body: skillBody(s) }))
    .filter((x) => x.body)
    .map((x) => `### skill: ${x.s}\n${x.body}`)
    .join('\n\n');
  return [
    `You are acting as the **${role}** agent in the nagents pipeline. You are running inside the target project's working directory and MAY read and write files here. Produce real files at the paths named below — do not just describe them.`,
    `\n## Your role definition\n${roleBody(role)}`,
    skills ? `\n## Skills you must apply (inlined — this engine can't auto-load them)\n${skills}` : '',
    `\n${memoryBlock()}`,
    `\n## This turn's task\n${instruction}`,
  ].filter(Boolean).join('\n');
}

// ── engine invocation ────────────────────────────────────────────────────────
function runEngine(prompt) {
  return new Promise((res, rej) => {
    const argv = engine.args.map((a) => (a === '{PROMPT}' ? prompt : a));
    const useStdin = engine.promptVia === 'stdin';
    const child = spawn(engine.cmd, argv, {
      cwd: CWD,
      stdio: [useStdin ? 'pipe' : 'ignore', 'pipe', 'inherit'],
    });
    let out = '';
    child.stdout.on('data', (d) => { const s = d.toString(); out += s; process.stdout.write(s); });
    child.on('error', (e) => rej(new Error(`failed to launch "${engine.cmd}": ${e.message}. Is it installed / on PATH?`)));
    child.on('close', () => res(out));
    if (useStdin) { child.stdin.write(prompt); child.stdin.end(); }
  });
}

async function step(role, instruction) {
  const prompt = buildPrompt(role, instruction);
  banner(`${role}`);
  if (dryRun) { console.log(prompt, '\n'); return ''; }
  return runEngine(prompt);
}

const VERDICT = (out) => (out.match(/VERDICT:\s*(APPROVED|CHANGES_REQUESTED|PASS|FAIL|READY|NOT[_ ]READY)/i) || [])[1];
function requireFiles(files, phase) {
  if (dryRun) return;
  const missing = files.filter((rel) => !existsSync(join(CWD, rel)));
  if (missing.length) {
    fail(`${phase} did not produce required artifact(s): ${missing.join(', ')}`);
  }
}

// ── phases ───────────────────────────────────────────────────────────────────
function shouldRun(phase) { return PHASES.indexOf(phase) >= PHASES.indexOf(fromPhase); }

async function main() {
  log(`engine=${engineName}  from=${fromPhase}  idea=${idea ? JSON.stringify(idea) : '(resuming)'}${dryRun ? '  [DRY RUN]' : ''}`);

  if (shouldRun('discovery'))
    await step('solution-architect',
      `Run DISCOVERY. Idea: "${idea}". ${platform ? `Target platform(s): ${platform}.` : 'Infer the target platform(s) from the idea; note assumptions.'} Write .nagents/discovery.md following .nagents/templates/discovery.template.md.`);
  if (shouldRun('discovery')) requireFiles(['.nagents/discovery.md'], 'discovery');

  if (shouldRun('stack'))
    await step('solution-architect',
      `Run STACK DECISION from .nagents/discovery.md. ${chosenStack
        ? `The user has chosen: "${chosenStack}". Record it as the agreed stack.`
        : `Propose 2 options with a clear recommendation, and (for this automated run) mark your recommendation as the agreed stack.`} Write .nagents/stack-decision.md following the template.`);
  if (shouldRun('stack')) requireFiles(['.nagents/stack-decision.md'], 'stack');

  if (shouldRun('training')) {
    const out = await step('solution-architect',
      `Run TRAINING. Using the agreed stack in .nagents/stack-decision.md: research best practices and generate the stack profile — fill .claude/skills/stack-profile/SKILL.md and add one references/<tech>.md per technology. Seed shared memory from templates: create .nagents/memory/{project-memory.md,decisions.md,state.md}, writing conventions into project-memory.md and the stack choice as ADR-001 in decisions.md. Write .nagents/readiness.md. End your reply with a line "VERDICT: READY" or "VERDICT: NOT_READY".`);
    requireFiles([
      '.claude/skills/stack-profile/SKILL.md',
      '.nagents/memory/project-memory.md',
      '.nagents/memory/decisions.md',
      '.nagents/memory/state.md',
      '.nagents/readiness.md',
    ], 'training');
    if (!dryRun && /NOT[_ ]READY/i.test(VERDICT(out) || '')) {
      log('Team NOT ready — stopping before build. Resolve gaps in .nagents/readiness.md then rerun with --from prd.');
      return;
    }
  }

  if (shouldRun('prd'))
    await step('product-owner',
      `Write the PRD at .nagents/prd.md following .claude/agents/product-owner.md and .nagents/templates/prd.template.md. Base it on .nagents/discovery.md and the idea "${idea || '(see discovery.md)'}".`);
  if (shouldRun('prd')) requireFiles(['.nagents/prd.md'], 'prd');

  if (shouldRun('backlog'))
    await step('scrum-master',
      `Read .nagents/prd.md. Produce .nagents/backlog.md and one .nagents/tasks/TASK-<id>.md per task (include each task's owned files). Seed the coordination board .nagents/memory/state.md. Follow the templates.`);
  if (shouldRun('backlog')) requireFiles(['.nagents/backlog.md', '.nagents/memory/state.md'], 'backlog');

  if (shouldRun('build')) await buildLoop();

  log(dryRun ? 'Dry-run complete. No artifacts were written.' : 'Pipeline complete. Inspect .nagents/ for all artifacts.');
}

async function buildLoop() {
  const tasksDir = join(CWD, '.nagents/tasks');
  const tasks = existsSync(tasksDir)
    ? readdirSync(tasksDir).filter((f) => /^TASK-.*\.md$/.test(f)).sort()
    : [];
  if (dryRun && !tasks.length) { log('No tasks found; dry-run stops before build prompts.'); return; }
  if (!tasks.length) fail('No tasks found in .nagents/tasks/ — did the backlog phase run?');
  log(`Building ${tasks.length} task(s) sequentially (one writer at a time → no conflicts).`);

  for (const file of tasks) {
    const id = file.replace(/\.md$/, '');
    let approved = false, round = 0, feedback = '';
    while (!approved && round < maxRework) {
      round++;
      await step('developer',
        `Implement ${id} (see .nagents/tasks/${file} and .nagents/prd.md). Read shared memory and CLAIM your files in .nagents/memory/state.md before editing; release them when done. Apply the stack-profile + generic skills. ${feedback ? `Address this review feedback:\n${feedback}` : ''} Record lasting decisions in .nagents/memory/decisions.md.`);
      const rev = await step('code-reviewer',
        `Review ${id} against the stack profile, generic skills, and the recorded conventions/decisions in .nagents/memory/. Append findings to .nagents/review.md. End your reply with "VERDICT: APPROVED" or "VERDICT: CHANGES_REQUESTED" followed by the blocking findings.`);
      requireFiles(['.nagents/review.md'], `${id} review`);
      const v = (VERDICT(rev) || '').toUpperCase();
      approved = v === 'APPROVED';
      feedback = approved ? '' : rev.slice(-2000);
      log(`${id}: review round ${round} → ${v || 'NO VERDICT'}`);
      if (dryRun) break;
    }
    if (!approved && !dryRun) { log(`${id}: BLOCKED_IN_REVIEW after ${round} round(s).`); continue; }

    let qa = await step('qa-engineer',
      `Verify ${id} against its acceptance criteria in .nagents/prd.md. Exercise the behavior, run tests. Write .nagents/qa-report.md. End with "VERDICT: PASS" or "VERDICT: FAIL" + defects.`);
    requireFiles(['.nagents/qa-report.md'], `${id} qa`);
    let v = (VERDICT(qa) || '').toUpperCase();
    if (v === 'FAIL' && !dryRun) {
      await step('developer', `QA failed ${id}. Read .nagents/qa-report.md, claim files, fix the defects, release claims.`);
      qa = await step('qa-engineer', `Re-verify ${id} after the fix. End with "VERDICT: PASS" or "VERDICT: FAIL".`);
      requireFiles(['.nagents/qa-report.md'], `${id} qa retest`);
      v = (VERDICT(qa) || '').toUpperCase();
    }
    log(`${id}: ${v === 'PASS' ? 'DONE ✅' : 'FAILED_QA ❌'}`);
    if (dryRun) break;
  }
}

// ── utils ────────────────────────────────────────────────────────────────────
function log(m) { console.log(`\n\x1b[36m[nagents]\x1b[0m ${m}`); }
function banner(m) { console.log(`\n\x1b[35m━━ ${m} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`); }
function fail(m) { console.error(`\x1b[31m[nagents] error:\x1b[0m ${m}`); process.exit(1); }

main().catch((e) => fail(e.message));
