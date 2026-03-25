/**
 * ETL Loader -- batch MERGE of MapaInversiones data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../../lib/neo4j/client'

import type {
  MapaPublicWorkParams,
  MapaContractorParams,
  ContractedForMapaRelParams,
  LocatedInProvinceMapaRelParams,
} from './types'
import type { MapaTransformResult } from './transformer'

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

async function loadPublicWorks(
  items: readonly MapaPublicWorkParams[],
): Promise<LoadStepResult> {
  return runBatched('PublicWork', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:PublicWork {work_id: p.work_id})
    SET n += p
  `)
}

async function loadContractors(
  items: readonly MapaContractorParams[],
): Promise<LoadStepResult> {
  return runBatched('Contractor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:Contractor {contractor_id: p.contractor_id})
    SET n += p
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadContractedForRels(
  items: readonly ContractedForMapaRelParams[],
): Promise<LoadStepResult> {
  return runBatched('CONTRACTED_FOR', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (w:PublicWork {work_id: r.work_id})
    MATCH (c:Contractor {contractor_id: r.contractor_id})
    MERGE (c)-[rel:CONTRACTED_FOR]->(w)
  `)
}

async function loadLocatedInProvinceRels(
  items: readonly LocatedInProvinceMapaRelParams[],
): Promise<LoadStepResult> {
  return runBatched('LOCATED_IN_PROVINCE', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (w:PublicWork {work_id: r.work_id})
    MERGE (prov:Province {name: r.province_name})
    MERGE (w)-[rel:LOCATED_IN_PROVINCE]->(prov)
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MapaLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadMapaAll(data: MapaTransformResult): Promise<MapaLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadPublicWorks(data.publicWorks))
  steps.push(await loadContractors(data.contractors))

  // Phase 2: Relationships
  steps.push(await loadContractedForRels(data.contractedForRels))
  steps.push(await loadLocatedInProvinceRels(data.locatedInProvinceRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
