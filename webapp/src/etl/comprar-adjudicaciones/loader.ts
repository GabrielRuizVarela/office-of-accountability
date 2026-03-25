/**
 * ETL Loader -- batch MERGE of Compr.ar adjudicaciones data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 * Sets caso_slug: 'obras-publicas' on all nodes.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  PublicContractParams,
  ContractorParams,
  AwardedToRelParams,
} from './types'
import type { AdjudicacionesTransformResult } from './transformer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_BATCH_SIZE = 500
const REL_BATCH_SIZE = 1000

// ---------------------------------------------------------------------------
// Batching helper
// ---------------------------------------------------------------------------

function chunk<T>(items: readonly T[], size: number): readonly T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

interface LoadStepResult {
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

  return { label, totalItems: items.length, batchesRun, errors }
}

// ---------------------------------------------------------------------------
// Node loaders
// ---------------------------------------------------------------------------

async function loadContracts(
  items: readonly PublicContractParams[],
): Promise<LoadStepResult> {
  return runBatched('PublicContract', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:PublicContract {contract_id: c.contract_id})
    SET n += c,
        n.caso_slug = 'obras-publicas'
  `)
}

async function loadContractors(
  items: readonly ContractorParams[],
): Promise<LoadStepResult> {
  return runBatched('Contractor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:Contractor {contractor_id: c.contractor_id})
    SET n += c,
        n.caso_slug = 'obras-publicas'
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadAwardedToRels(
  items: readonly AwardedToRelParams[],
): Promise<LoadStepResult> {
  return runBatched('AWARDED_TO', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (c:PublicContract {contract_id: r.contract_id})
    MATCH (s:Contractor {contractor_id: r.contractor_id})
    MERGE (c)-[rel:AWARDED_TO]->(s)
    SET rel.monto = r.monto,
        rel.moneda = r.moneda
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface AdjudicacionesLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadAdjudicacionesAll(
  data: AdjudicacionesTransformResult,
): Promise<AdjudicacionesLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes (contracts first, then contractors)
  steps.push(await loadContracts(data.contracts))
  steps.push(await loadContractors(data.contractors))

  // Phase 2: Relationships
  steps.push(await loadAwardedToRels(data.awardedToRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
