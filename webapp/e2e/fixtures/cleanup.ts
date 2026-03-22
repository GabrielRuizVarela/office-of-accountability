/**
 * E2E cleanup helpers — remove test data created during E2E runs.
 *
 * Uses the app's API endpoints where possible. Direct Neo4j cleanup
 * should only be used as a last resort since E2E tests shouldn't
 * depend on direct database access.
 */

import type { APIRequestContext } from '@playwright/test'

const CASO = 'caso-epstein'

/**
 * Delete a snapshot by ID via DELETE /engine/snapshots.
 */
export async function deleteSnapshot(
  request: APIRequestContext,
  snapshotId: string,
): Promise<boolean> {
  const res = await request.delete(
    `/api/casos/${CASO}/engine/snapshots?id=${encodeURIComponent(snapshotId)}`,
  )
  return res.status() === 200
}

/**
 * Mark an orchestrator task as failed (soft cleanup) via PATCH.
 */
export async function failTask(
  request: APIRequestContext,
  taskId: string,
): Promise<boolean> {
  const res = await request.patch(`/api/casos/${CASO}/engine/orchestrator/tasks`, {
    data: { task_id: taskId, status: 'failed' },
  })
  return res.status() === 200
}

/**
 * Cleanup a collection of test artifacts created during a test run.
 * Silently ignores failures (cleanup is best-effort).
 */
export async function cleanupTestArtifacts(
  request: APIRequestContext,
  artifacts: {
    snapshotIds?: string[]
    taskIds?: string[]
  },
): Promise<void> {
  const ops: Promise<boolean>[] = []

  for (const id of artifacts.snapshotIds ?? []) {
    ops.push(deleteSnapshot(request, id))
  }

  for (const id of artifacts.taskIds ?? []) {
    ops.push(failTask(request, id))
  }

  await Promise.allSettled(ops)
}
