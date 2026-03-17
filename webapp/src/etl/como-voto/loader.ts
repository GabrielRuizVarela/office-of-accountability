/**
 * ETL Loader — batch MERGE of Como Voto data into Neo4j.
 *
 * Uses UNWIND for efficient batching. All queries are parameterized
 * to prevent Cypher injection. Idempotent via MERGE (safe to re-run).
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  CastVoteRelParams,
  LegislativeVoteParams,
  MemberOfRelParams,
  PartyParams,
  PoliticianParams,
  ProvinceParams,
  RepresentsRelParams,
} from './types'
import type { TransformResult } from './transformer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default batch size for UNWIND operations */
const DEFAULT_BATCH_SIZE = 500

/** Batch size for relationships (smaller to avoid memory pressure) */
const RELATIONSHIP_BATCH_SIZE = 1000

// ---------------------------------------------------------------------------
// Batching helper
// ---------------------------------------------------------------------------

/** Split an array into chunks of the given size */
function chunk<T>(items: readonly T[], size: number): readonly T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

// ---------------------------------------------------------------------------
// Node loaders
// ---------------------------------------------------------------------------

/** MERGE Politician nodes in batches */
async function loadPoliticians(
  politicians: readonly PoliticianParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS p
    MERGE (n:Politician {id: p.id})
    SET n += p
  `

  return runBatched('Politician', politicians, batchSize, cypher)
}

/** MERGE Party nodes in batches */
async function loadParties(
  parties: readonly PartyParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS p
    MERGE (n:Party {id: p.id})
    SET n += p
  `

  return runBatched('Party', parties, batchSize, cypher)
}

/** MERGE Province nodes in batches */
async function loadProvinces(
  provinces: readonly ProvinceParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS p
    MERGE (n:Province {id: p.id})
    SET n += p
  `

  return runBatched('Province', provinces, batchSize, cypher)
}

/** MERGE LegislativeVote nodes in batches */
async function loadVotingSessions(
  sessions: readonly LegislativeVoteParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS v
    MERGE (n:LegislativeVote {acta_id: v.acta_id})
    SET n += v
  `

  return runBatched('LegislativeVote', sessions, batchSize, cypher)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

/** MERGE MEMBER_OF relationships in batches */
async function loadMemberOfRels(
  rels: readonly MemberOfRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (party:Party {id: r.party_id})
    MERGE (p)-[:MEMBER_OF]->(party)
  `

  return runBatched('MEMBER_OF', rels, batchSize, cypher)
}

/** MERGE REPRESENTS relationships in batches */
async function loadRepresentsRels(
  rels: readonly RepresentsRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (prov:Province {id: r.province_id})
    MERGE (p)-[:REPRESENTS]->(prov)
  `

  return runBatched('REPRESENTS', rels, batchSize, cypher)
}

/** MERGE CAST_VOTE relationships in batches */
async function loadCastVoteRels(
  rels: readonly CastVoteRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (v:LegislativeVote {acta_id: r.vote_acta_id})
    MERGE (p)-[cv:CAST_VOTE {vote_value: r.vote_value}]->(v)
    SET cv.source_url = r.source_url
  `

  return runBatched('CAST_VOTE', rels, batchSize, cypher)
}

// ---------------------------------------------------------------------------
// Batched execution helper
// ---------------------------------------------------------------------------

export interface LoadStepResult {
  readonly label: string
  readonly totalItems: number
  readonly batchesRun: number
  readonly errors: readonly string[]
}

async function runBatched<T extends object>(
  label: string,
  items: readonly T[],
  batchSize: number,
  cypher: string,
): Promise<LoadStepResult> {
  const batches = chunk(items, batchSize)
  const errors: string[] = []
  let batchesRun = 0

  for (const batch of batches) {
    try {
      await executeWrite(cypher, { batch })
      batchesRun += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${label} batch ${batchesRun + 1}: ${message}`)
    }
  }

  return {
    label,
    totalItems: items.length,
    batchesRun,
    errors,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface LoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export interface LoadOptions {
  readonly nodeBatchSize?: number
  readonly relBatchSize?: number
}

/**
 * Load all transformed Como Voto data into Neo4j.
 *
 * Execution order:
 * 1. Nodes first (Politician, Party, Province, LegislativeVote)
 * 2. Relationships after (MEMBER_OF, REPRESENTS, CAST_VOTE)
 *
 * This ensures MATCH clauses in relationship queries find their targets.
 */
export async function loadAll(
  data: TransformResult,
  options: LoadOptions = {},
): Promise<LoadResult> {
  const nodeBatchSize = options.nodeBatchSize ?? DEFAULT_BATCH_SIZE
  const relBatchSize = options.relBatchSize ?? RELATIONSHIP_BATCH_SIZE
  const start = Date.now()

  // Phase 1: Nodes (order matters — politicians first since rels reference them)
  const steps: LoadStepResult[] = []

  steps.push(await loadPoliticians(data.politicians, nodeBatchSize))
  steps.push(await loadParties(data.parties, nodeBatchSize))
  steps.push(await loadProvinces(data.provinces, nodeBatchSize))
  steps.push(await loadVotingSessions(data.votingSessions, nodeBatchSize))

  // Phase 2: Relationships (nodes must exist first)
  steps.push(await loadMemberOfRels(data.memberOfRels, relBatchSize))
  steps.push(await loadRepresentsRels(data.representsRels, relBatchSize))
  steps.push(await loadCastVoteRels(data.castVotes, relBatchSize))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return {
    steps,
    totalErrors,
    durationMs: Date.now() - start,
  }
}
