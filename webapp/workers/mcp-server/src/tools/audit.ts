/**
 * Audit and snapshot tool handlers for the MCP server.
 *
 * 4 tools that proxy to the Next.js audit/snapshot API routes:
 * - audit.trail         GET  /api/casos/:slug/engine/audit
 * - audit.verify_chain  GET  /api/casos/:slug/engine/audit (with verify_chain=true)
 * - snapshot.create     POST /api/casos/:slug/engine/snapshots
 * - snapshot.list       GET  /api/casos/:slug/engine/snapshots
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// audit.trail — retrieve audit trail for a pipeline state
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'audit.trail',
    description:
      'Retrieve the audit trail for a pipeline state, showing all actions and mutations over time.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID to audit' },
        limit: { type: 'number', description: 'Maximum number of audit entries to return (optional)' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {
      pipeline_state_id: String(args.pipeline_state_id),
    }
    if (args.limit != null) query.limit = String(args.limit)
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/audit`, query },
      auth,
      env,
    )
  },
  'audit:read',
)

// ---------------------------------------------------------------------------
// audit.verify_chain — verify the integrity of an audit chain
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'audit.verify_chain',
    description:
      'Verify the cryptographic or logical integrity of the audit chain for a pipeline state.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID whose chain to verify' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {
      pipeline_state_id: String(args.pipeline_state_id),
      verify_chain: 'true',
    }
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/audit`, query },
      auth,
      env,
    )
  },
  'audit:read',
)

// ---------------------------------------------------------------------------
// snapshot.create — create a snapshot of a pipeline state
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'snapshot.create',
    description:
      'Create a named snapshot of the current pipeline state for later restoration or comparison.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID to snapshot' },
        label: { type: 'string', description: 'Human-readable label for this snapshot (optional)' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      pipeline_state_id: args.pipeline_state_id,
    }
    if (args.label != null) body.label = args.label
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/snapshots`, body },
      auth,
      env,
    )
  },
  'snapshot:write',
)

// ---------------------------------------------------------------------------
// snapshot.list — list snapshots for a pipeline state
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'snapshot.list',
    description:
      'List all snapshots created for a given pipeline state.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID to list snapshots for' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {
      pipeline_state_id: String(args.pipeline_state_id),
    }
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/snapshots`, query },
      auth,
      env,
    )
  },
  'snapshot:read',
)
