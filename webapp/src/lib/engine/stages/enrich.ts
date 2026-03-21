import type { StageRunner, StageContext, StageResult } from './types'
import type { StageKind } from '../types'

export class EnrichStageRunner implements StageRunner {
  kind: StageKind = 'enrich'
  async run(_context: StageContext): Promise<StageResult> {
    return { proposals_created: 0, records_processed: 0, errors: [] }
  }
}
