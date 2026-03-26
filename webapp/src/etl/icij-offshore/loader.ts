/**
 * ETL Loader - batch MERGE of ICIJ Offshore Leaks data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  OffshoreOfficerParams,
  OffshoreEntityParams,
  OffshoreAddressParams,
  OffshoreIntermediaryParams,
  OfficerOfRelParams,
  IntermediaryOfRelParams,
  RegisteredAtRelParams,
  MaybeSameAsRelParams,
} from './types'
import type { IcijTransformResult } from './transformer'

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

async function loadOfficers(items: readonly OffshoreOfficerParams[]): Promise<LoadStepResult> {
  return runBatched('OffshoreOfficer', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS o
    MERGE (n:OffshoreOfficer {icij_id: o.icij_id})
    SET n += o
  `)
}

async function loadEntities(items: readonly OffshoreEntityParams[]): Promise<LoadStepResult> {
  return runBatched('OffshoreEntity', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS e
    MERGE (n:OffshoreEntity {icij_id: e.icij_id})
    SET n += e
  `)
}

async function loadAddresses(items: readonly OffshoreAddressParams[]): Promise<LoadStepResult> {
  return runBatched('OffshoreAddress', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS a
    MERGE (n:OffshoreAddress {icij_id: a.icij_id})
    SET n += a
  `)
}

async function loadIntermediaries(items: readonly OffshoreIntermediaryParams[]): Promise<LoadStepResult> {
  return runBatched('OffshoreIntermediary', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS i
    MERGE (n:OffshoreIntermediary {icij_id: i.icij_id})
    SET n += i
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadOfficerOfRels(items: readonly OfficerOfRelParams[]): Promise<LoadStepResult> {
  return runBatched('OFFICER_OF', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (o:OffshoreOfficer {icij_id: r.officer_icij_id})
    MATCH (e:OffshoreEntity {icij_id: r.entity_icij_id})
    MERGE (o)-[rel:OFFICER_OF]->(e)
    SET rel.link = r.link,
        rel.status = r.rel_status,
        rel.start_date = r.start_date,
        rel.end_date = r.end_date
  `)
}

async function loadIntermediaryOfRels(items: readonly IntermediaryOfRelParams[]): Promise<LoadStepResult> {
  return runBatched('INTERMEDIARY_OF', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (i:OffshoreIntermediary {icij_id: r.intermediary_icij_id})
    MATCH (e:OffshoreEntity {icij_id: r.entity_icij_id})
    MERGE (i)-[rel:INTERMEDIARY_OF]->(e)
    SET rel.link = r.link,
        rel.status = r.rel_status
  `)
}

async function loadRegisteredAtRels(items: readonly RegisteredAtRelParams[]): Promise<LoadStepResult> {
  return runBatched('REGISTERED_AT', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (e:OffshoreEntity {icij_id: r.entity_icij_id})
    MATCH (a:OffshoreAddress {icij_id: r.address_icij_id})
    MERGE (e)-[:REGISTERED_AT]->(a)
  `)
}

async function loadMaybeSameAsRels(items: readonly MaybeSameAsRelParams[]): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (o:OffshoreOfficer {icij_id: r.officer_icij_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(o)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface IcijLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadIcijAll(data: IcijTransformResult): Promise<IcijLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadOfficers(data.officers))
  steps.push(await loadEntities(data.entities))
  steps.push(await loadAddresses(data.addresses))
  steps.push(await loadIntermediaries(data.intermediaries))

  // Phase 2: Relationships
  steps.push(await loadOfficerOfRels(data.officerOfRels))
  steps.push(await loadIntermediaryOfRels(data.intermediaryOfRels))
  steps.push(await loadRegisteredAtRels(data.registeredAtRels))
  steps.push(await loadMaybeSameAsRels(data.maybeSameAsRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
