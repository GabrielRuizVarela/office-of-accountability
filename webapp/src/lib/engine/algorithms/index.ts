/**
 * Algorithm factory + barrel exports — M10 Graph Algorithms (Phase 6).
 */

import type { AlgorithmKind } from './types'
import type { Algorithm } from './types'
import { CentralityAlgorithm } from './centrality'
import { CommunityAlgorithm } from './community'
import { AnomalyAlgorithm } from './anomaly'
import { TemporalAlgorithm } from './temporal'

export function createAlgorithm(kind: AlgorithmKind): Algorithm {
  switch (kind) {
    case 'centrality':
      return new CentralityAlgorithm()
    case 'community':
      return new CommunityAlgorithm()
    case 'anomaly':
      return new AnomalyAlgorithm()
    case 'temporal':
      return new TemporalAlgorithm()
  }
}

// Re-export types for consumers
export type { Algorithm, AlgorithmContext, AlgorithmResult, AlgorithmKind } from './types'
export { algorithmKinds } from './types'
export { CentralityAlgorithm } from './centrality'
export { CommunityAlgorithm } from './community'
export { AnomalyAlgorithm } from './anomaly'
export { TemporalAlgorithm } from './temporal'
