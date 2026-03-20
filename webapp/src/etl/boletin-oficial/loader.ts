/**
 * ETL Loader -- batch MERGE of Boletin Oficial data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  GovernmentAppointmentParams,
  PublicContractParams,
  ContractorParams,
  AwardedToRelParams,
  MaybeSameAsAppointmentRelParams,
} from './types'
import type { BoletinTransformResult } from './transformer'

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

async function loadAppointments(
  items: readonly GovernmentAppointmentParams[],
): Promise<LoadStepResult> {
  return runBatched('GovernmentAppointment', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS a
    MERGE (n:GovernmentAppointment {appointment_id: a.appointment_id})
    SET n += a
  `)
}

async function loadContracts(
  items: readonly PublicContractParams[],
): Promise<LoadStepResult> {
  return runBatched('PublicContract', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:PublicContract {contract_id: c.contract_id})
    SET n += c
  `)
}

async function loadContractors(
  items: readonly ContractorParams[],
): Promise<LoadStepResult> {
  return runBatched('Contractor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:Contractor {contractor_id: c.contractor_id})
    SET n += c
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

async function loadMaybeSameAsRels(
  items: readonly MaybeSameAsAppointmentRelParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (a:GovernmentAppointment {appointment_id: r.appointment_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(a)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BoletinLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadBoletinAll(data: BoletinTransformResult): Promise<BoletinLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadAppointments(data.appointments))
  steps.push(await loadContracts(data.contracts))
  steps.push(await loadContractors(data.contractors))

  // Phase 2: Relationships
  steps.push(await loadAwardedToRels(data.awardedToRels))
  steps.push(await loadMaybeSameAsRels(data.maybeSameAsRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
