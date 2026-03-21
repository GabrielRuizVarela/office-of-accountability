/**
 * Stage types — M10 Stage Implementations (Phase 5).
 *
 * StageRunner interface, StageContext, and StageResult for the
 * autonomous investigation pipeline stage runners.
 */

import type { PipelineState, PipelineStage, StageKind } from '../types'

// ---------------------------------------------------------------------------
// StageContext — runtime context passed to every stage runner
// ---------------------------------------------------------------------------

export interface StageContext {
  pipelineState: PipelineState
  stage: PipelineStage
  casoSlug: string
}

// ---------------------------------------------------------------------------
// StageResult — what every stage runner returns
// ---------------------------------------------------------------------------

export interface StageResult {
  proposals_created: number
  records_processed: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// StageRunner interface — implemented by each stage kind
// ---------------------------------------------------------------------------

export interface StageRunner {
  kind: StageKind
  run(context: StageContext): Promise<StageResult>
}
