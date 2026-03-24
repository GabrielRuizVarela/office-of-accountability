/**
 * Graph tool handlers for the MCP server.
 *
 * 6 tools that proxy to the Next.js graph API routes:
 * - graph.query            GET /api/graph/query
 * - graph.node             GET /api/graph/node/:id
 * - graph.expand           GET /api/graph/expand/:id
 * - graph.search           GET /api/graph/search
 * - graph.path             GET /api/graph/path
 * - graph.edge_provenance  GET /api/graph/edge-provenance
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// graph.query — structured graph query with filters
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'graph.query',
    description:
      'Query the knowledge graph with structured filters. Returns nodes and links in force-graph format. At least one filter is required.',
    inputSchema: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          enum: ['Politician', 'Legislation', 'Vote', 'Investigation'],
          description: 'Node label to filter by',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date filter (YYYY-MM-DD)',
        },
        dateTo: {
          type: 'string',
          description: 'End date filter (YYYY-MM-DD)',
        },
        jurisdiction: {
          type: 'string',
          enum: ['nacional', 'provincial', 'municipal'],
          description: 'Jurisdiction filter',
        },
        relType: {
          type: 'string',
          enum: [
            'CAST_VOTE',
            'REPRESENTS',
            'AUTHORED',
            'SPONSORED',
            'REFERENCES',
            'MEMBER_OF',
            'DONATED_TO',
          ],
          description: 'Relationship type filter',
        },
        limit: {
          type: 'number',
          description: 'Max results (1-200, default 50)',
        },
        cursor: {
          type: 'string',
          description: 'Pagination cursor from previous response',
        },
      },
    },
  },
  async (args, auth, env) => {
    const query: Record<string, string> = {}
    if (args.label != null) query.label = String(args.label)
    if (args.dateFrom != null) query.dateFrom = String(args.dateFrom)
    if (args.dateTo != null) query.dateTo = String(args.dateTo)
    if (args.jurisdiction != null) query.jurisdiction = String(args.jurisdiction)
    if (args.relType != null) query.relType = String(args.relType)
    if (args.limit != null) query.limit = String(args.limit)
    if (args.cursor != null) query.cursor = String(args.cursor)
    return proxyToApi({ method: 'GET', path: '/api/graph/query', query }, auth, env)
  },
  'graph:read',
)

// ---------------------------------------------------------------------------
// graph.node — get a node and its 1-hop neighborhood
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'graph.node',
    description:
      'Get a node and its 1-hop neighborhood (direct connections). Accepts UUID, slug, or acta_id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Node identifier (UUID, slug, or acta_id)',
        },
        limit: {
          type: 'number',
          description: 'Max connected nodes (1-200, default 50)',
        },
      },
      required: ['id'],
    },
  },
  async (args, auth, env) => {
    const id = String(args.id)
    const query: Record<string, string> = {}
    if (args.limit != null) query.limit = String(args.limit)
    return proxyToApi({ method: 'GET', path: `/api/graph/node/${id}`, query }, auth, env)
  },
  'graph:read',
)

// ---------------------------------------------------------------------------
// graph.expand — expand a node's neighborhood to configurable depth
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'graph.expand',
    description:
      'Expand a node neighborhood to configurable depth (1-3 hops). Returns graph centered on the node.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Node identifier (UUID, slug, or acta_id)',
        },
        depth: {
          type: 'number',
          description: 'Expansion depth (1-3, default 1)',
        },
        limit: {
          type: 'number',
          description: 'Max nodes returned (1-500, default 200)',
        },
      },
      required: ['id'],
    },
  },
  async (args, auth, env) => {
    const id = String(args.id)
    const query: Record<string, string> = {}
    if (args.depth != null) query.depth = String(args.depth)
    if (args.limit != null) query.limit = String(args.limit)
    return proxyToApi({ method: 'GET', path: `/api/graph/expand/${id}`, query }, auth, env)
  },
  'graph:read',
)

// ---------------------------------------------------------------------------
// graph.search — full-text search across graph nodes
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'graph.search',
    description:
      'Full-text search across graph nodes with optional label filter and cursor pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description: 'Search query (1-200 characters)',
        },
        label: {
          type: 'string',
          enum: ['Politician', 'Legislation', 'Investigation'],
          description: 'Filter results by node label',
        },
        limit: {
          type: 'number',
          description: 'Max results (1-100, default 20)',
        },
        cursor: {
          type: 'string',
          description: 'Pagination cursor from previous response',
        },
      },
      required: ['q'],
    },
  },
  async (args, auth, env) => {
    const query: Record<string, string> = { q: String(args.q) }
    if (args.label != null) query.label = String(args.label)
    if (args.limit != null) query.limit = String(args.limit)
    if (args.cursor != null) query.cursor = String(args.cursor)
    return proxyToApi({ method: 'GET', path: '/api/graph/search', query }, auth, env)
  },
  'graph:read',
)

// ---------------------------------------------------------------------------
// graph.path — find shortest path(s) between two nodes
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'graph.path',
    description:
      'Find the shortest path(s) between two nodes in the knowledge graph.',
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          description: 'Source node identifier',
        },
        target: {
          type: 'string',
          description: 'Target node identifier',
        },
        maxHops: {
          type: 'number',
          description: 'Maximum path length (1-6, default 6)',
        },
        all: {
          type: 'boolean',
          description: 'Return all shortest paths (default: single shortest)',
        },
      },
      required: ['source', 'target'],
    },
  },
  async (args, auth, env) => {
    const query: Record<string, string> = {
      source: String(args.source),
      target: String(args.target),
    }
    if (args.maxHops != null) query.maxHops = String(args.maxHops)
    if (args.all === true) query.all = 'true'
    return proxyToApi({ method: 'GET', path: '/api/graph/path', query }, auth, env)
  },
  'graph:read',
)

// ---------------------------------------------------------------------------
// graph.edge_provenance — get provenance metadata for a relationship
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'graph.edge_provenance',
    description:
      'Get provenance metadata (source, confidence tier, timestamps) for a specific relationship between two nodes.',
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          description: 'Source node identifier',
        },
        target: {
          type: 'string',
          description: 'Target node identifier',
        },
        type: {
          type: 'string',
          description: 'Relationship type (e.g., CAST_VOTE, REPRESENTS)',
        },
      },
      required: ['source', 'target', 'type'],
    },
  },
  async (args, auth, env) => {
    const query: Record<string, string> = {
      source: String(args.source),
      target: String(args.target),
      type: String(args.type),
    }
    return proxyToApi({ method: 'GET', path: '/api/graph/edge-provenance', query }, auth, env)
  },
  'graph:read',
)
