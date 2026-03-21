/**
 * Anthropic LLM provider — Messages API adapter.
 *
 * Uses raw fetch against the Anthropic /v1/messages endpoint.
 * Maps thinking blocks → normalized `reasoning` field.
 */

import type { LLMOptions, LLMProvider, LLMResponse, ToolCall } from './types.ts'

// ---------------------------------------------------------------------------
// Anthropic response types (subset we use)
// ---------------------------------------------------------------------------

interface AnthropicTextBlock {
  type: 'text'
  text: string
}

interface AnthropicThinkingBlock {
  type: 'thinking'
  thinking: string
}

interface AnthropicToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: unknown
}

type AnthropicContentBlock = AnthropicTextBlock | AnthropicThinkingBlock | AnthropicToolUseBlock

interface AnthropicResponse {
  content: AnthropicContentBlock[]
  usage: { input_tokens: number; output_tokens: number }
  model: string
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface AnthropicConfig {
  apiKey?: string
  endpoint?: string
  model?: string
}

const DEFAULT_ENDPOINT = 'https://api.anthropic.com'
const API_VERSION = '2023-06-01'
const REQUEST_TIMEOUT_MS = 120_000

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

class AnthropicProvider implements LLMProvider {
  readonly provider = 'anthropic' as const
  readonly model: string
  private readonly endpoint: string
  private readonly apiKey: string

  constructor(config: AnthropicConfig) {
    this.endpoint = config.endpoint ?? process.env.ANTHROPIC_API_BASE ?? DEFAULT_ENDPOINT
    this.model = config.model ?? 'claude-sonnet-4-20250514'
    const key = config.apiKey ?? process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('Anthropic API key required (config.apiKey or ANTHROPIC_API_KEY)')
    this.apiKey = key
  }

  async complete(options: LLMOptions): Promise<LLMResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: this.buildMessages(options),
      max_tokens: options.max_tokens ?? 4096,
    }

    if (options.system_prompt) {
      body.system = options.system_prompt
    }

    if (options.temperature !== undefined) body.temperature = options.temperature

    if (options.tools?.length) {
      body.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }))
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let res: Response
    try {
      res = await fetch(`${this.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': API_VERSION,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '<unreadable>')
      throw new Error(`anthropic ${res.status}: ${text}`)
    }

    const data = (await res.json()) as AnthropicResponse
    return this.normalizeResponse(data)
  }

  private normalizeResponse(data: AnthropicResponse): LLMResponse {
    let content = ''
    let reasoning: string | undefined
    const toolCalls: ToolCall[] = []

    for (const block of data.content) {
      switch (block.type) {
        case 'text':
          content += block.text
          break
        case 'thinking':
          reasoning = reasoning ? `${reasoning}\n${block.thinking}` : block.thinking
          break
        case 'tool_use':
          toolCalls.push({
            id: block.id,
            name: block.name,
            arguments: JSON.stringify(block.input),
          })
          break
      }
    }

    return {
      content,
      reasoning,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
      },
      model: data.model,
      provider: this.provider,
    }
  }

  private buildMessages(options: LLMOptions): Array<{ role: string; content: string }> {
    const msgs: Array<{ role: string; content: string }> = []

    for (const m of options.messages) {
      if (m.role === 'system') continue // system handled separately
      msgs.push({ role: m.role, content: m.content })
    }

    return msgs
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAnthropicProvider(config: AnthropicConfig = {}): LLMProvider {
  return new AnthropicProvider(config)
}
