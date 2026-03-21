/**
 * Engine audit log — M10.
 *
 * Append-only AuditEntry nodes with SHA-256 hash chain.
 * No update or delete — entries are immutable.
 *
 * Functions: appendEntry, getChain, validateChain.
 */

import { createHash, randomUUID } from 'crypto'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery } from '../neo4j/client'
import { auditEntrySchema, type AuditEntry } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GENESIS_HASH = '0'.repeat(64)

/** Extract plain-object properties from a Neo4j node record aliased as `n`. */
function nodeProps(record: Neo4jRecord): Record<string, unknown> {
  const node = record.get('n')
  const raw = node.properties as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : v
  }
  return out
}

/** Compute SHA-256 hash for an audit entry's fields. */
function computeHash(fields: {
  prev_hash: string
  action: string
  detail: string
  pipeline_state_id: string
  stage_id?: string
  created_at: string
}): string {
  const data = [
    fields.prev_hash,
    fields.action,
    fields.detail,
    fields.pipeline_state_id,
    fields.stage_id ?? '',
    fields.created_at,
  ].join('|')
  return createHash('sha256').update(data).digest('hex')
}

// ---------------------------------------------------------------------------
// appendEntry — create a new audit entry in the hash chain
// ---------------------------------------------------------------------------

export async function appendEntry(input: {
  pipeline_state_id: string
  stage_id?: string
  action: string
  detail: string
}): Promise<AuditEntry> {
  // 1. Find the latest entry for this pipeline_state to get prev_hash
  const latest = await readQuery<AuditEntry>(
    `MATCH (n:AuditEntry {pipeline_state_id: $pipelineStateId})
     RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
    { pipelineStateId: input.pipeline_state_id, limit: neo4j.int(1) },
    (r) => auditEntrySchema.parse(nodeProps(r)),
  )

  const prevHash = latest.records[0]?.hash ?? GENESIS_HASH

  // 2. Build the entry
  const createdAt = new Date().toISOString()
  const hash = computeHash({
    prev_hash: prevHash,
    action: input.action,
    detail: input.detail,
    pipeline_state_id: input.pipeline_state_id,
    stage_id: input.stage_id,
    created_at: createdAt,
  })

  const props = {
    id: randomUUID(),
    pipeline_state_id: input.pipeline_state_id,
    stage_id: input.stage_id,
    action: input.action,
    detail: input.detail,
    prev_hash: prevHash,
    hash,
    created_at: createdAt,
  }

  // 3. Create the node
  const result = await writeQuery<AuditEntry>(
    `CREATE (n:AuditEntry $props) RETURN n`,
    { props },
    (r) => auditEntrySchema.parse(nodeProps(r)),
  )

  return result.records[0]
}

// ---------------------------------------------------------------------------
// getChain — retrieve all entries for a pipeline state, ordered chronologically
// ---------------------------------------------------------------------------

export async function getChain(
  pipelineStateId: string,
  limit = 1000,
): Promise<AuditEntry[]> {
  const result = await readQuery<AuditEntry>(
    `MATCH (n:AuditEntry {pipeline_state_id: $pipelineStateId})
     RETURN n ORDER BY n.created_at ASC LIMIT $limit`,
    { pipelineStateId, limit: neo4j.int(limit) },
    (r) => auditEntrySchema.parse(nodeProps(r)),
  )
  return result.records as unknown as AuditEntry[]
}

// ---------------------------------------------------------------------------
// validateChain — verify integrity of the hash chain
// ---------------------------------------------------------------------------

export interface ChainValidation {
  valid: boolean
  entries: number
  error?: string
}

export async function validateChain(
  pipelineStateId: string,
): Promise<ChainValidation> {
  const chain = await getChain(pipelineStateId)

  if (chain.length === 0) {
    return { valid: true, entries: 0 }
  }

  // First entry must reference the genesis hash
  if (chain[0].prev_hash !== GENESIS_HASH) {
    return {
      valid: false,
      entries: chain.length,
      error: `First entry prev_hash is not genesis (got ${chain[0].prev_hash.slice(0, 16)}...)`,
    }
  }

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i]

    // Verify the stored hash matches recomputed hash
    const expected = computeHash({
      prev_hash: entry.prev_hash,
      action: entry.action,
      detail: entry.detail,
      pipeline_state_id: entry.pipeline_state_id,
      stage_id: entry.stage_id,
      created_at: entry.created_at,
    })

    if (entry.hash !== expected) {
      return {
        valid: false,
        entries: chain.length,
        error: `Entry ${i} (${entry.id}): hash mismatch — stored ${entry.hash.slice(0, 16)}... vs computed ${expected.slice(0, 16)}...`,
      }
    }

    // Verify chain linkage (entry i+1's prev_hash must equal entry i's hash)
    if (i > 0 && entry.prev_hash !== chain[i - 1].hash) {
      return {
        valid: false,
        entries: chain.length,
        error: `Entry ${i} (${entry.id}): prev_hash does not match previous entry's hash`,
      }
    }
  }

  return { valid: true, entries: chain.length }
}
