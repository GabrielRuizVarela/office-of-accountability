/**
 * Orchestrator synthesis — corroboration, contradiction detection, dedup, and result synthesis.
 * No orchestrator loop logic here (that's orchestrator.ts in Step 3.2).
 */

import neo4j from 'neo4j-driver-lite'
import type { OrchestratorTask } from '../types'
import { readQuery } from '../../neo4j/client'

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Corroboration {
  target: string
  proposals: { id: string; confidence: number; stage_id: string }[]
  count: number
}

export interface Contradiction {
  target: string
  proposal_a: string
  proposal_b: string
  reason: string
}

export interface DuplicateGroup {
  canonical_id: string
  duplicate_ids: string[]
}

export interface SynthesisReport {
  investigation_id: string
  corroborations: Corroboration[]
  contradictions: Contradiction[]
  duplicates: DuplicateGroup[]
  task_count: number
  synthesized_at: string
}

// ---------------------------------------------------------------------------
// findCorroborations — proposals referencing the same target entity
// ---------------------------------------------------------------------------

/**
 * Finds proposals that reference the same target (by payload.name or
 * payload.source+payload.target for edges), grouped with count >= 2.
 */
export async function findCorroborations(investigation_id: string): Promise<Corroboration[]> {
  const cypher = `
    MATCH (ps:PipelineState)-[:HAS_PROPOSAL]->(p:Proposal)
    WHERE ps.caso_slug = $investigation_id
      AND p.status = 'pending'
    WITH coalesce(p.payload_name, p.payload_source + ' -> ' + p.payload_target) AS target,
         collect({ id: p.id, confidence: p.confidence, stage_id: p.stage_id }) AS proposals
    WHERE size(proposals) >= 2
    RETURN target, proposals
    LIMIT $limit
  `

  const result = await readQuery(
    cypher,
    { investigation_id, limit: neo4j.int(100) },
    (record) => {
      const target = record.get('target') as string
      const proposals = (record.get('proposals') as Array<{
        id: string
        confidence: unknown
        stage_id: string
      }>).map((p) => ({
        id: p.id,
        confidence: typeof p.confidence === 'object' && p.confidence !== null && 'toNumber' in p.confidence
          ? (p.confidence as { toNumber: () => number }).toNumber()
          : p.confidence as number,
        stage_id: p.stage_id,
      }))
      return {
        target,
        proposals,
        count: proposals.length,
      } satisfies Corroboration
    },
  )

  return [...result.records]
}

// ---------------------------------------------------------------------------
// findContradictions — conflicting proposals for same target
// ---------------------------------------------------------------------------

/**
 * Finds pairs of proposals where the same target has conflicting types
 * or conflicting payloads.
 */
export async function findContradictions(investigation_id: string): Promise<Contradiction[]> {
  const cypher = `
    MATCH (ps:PipelineState)-[:HAS_PROPOSAL]->(a:Proposal),
          (ps)-[:HAS_PROPOSAL]->(b:Proposal)
    WHERE ps.caso_slug = $investigation_id
      AND a.status = 'pending' AND b.status = 'pending'
      AND id(a) < id(b)
      AND coalesce(a.payload_name, a.payload_source + ' -> ' + a.payload_target)
        = coalesce(b.payload_name, b.payload_source + ' -> ' + b.payload_target)
      AND (a.type <> b.type OR a.payload_label <> b.payload_label)
    WITH coalesce(a.payload_name, a.payload_source + ' -> ' + a.payload_target) AS target,
         a, b
    RETURN target, a.id AS proposal_a, b.id AS proposal_b,
           CASE
             WHEN a.type <> b.type THEN 'conflicting types: ' + a.type + ' vs ' + b.type
             ELSE 'conflicting labels: ' + coalesce(a.payload_label, '?') + ' vs ' + coalesce(b.payload_label, '?')
           END AS reason
    LIMIT $limit
  `

  const result = await readQuery(
    cypher,
    { investigation_id, limit: neo4j.int(50) },
    (record) => ({
      target: record.get('target') as string,
      proposal_a: record.get('proposal_a') as string,
      proposal_b: record.get('proposal_b') as string,
      reason: record.get('reason') as string,
    } satisfies Contradiction),
  )

  return [...result.records]
}

// ---------------------------------------------------------------------------
// deduplicateProposals — find proposals with identical type + target
// ---------------------------------------------------------------------------

/**
 * Finds proposals with identical type and target (payload.name or
 * payload.source+payload.target for edges). Returns groups with a
 * canonical ID and duplicate IDs.
 */
export async function deduplicateProposals(investigation_id: string): Promise<DuplicateGroup[]> {
  const cypher = `
    MATCH (ps:PipelineState)-[:HAS_PROPOSAL]->(p:Proposal)
    WHERE ps.caso_slug = $investigation_id
      AND p.status = 'pending'
    WITH p.type AS ptype,
         coalesce(p.payload_name, p.payload_source + ' -> ' + p.payload_target) AS target,
         collect(p.id) AS ids
    WHERE size(ids) >= 2
    RETURN ids
    LIMIT $limit
  `

  const result = await readQuery(
    cypher,
    { investigation_id, limit: neo4j.int(100) },
    (record) => {
      const ids = record.get('ids') as string[]
      return {
        canonical_id: ids[0],
        duplicate_ids: ids.slice(1),
      } satisfies DuplicateGroup
    },
  )

  return [...result.records]
}

// ---------------------------------------------------------------------------
// synthesizeResults — combine all synthesis analyses
// ---------------------------------------------------------------------------

/**
 * Runs corroboration, contradiction, and dedup analyses in parallel,
 * returning a combined SynthesisReport.
 */
export async function synthesizeResults(
  investigation_id: string,
  completedTasks: OrchestratorTask[],
): Promise<SynthesisReport> {
  const [corroborations, contradictions, duplicates] = await Promise.all([
    findCorroborations(investigation_id),
    findContradictions(investigation_id),
    deduplicateProposals(investigation_id),
  ])

  return {
    investigation_id,
    corroborations,
    contradictions,
    duplicates,
    task_count: completedTasks.length,
    synthesized_at: new Date().toISOString(),
  }
}
