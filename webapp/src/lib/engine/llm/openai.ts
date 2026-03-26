/**
 * OpenAI LLM provider - chat completions adapter.
 *
 * Uses raw fetch against the OpenAI /v1/chat/completions endpoint.
 * Maps standard OpenAI response format to the normalized LLMResponse.
 */

import type { LLMOptions, LLMProvider, LLMResponse, ToolCall } from './types.ts'

// ---------------------------------------------------------------------------
// OpenAI response types (subset we use)
// ---------------------------------------------------------------------------

interface OAIToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

interface OAIChoice {
  message: {
    content: string | null
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

interface OpenAIConfig {
  apiKey?: string
  endpoint?: string
  model?: string
}

const DEFAULT_ENDPOINT = 'https://api.openai.com'
const REQUEST_TIMEOUT_MS = 120_000

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

class OpenAIProvider implements LLMProvider {
  readonly provider = 'openai' as const
  readonly model: string
  private readonly endpoint: string
  private readonly apiKey: string

  constructor(config: OpenAIConfig) {
    this.endpoint = config.endpoint ?? process.env.OPENAI_API_BASE ?? DEFAULT_ENDPOINT
    this.model = config.model ?? 'gpt-4o'
    const key = config.apiKey ?? process.env.OPENAI_API_KEY
    if (!key) throw new Error('OpenAI API key required (config.apiKey or OPENAI_API_KEY)')
    this.apiKey = key
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '<unreadable>')
      throw new Error(`openai ${res.status}: ${text}`)
    }

    const data = (await res.json()) as OAIResponse
    const choice = data.choices[0]
    if (!choice) throw new Error('openai: empty choices array')

    const toolCalls: ToolCall[] | undefined = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }))

    return {
      content: choice.message.content ?? '',
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

export function createOpenAIProvider(config: OpenAIConfig = {}): LLMProvider {
  return new OpenAIProvider(config)
}
