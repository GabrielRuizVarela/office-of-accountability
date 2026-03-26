/**
 * Engine node types - autonomous investigation pipeline (M10).
 *
 * Node types: SourceConnector, PipelineConfig, PipelineStage, Gate,
 * PipelineState, Proposal, AuditEntry, Snapshot, ModelConfig.
 *
 * Each type has a Zod schema and an inferred TypeScript type.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const connectorKinds = ['rest_api', 'file_upload', 'custom_script'] as const
export type ConnectorKind = (typeof connectorKinds)[number]

export const stageKinds = ['ingest', 'verify', 'enrich', 'analyze', 'iterate', 'report'] as const
export type StageKind = (typeof stageKinds)[number]

export const gateActions = ['approve', 'reject', 'request_changes'] as const
export type GateAction = (typeof gateActions)[number]

export const pipelineStatuses = ['idle', 'running', 'paused', 'completed', 'failed'] as const
export type PipelineStatus = (typeof pipelineStatuses)[number]

export const proposalStatuses = ['pending', 'approved', 'rejected'] as const
export type ProposalStatus = (typeof proposalStatuses)[number]

export const proposalTypes = [
  'create_node',
  'create_relationship',
  'update_node',
  'delete_node',
  'delete_relationship',
  'hypothesis',
  'report_section',
] as const
export type ProposalType = (typeof proposalTypes)[number]

export const confidenceTiers = ['gold', 'silver', 'bronze'] as const
export type ConfidenceTier = (typeof confidenceTiers)[number]

// ---------------------------------------------------------------------------
// 1. SourceConnector - external data source configuration
// ---------------------------------------------------------------------------

export const sourceConnectorSchema = z.object({
  id: z.string().min(1),
  caso_slug: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(connectorKinds),
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type SourceConnector = z.infer<typeof sourceConnectorSchema>

// ---------------------------------------------------------------------------
// 2. PipelineConfig - overall pipeline definition
// ---------------------------------------------------------------------------

export const pipelineConfigSchema = z.object({
  id: z.string().min(1),
  caso_slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  stage_ids: z.array(z.string().min(1)),
  created_at: z.string(),
  updated_at: z.string(),
})

export type PipelineConfig = z.infer<typeof pipelineConfigSchema>

// ---------------------------------------------------------------------------
// 3. PipelineStage - individual stage in the pipeline
// ---------------------------------------------------------------------------

export const pipelineStageSchema = z.object({
  id: z.string().min(1),
  pipeline_id: z.string().min(1),
  kind: z.enum(stageKinds),
  order: z.number().int().min(0),
  model_config_id: z.string().min(1).optional(),
  connector_ids: z.array(z.string().min(1)).optional(),
  gate_id: z.string().min(1).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type PipelineStage = z.infer<typeof pipelineStageSchema>

// ---------------------------------------------------------------------------
// 4. Gate - human review checkpoint between stages
// ---------------------------------------------------------------------------

export const gateSchema = z.object({
  id: z.string().min(1),
  stage_id: z.string().min(1),
  required: z.boolean(),
  auto_approve_threshold: z.number().min(0).max(1).optional(),
  last_action: z.enum(gateActions).optional(),
  last_action_by: z.string().optional(),
  last_action_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Gate = z.infer<typeof gateSchema>

// ---------------------------------------------------------------------------
// 5. PipelineState - runtime state of a pipeline execution
// ---------------------------------------------------------------------------

export const pipelineStateSchema = z.object({
  id: z.string().min(1),
  pipeline_id: z.string().min(1),
  caso_slug: z.string().min(1),
  status: z.enum(pipelineStatuses),
  current_stage_id: z.string().min(1).optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  error: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type PipelineState = z.infer<typeof pipelineStateSchema>

// ---------------------------------------------------------------------------
// 6. Proposal - LLM-generated change for human review
// ---------------------------------------------------------------------------

export const proposalSchema = z.object({
  id: z.string().min(1),
  pipeline_state_id: z.string().min(1),
  stage_id: z.string().min(1),
  type: z.enum(proposalTypes),
  payload: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  status: z.enum(proposalStatuses),
  reviewed_by: z.string().optional(),
  reviewed_at: z.string().optional(),
  created_at: z.string(),
})

export type Proposal = z.infer<typeof proposalSchema>

// ---------------------------------------------------------------------------
// 7. AuditEntry - append-only log with SHA-256 hash chain
// ---------------------------------------------------------------------------

export const auditEntrySchema = z.object({
  id: z.string().min(1),
  pipeline_state_id: z.string().min(1),
  stage_id: z.string().min(1).optional(),
  action: z.string().min(1),
  detail: z.string(),
  prev_hash: z.string(),
  hash: z.string(),
  created_at: z.string(),
})

export type AuditEntry = z.infer<typeof auditEntrySchema>

// ---------------------------------------------------------------------------
// 8. Snapshot - graph state capture at a point in time
// ---------------------------------------------------------------------------

export const snapshotSchema = z.object({
  id: z.string().min(1),
  pipeline_state_id: z.string().min(1),
  stage_id: z.string().min(1).optional(),
  label: z.string(),
  /** Namespace key for the copied subgraph: "{caso_slug}:snapshot-{id}" */
  snapshot_slug: z.string().min(1),
  node_count: z.number().int().min(0),
  relationship_count: z.number().int().min(0),
  created_at: z.string(),
})

export type Snapshot = z.infer<typeof snapshotSchema>

// ---------------------------------------------------------------------------
// 9. ModelConfig - LLM model configuration
// ---------------------------------------------------------------------------

export const modelConfigSchema = z.object({
  id: z.string().min(1),
  caso_slug: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().min(1),
  endpoint: z.string().url().optional(),
  /** Name of the environment variable holding the API key (e.g., "OPENAI_API_KEY").
   *  Read via process.env[api_key_env] at runtime. Never store the key itself. */
  api_key_env: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).optional(),
  system_prompt: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type ModelConfig = z.infer<typeof modelConfigSchema>

// ---------------------------------------------------------------------------
// 10. OrchestratorTask - work item in the investigation orchestrator queue
// ---------------------------------------------------------------------------

export const orchestratorTaskStatuses = [
  'pending',
  'assigned',
  'running',
  'completed',
  'failed',
] as const
export type OrchestratorTaskStatus = (typeof orchestratorTaskStatuses)[number]

export const orchestratorTaskSchema = z.object({
  id: z.string().min(1),
  investigation_id: z.string().min(1),
  type: z.string().min(1),
  target: z.string().min(1),
  priority: z.number().int().min(1).max(10),
  status: z.enum(orchestratorTaskStatuses),
  assigned_to: z.string().min(1).optional(),
  dependencies: z.array(z.string().min(1)),
  result_summary: z.string().optional(),
  created_at: z.string(),
  completed_at: z.string().optional(),
})

export type OrchestratorTask = z.infer<typeof orchestratorTaskSchema>

// ---------------------------------------------------------------------------
// 12. OrchestratorState - runtime state of the investigation orchestrator
// ---------------------------------------------------------------------------

export const orchestratorStateSchema = z.object({
  id: z.string().min(1),
  investigation_id: z.string().min(1),
  active_tasks: z.number().int().min(0),
  completed_tasks: z.number().int().min(0),
  agent_count: z.number().int().min(0),
  current_focus: z.string().optional(),
  last_synthesis_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type OrchestratorState = z.infer<typeof orchestratorStateSchema>
