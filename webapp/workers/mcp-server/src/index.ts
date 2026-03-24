/**
 * MCP Server — Cloudflare Worker entry point.
 *
 * Implements MCP protocol over SSE transport:
 * - GET /sse — SSE endpoint for server-to-client streaming
 * - POST /message — receives client JSON-RPC messages
 * - GET /health — server health check
 * - GET /.well-known/mcp.json — MCP server manifest
 *
 * Architecture: pure proxy — all tool handlers call the Next.js API.
 * The Worker handles MCP protocol, auth, rate limiting, and routing.
 */

import type {
  Env,
  JsonRpcRequest,
  JsonRpcResponse,
  MCPInitializeResult,
  MCPToolCallParams,
} from './types'
import { authenticate, checkRateLimit } from './auth'
import { callTool, getResourceCount, getToolCount, listResourceTemplates, listTools, readResource } from './registry'

// Import tool/resource registrations (side-effect: registers tools)
import './tools/index'

const PROTOCOL_VERSION = '2024-11-05'
const SERVER_NAME = 'Office of Accountability Investigation Engine'
const SERVER_VERSION = '1.0.0'

// ---------------------------------------------------------------------------
// SSE session state (per-connection)
// ---------------------------------------------------------------------------

interface SSESession {
  writer: WritableStreamDefaultWriter<Uint8Array>
  encoder: TextEncoder
}

function sendSSEEvent(session: SSESession, event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  session.writer.write(session.encoder.encode(payload))
}

function sendSSEMessage(session: SSESession, message: JsonRpcResponse): void {
  sendSSEEvent(session, 'message', message)
}

// ---------------------------------------------------------------------------
// MCP protocol handlers
// ---------------------------------------------------------------------------

function handleInitialize(id: string | number): JsonRpcResponse {
  const result: MCPInitializeResult = {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {
      tools: {},
      resources: {},
    },
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
  }
  return { jsonrpc: '2.0', id, result }
}

// ---------------------------------------------------------------------------
// Request routing
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    // Health check — no auth required
    if (path === '/health' && request.method === 'GET') {
      return handleHealth(env)
    }

    // MCP manifest — no auth required
    if (path === '/.well-known/mcp.json' && request.method === 'GET') {
      return handleManifest(request)
    }

    // SSE endpoint
    if (path === '/sse' && request.method === 'GET') {
      return handleSSE(request, env)
    }

    // Message endpoint (JSON-RPC over HTTP POST)
    if (path === '/message' && request.method === 'POST') {
      return handleMessage(request, env)
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders() })
  },
}

// ---------------------------------------------------------------------------
// SSE connection handler
// ---------------------------------------------------------------------------

async function handleSSE(request: Request, env: Env): Promise<Response> {
  // Authenticate
  const authResult = await authenticate(request, env)
  if ('error' in authResult) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const { auth } = authResult

  // Create SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const session: SSESession = {
    writer: writable.getWriter(),
    encoder: new TextEncoder(),
  }

  // Send endpoint event — tells the client where to POST messages
  const messageUrl = new URL('/message', request.url).toString()
  sendSSEEvent(session, 'endpoint', messageUrl)

  // The SSE connection stays open — the client sends messages via POST /message
  // and receives responses via this SSE stream.
  // In a stateless Worker, we rely on the client including auth on each POST.

  return new Response(readable, {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// ---------------------------------------------------------------------------
// Message handler (JSON-RPC POST)
// ---------------------------------------------------------------------------

async function handleMessage(request: Request, env: Env): Promise<Response> {
  // Authenticate
  const authResult = await authenticate(request, env)
  if ('error' in authResult) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const { auth } = authResult

  // Rate limit
  const allowed = await checkRateLimit(auth.key_id, env)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded: 120 tool calls per minute' }),
      { status: 429, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    )
  }

  // Parse JSON-RPC request
  let rpcRequest: JsonRpcRequest
  try {
    rpcRequest = (await request.json()) as JsonRpcRequest
  } catch {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      }),
      { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    )
  }

  if (rpcRequest.jsonrpc !== '2.0' || !rpcRequest.method) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: rpcRequest.id ?? null,
        error: { code: -32600, message: 'Invalid JSON-RPC request' },
      }),
      { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    )
  }

  // Route by MCP method
  let response: JsonRpcResponse

  switch (rpcRequest.method) {
    case 'initialize':
      response = handleInitialize(rpcRequest.id)
      break

    case 'notifications/initialized':
      // Client acknowledging initialization — no response needed for notifications
      return new Response(null, { status: 204, headers: corsHeaders() })

    case 'tools/list':
      response = {
        jsonrpc: '2.0',
        id: rpcRequest.id,
        result: { tools: listTools(auth) },
      }
      break

    case 'tools/call': {
      const params = rpcRequest.params as unknown as MCPToolCallParams
      if (!params?.name) {
        response = {
          jsonrpc: '2.0',
          id: rpcRequest.id,
          error: { code: -32602, message: 'Missing tool name in params' },
        }
        break
      }
      const toolResult = await callTool(params.name, params.arguments ?? {}, auth, env)
      response = {
        jsonrpc: '2.0',
        id: rpcRequest.id,
        result: toolResult,
      }
      break
    }

    case 'resources/list':
      response = {
        jsonrpc: '2.0',
        id: rpcRequest.id,
        result: { resourceTemplates: listResourceTemplates(auth) },
      }
      break

    case 'resources/read': {
      const uri = (rpcRequest.params as { uri?: string })?.uri
      if (!uri) {
        response = {
          jsonrpc: '2.0',
          id: rpcRequest.id,
          error: { code: -32602, message: 'Missing resource URI in params' },
        }
        break
      }
      const resourceResult = await readResource(uri, auth, env)
      if ('error' in resourceResult) {
        response = {
          jsonrpc: '2.0',
          id: rpcRequest.id,
          error: { code: -32602, message: resourceResult.error },
        }
      } else {
        response = {
          jsonrpc: '2.0',
          id: rpcRequest.id,
          result: { contents: [resourceResult] },
        }
      }
      break
    }

    default:
      response = {
        jsonrpc: '2.0',
        id: rpcRequest.id,
        error: { code: -32601, message: `Unknown method: ${rpcRequest.method}` },
      }
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

async function handleHealth(env: Env): Promise<Response> {
  // Probe Next.js API
  let neo4jStatus = 'unknown'
  let neo4jLatency = -1
  try {
    const start = Date.now()
    const res = await fetch(`${env.NEXTJS_API_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    })
    neo4jLatency = Date.now() - start
    neo4jStatus = res.ok ? 'connected' : 'error'
  } catch {
    neo4jStatus = 'unreachable'
  }

  const body = {
    status: 'ok',
    tools: getToolCount(),
    resources: getResourceCount(),
    neo4j: { status: neo4jStatus, latency_ms: neo4jLatency },
    version: SERVER_VERSION,
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

// ---------------------------------------------------------------------------
// MCP manifest
// ---------------------------------------------------------------------------

function handleManifest(request: Request): Response {
  const baseUrl = new URL(request.url).origin
  const manifest = {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    description:
      'Investigation creation, pipeline orchestration, graph analysis, and compliance for civic research',
    transport: 'sse',
    url: `${baseUrl}/sse`,
    auth: { type: 'bearer', description: 'API key from Settings > API Keys' },
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}
