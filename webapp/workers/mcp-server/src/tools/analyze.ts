/**
 * Analyze tool handlers for the MCP server.
 *
 * 3 tools that proxy to the Next.js analyze API routes:
 * - analyze.detect_gaps   GET  /api/casos/:slug/engine/analyze/gaps
 * - analyze.hypothesize   POST /api/casos/:slug/engine/analyze/hypothesis
 * - analyze.run_analysis  POST /api/casos/:slug/engine/analyze/run
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// analyze.detect_gaps — detect missing or weak evidence in a case
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'analyze.detect_gaps',
    description:
      'Detect evidence gaps, missing relationships, and weak nodes in the case graph.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
      },
      required: ['caso_slug'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi(
      { method: 'GET', path: `/api/casos/${casoSlug}/engine/analyze/gaps` },
      auth,
      env,
    )
  },
  'analyze:read',
)

// ---------------------------------------------------------------------------
// analyze.hypothesize — propose and record a new hypothesis
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'analyze.hypothesize',
    description:
      'Propose a new investigative hypothesis, linking it to supporting evidence nodes with a confidence score.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        hypothesis: { type: 'string', description: 'Text of the hypothesis to propose' },
        evidence_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs of evidence nodes supporting this hypothesis',
        },
        confidence: {
          type: 'number',
          description: 'Confidence score (0–1) for this hypothesis',
        },
      },
      required: ['caso_slug', 'hypothesis', 'evidence_ids', 'confidence'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      hypothesis: args.hypothesis,
      evidence_ids: args.evidence_ids,
      confidence: args.confidence,
      proposed_by: `mcp:${auth.key_id}`,
    }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/analyze/hypothesis`, body },
      auth,
      env,
    )
  },
  'analyze:write',
)

// ---------------------------------------------------------------------------
// analyze.run_analysis — run a structured graph analysis
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'analyze.run_analysis',
    description:
      'Run a structured analysis pass over the case graph. Supported types: procurement, ownership, connections, temporal, centrality.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        type: {
          type: 'string',
          enum: ['procurement', 'ownership', 'connections', 'temporal', 'centrality'],
          description: 'Analysis type to execute',
        },
      },
      required: ['caso_slug', 'type'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      type: args.type,
    }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/analyze/run`, body },
      auth,
      env,
    )
  },
  'analyze:read',
)
