/**
 * Algorithm types - M10 Graph Algorithms (Phase 6).
 *
 * Algorithm interface, AlgorithmContext, and AlgorithmResult for the
 * autonomous investigation pipeline graph analysis algorithms.
 */

// ---------------------------------------------------------------------------
// AlgorithmKind - the kinds of graph algorithms available
// ---------------------------------------------------------------------------

export const algorithmKinds = ['centrality', 'community', 'anomaly', 'temporal'] as const
export type AlgorithmKind = (typeof algorithmKinds)[number]

// ---------------------------------------------------------------------------
// AlgorithmContext - runtime context passed to every algorithm
// ---------------------------------------------------------------------------

export interface AlgorithmContext {
  casoSlug: string
  pipelineStateId: string
  stageId: string
}

// ---------------------------------------------------------------------------
// AlgorithmResult - what every algorithm returns
// ---------------------------------------------------------------------------

export interface AlgorithmResult {
  hypotheses_created: number
  nodes_analyzed: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Algorithm interface - implemented by each algorithm kind
// ---------------------------------------------------------------------------

export interface Algorithm {
  kind: AlgorithmKind
  run(context: AlgorithmContext): Promise<AlgorithmResult>
}
