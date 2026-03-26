/**
 * Verify tool handlers for the MCP server.
 *
 * 2 tools that proxy to the Next.js verify API routes:
 * - verify.promote_tier     POST /api/casos/:slug/engine/verify/promote
 * - verify.cross_reference  POST /api/casos/:slug/engine/verify/cross-reference
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// verify.promote_tier — promote nodes to a higher confidence tier
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'verify.promote_tier',
    description:
      'Promote one or more graph nodes to a higher confidence tier (silver or gold). Requires evidence URL or rationale.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        node_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of node IDs to promote',
        },
        to_tier: {
          type: 'string',
          enum: ['silver', 'gold'],
          description: 'Target confidence tier',
        },
        evidence_url: { type: 'string', description: 'URL to supporting evidence (optional)' },
        rationale: { type: 'string', description: 'Explanation for the promotion decision' },
      },
      required: ['caso_slug', 'node_ids', 'to_tier', 'rationale'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      node_ids: args.node_ids,
      to_tier: args.to_tier,
      rationale: args.rationale,
      promoted_by: `mcp:${auth.key_id}`,
    }
    if (args.evidence_url != null) body.evidence_url = args.evidence_url
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/verify/promote`, body },
      auth,
      env,
    )
  },
  'verify:write',
)

// ---------------------------------------------------------------------------
// verify.cross_reference — cross-reference nodes by identifier match type
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'verify.cross_reference',
    description:
      'Cross-reference graph nodes using identifier matching (CUIT, DNI, or fuzzy name). Returns potential duplicate or related node pairs.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        match_type: {
          type: 'string',
          enum: ['cuit', 'dni', 'name_fuzzy'],
          description: 'Type of identifier matching to apply',
        },
        threshold: {
          type: 'number',
          description: 'Similarity threshold for fuzzy matching (0–1, optional)',
        },
      },
      required: ['caso_slug', 'match_type'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      match_type: args.match_type,
    }
    if (args.threshold != null) body.threshold = args.threshold
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/verify/cross-reference`, body },
      auth,
      env,
    )
  },
  'verify:write',
)
