/**
 * ETL Loader — batch MERGE of IGJ company registry data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  PublicCompanyParams,
  BoardMemberParams,
  BoardMemberOfRelParams,
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

async function loadCompanies(items: readonly PublicCompanyParams[]): Promise<LoadStepResult> {
  return runBatched('PublicCompany', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:PublicCompany {igj_id: c.igj_id})
    SET n += c
  `)
}

async function loadBoardMembers(items: readonly BoardMemberParams[]): Promise<LoadStepResult> {
  return runBatched('BoardMember', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS b
    MERGE (n:BoardMember {igj_authority_id: b.igj_authority_id})
    SET n += b
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadBoardMemberOfRels(items: readonly BoardMemberOfRelParams[]): Promise<LoadStepResult> {
  return runBatched('BOARD_MEMBER_OF', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (b:BoardMember {igj_authority_id: r.authority_id})
    MATCH (c:PublicCompany {igj_id: r.company_igj_id})
    MERGE (b)-[rel:BOARD_MEMBER_OF]->(c)
    SET rel.role_type = r.role_type,
        rel.role_description = r.role_description
  `)
}

async function loadMaybeSameAsRels(items: readonly MaybeSameAsRelParams[]): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (b:BoardMember {igj_authority_id: r.authority_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(b)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
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
  steps.push(await loadBoardMembers(data.boardMembers))

  // Phase 2: Relationships
  steps.push(await loadBoardMemberOfRels(data.boardMemberOfRels))
  steps.push(await loadMaybeSameAsRels(data.maybeSameAsRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
