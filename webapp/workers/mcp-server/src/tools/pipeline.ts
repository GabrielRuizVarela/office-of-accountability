/**
 * Pipeline tool handlers for the MCP server.
 *
 * 7 tools that proxy to the Next.js engine API routes:
 * - pipeline.run          POST /api/casos/:slug/engine/run
 * - pipeline.state        GET  /api/casos/:slug/engine/state
 * - pipeline.stop         POST /api/casos/:slug/engine/state
 * - pipeline.proposals    GET  /api/casos/:slug/engine/proposals
 * - pipeline.approve      POST /api/casos/:slug/engine/proposals
 * - pipeline.reject       POST /api/casos/:slug/engine/proposals
 * - pipeline.gate_action  POST /api/casos/:slug/engine/gate/:stageId
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// pipeline.run — trigger a pipeline run
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.run',
    description: 'Trigger a pipeline run for a caso.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        pipeline_id: { type: 'string', description: 'Pipeline ID to run' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body = { pipeline_id: args.pipeline_id }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/run`, body },
      auth,
      env,
    )
  },
  'pipeline:write',
)

// ---------------------------------------------------------------------------
// pipeline.state — get pipeline state
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.state',
    description: 'Get the current state of a pipeline for a caso.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        pipeline_id: { type: 'string', description: 'Pipeline ID (optional, returns all if omitted)' },
      },
      required: ['caso_slug'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {}
    if (args.pipeline_id != null) query.pipeline_id = String(args.pipeline_id)
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/state`, query },
      auth,
      env,
    )
  },
  'pipeline:read',
)

// ---------------------------------------------------------------------------
// pipeline.stop — stop a running pipeline
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.stop',
    description: 'Stop a running pipeline by setting its status to stopped.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        pipeline_id: { type: 'string', description: 'Pipeline ID to stop' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body = { pipeline_id: args.pipeline_id, status: 'stopped' }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/state`, body },
      auth,
      env,
    )
  },
  'pipeline:write',
)

// ---------------------------------------------------------------------------
// pipeline.proposals — list proposals for a pipeline state
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.proposals',
    description: 'List proposals for a given pipeline state, optionally filtered by status.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
        status: {
          type: 'string',
          enum: ['pending', 'approved', 'rejected'],
          description: 'Filter proposals by status (optional)',
        },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {
      pipeline_state_id: String(args.pipeline_state_id),
    }
    if (args.status != null) query.status = String(args.status)
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/proposals`, query },
      auth,
      env,
    )
  },
  'pipeline:read',
)

// ---------------------------------------------------------------------------
// pipeline.approve — approve a set of proposals
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.approve',
    description: 'Approve one or more proposals by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        proposal_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of proposal IDs to approve',
        },
        rationale: { type: 'string', description: 'Reason for approval' },
      },
      required: ['caso_slug', 'proposal_ids', 'rationale'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body = {
      ids: args.proposal_ids,
      action: 'approved',
      reviewed_by: `mcp:${auth.key_id}`,
    }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/proposals`, body },
      auth,
      env,
    )
  },
  'pipeline:write',
)

// ---------------------------------------------------------------------------
// pipeline.reject — reject a set of proposals
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.reject',
    description: 'Reject one or more proposals by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        proposal_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of proposal IDs to reject',
        },
        rationale: { type: 'string', description: 'Reason for rejection' },
      },
      required: ['caso_slug', 'proposal_ids', 'rationale'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body = {
      ids: args.proposal_ids,
      action: 'rejected',
      reviewed_by: `mcp:${auth.key_id}`,
    }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/proposals`, body },
      auth,
      env,
    )
  },
  'pipeline:write',
)

// ---------------------------------------------------------------------------
// pipeline.gate_action — perform an action on a pipeline gate
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'pipeline.gate_action',
    description: 'Perform an approve, reject, or back action on a pipeline gate stage.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Caso slug identifier' },
        stage_id: { type: 'string', description: 'Gate stage ID' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
        action: {
          type: 'string',
          enum: ['approve', 'reject', 'back'],
          description: 'Action to perform on the gate',
        },
      },
      required: ['caso_slug', 'stage_id', 'pipeline_state_id', 'action'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const stageId = String(args.stage_id)
    const body = {
      pipeline_state_id: args.pipeline_state_id,
      action: args.action,
      reviewed_by: `mcp:${auth.key_id}`,
    }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/gate/${stageId}`, body },
      auth,
      env,
    )
  },
  'pipeline:write',
)
