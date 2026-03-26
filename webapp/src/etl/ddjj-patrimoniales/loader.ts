/**
 * ETL Loader - batch MERGE of DDJJ Patrimoniales data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  AssetDeclarationParams,
  DdjjMaybeSameAsRelParams,
} from './types'
import type { DdjjTransformResult } from './transformer'

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

async function loadDeclarations(items: readonly AssetDeclarationParams[]): Promise<LoadStepResult> {
  return runBatched('AssetDeclaration', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS d
    MERGE (n:AssetDeclaration {ddjj_id: d.ddjj_id})
    SET n += d
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadMaybeSameAsRels(items: readonly DdjjMaybeSameAsRelParams[]): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (d:AssetDeclaration {ddjj_id: r.ddjj_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(d)
    SET rel.confidence = r.confidence,
        rel.match_method = r.match_method
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DdjjLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadDdjjAll(data: DdjjTransformResult): Promise<DdjjLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes
  steps.push(await loadDeclarations(data.declarations))

  // Phase 2: Relationships
  steps.push(await loadMaybeSameAsRels(data.maybeSameAsRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
