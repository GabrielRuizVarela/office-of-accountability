/**
 * ETL Loader -- batch MERGE of World Bank multilateral data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../../lib/neo4j/client'

import type {
  MultilateralProjectParams,
  MultilateralContractorParams,
  MultilateralContractParams,
  FundedByRelParams,
  AwardedToRelParams,
} from './types'
import type { MultilateralTransformResult } from './transformer'

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

async function loadProjects(
  items: readonly MultilateralProjectParams[],
): Promise<LoadStepResult> {
  return runBatched('MultilateralProject', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:MultilateralProject {project_id: p.project_id})
    SET n += p
  `)
}

async function loadContractors(
  items: readonly MultilateralContractorParams[],
): Promise<LoadStepResult> {
  return runBatched('Contractor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:Contractor {contractor_id: p.contractor_id})
    SET n += p
  `)
}

async function loadContracts(
  items: readonly MultilateralContractParams[],
): Promise<LoadStepResult> {
  return runBatched('MultilateralContract', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:MultilateralContract {contract_id: p.contract_id})
    SET n += p
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadFundedByRels(
  items: readonly FundedByRelParams[],
): Promise<LoadStepResult> {
  return runBatched('FUNDED_BY', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (c:MultilateralContract {contract_id: r.contract_id})
    MATCH (p:MultilateralProject {project_id: r.project_id})
    MERGE (c)-[rel:FUNDED_BY]->(p)
  `)
}

async function loadAwardedToRels(
  items: readonly AwardedToRelParams[],
): Promise<LoadStepResult> {
  return runBatched('AWARDED_TO', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (c:MultilateralContract {contract_id: r.contract_id})
    MATCH (s:Contractor {contractor_id: r.contractor_id})
    MERGE (c)-[rel:AWARDED_TO]->(s)
    SET rel.amount_usd = r.amount_usd
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MultilateralLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadMultilateralAll(
  data: MultilateralTransformResult,
): Promise<MultilateralLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadProjects(data.projects))
  steps.push(await loadContractors(data.contractors))
  steps.push(await loadContracts(data.contracts))

  // Phase 2: Relationships
  steps.push(await loadFundedByRels(data.fundedByRels))
  steps.push(await loadAwardedToRels(data.awardedToRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
