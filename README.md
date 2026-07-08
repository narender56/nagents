<div align="center">

# 🤖 nagents

**A self-adapting software-engineering team for [Claude Code](https://claude.com/claude-code).**

Architect → Product Owner → Scrum Master → Developer → Code Reviewer → QA — six AI subagents that discover your platform, agree a tech stack, *learn its best practices*, then build with review and QA gates.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-8A63D2.svg)](https://code.claude.com/docs/en/plugins)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](CHANGELOG.md)

</div>

---

## What is this?

Most "AI dev team" setups hardcode a stack and a fixed pipeline. **nagents doesn't.** You describe an idea; a senior **Solution Architect** asks what you're building (mobile? web? desktop?), proposes a tech stack, and — once you agree — **researches that stack's best practices and writes them into a skill the whole team loads before coding.** Then the classic loop runs: PRD → backlog → implement → review → QA, with rework loops at every gate.

It's built from two clean primitives, kept deliberately separate:

- **Roles** = *who acts* (the six subagents)
- **Skills** = *the knowledge they apply* (SOLID, design patterns, atomic design, component structure, coding standards, + the per-project stack profile)

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

| Agent | Role | Produces |
|---|---|---|
| 🧭 **solution-architect** | Senior. Platform, stack, onboarding, readiness | `discovery.md`, `stack-decision.md`, `readiness.md`, the stack profile |
| 📋 **product-owner** | The *what & why* | `prd.md` (user stories + testable acceptance criteria) |
| 🗂️ **scrum-master** | Planning & sequencing | `backlog.md`, `tasks/` |
| 💻 **developer** | The *how* — applies the skill pack | code + task notes |
| 🔍 **code-reviewer** | Quality gate | `review.md` |
| ✅ **qa-engineer** | Acceptance gate | `qa-report.md` |

## The skills

- **stack-profile** — the *chosen stack's* conventions & best practices. **Generated per project** by the architect (empty until then). This is how the team "gets familiar" with a stack — knowledge written down once, loaded by every developer and reviewer. It wins over the generic examples when they conflict.
- Always-on quality bar: **solid-principles · design-patterns · atomic-design · component-structure · coding-standards**.

> **On "training":** agents can't fine-tune themselves. So "getting familiar with a stack" here means the architect **researches current best practices and writes them into the `stack-profile` skill** (one `references/<tech>.md` per technology). Concrete, inspectable, and it measurably changes what the developers produce — no hand-waving.

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

The architect runs discovery, proposes a stack, and **waits for your call**. Approve it or hand it your own stack; it generates the stack profile, confirms readiness, then the PO → SM → dev → review → QA loop runs. Inspect every artifact in [`.nagents/`](.nagents/README.md) between stages, or drive a single role directly: *"Have the code-reviewer look at TASK-002."*

**Automated, hands-off run** (skips the interactive stack decision if you pass a stack):

> "Run the nagents-pipeline workflow with args: `{ idea: 'habit-tracking app', platform: 'cross-platform mobile', stack: 'Flutter + Firebase' }`"

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
│   ├── skills/        stack-profile (generated) + 5 generic skills
│   └── workflows/     nagents-pipeline.js  (automated end-to-end run)
├── .claude-plugin/
│   ├── plugin.json        plugin manifest (points at .claude/)
│   └── marketplace.json   makes the repo directly installable
├── .nagents/          runtime artifacts + templates/  (see its README)
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

- [ ] Ship artifact templates *with* the plugin so plugin-only installs get full orchestration
- [ ] Ready-made stack profiles for popular stacks (React, Angular/NestJS, Flutter, Go)
- [ ] A `/nagents` slash command to kick off the flow
- [ ] Example runs checked into `examples/`

See [CHANGELOG.md](CHANGELOG.md) for what's shipped.

## Contributing

PRs and issues welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Good first contributions: new stack profiles, sharper skill rubrics, and example runs.

## License

[MIT](LICENSE) © [Narender Vaddepelly](https://github.com/narender56)

<div align="center"><sub>Built with Claude Code.</sub></div>
