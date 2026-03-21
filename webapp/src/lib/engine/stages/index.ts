/**
 * Stage factory + barrel exports — M10 Stage Implementations (Phase 5).
 */

import type { StageKind } from '../types'
import type { StageRunner } from './types'
import { IngestStageRunner } from './ingest'
import { VerifyStageRunner } from './verify'
import { EnrichStageRunner } from './enrich'
import { AnalyzeStageRunner } from './analyze'
import { ReportStageRunner } from './report'

export function createStageRunner(kind: StageKind): StageRunner {
  switch (kind) {
    case 'ingest':
      return new IngestStageRunner()
    case 'verify':
      return new VerifyStageRunner()
    case 'enrich':
      return new EnrichStageRunner()
    case 'analyze':
      return new AnalyzeStageRunner()
    case 'iterate':
      // Iterate reuses analyze runner with iteration loop — placeholder until Phase 5b
      return new AnalyzeStageRunner()
    case 'report':
      return new ReportStageRunner()
  }
}

// Re-export types and runner classes for consumers
export type { StageRunner, StageContext, StageResult } from './types'
export { IngestStageRunner } from './ingest'
export { VerifyStageRunner } from './verify'
export { EnrichStageRunner } from './enrich'
export { AnalyzeStageRunner } from './analyze'
export { ReportStageRunner } from './report'
