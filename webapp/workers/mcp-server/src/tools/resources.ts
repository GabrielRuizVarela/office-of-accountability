/**
 * MCP resource registrations.
 *
 * Resources provide context injection — LLM clients read them to understand
 * an investigation's state without issuing explicit tool calls.
 *
 * All resources follow the URI scheme: investigation://{slug}/<aspect>
 */

import { registerResource } from '../registry'
import type { AuthContext, Env, MCPResourceContents } from '../types'

async function fetchResource(
  path: string,
  auth: AuthContext,
  env: Env,
  uri: string,
): Promise<MCPResourceContents> {
  const url = new URL(path, env.NEXTJS_API_URL)
  const response = await fetch(url.toString(), {
    headers: { 'X-MCP-User-Id': auth.user_id, 'X-MCP-Key-Id': auth.key_id },
    signal: AbortSignal.timeout(15_000),
  })
  const data = await response.json()
  return { uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }
}

function extractSlug(uri: string): string {
  return uri.match(/investigation:\/\/([^/]+)/)?.[1] ?? ''
}

// ---------------------------------------------------------------------------
// 1. Summary — investigation://{slug}/summary
// ---------------------------------------------------------------------------

registerResource(
  {
    uriTemplate: 'investigation://{slug}/summary',
    name: 'Investigation Summary',
    description: 'High-level statistics and metadata for an investigation case.',
    mimeType: 'application/json',
  },
  async (uri: string, auth: AuthContext, env: Env): Promise<MCPResourceContents> => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/caso/${slug}/stats`, auth, env, uri)
  },
  'investigation:read',
)

// ---------------------------------------------------------------------------
// 2. Schema — investigation://{slug}/schema
// ---------------------------------------------------------------------------

registerResource(
  {
    uriTemplate: 'investigation://{slug}/schema',
    name: 'Investigation Schema',
    description: 'Graph schema (node labels and relationship types) for an investigation.',
    mimeType: 'application/json',
  },
  async (uri: string, auth: AuthContext, env: Env): Promise<MCPResourceContents> => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/caso/${slug}/schema`, auth, env, uri)
  },
  'investigation:read',
)

// ---------------------------------------------------------------------------
// 3. Gaps — investigation://{slug}/gaps
// ---------------------------------------------------------------------------

registerResource(
  {
    uriTemplate: 'investigation://{slug}/gaps',
    name: 'Investigation Gaps',
    description: 'Identified knowledge gaps and missing connections in an investigation.',
    mimeType: 'application/json',
  },
  async (uri: string, auth: AuthContext, env: Env): Promise<MCPResourceContents> => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/casos/${slug}/engine/analyze/gaps`, auth, env, uri)
  },
  'analyze:read',
)

// ---------------------------------------------------------------------------
// 4. Pipeline — investigation://{slug}/pipeline
// ---------------------------------------------------------------------------

registerResource(
  {
    uriTemplate: 'investigation://{slug}/pipeline',
    name: 'Investigation Pipeline State',
    description: 'Current engine pipeline state for an investigation (stages, status, progress).',
    mimeType: 'application/json',
  },
  async (uri: string, auth: AuthContext, env: Env): Promise<MCPResourceContents> => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/casos/${slug}/engine/state`, auth, env, uri)
  },
  'pipeline:read',
)

// ---------------------------------------------------------------------------
// 5. Metrics — investigation://{slug}/metrics
// ---------------------------------------------------------------------------

registerResource(
  {
    uriTemplate: 'investigation://{slug}/metrics',
    name: 'Investigation Engine Metrics',
    description: 'Observability counters and LLM token usage for an investigation engine run.',
    mimeType: 'application/json',
  },
  async (uri: string, auth: AuthContext, env: Env): Promise<MCPResourceContents> => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/casos/${slug}/engine/metrics`, auth, env, uri)
  },
  'pipeline:read',
)
