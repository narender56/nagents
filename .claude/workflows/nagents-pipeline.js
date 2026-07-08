export const meta = {
  name: 'nagents-pipeline',
  description: 'Adapt to a product: discovery → stack proposal → stack profile ("training") → readiness → PRD → backlog → Dev/Review/QA build loop',
  whenToUse: 'Hands-off run of the full nagents team on a product idea. Pass args as { idea, platform?, stack? }. Provide stack to skip the interactive decision; omit it to let the architect recommend one.',
  phases: [
    { title: 'Discovery', detail: 'Architect + PO establish platform & constraints' },
    { title: 'Stack', detail: 'Architect proposes/agrees the tech stack' },
    { title: 'Training', detail: 'Architect generates the stack profile & confirms readiness' },
    { title: 'Product', detail: 'PO writes PRD + acceptance criteria' },
    { title: 'Plan', detail: 'Scrum Master builds the backlog' },
    { title: 'Build', detail: 'Per task: Developer → Reviewer → QA with rework loops' },
  ],
}

// args = { idea, platform?, stack? }  (or a bare string treated as the idea)
const idea = typeof args === 'string' ? args : (args && args.idea) || null
const platform = (args && args.platform) || null
const chosenStack = (args && args.stack) || null

const READINESS_SCHEMA = {
  type: 'object',
  required: ['ready'],
  properties: {
    ready: { type: 'boolean' },
    stack: { type: 'string' },
    gaps: { type: 'array', items: { type: 'string' } },
  },
}

const TASK_SCHEMA = {
  type: 'object',
  required: ['tasks'],
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title'],
        properties: { id: { type: 'string' }, title: { type: 'string' }, dependsOn: { type: 'string' } },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['verdict'],
  properties: {
    verdict: { type: 'string', enum: ['APPROVED', 'CHANGES_REQUESTED', 'PASS', 'FAIL'] },
    summary: { type: 'string' },
  },
}

// ── Phase 1: Discovery ───────────────────────────────────────────────────
phase('Discovery')
await agent(
  `You are the solution-architect agent, partnering with the product-owner. Idea: "${idea}". ` +
    (platform ? `Target platform(s): ${platform}. ` : 'Determine the target platform(s) from the idea; note assumptions if unstated. ') +
    `Follow .claude/agents/solution-architect.md and write .nagents/discovery.md from .nagents/templates/discovery.template.md.`,
  { label: 'architect:discovery', phase: 'Discovery', agentType: 'solution-architect' }
)

// ── Phase 2: Stack decision ──────────────────────────────────────────────
phase('Stack')
await agent(
  `You are the solution-architect agent. Based on .nagents/discovery.md, ` +
    (chosenStack
      ? `the user has chosen this stack: "${chosenStack}". Record it as the agreed stack (note risks once).`
      : `propose 2 options with a clear recommendation.`) +
    ` Write .nagents/stack-decision.md from the template.`,
  { label: 'architect:stack', phase: 'Stack', agentType: 'solution-architect' }
)

// ── Phase 3: Training — generate stack profile + readiness ───────────────
phase('Training')
const readiness = await agent(
  `You are the solution-architect agent. Using the agreed stack in .nagents/stack-decision.md, ` +
    `research current best practices and generate the stack profile: fill .claude/skills/stack-profile/SKILL.md and add one references/<tech>.md per technology. ` +
    `Map the generic skills onto the stack. Then write .nagents/readiness.md and return whether the team is ready.`,
  { label: 'architect:training', phase: 'Training', agentType: 'solution-architect', schema: READINESS_SCHEMA }
)
if (!readiness || !readiness.ready) {
  log(`Team NOT ready: ${(readiness && (readiness.gaps || []).join('; ')) || 'unknown gaps'}. Stopping before build.`)
  return { idea, stopped: 'not-ready', readiness }
}
log(`Team ready on stack: ${readiness.stack || chosenStack || 'see stack-decision.md'}`)

// ── Phase 4: Product Owner ───────────────────────────────────────────────
phase('Product')
await agent(
  `You are the product-owner agent. Idea: "${idea}". Discovery is in .nagents/discovery.md and the stack in .nagents/stack-decision.md. ` +
    `Write the PRD at .nagents/prd.md following .claude/agents/product-owner.md and the template.`,
  { label: 'product-owner', phase: 'Product', agentType: 'product-owner' }
)

// ── Phase 5: Scrum Master ────────────────────────────────────────────────
phase('Plan')
const plan = await agent(
  `You are the scrum-master agent. Read .nagents/prd.md and produce .nagents/backlog.md plus one .nagents/tasks/TASK-<id>.md per task ` +
    `(planning within the architecture in .nagents/stack-decision.md). Return the ordered task list.`,
  { label: 'scrum-master', phase: 'Plan', agentType: 'scrum-master', schema: TASK_SCHEMA }
)
const tasks = (plan && plan.tasks) || []
log(`Backlog created with ${tasks.length} task(s).`)

// ── Phase 6: Build each task through Dev → Review → QA with rework loops ──
phase('Build')
const MAX_REWORK = 3

const results = await pipeline(
  tasks,
  async (task) => {
    let approved = false
    let round = 0
    let lastFeedback = ''
    // Dev ↔ Review loop
    while (!approved && round < MAX_REWORK) {
      round++
      await agent(
        `You are the developer agent. Implement ${task.id} — ${task.title}. ` +
          `Read .nagents/tasks/${task.id}.md and .nagents/prd.md. Apply the stack-profile skill FIRST, then the generic skills (SOLID, design-patterns, atomic-design, component-structure, coding-standards). ` +
          (lastFeedback ? `Address this review feedback: ${lastFeedback}` : '') +
          ` Follow .claude/agents/developer.md.`,
        { label: `dev:${task.id} r${round}`, phase: 'Build', agentType: 'developer' }
      )
      const review = await agent(
        `You are the code-reviewer agent. Review the implementation of ${task.id} against the stack profile + generic skills. ` +
          `Follow .claude/agents/code-reviewer.md, append to .nagents/review.md, and return your verdict.`,
        { label: `review:${task.id} r${round}`, phase: 'Build', agentType: 'code-reviewer', schema: VERDICT_SCHEMA }
      )
      approved = review && review.verdict === 'APPROVED'
      lastFeedback = review ? review.summary || '' : ''
    }
    if (!approved) return { task: task.id, status: 'BLOCKED_IN_REVIEW', rounds: round }

    // QA gate (one rework hop back to dev on FAIL)
    let qa = await agent(
      `You are the qa-engineer agent. Verify ${task.id} against its acceptance criteria in .nagents/prd.md. ` +
        `Follow .claude/agents/qa-engineer.md, write .nagents/qa-report.md, and return your verdict.`,
      { label: `qa:${task.id}`, phase: 'Build', agentType: 'qa-engineer', schema: VERDICT_SCHEMA }
    )
    if (qa && qa.verdict === 'FAIL') {
      await agent(
        `You are the developer agent. QA failed ${task.id}: ${qa.summary || ''}. Fix the defects. Follow .claude/agents/developer.md.`,
        { label: `dev:${task.id} qa-fix`, phase: 'Build', agentType: 'developer' }
      )
      qa = await agent(
        `You are the qa-engineer agent. Re-verify ${task.id} after the defect fix. Return your verdict.`,
        { label: `qa:${task.id} retest`, phase: 'Build', agentType: 'qa-engineer', schema: VERDICT_SCHEMA }
      )
    }
    return { task: task.id, status: qa && qa.verdict === 'PASS' ? 'DONE' : 'FAILED_QA', rounds: round }
  }
)

return { idea, stack: readiness.stack || chosenStack, tasks: tasks.length, results }
