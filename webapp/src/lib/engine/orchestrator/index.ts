/**
 * Orchestrator module — barrel re-exports.
 */

export { runOrchestrationCycle } from './orchestrator'
export type { OrchestratorCycleResult } from './orchestrator'

export { planBatch, dispatchBatch, collectResults, reassign } from './dispatch'

export {
  findCorroborations,
  findContradictions,
  deduplicateProposals,
  synthesizeResults,
} from './synthesis'
export type {
  Corroboration,
  Contradiction,
  DuplicateGroup,
  SynthesisReport,
} from './synthesis'

export {
  scorePriority,
  rebalance,
  detectDiminishingReturns,
  suggestNewFocus,
} from './priority'
