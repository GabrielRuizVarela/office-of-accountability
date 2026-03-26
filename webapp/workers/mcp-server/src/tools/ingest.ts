/**
 * Ingest tool handlers for the MCP server.
 *
 * 4 tools that proxy to the Next.js engine ingest API routes:
 * - ingest.add_entity       POST /api/casos/:slug/engine/ingest/entity
 * - ingest.add_relationship POST /api/casos/:slug/engine/ingest/relationship
 * - ingest.import_csv       POST /api/casos/:slug/engine/ingest/csv
 * - ingest.import_url       POST /api/casos/:slug/engine/ingest/url
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// ingest.add_entity — add a single entity node to the graph
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'ingest.add_entity',
    description:
      'Add a single entity node to the case graph. The entity is staged with the given label and properties, attributed to the calling MCP key.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        label: { type: 'string', description: 'Neo4j node label (e.g. Person, Organization)' },
        properties: { type: 'object', description: 'Key-value properties for the entity' },
        source_url: { type: 'string', description: 'Source URL for provenance (optional)' },
        confidence: { type: 'number', description: 'Confidence score 0–1 (optional)' },
      },
      required: ['caso_slug', 'label', 'properties'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      label: args.label,
      properties: args.properties,
      proposed_by: `mcp:${auth.key_id}`,
    }
    if (args.source_url != null) body.source_url = args.source_url
    if (args.confidence != null) body.confidence = args.confidence
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/ingest/entity`, body },
      auth,
      env,
    )
  },
  'ingest:write',
)

// ---------------------------------------------------------------------------
// ingest.add_relationship — add a relationship between two existing nodes
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'ingest.add_relationship',
    description:
      'Add a directed relationship between two existing graph nodes. Attributed to the calling MCP key.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        from_id: { type: 'string', description: 'Neo4j element ID of the source node' },
        to_id: { type: 'string', description: 'Neo4j element ID of the target node' },
        type: { type: 'string', description: 'Relationship type (e.g. KNOWS, OWNS)' },
        properties: { type: 'object', description: 'Key-value properties on the relationship (optional)' },
        confidence: { type: 'number', description: 'Confidence score 0–1 (optional)' },
      },
      required: ['caso_slug', 'from_id', 'to_id', 'type'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      from_id: args.from_id,
      to_id: args.to_id,
      type: args.type,
      proposed_by: `mcp:${auth.key_id}`,
    }
    if (args.properties != null) body.properties = args.properties
    if (args.confidence != null) body.confidence = args.confidence
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/ingest/relationship`, body },
      auth,
      env,
    )
  },
  'ingest:write',
)

// ---------------------------------------------------------------------------
// ingest.import_csv — bulk-import entities from CSV content
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'ingest.import_csv',
    description:
      'Bulk-import entities from CSV content. Columns are mapped to node properties via column_mapping. Attributed to the calling MCP key.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        csv_content: { type: 'string', description: 'Raw CSV text (including header row)' },
        column_mapping: {
          type: 'object',
          description: 'Map of CSV column name → node property name',
        },
        label: { type: 'string', description: 'Neo4j node label for all imported rows' },
        id_column: {
          type: 'string',
          description: 'CSV column to use as the unique node identifier (optional)',
        },
      },
      required: ['caso_slug', 'csv_content', 'column_mapping', 'label'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      csv_content: args.csv_content,
      column_mapping: args.column_mapping,
      label: args.label,
      proposed_by: `mcp:${auth.key_id}`,
    }
    if (args.id_column != null) body.id_column = args.id_column
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/ingest/csv`, body },
      auth,
      env,
    )
  },
  'ingest:write',
)

// ---------------------------------------------------------------------------
// ingest.import_url — fetch and ingest content from a URL
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'ingest.import_url',
    description:
      'Fetch content from a URL and ingest it into the case. Optionally runs entity extraction via the LLM pipeline. Attributed to the calling MCP key.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Case slug identifier' },
        url: { type: 'string', description: 'URL to fetch and ingest' },
        extract_entities: {
          type: 'boolean',
          description: 'Run LLM entity extraction on the fetched content (default false)',
        },
      },
      required: ['caso_slug', 'url'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const body: Record<string, unknown> = {
      url: args.url,
      extract_entities: args.extract_entities ?? false,
      proposed_by: `mcp:${auth.key_id}`,
    }
    return proxyToApi(
      { method: 'POST', path: `/api/casos/${casoSlug}/engine/ingest/url`, body },
      auth,
      env,
    )
  },
  'ingest:write',
)
