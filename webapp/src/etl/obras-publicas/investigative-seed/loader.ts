/**
 * ETL Loader -- batch MERGE of investigative seed data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../../lib/neo4j/client'

import type {
  BriberyCaseParams,
  IntermediaryParams,
  SeedContractorParams,
  SeedPublicWorkParams,
  CaseInvolvesRelParams,
  BribedByRelParams,
  IntermediatedRelParams,
} from './types'
import type { InvestigativeSeedTransformResult } from './transformer'

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

async function loadBriberyCases(items: readonly BriberyCaseParams[]): Promise<LoadStepResult> {
  return runBatched('BriberyCase', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:BriberyCase {case_id: p.case_id})
    SET n += p
  `)
}

async function loadIntermediaries(items: readonly IntermediaryParams[]): Promise<LoadStepResult> {
  return runBatched('Intermediary', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:Intermediary {intermediary_id: p.intermediary_id})
    SET n += p
  `)
}

async function loadContractors(items: readonly SeedContractorParams[]): Promise<LoadStepResult> {
  // Filter out contractors without CUIT to avoid unique constraint violation
  const withCuit = items.filter(c => c.cuit !== '')
  return runBatched('Contractor (seed)', withCuit, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:Contractor {cuit: p.cuit})
    SET n += p
  `)
}

async function loadPublicWorks(items: readonly SeedPublicWorkParams[]): Promise<LoadStepResult> {
  return runBatched('PublicWork (seed)', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:PublicWork {work_id: p.work_id})
    SET n += p
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadCaseInvolvesContractorRels(
  items: readonly CaseInvolvesRelParams[],
): Promise<LoadStepResult> {
  const contractorRels = items.filter(r => r.entity_label === 'Contractor')
  return runBatched('CASE_INVOLVES (Contractor)', contractorRels, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (bc:BriberyCase {case_id: r.case_id})
    MATCH (c:Contractor {contractor_id: r.entity_id})
    MERGE (bc)-[rel:CASE_INVOLVES]->(c)
    SET rel.role = r.role
  `)
}

async function loadCaseInvolvesWorkRels(
  items: readonly CaseInvolvesRelParams[],
): Promise<LoadStepResult> {
  const workRels = items.filter(r => r.entity_label === 'PublicWork')
  return runBatched('CASE_INVOLVES (PublicWork)', workRels, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (bc:BriberyCase {case_id: r.case_id})
    MATCH (pw:PublicWork {work_id: r.entity_id})
    MERGE (bc)-[rel:CASE_INVOLVES]->(pw)
    SET rel.role = r.role
  `)
}

async function loadBribedByRels(items: readonly BribedByRelParams[]): Promise<LoadStepResult> {
  // BRIBED_BY links to Politician nodes if they exist, or creates lightweight placeholder
  return runBatched('BRIBED_BY', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (bc:BriberyCase {case_id: r.case_id})
    MERGE (pol:Politician {full_name: r.politician_name})
    ON CREATE SET pol.id = r.politician_name,
                  pol.name = r.politician_name,
                  pol.caso_slug = 'obras-publicas',
                  pol.tier = 'bronze',
                  pol.submitted_by = 'etl:investigative-seed'
    MERGE (pol)-[rel:BRIBED_BY]->(bc)
    SET rel.position = r.position,
        rel.period = r.period
  `)
}

async function loadIntermediatedRels(items: readonly IntermediatedRelParams[]): Promise<LoadStepResult> {
  return runBatched('INTERMEDIATED', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (i:Intermediary {intermediary_id: r.intermediary_id})
    MATCH (bc:BriberyCase {case_id: r.case_id})
    MERGE (i)-[:INTERMEDIATED]->(bc)
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface InvestigativeSeedLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadInvestigativeSeedAll(
  data: InvestigativeSeedTransformResult,
): Promise<InvestigativeSeedLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadBriberyCases(data.briberyCases))
  steps.push(await loadIntermediaries(data.intermediaries))
  steps.push(await loadContractors(data.contractors))
  steps.push(await loadPublicWorks(data.publicWorks))

  // Phase 2: Relationships
  steps.push(await loadCaseInvolvesContractorRels(data.caseInvolvesRels))
  steps.push(await loadCaseInvolvesWorkRels(data.caseInvolvesRels))
  steps.push(await loadBribedByRels(data.bribedByRels))
  steps.push(await loadIntermediatedRels(data.intermediatedRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)
  return { steps, totalErrors, durationMs: Date.now() - start }
}
