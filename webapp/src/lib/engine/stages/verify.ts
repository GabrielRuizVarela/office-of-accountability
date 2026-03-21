import type { StageRunner, StageContext, StageResult } from './types'
import type { StageKind } from '../types'

export class VerifyStageRunner implements StageRunner {
  kind: StageKind = 'verify'
  async run(_context: StageContext): Promise<StageResult> {
    return { proposals_created: 0, records_processed: 0, errors: [] }
  }
}
