/**
 * E2E seed helpers — create test data via the app's API routes.
 *
 * These helpers use Playwright's APIRequestContext so they respect
 * the same baseURL and cookies as page-level tests.
 */

import type { APIRequestContext } from '@playwright/test'

const CASO = 'caso-epstein'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeededPipeline {
  pipeline_id: string
  pipeline_state_id: string
  caso_slug: string
}

export interface SeededTask {
  id: string
  investigation_id: string
  type: string
  target: string
  status: string
}

export interface SeededSnapshot {
  id: string
  pipeline_state_id: string
  label: string
}

// ---------------------------------------------------------------------------
// Engine seeds
// ---------------------------------------------------------------------------

/**
 * Start a pipeline run via POST /engine/run.
 * Returns the pipeline state if the database is available.
 */
export async function seedPipelineRun(
  request: APIRequestContext,
  pipelineId = `e2e-pipeline-${Date.now()}`,
): Promise<SeededPipeline | null> {
  const res = await request.post(`/api/casos/${CASO}/engine/run`, {
    data: { pipeline_id: pipelineId },
  })

  if (res.status() === 503 || res.status() === 429) return null

  const json = await res.json()
  if (!json.success) return null

  return {
    pipeline_id: pipelineId,
    pipeline_state_id: json.data.id,
    caso_slug: json.data.caso_slug ?? CASO,
  }
}

/**
 * Create an orchestrator task via POST /engine/orchestrator/tasks.
 */
export async function seedOrchestratorTask(
  request: APIRequestContext,
  opts: {
    investigation_id: string
    type?: string
    target?: string
    priority?: number
  },
): Promise<SeededTask | null> {
  const res = await request.post(`/api/casos/${CASO}/engine/orchestrator/tasks`, {
    data: {
      investigation_id: opts.investigation_id,
      type: opts.type ?? 'verify',
      target: opts.target ?? `e2e-target-${Date.now()}`,
      priority: opts.priority ?? 5,
    },
  })

  if (res.status() === 503) return null

  const json = await res.json()
  if (!json.success) return null

  return json.data.task as SeededTask
}

/**
 * Create a snapshot via POST /engine/snapshots.
 * Requires a valid pipeline_state_id (from seedPipelineRun).
 */
export async function seedSnapshot(
  request: APIRequestContext,
  pipelineStateId: string,
  label = 'e2e-snapshot',
): Promise<SeededSnapshot | null> {
  const res = await request.post(`/api/casos/${CASO}/engine/snapshots`, {
    data: { pipeline_state_id: pipelineStateId, label },
  })

  if (res.status() === 503 || res.status() === 404) return null

  const json = await res.json()
  if (!json.success) return null

  return json.data.snapshot as SeededSnapshot
}

// ---------------------------------------------------------------------------
// Compliance seeds
// ---------------------------------------------------------------------------

/**
 * Discover available compliance frameworks via GET /compliance/frameworks.
 * Returns framework IDs if any are seeded.
 */
export async function getComplianceFrameworks(
  request: APIRequestContext,
): Promise<Array<{ id: string; name: string; standard: string }>> {
  const res = await request.get(`/api/casos/${CASO}/compliance/frameworks`)
  if (res.status() !== 200) return []

  const json = await res.json()
  return json.success ? json.data : []
}

/**
 * Create a compliance attestation via POST /compliance/attestations.
 */
export async function seedAttestation(
  request: APIRequestContext,
  opts: {
    checklist_item_id: string
    attested_by?: string
    notes?: string
  },
): Promise<boolean> {
  const res = await request.post(`/api/casos/${CASO}/compliance/attestations`, {
    data: {
      checklist_item_id: opts.checklist_item_id,
      attested_by: opts.attested_by ?? 'e2e-test-runner',
      notes: opts.notes ?? 'Seeded by E2E fixture',
    },
  })

  return res.status() === 200 || res.status() === 201
}

// ---------------------------------------------------------------------------
// Investigation / politician seeds (via direct graph API)
// ---------------------------------------------------------------------------

/**
 * Check if the caso-epstein investigation exists via the graph API.
 */
export async function investigationExists(
  request: APIRequestContext,
): Promise<boolean> {
  const res = await request.get(`/api/casos/${CASO}/graph?limit=1`)
  return res.status() === 200
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Check whether Neo4j is reachable by hitting a lightweight endpoint. */
export async function isNeo4jAvailable(
  request: APIRequestContext,
): Promise<boolean> {
  try {
    const res = await request.get(`/api/casos/${CASO}/compliance/frameworks`)
    return res.status() !== 503
  } catch {
    return false
  }
}

export const E2E_CASO = CASO
