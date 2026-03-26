/**
 * Snapshot CRUD - M10.
 *
 * Snapshots capture graph state at pipeline gates for rollback capability.
 * Immutable after creation (no update). Can be deleted to save space.
 */

import crypto from 'node:crypto'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery, executeWrite } from '../neo4j/client'
import { snapshotSchema, type Snapshot } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nodeProps(record: Neo4jRecord): Record<string, unknown> {
  const node = record.get('n')
  const raw = node.properties as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : v
  }
  return out
}

function nowISO(): string {
  return new Date().toISOString()
}

function parseSnapshot(raw: unknown): Snapshot {
  return snapshotSchema.parse(raw)
}

// ---------------------------------------------------------------------------
// createSnapshot
// ---------------------------------------------------------------------------

type CreateSnapshotInput = Omit<Snapshot, 'id' | 'created_at'>

export async function createSnapshot(input: CreateSnapshotInput): Promise<Snapshot> {
  const props = {
    ...input,
    id: crypto.randomUUID(),
    created_at: nowISO(),
  }

  const result = await writeQuery<Snapshot>(
    `CREATE (n:Snapshot $props) RETURN n`,
    { props },
    (r) => parseSnapshot(nodeProps(r)),
  )
  return result.records[0]
}

// ---------------------------------------------------------------------------
// getSnapshot
// ---------------------------------------------------------------------------

export async function getSnapshot(id: string): Promise<Snapshot | null> {
  const result = await readQuery<Snapshot>(
    `MATCH (n:Snapshot {id: $id}) RETURN n`,
    { id },
    (r) => parseSnapshot(nodeProps(r)),
  )
  return result.records[0] ?? null
}

// ---------------------------------------------------------------------------
// listByPipelineState
// ---------------------------------------------------------------------------

export async function listByPipelineState(
  pipelineStateId: string,
  limit = 50,
): Promise<Snapshot[]> {
  const result = await readQuery<Snapshot>(
    `MATCH (n:Snapshot {pipeline_state_id: $pipelineStateId})
     RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
    { pipelineStateId, limit: neo4j.int(limit) },
    (r) => parseSnapshot(nodeProps(r)),
  )
  return result.records as unknown as Snapshot[]
}

// ---------------------------------------------------------------------------
// listByStage
// ---------------------------------------------------------------------------

export async function listByStage(
  stageId: string,
  limit = 50,
): Promise<Snapshot[]> {
  const result = await readQuery<Snapshot>(
    `MATCH (n:Snapshot {stage_id: $stageId})
     RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
    { stageId, limit: neo4j.int(limit) },
    (r) => parseSnapshot(nodeProps(r)),
  )
  return result.records as unknown as Snapshot[]
}

// ---------------------------------------------------------------------------
// captureSnapshot
// ---------------------------------------------------------------------------

/**
 * Capture a snapshot using caso_slug namespacing.
 *
 * Instead of serializing the graph to JSON (which hits Neo4j property size limits
 * on large graphs), we copy all nodes in the investigation subgraph to a
 * snapshot-specific namespace: "{caso_slug}:snapshot-{id}".
 *
 * This uses Neo4j's native storage. Queries against the snapshot target the
 * snapshot namespace. Restore = copy snapshot namespace back to main namespace.
 */
export async function captureSnapshot(
  pipelineStateId: string,
  stageId: string | undefined,
  label: string,
  casoSlug: string,
): Promise<Snapshot> {
  const snapshotId = crypto.randomUUID()
  const snapshotSlug = `${casoSlug}:snapshot-${snapshotId}`

  // Count nodes for this caso
  const nodeCountResult = await readQuery<{ cnt: number }>(
    `MATCH (n) WHERE n.caso_slug = $casoSlug RETURN count(n) AS cnt`,
    { casoSlug },
    (r) => {
      const v = r.get('cnt')
      return { cnt: neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : (v as number) }
    },
  )
  const nodeCount = nodeCountResult.records[0]?.cnt ?? 0

  // Count relationships for this caso
  const relCountResult = await readQuery<{ cnt: number }>(
    `MATCH (a)-[r]->(b) WHERE a.caso_slug = $casoSlug RETURN count(r) AS cnt`,
    { casoSlug },
    (r) => {
      const v = r.get('cnt')
      return { cnt: neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : (v as number) }
    },
  )
  const relationshipCount = relCountResult.records[0]?.cnt ?? 0

  // Copy nodes to snapshot namespace
  // Each node gets its properties copied with the caso_slug changed to the snapshot slug
  await executeWrite(
    `MATCH (n) WHERE n.caso_slug = $casoSlug
     WITH n, labels(n) AS lbls
     CALL {
       WITH n, lbls
       CREATE (s)
       SET s = properties(n), s.caso_slug = $snapshotSlug, s._snapshot_source_id = n.id
     } IN TRANSACTIONS OF 500 ROWS`,
    { casoSlug, snapshotSlug },
  )

  // Copy relationships between snapshot nodes
  await executeWrite(
    `MATCH (a)-[r]->(b) WHERE a.caso_slug = $casoSlug AND b.caso_slug = $casoSlug
     WITH r, type(r) AS rType, a.id AS fromId, b.id AS toId, properties(r) AS rProps
     MATCH (sa {caso_slug: $snapshotSlug, _snapshot_source_id: fromId})
     MATCH (sb {caso_slug: $snapshotSlug, _snapshot_source_id: toId})
     CALL {
       WITH sa, sb, rType, rProps
       CREATE (sa)-[sr:SNAPSHOT_REL {type: rType, props: toString(rProps)}]->(sb)
     } IN TRANSACTIONS OF 500 ROWS`,
    { snapshotSlug },
  )

  // Create snapshot metadata node
  return createSnapshot({
    pipeline_state_id: pipelineStateId,
    stage_id: stageId,
    label,
    snapshot_slug: snapshotSlug,
    node_count: nodeCount,
    relationship_count: relationshipCount,
  })
}

// ---------------------------------------------------------------------------
// deleteSnapshot
// ---------------------------------------------------------------------------

export async function deleteSnapshot(id: string): Promise<void> {
  await executeWrite(
    `MATCH (n:Snapshot {id: $id}) DELETE n`,
    { id },
  )
}
