/**
 * Proxy utility for forwarding MCP tool calls to the Next.js API.
 *
 * All tool handlers use this to proxy requests to existing API routes.
 * The Worker never connects to Neo4j or LLM directly.
 */

import type { AuthContext, Env, MCPToolResult } from './types'

interface ProxyOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  body?: Record<string, unknown>
  query?: Record<string, string>
}

/**
 * Proxy a request to the Next.js API and return an MCP tool result.
 */
export async function proxyToApi(
  options: ProxyOptions,
  auth: AuthContext,
  env: Env,
): Promise<MCPToolResult> {
  const url = new URL(options.path, env.NEXTJS_API_URL)

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      url.searchParams.set(key, value)
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-MCP-User-Id': auth.user_id,
    'X-MCP-Key-Id': auth.key_id,
  }

  const fetchOptions: RequestInit = {
    method: options.method,
    headers,
    signal: AbortSignal.timeout(30_000),
  }

  if (options.body && (options.method === 'POST' || options.method === 'PATCH' || options.method === 'PUT')) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url.toString(), fetchOptions)

    if (!response.ok) {
      const errorText = await response.text()
      return {
        content: [
          {
            type: 'text',
            text: `API error (${response.status}): ${errorText}`,
          },
        ],
        isError: true,
      }
    }

    const data = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      content: [{ type: 'text', text: `Proxy error: ${message}` }],
      isError: true,
    }
  }
}
