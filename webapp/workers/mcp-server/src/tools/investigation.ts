/**
 * Investigation tool handlers for the MCP server.
 *
 * 8 tools that proxy to the Next.js investigation API routes:
 * - investigation.list       GET  /api/investigations
 * - investigation.get        GET  /api/investigations/:id
 * - investigation.create     POST /api/investigations
 * - investigation.update     PATCH /api/investigations/:id
 * - investigation.delete     DELETE /api/investigations/:id
 * - investigation.mine       GET  /api/investigations/mine
 * - investigation.tags       GET  /api/investigations/tags
 * - investigation.upload_image POST /api/investigations/images
 */

import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

// ---------------------------------------------------------------------------
// investigation.list — list published investigations
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.list',
    description:
      'List published investigations with pagination and optional tag filter.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (1-based, default 1)' },
        limit: { type: 'number', description: 'Results per page (1-50, default 20)' },
        tag: { type: 'string', description: 'Filter by tag' },
      },
    },
  },
  async (args, auth, env) => {
    const query: Record<string, string> = {}
    if (args.page != null) query.page = String(args.page)
    if (args.limit != null) query.limit = String(args.limit)
    if (args.tag != null) query.tag = String(args.tag)
    return proxyToApi({ method: 'GET', path: '/api/investigations', query }, auth, env)
  },
  'investigation:read',
)

// ---------------------------------------------------------------------------
// investigation.get — get a single investigation by ID
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.get',
    description:
      'Retrieve a single investigation by its ID. Drafts require author access.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Investigation UUID' },
      },
      required: ['id'],
    },
  },
  async (args, auth, env) => {
    const id = String(args.id)
    return proxyToApi({ method: 'GET', path: `/api/investigations/${id}` }, auth, env)
  },
  'investigation:read',
)

// ---------------------------------------------------------------------------
// investigation.create — create a new investigation
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.create',
    description:
      'Create a new investigation with a title, body (TipTap JSON), tags, and status.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Investigation title' },
        body: { type: 'object', description: 'TipTap editor JSON body' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Publication status (default: draft)',
        },
      },
      required: ['title', 'body'],
    },
  },
  async (args, auth, env) => {
    const body: Record<string, unknown> = {
      title: args.title,
      body: args.body,
    }
    if (args.tags != null) body.tags = args.tags
    if (args.status != null) body.status = args.status
    return proxyToApi({ method: 'POST', path: '/api/investigations', body }, auth, env)
  },
  'investigation:write',
)

// ---------------------------------------------------------------------------
// investigation.update — update an existing investigation
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.update',
    description:
      'Update an existing investigation. Only the author can update. Partial updates supported.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Investigation UUID' },
        title: { type: 'string', description: 'New title' },
        body: { type: 'object', description: 'New TipTap editor JSON body' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'New publication status',
        },
      },
      required: ['id'],
    },
  },
  async (args, auth, env) => {
    const id = String(args.id)
    const body: Record<string, unknown> = {}
    if (args.title != null) body.title = args.title
    if (args.body != null) body.body = args.body
    if (args.tags != null) body.tags = args.tags
    if (args.status != null) body.status = args.status
    return proxyToApi({ method: 'PATCH', path: `/api/investigations/${id}`, body }, auth, env)
  },
  'investigation:write',
)

// ---------------------------------------------------------------------------
// investigation.delete — delete an investigation
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.delete',
    description: 'Delete an investigation. Only the author can delete.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Investigation UUID' },
      },
      required: ['id'],
    },
  },
  async (args, auth, env) => {
    const id = String(args.id)
    return proxyToApi({ method: 'DELETE', path: `/api/investigations/${id}` }, auth, env)
  },
  'investigation:write',
)

// ---------------------------------------------------------------------------
// investigation.mine — list current user's investigations
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.mine',
    description:
      "List the authenticated user's investigations (all statuses) with pagination.",
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (1-based, default 1)' },
        limit: { type: 'number', description: 'Results per page (1-50, default 20)' },
      },
    },
  },
  async (args, auth, env) => {
    const query: Record<string, string> = {}
    if (args.page != null) query.page = String(args.page)
    if (args.limit != null) query.limit = String(args.limit)
    return proxyToApi({ method: 'GET', path: '/api/investigations/mine', query }, auth, env)
  },
  'investigation:read',
)

// ---------------------------------------------------------------------------
// investigation.tags — list all available tags
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.tags',
    description: 'List all unique tags from published investigations.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  async (_args, auth, env) => {
    return proxyToApi({ method: 'GET', path: '/api/investigations/tags' }, auth, env)
  },
  'investigation:read',
)

// ---------------------------------------------------------------------------
// investigation.upload_image — upload an image for use in investigations
// ---------------------------------------------------------------------------

registerTool(
  {
    name: 'investigation.upload_image',
    description:
      'Upload a base64-encoded image for use in investigation documents. Returns the image URL. Max 5MB. Accepts JPEG, PNG, GIF, WebP.',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'Base64-encoded image data',
        },
        filename: {
          type: 'string',
          description: 'Original filename (e.g., "photo.jpg")',
        },
        mime_type: {
          type: 'string',
          enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          description: 'MIME type of the image',
        },
      },
      required: ['data', 'filename', 'mime_type'],
    },
  },
  async (args, auth, env) => {
    // The Next.js API expects multipart/form-data, but from the MCP side
    // we receive base64. Proxy as JSON and let the API handle conversion.
    return proxyToApi(
      {
        method: 'POST',
        path: '/api/investigations/images',
        body: {
          data: args.data,
          filename: args.filename,
          mime_type: args.mime_type,
        },
      },
      auth,
      env,
    )
  },
  'investigation:write',
)
