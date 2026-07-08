<div align="center">

# 🤖 nagents

**A self-adapting software-engineering team for [Claude Code](https://claude.com/claude-code) — and any other agent CLI (Codex, Gemini, Aider).**

Architect → Product Owner → Scrum Master → Developer → Code Reviewer → QA — six AI subagents that discover your platform, agree a tech stack, _learn its best practices_, then build with review and QA gates.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-8A63D2.svg)](https://code.claude.com/docs/en/plugins)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](CHANGELOG.md)

</div>

---

## What is this?

Most "AI dev team" setups hardcode a stack and a fixed pipeline. **nagents doesn't.** You describe an idea; a senior **Solution Architect** asks what you're building (mobile? web? desktop?), proposes a tech stack, and — once you agree — **researches that stack's best practices and writes them into a skill the whole team loads before coding.** Then the classic loop runs: PRD → backlog → implement → review → QA, with rework loops at every gate.

It's built from two clean primitives, kept deliberately separate:

- **Roles** = _who acts_ (the six subagents)
- **Skills** = _the knowledge they apply_ (SOLID, design patterns, atomic design, component structure, coding standards, + the per-project stack profile)

Same six agents adapt to **any product and any stack** — because the stack-specific knowledge is regenerated per project, not baked in.

## The flow

```
IDEA
  → Architect + PO: DISCOVERY      (asks: mobile? web? desktop? other? + constraints)
  → Architect: PROPOSE STACK       (2 options + a recommendation)
  → YOU: accept / pick other / bring your own stack        ← you decide
  → Architect: GENERATE STACK PROFILE   (researches best practices for that stack)
  → Architect: ONBOARD + READINESS CHECK
  → PO: PRD  →  Scrum Master: BACKLOG
  → per task: Developer → Code Reviewer → QA → Done
                  ▲            │            │
                  └─ changes ──┘            │
                  └────────── defects ──────┘
```

## The team

| Agent                     | Role                                           | Produces                                                               |
| ------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| 🧭 **solution-architect** | Senior. Platform, stack, onboarding, readiness | `discovery.md`, `stack-decision.md`, `readiness.md`, the stack profile |
| 📋 **product-owner**      | The _what & why_                               | `prd.md` (user stories + testable acceptance criteria)                 |
| 🗂️ **scrum-master**       | Planning & sequencing                          | `backlog.md`, `tasks/`                                                 |
| 💻 **developer**          | The _how_ — applies the skill pack             | code + task notes                                                      |
| 🔍 **code-reviewer**      | Quality gate                                   | `review.md`                                                            |
| ✅ **qa-engineer**        | Acceptance gate                                | `qa-report.md`                                                         |

## The skills

- **team-memory** — the shared-memory + conflict-avoidance protocol every agent follows (see below).
- **stack-profile** — the _chosen stack's_ conventions & best practices. **Generated per project** by the architect (empty until then). This is how the team "gets familiar" with a stack — knowledge written down once, loaded by every developer and reviewer. It wins over the generic examples when they conflict.
- Always-on quality bar: **solid-principles · design-patterns · atomic-design · component-structure · coding-standards**.

> **On "training":** agents can't fine-tune themselves. So "getting familiar with a stack" here means the architect **researches current best practices and writes them into the `stack-profile` skill** (one `references/<tech>.md` per technology). Concrete, inspectable, and it measurably changes what the developers produce — no hand-waving.

## Shared memory & no conflicts

Subagents each run in their own context — **the only thing they share is the filesystem.** nagents turns that into a real team memory and a coordination discipline (the **team-memory** skill), so the agents stay consistent and never clobber each other's work.

**Common memory** lives in [`.nagents/memory/`](.nagents/memory):

- `project-memory.md` — durable conventions, glossary, key facts, gotchas
- `decisions.md` — append-only decision log (ADR-style) with rationale
- `state.md` — live task board + **file ownership locks**

**How conflicts are prevented:**

- **Append, never overwrite** — every entry is stamped `[date · agent]`; outdated info is _superseded_, not rewritten, so two agents writing at once don't collide.
- **Claim before you edit** — a developer must claim a file in `state.md` before touching it, and release it on handoff. **One writer per file, ever.**
- **Sequential by default** — the build loop runs one task fully (dev → review → QA) before the next, so file conflicts are impossible. Parallelism is opt-in and only for tasks with _disjoint_ file sets, each developer isolated in its own git **worktree**.
- **Read before you act** — every agent reads the shared memory at the start of its turn, so nobody works on stale assumptions.

---

## Requirements

- [Claude Code](https://claude.com/claude-code) (CLI, desktop, or IDE extension)
- [Node.js](https://nodejs.org) 18+ — only needed to run the optional automated workflow and the validation script

## Install & use

There are two ways to run it. **Cloning gives you the full experience** (agents + skills + orchestrator + templates + automated workflow). **Installing the plugin** drops the six agents + skill pack into any existing project.

### Option A — Clone (recommended)

```bash
git clone https://github.com/narender56/nagents.git
cd nagents
claude            # open Claude Code in the repo
```

Then just describe an idea:

> "I want to build a habit-tracking app. Kick off nagents."

The architect runs discovery, proposes a stack, and **waits for your call**. Approve it or hand it your own stack; it generates the stack profile, confirms readiness, then the PO → SM → dev → review → QA loop runs. Inspect every artifact in [`.nagents/`](.nagents/README.md) between stages, or drive a single role directly: _"Have the code-reviewer look at TASK-002."_

**Automated, hands-off run** (skips the interactive stack decision if you pass a stack):

> "Run the nagents-pipeline workflow with args: `{ idea: 'habit-tracking app', platform: 'cross-platform mobile', stack: 'Flutter + Firebase' }`"

### Option C — Any agent CLI (Codex, Gemini, Aider, …) via the tool-agnostic orchestrator

nagents isn't Claude-only. The roles, skills, and memory are plain files, so a small Node runner drives the whole pipeline against **any** coding-agent CLI:

```bash
node orchestrator/run.mjs --engine codex  --idea "a habit-tracking app" --platform mobile
node orchestrator/run.mjs --engine gemini --idea "..."
node orchestrator/run.mjs --engine claude --idea "..." --stack "Flutter + Firebase"
```

It inlines the skills into each prompt (non-Claude tools can't auto-load them), runs every role sequentially (no file conflicts), and enforces the review/QA gates. Most other tools are single-agent — this runner _is_ the orchestration they lack. See [`orchestrator/README.md`](orchestrator/README.md).

### Option B — Install as a Claude Code plugin

From inside any project's Claude Code session:

```bash
/plugin marketplace add narender56/nagents
/plugin install nagents@nagents
```

This makes the six agents and the skill pack available in that project. To also get the artifact templates and the orchestrator's rules, copy [`.nagents/templates/`](.nagents/templates) and [`CLAUDE.md`](CLAUDE.md) from this repo into your project — or just invoke the agents directly (they degrade gracefully without the templates).

## Repository layout

```
nagents/
├── .claude/
│   ├── agents/        6 role agents
│   ├── skills/        team-memory + stack-profile (generated) + 5 generic skills
│   └── workflows/     nagents-pipeline.js  (automated end-to-end run)
├── orchestrator/      tool-agnostic runner: run.mjs + engines.json (Codex, Gemini, Aider, Claude)
├── .claude-plugin/
│   ├── plugin.json        plugin manifest (points at .claude/)
│   └── marketplace.json   makes the repo directly installable
├── .nagents/          runtime artifacts + memory/ (shared brain) + templates/
├── .github/           issue/PR templates + CI validation
├── scripts/validate.mjs   structural checks (agents, skills, JSON, workflow)
├── CLAUDE.md          orchestrator instructions (auto-loaded)
├── CONTRIBUTING.md · CODE_OF_CONDUCT.md · CHANGELOG.md · LICENSE
```

## Validate your changes

```bash
node scripts/validate.mjs
```

Checks that every agent and skill has valid front-matter, the plugin/marketplace JSON parses, and the workflow is syntactically valid. CI runs this on every PR.

## Roadmap

- [x] Ship artifact templates _with_ the plugin so plugin-only installs get full orchestration
- [x] Ready-made stack profiles for popular stacks (React, Angular/NestJS, Flutter, Go)
- [x] A `/nagents` slash command to kick off the flow
- [x] Example runs checked into `examples/`

See [CHANGELOG.md](CHANGELOG.md) for what's shipped.

## Contributing

PRs and issues welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Good first contributions: new stack profiles, sharper skill rubrics, and example runs.

## License

[MIT](LICENSE) © [Narender Vaddepelly](https://github.com/narender56)
