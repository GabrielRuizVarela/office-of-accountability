/**
 * Mock llama.cpp server for E2E tests.
 *
 * Spins up a minimal HTTP server that implements the OpenAI-compatible
 * /v1/chat/completions endpoint. Returns canned compliance-evaluation
 * responses so LLM-dependent tests run without a real GPU.
 *
 * Usage in tests:
 *   const server = await startMockLlmServer()
 *   // ... run tests that hit the LLM endpoint ...
 *   await server.close()
 *
 * The server listens on a random port. Set MIROFISH_API_URL in your
 * environment to point tests at it.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'

// ---------------------------------------------------------------------------
// Types matching llama.cpp's OpenAI-compatible response format
// ---------------------------------------------------------------------------

interface ChatCompletionRequest {
  model?: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
  max_tokens?: number
  response_format?: { type: string }
  tools?: unknown[]
}

interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
      reasoning_content?: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ---------------------------------------------------------------------------
// Canned responses
// ---------------------------------------------------------------------------

/** Default compliance evaluation response when json_mode is requested. */
function complianceResponse(): string {
  return JSON.stringify({
    findings: [
      { node_id: 'mock-node-1', assessment: 'pass', issues: [] },
      { node_id: 'mock-node-2', assessment: 'pass', issues: [] },
    ],
    summary: 'All nodes pass compliance checks (mock LLM response)',
    score: 1.0,
  })
}

/** Default free-text response for non-JSON requests. */
function freeTextResponse(): string {
  return 'This is a mock LLM response for E2E testing purposes.'
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export interface MockLlmServer {
  url: string
  port: number
  /** Number of requests handled so far */
  requestCount: () => number
  /** Last request body received */
  lastRequest: () => ChatCompletionRequest | null
  close: () => Promise<void>
}

function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  state: { count: number; last: ChatCompletionRequest | null },
): void {
  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // Only handle the chat completions endpoint
  if (req.url !== '/v1/chat/completions' || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => chunks.push(chunk))
  req.on('end', () => {
    state.count++

    let body: ChatCompletionRequest
    try {
      body = JSON.parse(Buffer.concat(chunks).toString()) as ChatCompletionRequest
      state.last = body
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON' }))
      return
    }

    const isJsonMode = body.response_format?.type === 'json_object'
    const content = isJsonMode ? complianceResponse() : freeTextResponse()

    const response: ChatCompletionResponse = {
      id: `mock-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model ?? 'mock-qwen-3.5',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
            reasoning_content: 'Mock reasoning: evaluated compliance rules against provided data.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(response))
  })
}

/**
 * Start a mock llama.cpp server on a random available port.
 */
export async function startMockLlmServer(): Promise<MockLlmServer> {
  const state = { count: 0, last: null as ChatCompletionRequest | null }

  const server = createServer((req, res) => handleRequest(req, res, state))

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve())
  })

  const { port } = server.address() as AddressInfo
  const url = `http://127.0.0.1:${port}`

  return {
    url,
    port,
    requestCount: () => state.count,
    lastRequest: () => state.last,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      }),
  }
}
