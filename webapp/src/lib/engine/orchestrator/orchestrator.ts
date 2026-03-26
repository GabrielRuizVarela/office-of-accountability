/**
 * Orchestrator coordinator - ties together dispatch, synthesis, and priority
 * into a single orchestration cycle. Pure orchestration logic, no direct DB access.
 */

import type { OrchestratorTask } from '../types'
import type { GapReport } from '../gap-detector'
import type { ResearchDirective } from '../research-program'
import type { IterationMetrics } from '../research-metrics'
import type { SynthesisReport } from './synthesis'
import { planBatch, dispatchBatch, collectResults } from './dispatch'
import { synthesizeResults } from './synthesis'
import { scorePriority, rebalance, detectDiminishingReturns, suggestNewFocus } from './priority'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrchestratorCycleResult {
  dispatched_count: number
  completed_count: number
  synthesis: SynthesisReport
  diminishing_returns: boolean
  suggested_focus: string[]
  rebalanced: boolean
}

// ---------------------------------------------------------------------------
// runOrchestrationCycle - single cycle of plan → dispatch → synthesize → rebalance
// ---------------------------------------------------------------------------

/**
 * Runs one full orchestration cycle:
 * 1. Plan tasks from gaps + directives
 * 2. Score each task's priority using current metrics
 * 3. Dispatch tasks to Neo4j
 * 4. Collect completed results
 * 5. Synthesize findings (corroboration, contradiction, dedup)
 * 6. Rebalance pending task priorities
 * 7. Check for diminishing returns and suggest new focus if needed
 */
export async function runOrchestrationCycle(
  investigation_id: string,
  gaps: GapReport,
  directives: ResearchDirective[],
  metrics: IterationMetrics,
  metricsHistory: IterationMetrics[],
): Promise<OrchestratorCycleResult> {
  // 1. Plan tasks from gaps + directives
  const tasks = planBatch(investigation_id, gaps, directives)

  // 2. Score each task's priority using current metrics
  for (const task of tasks) {
    task.priority = scorePriority(task, metrics)
  }

  // 3. Dispatch to Neo4j
  await dispatchBatch(tasks)

  // 4. Collect completed results
  const completed = await collectResults(investigation_id)

  // 5. Synthesize findings
  const synthesis = await synthesizeResults(investigation_id, completed)

  // 6. Rebalance pending task priorities
  await rebalance(investigation_id, synthesis)

  // 7. Check diminishing returns and suggest new focus if needed
  const diminishing_returns = detectDiminishingReturns(metricsHistory)
  const suggested_focus = diminishing_returns
    ? await suggestNewFocus(investigation_id)
    : []

  return {
    dispatched_count: tasks.length,
    completed_count: completed.length,
    synthesis,
    diminishing_returns,
    suggested_focus,
    rebalanced: synthesis.corroborations.length > 0,
  }
}
