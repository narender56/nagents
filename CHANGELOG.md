# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Ship artifact templates with the plugin so plugin-only installs get full orchestration
- Ready-made stack profiles for popular stacks (React, Angular/NestJS, Flutter, Go)
- A `/nagents` slash command to kick off the flow
- Example runs under `examples/`

## [0.1.0] - 2026-07-08

Initial public release.

### Added
- Six role subagents: `solution-architect`, `product-owner`, `scrum-master`,
  `developer`, `code-reviewer`, `qa-engineer`.
- Generic skill pack: `solid-principles`, `design-patterns`, `atomic-design`,
  `component-structure`, `coding-standards`.
- Per-project `stack-profile` skill — the "training" mechanism the architect
  populates with a chosen stack's best practices.
- Full inception flow: discovery → stack proposal → stack profile → readiness,
  ahead of PRD → backlog → dev → review → QA with rework loops.
- Artifact templates in `.nagents/templates/` and an auto-loaded `CLAUDE.md`
  orchestrator guide.
- Deterministic `nagents-pipeline.js` workflow for hands-off runs.
- Claude Code plugin packaging (`plugin.json` + `marketplace.json`).
- OSS scaffolding: MIT license, contributing guide, code of conduct,
  issue/PR templates, and a `validate.mjs` structural check run in CI.

[Unreleased]: https://github.com/narender56/nagents/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/narender56/nagents/releases/tag/v0.1.0
