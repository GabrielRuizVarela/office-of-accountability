/**
 * ETL Loader - batch MERGE of IGJ corporate registry data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  CompanyParams,
  CompanyOfficerParams,
  OfficerOfCompanyRelParams,
  MaybeSameAsRelParams,
} from './types'
import type { IgjTransformResult } from './transformer'

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

async function loadCompanies(items: readonly CompanyParams[]): Promise<LoadStepResult> {
  return runBatched('Company', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:Company {igj_id: c.igj_id})
    SET n += c
  `)
}

async function loadOfficers(items: readonly CompanyOfficerParams[]): Promise<LoadStepResult> {
  return runBatched('CompanyOfficer', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS o
    MERGE (n:CompanyOfficer {officer_id: o.officer_id})
    SET n += o
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadOfficerOfCompanyRels(
  items: readonly OfficerOfCompanyRelParams[],
): Promise<LoadStepResult> {
  return runBatched('OFFICER_OF_COMPANY', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (o:CompanyOfficer {officer_id: r.officer_id})
    MATCH (c:Company {igj_id: r.company_igj_id})
    MERGE (o)-[rel:OFFICER_OF_COMPANY]->(c)
    SET rel.role = r.role,
        rel.role_code = r.role_code
  `)
}

async function loadMaybeSameAsRels(
  items: readonly MaybeSameAsRelParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (o:CompanyOfficer {officer_id: r.officer_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(o)
    SET rel.confidence = r.confidence,
        rel.source = 'igj'
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface IgjLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadIgjAll(data: IgjTransformResult): Promise<IgjLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadCompanies(data.companies))
  steps.push(await loadOfficers(data.officers))

  // Phase 2: Relationships
  steps.push(await loadOfficerOfCompanyRels(data.officerOfCompanyRels))
  steps.push(await loadMaybeSameAsRels(data.maybeSameAsRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
