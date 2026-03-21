/**
 * Research iteration metrics — pure computation, no side effects.
 * Used by iterate.ts to evaluate convergence and decide whether to continue.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Lightweight graph state summary for before/after comparison. */
export interface GraphSummary {
  node_count: number
  relationship_count: number
  /** Average confidence across all nodes (0–1). */
  avg_confidence: number
  /** Number of nodes that corroborate (share ≥2 independent sources). */
  corroborated_count: number
}

export interface IterationMetrics {
  /** Change in graph coverage (node + relationship growth ratio). */
  coverage_delta: number
  /** Change in average confidence. */
  confidence_delta: number
  /** Ratio of corroborated nodes to total nodes (0–1). */
  corroboration_score: number
  /** Ratio of new information in this iteration vs prior state. */
  novelty_score: number
  /** Number of proposals created in this iteration. */
  proposals_this_iteration: number
}

// ---------------------------------------------------------------------------
// evaluateIteration
// ---------------------------------------------------------------------------

/**
 * Compare graph state before and after an iteration to compute quality metrics.
 *
 * @param before - Graph summary before the iteration
 * @param after  - Graph summary after the iteration
 * @param proposalsCreated - Number of proposals generated in this iteration
 */
export function evaluateIteration(
  before: GraphSummary,
  after: GraphSummary,
  proposalsCreated: number,
): IterationMetrics {
  const prevTotal = before.node_count + before.relationship_count
  const currTotal = after.node_count + after.relationship_count

  // Coverage delta: relative growth of graph elements.
  // Guard against division by zero when graph is empty.
  const coverage_delta = prevTotal > 0 ? (currTotal - prevTotal) / prevTotal : currTotal > 0 ? 1 : 0

  // Confidence delta: simple difference in average confidence.
  const confidence_delta = after.avg_confidence - before.avg_confidence

  // Corroboration score: fraction of nodes with independent corroboration.
  const corroboration_score = after.node_count > 0 ? after.corroborated_count / after.node_count : 0

  // Novelty score: fraction of new elements relative to current total.
  const newElements = (after.node_count - before.node_count) + (after.relationship_count - before.relationship_count)
  const novelty_score = currTotal > 0 ? Math.max(0, newElements) / currTotal : 0

  return {
    coverage_delta,
    confidence_delta,
    corroboration_score,
    novelty_score,
    proposals_this_iteration: proposalsCreated,
  }
}

// ---------------------------------------------------------------------------
// shouldContinue
// ---------------------------------------------------------------------------

/** Diminishing-returns thresholds. */
const MIN_COVERAGE_DELTA = 0.01
const MIN_PROPOSALS = 1

/**
 * Decide whether the autonomous iteration loop should run another round.
 *
 * Stops when:
 * - Max iterations reached
 * - Coverage growth below threshold AND no new proposals
 */
export function shouldContinue(
  metrics: IterationMetrics,
  iteration: number,
  maxIterations: number,
): boolean {
  if (iteration >= maxIterations) return false
  if (metrics.coverage_delta < MIN_COVERAGE_DELTA && metrics.proposals_this_iteration < MIN_PROPOSALS) return false
  return true
}
