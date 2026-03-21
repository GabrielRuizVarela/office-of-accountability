/**
 * Snapshot CRUD — M10.
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

export async function captureSnapshot(
  pipelineStateId: string,
  stageId: string | undefined,
  label: string,
  casoSlug: string,
): Promise<Snapshot> {
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

  // Export graph state as JSON snapshot
  const nodesResult = await readQuery<{ labels: string[]; props: Record<string, unknown> }>(
    `MATCH (n) WHERE n.caso_slug = $casoSlug RETURN labels(n) AS labels, properties(n) AS props`,
    { casoSlug },
    (r) => ({
      labels: r.get('labels') as string[],
      props: r.get('props') as Record<string, unknown>,
    }),
  )

  const relsResult = await readQuery<{ type: string; fromId: string; toId: string; props: Record<string, unknown> }>(
    `MATCH (a)-[r]->(b) WHERE a.caso_slug = $casoSlug
     RETURN type(r) AS type, a.id AS fromId, b.id AS toId, properties(r) AS props`,
    { casoSlug },
    (r) => ({
      type: r.get('type') as string,
      fromId: r.get('fromId') as string,
      toId: r.get('toId') as string,
      props: r.get('props') as Record<string, unknown>,
    }),
  )

  const cypherExport = JSON.stringify({
    nodes: nodesResult.records,
    relationships: relsResult.records,
  })

  return createSnapshot({
    pipeline_state_id: pipelineStateId,
    stage_id: stageId,
    label,
    node_count: nodeCount,
    relationship_count: relationshipCount,
    cypher_export: cypherExport,
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
