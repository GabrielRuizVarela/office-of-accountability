/**
 * ETL Loader -- batch MERGE of SIPRO supplier data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../../lib/neo4j/client'

import type { SiproContractorParams } from './types'
import type { SiproTransformResult } from './transformer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_BATCH_SIZE = 500

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
// Node loader
// ---------------------------------------------------------------------------

async function loadContractors(
  items: readonly SiproContractorParams[],
): Promise<LoadStepResult> {
  return runBatched('Contractor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS c
    MERGE (n:Contractor {contractor_id: c.contractor_id})
    SET n += c
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SiproLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadSiproAll(data: SiproTransformResult): Promise<SiproLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  steps.push(await loadContractors(data.contractors))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
