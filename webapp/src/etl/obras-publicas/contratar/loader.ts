/**
 * ETL Loader -- batch MERGE of CONTRAT.AR data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../../lib/neo4j/client'

import type {
  ObrasProcedureParams,
  ObrasPublicWorkParams,
  ObrasBidParams,
  ObrasContractorParams,
  ObrasPublicContractParams,
  ProcedureForRelParams,
  BidOnRelParams,
  BidderRelParams,
  ContractedForRelParams,
  ObrasAwardedToRelParams,
  LocatedInProvinceRelParams,
} from './types'
import type { ContratarTransformResult } from './transformer'

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

async function loadProcedures(
  items: readonly ObrasProcedureParams[],
): Promise<LoadStepResult> {
  return runBatched('ObrasProcedure', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:ObrasProcedure {procedure_id: p.procedure_id})
    SET n += p
  `)
}

async function loadPublicWorks(
  items: readonly ObrasPublicWorkParams[],
): Promise<LoadStepResult> {
  return runBatched('PublicWork', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:PublicWork {work_id: p.work_id})
    SET n += p
  `)
}

async function loadBids(
  items: readonly ObrasBidParams[],
): Promise<LoadStepResult> {
  return runBatched('Bid', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:Bid {bid_id: p.bid_id})
    SET n += p
  `)
}

async function loadContractors(
  items: readonly ObrasContractorParams[],
): Promise<LoadStepResult> {
  return runBatched('Contractor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:Contractor {contractor_id: p.contractor_id})
    SET n += p
  `)
}

async function loadContracts(
  items: readonly ObrasPublicContractParams[],
): Promise<LoadStepResult> {
  return runBatched('PublicContract', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:PublicContract {contract_id: p.contract_id})
    SET n += p
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadProcedureForRels(
  items: readonly ProcedureForRelParams[],
): Promise<LoadStepResult> {
  return runBatched('PROCEDURE_FOR', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (proc:ObrasProcedure {procedure_id: r.procedure_id})
    MATCH (w:PublicWork {work_id: r.work_id})
    MERGE (proc)-[rel:PROCEDURE_FOR]->(w)
  `)
}

async function loadBidOnRels(
  items: readonly BidOnRelParams[],
): Promise<LoadStepResult> {
  return runBatched('BID_ON', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (b:Bid {bid_id: r.bid_id})
    MATCH (proc:ObrasProcedure {procedure_id: r.procedure_id})
    MERGE (b)-[rel:BID_ON]->(proc)
  `)
}

async function loadBidderRels(
  items: readonly BidderRelParams[],
): Promise<LoadStepResult> {
  return runBatched('BIDDER', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (b:Bid {bid_id: r.bid_id})
    MATCH (c:Contractor {contractor_id: r.contractor_id})
    MERGE (c)-[rel:BIDDER]->(b)
  `)
}

async function loadContractedForRels(
  items: readonly ContractedForRelParams[],
): Promise<LoadStepResult> {
  return runBatched('CONTRACTED_FOR', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (c:PublicContract {contract_id: r.contract_id})
    MATCH (w:PublicWork {work_id: r.work_id})
    MERGE (c)-[rel:CONTRACTED_FOR]->(w)
  `)
}

async function loadAwardedToRels(
  items: readonly ObrasAwardedToRelParams[],
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

async function loadLocatedInProvinceRels(
  items: readonly LocatedInProvinceRelParams[],
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

export interface ContratarLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadContratarAll(data: ContratarTransformResult): Promise<ContratarLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadProcedures(data.procedures))
  steps.push(await loadPublicWorks(data.publicWorks))
  steps.push(await loadBids(data.bids))
  steps.push(await loadContractors(data.contractors))
  steps.push(await loadContracts(data.contracts))

  // Phase 2: Relationships
  steps.push(await loadProcedureForRels(data.procedureForRels))
  steps.push(await loadBidOnRels(data.bidOnRels))
  steps.push(await loadBidderRels(data.bidderRels))
  steps.push(await loadContractedForRels(data.contractedForRels))
  steps.push(await loadAwardedToRels(data.awardedToRels))
  steps.push(await loadLocatedInProvinceRels(data.locatedInProvinceRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
