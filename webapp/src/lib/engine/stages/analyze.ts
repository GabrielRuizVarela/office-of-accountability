import type { StageRunner, StageContext, StageResult } from './types'
import type { StageKind } from '../types'

export class AnalyzeStageRunner implements StageRunner {
  kind: StageKind = 'analyze'
  async run(_context: StageContext): Promise<StageResult> {
    return { proposals_created: 0, records_processed: 0, errors: [] }
  }
}
