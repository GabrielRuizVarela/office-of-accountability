/**
 * Proposal CRUD — M10.
 *
 * Proposals are LLM-generated graph mutations that require human review
 * before applying. Immutable after creation (no update/delete).
 */

import crypto from 'node:crypto'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery, executeWrite, withWriteTransaction } from '../neo4j/client'
import { incrementCounter } from './metrics'
import {
  proposalSchema,
  type Proposal,
  type ProposalStatus,
  type ProposalType,
} from './types'

// ---------------------------------------------------------------------------
// Label & relationship type whitelist (prevents Cypher injection via dynamic labels)
// ---------------------------------------------------------------------------

/** Safe identifier pattern — only alphanumeric + underscore, must start with letter */
const SAFE_IDENTIFIER_RE = /^[A-Za-z][A-Za-z0-9_]*$/

/** Known node labels from schema.ts constraints + investigation node types */
const ALLOWED_NODE_LABELS = new Set([
  // Core platform
  'Politician', 'Legislation', 'LegislativeVote', 'Party', 'Province',
  'Investigation', 'User',
  // Caso Libra legacy
  'CasoLibraPerson', 'CasoLibraEvent', 'CasoLibraDocument',
  'CasoLibraOrganization', 'CasoLibraToken', 'CasoLibraWallet',
  // Generic investigation
  'Person', 'Organization', 'Event', 'Document', 'Token', 'Wallet',
  'Location', 'Aircraft', 'ShellCompany', 'Claim', 'MoneyFlow',
  'GovernmentAction', 'LegalCase',
  // Cross-reference engine
  'Contractor', 'Company', 'CompanyOfficer', 'GovernmentAppointment',
  'Donor', 'AssetDeclaration',
  // Engine (M10)
  'SourceConnector', 'PipelineConfig', 'PipelineStage', 'Gate',
  'PipelineState', 'Proposal', 'AuditEntry', 'Snapshot',
  'ModelConfig', 'OrchestratorTask', 'OrchestratorState',
  // Investigation config
  'InvestigationConfig', 'SchemaDefinition', 'NodeTypeDefinition', 'RelTypeDefinition',
  // Compliance (M11)
  'ComplianceFramework', 'ComplianceRule', 'ChecklistItem',
  'ComplianceAttestation', 'ComplianceEvaluation',
  // MCP (M13)
  'MCPApiKey',
])

/** Known relationship types used across the codebase */
const ALLOWED_REL_TYPES = new Set([
  // Investigation
  'PARTICIPATED_IN', 'MENTIONS', 'MENTIONED_IN', 'REFERENCES',
  'AFFILIATED_WITH', 'DOCUMENTED_BY', 'FILED_IN', 'AUTHORED',
  'EVIDENCE_FOR',
  // Political
  'MEMBER_OF', 'REPRESENTS', 'CAST_VOTE', 'BELONGS_TO',
  // Engine
  'HAS_PROPOSAL', 'HAS_SCHEMA', 'DEFINES_NODE_TYPE', 'DEFINES_REL_TYPE',
  // Compliance
  'HAS_RULE', 'HAS_CHECKLIST_ITEM',
  // Generic relationships LLM might create
  'KNOWS', 'CONNECTED_TO', 'RELATED_TO', 'CONTROLS', 'OWNS',
  'FUNDED_BY', 'SENT', 'RECEIVED', 'EMPLOYED_BY', 'TRAVELED_TO',
  'FLEW_ON', 'VISITED', 'MET_WITH', 'ASSOCIATED_WITH',
])

function assertSafeLabel(label: string): void {
  if (!SAFE_IDENTIFIER_RE.test(label)) {
    throw new Error(`Invalid label: "${label}" — must match ${SAFE_IDENTIFIER_RE}`)
  }
  if (!ALLOWED_NODE_LABELS.has(label)) {
    throw new Error(`Unknown node label: "${label}" — not in schema whitelist`)
  }
}

function assertSafeRelType(relType: string): void {
  if (!SAFE_IDENTIFIER_RE.test(relType)) {
    throw new Error(`Invalid relationship type: "${relType}" — must match ${SAFE_IDENTIFIER_RE}`)
  }
  if (!ALLOWED_REL_TYPES.has(relType)) {
    throw new Error(`Unknown relationship type: "${relType}" — not in schema whitelist`)
  }
}

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

function parseProposal(raw: unknown): Proposal {
  return proposalSchema.parse(raw)
}

// ---------------------------------------------------------------------------
// createProposal
// ---------------------------------------------------------------------------

type CreateProposalInput = Omit<Proposal, 'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'created_at'>

export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  const props = {
    ...input,
    id: crypto.randomUUID(),
    status: 'pending' as const,
    created_at: nowISO(),
    payload: JSON.stringify(input.payload),
  }

  const proposal = await withWriteTransaction(async (tx) => {
    const result = await tx.run(
      `CREATE (n:Proposal $props) RETURN n`,
      { props },
    )
    const record = result.records[0]
    const raw = nodeProps(record)
    if (typeof raw.payload === 'string') {
      raw.payload = JSON.parse(raw.payload as string)
    }
    const parsed = parseProposal(raw)

    // Create HAS_PROPOSAL relationship from PipelineState to Proposal
    await tx.run(
      `MATCH (ps:PipelineState {id: $pipelineStateId}), (p:Proposal {id: $proposalId})
       CREATE (ps)-[:HAS_PROPOSAL]->(p)`,
      { pipelineStateId: props.pipeline_state_id, proposalId: props.id },
    )

    return parsed
  })

  incrementCounter('proposals_total')
  return proposal
}

// ---------------------------------------------------------------------------
// getProposal
// ---------------------------------------------------------------------------

export async function getProposal(id: string): Promise<Proposal | null> {
  const result = await readQuery<Proposal>(
    `MATCH (n:Proposal {id: $id}) RETURN n`,
    { id },
    (r) => {
      const raw = nodeProps(r)
      if (typeof raw.payload === 'string') {
        raw.payload = JSON.parse(raw.payload)
      }
      return parseProposal(raw)
    },
  )
  return result.records[0] ?? null
}

// ---------------------------------------------------------------------------
// listByPipelineState
// ---------------------------------------------------------------------------

export async function listByPipelineState(
  pipelineStateId: string,
  status?: ProposalStatus,
  limit = 100,
): Promise<Proposal[]> {
  const cypher = status
    ? `MATCH (n:Proposal {pipeline_state_id: $pipelineStateId, status: $status})
       RETURN n ORDER BY n.created_at ASC LIMIT $limit`
    : `MATCH (n:Proposal {pipeline_state_id: $pipelineStateId})
       RETURN n ORDER BY n.created_at ASC LIMIT $limit`

  const params: Record<string, unknown> = {
    pipelineStateId,
    limit: neo4j.int(limit),
  }
  if (status) params.status = status

  const result = await readQuery<Proposal>(
    cypher,
    params,
    (r) => {
      const raw = nodeProps(r)
      if (typeof raw.payload === 'string') {
        raw.payload = JSON.parse(raw.payload)
      }
      return parseProposal(raw)
    },
  )
  return result.records as unknown as Proposal[]
}

// ---------------------------------------------------------------------------
// listByStage
// ---------------------------------------------------------------------------

export async function listByStage(
  stageId: string,
  status?: ProposalStatus,
  limit = 100,
): Promise<Proposal[]> {
  const cypher = status
    ? `MATCH (n:Proposal {stage_id: $stageId, status: $status})
       RETURN n ORDER BY n.created_at ASC LIMIT $limit`
    : `MATCH (n:Proposal {stage_id: $stageId})
       RETURN n ORDER BY n.created_at ASC LIMIT $limit`

  const params: Record<string, unknown> = {
    stageId,
    limit: neo4j.int(limit),
  }
  if (status) params.status = status

  const result = await readQuery<Proposal>(
    cypher,
    params,
    (r) => {
      const raw = nodeProps(r)
      if (typeof raw.payload === 'string') {
        raw.payload = JSON.parse(raw.payload)
      }
      return parseProposal(raw)
    },
  )
  return result.records as unknown as Proposal[]
}

// ---------------------------------------------------------------------------
// reviewProposal
// ---------------------------------------------------------------------------

export async function reviewProposal(
  id: string,
  action: 'approved' | 'rejected',
  reviewedBy: string,
): Promise<Proposal | null> {
  const result = await writeQuery<Proposal>(
    `MATCH (n:Proposal {id: $id})
     WHERE n.status = 'pending'
     SET n.status = $action, n.reviewed_by = $reviewedBy, n.reviewed_at = $reviewedAt
     RETURN n`,
    { id, action, reviewedBy, reviewedAt: nowISO() },
    (r) => {
      const raw = nodeProps(r)
      if (typeof raw.payload === 'string') {
        raw.payload = JSON.parse(raw.payload)
      }
      return parseProposal(raw)
    },
  )
  return result.records[0] ?? null
}

// ---------------------------------------------------------------------------
// batchReview
// ---------------------------------------------------------------------------

export async function batchReview(
  ids: string[],
  action: 'approved' | 'rejected',
  reviewedBy: string,
): Promise<number> {
  const result = await writeQuery<{ count: number }>(
    `MATCH (n:Proposal)
     WHERE n.id IN $ids AND n.status = 'pending'
     SET n.status = $action, n.reviewed_by = $reviewedBy, n.reviewed_at = $reviewedAt
     RETURN count(n) AS count`,
    { ids, action, reviewedBy, reviewedAt: nowISO() },
    (r) => ({ count: neo4j.isInt(r.get('count')) ? (r.get('count') as { toNumber(): number }).toNumber() : (r.get('count') as number) }),
  )
  return result.records[0]?.count ?? 0
}

// ---------------------------------------------------------------------------
// applyProposal
// ---------------------------------------------------------------------------

export async function applyProposal(id: string): Promise<void> {
  // Read raw node properties (bypasses strict Zod schema to support
  // both pipeline-created and MCP/ingest-created proposals)
  const rawResult = await readQuery<Record<string, unknown>>(
    `MATCH (n:Proposal {id: $id}) RETURN n`,
    { id },
    (r) => {
      const node = r.get('n') as { properties: Record<string, unknown> }
      const props = { ...node.properties }
      // Parse payload_json if stored as string
      if (typeof props.payload_json === 'string') {
        props.payload = JSON.parse(props.payload_json)
      } else if (typeof props.payload === 'string') {
        props.payload = JSON.parse(props.payload)
      }
      return props
    },
  )

  const proposal = rawResult.records[0]
  if (!proposal) throw new Error(`Proposal not found: ${id}`)
  if (proposal.status !== 'approved') {
    throw new Error(`Proposal ${id} is not approved (status: ${proposal.status})`)
  }

  const payload = (proposal.payload ?? {}) as Record<string, unknown>
  const type = (proposal.type ?? '') as ProposalType

  switch (type) {
    case 'create_node': {
      const label = payload.label as string
      assertSafeLabel(label)
      const properties = { ...(payload.properties as Record<string, unknown>) }
      // Ensure the node ID from the payload is included in properties
      if (payload.id && !properties.id) {
        properties.id = payload.id
      }
      await executeWrite(
        `CREATE (n:\`${label}\` $props)`,
        { props: properties },
      )
      break
    }

    case 'create_relationship': {
      const fromId = payload.from_id as string
      const toId = payload.to_id as string
      const relType = payload.type as string
      assertSafeRelType(relType)
      const relProps = (payload.properties as Record<string, unknown>) ?? {}
      await executeWrite(
        `MATCH (a {id: $fromId}), (b {id: $toId})
         CREATE (a)-[r:\`${relType}\` $props]->(b)`,
        { fromId, toId, props: relProps },
      )
      break
    }

    case 'update_node': {
      const nodeId = payload.node_id as string
      const properties = payload.properties as Record<string, unknown>
      await executeWrite(
        `MATCH (n {id: $nodeId}) SET n += $props`,
        { nodeId, props: properties },
      )
      break
    }

    case 'delete_node': {
      const nodeId = payload.node_id as string
      await executeWrite(
        `MATCH (n {id: $nodeId}) DETACH DELETE n`,
        { nodeId },
      )
      break
    }

    case 'delete_relationship': {
      const fromId = payload.from_id as string
      const toId = payload.to_id as string
      const relType = payload.type as string
      assertSafeRelType(relType)
      await executeWrite(
        `MATCH (a {id: $fromId})-[r:\`${relType}\`]->(b {id: $toId}) DELETE r`,
        { fromId, toId },
      )
      break
    }

    case 'hypothesis':
    case 'report_section':
      // Informational only — no graph mutation
      break
  }
}
