/**
 * llama.cpp LLM provider - OpenAI-compatible HTTP adapter for local Qwen 3.5.
 *
 * Uses raw fetch against llama.cpp's /v1/chat/completions endpoint.
 * Maps Qwen-specific `reasoning_content` field to the normalized `reasoning` field.
 */

import type { LLMOptions, LLMProvider, LLMResponse, ToolCall } from './types.ts'

// ---------------------------------------------------------------------------
// OpenAI-compatible response types (subset we actually use)
// ---------------------------------------------------------------------------

interface OAIToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

interface OAIChoice {
  message: {
    content: string | null
    reasoning_content?: string | null
    tool_calls?: OAIToolCall[]
  }
}

interface OAIResponse {
  choices: OAIChoice[]
  usage?: { prompt_tokens: number; completion_tokens: number }
  model: string
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface LlamaCppConfig {
  endpoint?: string
  model?: string
}

const DEFAULT_ENDPOINT = 'http://localhost:8080'
const REQUEST_TIMEOUT_MS = 120_000

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

class LlamaCppProvider implements LLMProvider {
  readonly provider = 'llamacpp' as const
  readonly model: string
  private readonly endpoint: string

  constructor(config: LlamaCppConfig) {
    this.endpoint = config.endpoint ?? process.env.MIROFISH_API_URL ?? DEFAULT_ENDPOINT
    this.model = config.model ?? 'default'
  }

  async complete(options: LLMOptions): Promise<LLMResponse> {
    const messages = this.buildMessages(options)

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
    }

    if (options.temperature !== undefined) body.temperature = options.temperature
    if (options.max_tokens !== undefined) body.max_tokens = options.max_tokens

    if (options.tools?.length) {
      body.tools = options.tools.map((t) => ({
        type: 'function' as const,
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }))
    }

    if (options.json_mode) {
      body.response_format = { type: 'json_object' }
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let res: Response
    try {
      res = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '<unreadable>')
      throw new Error(`llamacpp ${res.status}: ${text}`)
    }

    const data = (await res.json()) as OAIResponse
    const choice = data.choices[0]
    if (!choice) throw new Error('llamacpp: empty choices array')

    const toolCalls: ToolCall[] | undefined = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }))

    return {
      content: choice.message.content ?? '',
      reasoning: choice.message.reasoning_content ?? undefined,
      tool_calls: toolCalls,
      usage: data.usage,
      model: data.model ?? this.model,
      provider: this.provider,
    }
  }

  private buildMessages(options: LLMOptions): Array<{ role: string; content: string; tool_call_id?: string; name?: string }> {
    const msgs: Array<{ role: string; content: string; tool_call_id?: string; name?: string }> = []

    if (options.system_prompt) {
      msgs.push({ role: 'system', content: options.system_prompt })
    }

    for (const m of options.messages) {
      const msg: { role: string; content: string; tool_call_id?: string; name?: string } = {
        role: m.role,
        content: m.content,
      }
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id
      if (m.name) msg.name = m.name
      msgs.push(msg)
    }

    return msgs
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createLlamaCppProvider(config: LlamaCppConfig = {}): LLMProvider {
  return new LlamaCppProvider(config)
}
