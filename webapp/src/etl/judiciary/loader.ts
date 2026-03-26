/**
 * ETL Loader - batch MERGE of judiciary designation data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  JudgeParams,
  CourtParams,
  AppointedByRelParams,
  ServesInRelParams,
  JudgePoliticianMaybeSameAsParams,
  JudgeDdjjMaybeSameAsParams,
  JudgeCompanyOfficerMaybeSameAsParams,
  JudgeBoardMemberMaybeSameAsParams,
} from './types'
import type { JudiciaryTransformResult } from './transformer'

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

async function loadJudges(items: readonly JudgeParams[]): Promise<LoadStepResult> {
  return runBatched('Judge', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS j
    MERGE (n:Judge {dni: j.dni})
    SET n += j
  `)
}

async function loadCourts(items: readonly CourtParams[]): Promise<LoadStepResult> {
  return runBatched('Court', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:Court {court_slug: c.court_slug})
    SET n += c
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadAppointedByRels(items: readonly AppointedByRelParams[]): Promise<LoadStepResult> {
  return runBatched('APPOINTED_BY', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (j:Judge {dni: r.judge_dni})
    MATCH (p:Politician {id: r.politician_id})
    MERGE (j)-[rel:APPOINTED_BY]->(p)
    SET rel.decreto = r.decreto,
        rel.fecha = r.fecha,
        rel.cargo_tipo = r.cargo_tipo
  `)
}

async function loadServesInRels(items: readonly ServesInRelParams[]): Promise<LoadStepResult> {
  return runBatched('SERVES_IN', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (j:Judge {dni: r.judge_dni})
    MATCH (c:Court {court_slug: r.court_slug})
    MERGE (j)-[:SERVES_IN]->(c)
  `)
}

async function loadJudgePoliticianRels(
  items: readonly JudgePoliticianMaybeSameAsParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS(Judge-Politician)', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (j:Judge {dni: r.judge_dni})
    MATCH (p:Politician {id: r.politician_id})
    MERGE (j)-[rel:MAYBE_SAME_AS]->(p)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

async function loadJudgeDdjjRels(
  items: readonly JudgeDdjjMaybeSameAsParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS(Judge-DDJJ)', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (j:Judge {dni: r.judge_dni})
    MATCH (d:AssetDeclaration {ddjj_id: r.ddjj_id})
    MERGE (j)-[rel:MAYBE_SAME_AS]->(d)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

async function loadJudgeCompanyOfficerRels(
  items: readonly JudgeCompanyOfficerMaybeSameAsParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS(Judge-CompanyOfficer)', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (j:Judge {dni: r.judge_dni})
    MATCH (o:CompanyOfficer {officer_id: r.officer_id})
    MERGE (j)-[rel:MAYBE_SAME_AS]->(o)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

async function loadJudgeBoardMemberRels(
  items: readonly JudgeBoardMemberMaybeSameAsParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS(Judge-BoardMember)', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (j:Judge {dni: r.judge_dni})
    MATCH (b:BoardMember {igj_authority_id: r.authority_id})
    MERGE (j)-[rel:MAYBE_SAME_AS]->(b)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface JudiciaryLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadJudiciaryAll(data: JudiciaryTransformResult): Promise<JudiciaryLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadJudges(data.judges))
  steps.push(await loadCourts(data.courts))

  // Phase 2: Relationships
  steps.push(await loadAppointedByRels(data.appointedByRels))
  steps.push(await loadServesInRels(data.servesInRels))
  steps.push(await loadJudgePoliticianRels(data.judgePoliticianRels))
  steps.push(await loadJudgeDdjjRels(data.judgeDdjjRels))
  steps.push(await loadJudgeCompanyOfficerRels(data.judgeCompanyOfficerRels))
  steps.push(await loadJudgeBoardMemberRels(data.judgeBoardMemberRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
