/**
 * MCP tool parameter and response schemas — shared between
 * the MCP server (Cloudflare Worker) and the Next.js API.
 *
 * Zod 4 schemas validate tool inputs before proxying to the API.
 * These schemas define the inputSchema for each MCP tool definition.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Investigation tools
// ---------------------------------------------------------------------------

export const investigationListParams = z.object({
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const investigationCreateParams = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  caso_slug: z.string().min(1).max(100),
  schema_id: z.string().optional(),
  framework_ids: z.array(z.string()).optional(),
})

export const investigationGetParams = z.object({
  investigation_id: z.string().min(1),
})

export const investigationUpdateParams = z.object({
  investigation_id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
})

export const investigationDeleteParams = z.object({
  investigation_id: z.string().min(1),
})

export const investigationAddSourceParams = z.object({
  investigation_id: z.string().min(1),
  connector_type: z.enum(['rest-api', 'file-upload', 'custom-script']),
  config: z.record(z.string(), z.unknown()),
})

export const investigationSetFrameworkParams = z.object({
  investigation_id: z.string().min(1),
  framework_id: z.string().min(1),
})

export const investigationSetDirectivesParams = z.object({
  investigation_id: z.string().min(1),
  directives: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Pipeline tools
// ---------------------------------------------------------------------------

export const pipelineRunParams = z.object({
  investigation_id: z.string().min(1),
  stage: z
    .enum(['ingest', 'verify', 'enrich', 'analyze', 'iterate', 'report'])
    .optional(),
})

export const pipelineStateParams = z.object({
  investigation_id: z.string().min(1),
})

export const pipelineStopParams = z.object({
  investigation_id: z.string().min(1),
})

export const pipelineProposalsParams = z.object({
  investigation_id: z.string().min(1),
  stage: z
    .enum(['ingest', 'verify', 'enrich', 'analyze', 'iterate', 'report'])
    .optional(),
  type: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  min_confidence: z.number().min(0).max(1).optional(),
})

export const pipelineApproveParams = z.object({
  investigation_id: z.string().min(1),
  proposal_ids: z.array(z.string().min(1)).min(1),
  rationale: z.string().min(1),
})

export const pipelineRejectParams = z.object({
  investigation_id: z.string().min(1),
  proposal_ids: z.array(z.string().min(1)).min(1),
  rationale: z.string().min(1),
})

export const pipelineGateActionParams = z.object({
  investigation_id: z.string().min(1),
  stage_id: z.string().min(1),
  action: z.enum(['approve', 'reject', 'partial', 'back_to_analyze']),
  rationale: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Graph tools
// ---------------------------------------------------------------------------

export const graphQueryParams = z.object({
  investigation_id: z.string().min(1),
  cypher: z.string().min(1).max(5000),
  params: z.record(z.string(), z.unknown()).optional(),
})

export const graphNodeParams = z.object({
  investigation_id: z.string().min(1),
  node_id: z.string().min(1),
})

export const graphSearchParams = z.object({
  investigation_id: z.string().min(1),
  query: z.string().min(1).max(500),
  labels: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const graphStatsParams = z.object({
  investigation_id: z.string().min(1),
})

export const graphPathParams = z.object({
  investigation_id: z.string().min(1),
  from_id: z.string().min(1),
  to_id: z.string().min(1),
  max_depth: z.number().int().min(1).max(20).optional(),
})

export const graphNeighborsParams = z.object({
  investigation_id: z.string().min(1),
  node_id: z.string().min(1),
  depth: z.number().int().min(1).max(5).optional(),
  labels: z.array(z.string()).optional(),
})

// ---------------------------------------------------------------------------
// Orchestrator tools
// ---------------------------------------------------------------------------

export const orchestratorStateParams = z.object({
  investigation_id: z.string().min(1),
})

export const orchestratorTasksParams = z.object({
  investigation_id: z.string().min(1),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const orchestratorSynthesisParams = z.object({
  investigation_id: z.string().min(1),
})

export const orchestratorMetricsParams = z.object({
  investigation_id: z.string().min(1),
})

export const orchestratorSetFocusParams = z.object({
  investigation_id: z.string().min(1),
  focus: z.string().min(1),
  directives: z.string().optional(),
})

export const orchestratorReprioritizeParams = z.object({
  investigation_id: z.string().min(1),
  task_id: z.string().min(1),
  priority: z.number().int().min(1).max(10),
})

// ---------------------------------------------------------------------------
// Compliance tools
// ---------------------------------------------------------------------------

export const complianceEvaluateParams = z.object({
  investigation_id: z.string().min(1),
  framework_id: z.string().optional(),
  phase: z
    .enum(['ingest', 'verify', 'enrich', 'analyze', 'iterate', 'report', 'any'])
    .optional(),
})

export const complianceStatusParams = z.object({
  investigation_id: z.string().min(1),
})

export const complianceChecklistParams = z.object({
  investigation_id: z.string().min(1),
  framework_id: z.string().min(1),
})

export const complianceAttestParams = z.object({
  investigation_id: z.string().min(1),
  checklist_item_id: z.string().min(1),
  notes: z.string().optional(),
})

export const complianceHistoryParams = z.object({
  investigation_id: z.string().min(1),
  framework_id: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Audit & Snapshot tools
// ---------------------------------------------------------------------------

export const auditLogParams = z.object({
  investigation_id: z.string().min(1),
  limit: z.number().int().min(1).max(500).optional(),
  after: z.string().optional(),
})

export const auditVerifyChainParams = z.object({
  investigation_id: z.string().min(1),
})

export const snapshotListParams = z.object({
  investigation_id: z.string().min(1),
})

export const snapshotCreateParams = z.object({
  investigation_id: z.string().min(1),
  name: z.string().min(1).max(200),
})

export const snapshotRestoreParams = z.object({
  investigation_id: z.string().min(1),
  snapshot_id: z.string().min(1),
})

// ---------------------------------------------------------------------------
// API Key management (webapp routes, not MCP tools)
// ---------------------------------------------------------------------------

export const createApiKeyParams = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string().min(1)).min(1),
  investigation_ids: z.array(z.string()).default([]),
})

export const revokeApiKeyParams = z.object({
  key_id: z.string().min(1),
})

// ---------------------------------------------------------------------------
// MCP API Key node (for Neo4j)
// ---------------------------------------------------------------------------

export const mcpApiKeySchema = z.object({
  id: z.string(),
  key_hash: z.string(),
  user_id: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  investigation_ids: z.array(z.string()),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
  revoked_at: z.string().nullable(),
})

export type MCPApiKey = z.infer<typeof mcpApiKeySchema>
