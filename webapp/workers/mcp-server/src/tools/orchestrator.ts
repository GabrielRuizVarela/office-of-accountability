/**
 * Orchestrator tool handlers for the MCP server.
 *
 * 3 tools that proxy to the Next.js orchestrator API routes:
 * - orchestrator.state      GET /api/casos/:slug/engine/orchestrator
 * - orchestrator.set_focus  PUT /api/casos/:slug/engine/orchestrator/focus
 * - orchestrator.tasks      GET /api/casos/:slug/engine/orchestrator/tasks
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// orchestrator.state — get current orchestrator state for a pipeline
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'orchestrator.state',
    description:
      'Get the current orchestrator state for a pipeline, including focus, active tasks, and status.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_id: { type: 'string', description: 'Pipeline ID to inspect' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {
      pipeline_id: String(args.pipeline_id),
    }
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/orchestrator`, query },
      auth,
      env,
    )
  },
  'orchestrator:read',
)

// ---------------------------------------------------------------------------
// orchestrator.set_focus — set the investigative focus for a pipeline
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'orchestrator.set_focus',
    description:
      'Set or update the investigative focus directive for a pipeline, guiding subsequent analysis steps.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_id: { type: 'string', description: 'Pipeline ID to update' },
        focus: { type: 'string', description: 'New focus directive or investigative question' },
      },
      required: ['caso_slug', 'pipeline_id', 'focus'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      pipeline_id: args.pipeline_id,
      focus: args.focus,
    }
    return proxyToApi(
      { method: 'PUT', path: `/api/casos/${casoSlug}/engine/orchestrator/focus`, body },
      auth,
      env,
    )
  },
  'orchestrator:write',
)

// ---------------------------------------------------------------------------
// orchestrator.tasks — list tasks for a pipeline with optional status filter
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'orchestrator.tasks',
    description:
      'List all tasks queued or running under a pipeline, optionally filtered by status.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_id: { type: 'string', description: 'Pipeline ID to query tasks for' },
        status: {
          type: 'string',
          enum: ['pending', 'active', 'completed', 'failed'],
          description: 'Filter tasks by status (optional)',
        },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {
      pipeline_id: String(args.pipeline_id),
    }
    if (args.status != null) query.status = String(args.status)
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/orchestrator/tasks`, query },
      auth,
      env,
    )
  },
  'orchestrator:read',
)
