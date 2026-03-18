/**
 * POST /api/caso/[slug]/simulation/query
 *
 * Send a query to the simulation — forwards to llama-server's
 * OpenAI-compatible chat completion endpoint.
 */

import { NextRequest } from 'next/server'

import { CASO_EPSTEIN_SLUG } from '../../../../../../lib/caso-epstein/types'

const LLM_API_URL = process.env.MIROFISH_API_URL ?? 'http://localhost:8080'
const REQUEST_TIMEOUT_MS = 600_000

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (slug !== CASO_EPSTEIN_SLUG) {
    return Response.json({ success: false, error: 'Investigation not found' }, { status: 404 })
  }

  let body: { prompt?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  if (!prompt) {
    return Response.json({ success: false, error: 'Prompt is required' }, { status: 400 })
  }

  // Get simulation state from global store
  const simulations = (globalThis as Record<string, unknown>).__epstein_simulations as
    Map<string, { seed: unknown; messages: Array<{ role: string; content: string }> }> | undefined

  if (!simulations || simulations.size === 0) {
    return Response.json({ success: false, error: 'No active simulation. Initialize first.' }, { status: 400 })
  }

  // Get the most recent simulation
  const simEntry = [...simulations.entries()].pop()
  if (!simEntry) {
    return Response.json({ success: false, error: 'No active simulation' }, { status: 400 })
  }

  const [, sim] = simEntry

  // Add user message to conversation
  sim.messages.push({ role: 'user', content: prompt })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(`${LLM_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Qwen3.5-9B-Q5_K_M.gguf',
        messages: sim.messages,
        temperature: 0.7,
        max_tokens: 1024,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      return Response.json(
        { success: false, error: `LLM error: ${response.status} - ${errText.slice(0, 200)}` },
        { status: 502 },
      )
    }

    const completion = await response.json()
    const msg = completion.choices?.[0]?.message
    // Qwen 3.5 puts reasoning in reasoning_content — use content first, fall back to reasoning
    const assistantMessage = (msg?.content && msg.content.trim() !== '')
      ? msg.content
      : (msg?.reasoning_content ?? 'No response generated.')

    // Add assistant response to conversation history
    sim.messages.push({ role: 'assistant', content: assistantMessage })

    // Parse agent responses from the LLM output
    const agentMessages = parseAgentResponses(assistantMessage)

    return Response.json({
      success: true,
      data: { messages: agentMessages },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return Response.json({ success: false, error: 'LLM request timed out' }, { status: 504 })
    }

    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return Response.json(
        { success: false, error: 'LLM server not reachable. Is llama-server running on port 8080?' },
        { status: 503 },
      )
    }

    return Response.json({ success: false, error: 'Query failed' }, { status: 500 })
  }
}

/**
 * Parse the LLM output into individual agent messages.
 * Looks for patterns like "**Agent Name**: ..." or "Agent Name: ..."
 */
function parseAgentResponses(text: string): Array<{ role: string; agent_name?: string; content: string; timestamp: string }> {
  const now = new Date().toISOString()

  // Try to split by agent name patterns
  const agentPattern = /(?:^|\n)\*{0,2}([A-Z][a-zA-Z\s.'-]+?)(?:\s*\(.*?\))?\*{0,2}\s*:\s*/g
  const parts: Array<{ name: string; start: number }> = []

  let match
  while ((match = agentPattern.exec(text)) !== null) {
    // Only treat as agent name if it looks like a person name
    const name = match[1].trim()
    if (name.length > 2 && name.length < 50) {
      parts.push({ name, start: match.index + match[0].length })
    }
  }

  if (parts.length >= 2) {
    // Successfully parsed multiple agents
    return parts.map((part, i) => {
      const end = i < parts.length - 1
        ? parts[i + 1].start - (text.slice(0, parts[i + 1].start).match(/\n?\*{0,2}[A-Z][a-zA-Z\s.'-]+?\*{0,2}\s*:\s*$/)?.[0]?.length ?? 0)
        : text.length
      const content = text.slice(part.start, end).trim()
      return {
        role: 'agent' as const,
        agent_name: part.name,
        content,
        timestamp: now,
      }
    })
  }

  // Fallback: return as a single system analysis
  return [{
    role: 'agent' as const,
    agent_name: 'Swarm Analysis',
    content: text.trim(),
    timestamp: now,
  }]
}
