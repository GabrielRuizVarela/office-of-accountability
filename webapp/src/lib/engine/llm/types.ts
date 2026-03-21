/**
 * LLM abstraction layer — provider-agnostic interfaces for the engine pipeline.
 *
 * Plain TypeScript interfaces (no Zod — these are internal, not persisted).
 * Covers: messages, tool use, provider contract, and response normalization.
 */

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  name?: string
}

// ---------------------------------------------------------------------------
// Tool use
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface ToolCall {
  id: string
  name: string
  arguments: string
}

// ---------------------------------------------------------------------------
// Request options
// ---------------------------------------------------------------------------

export interface LLMOptions {
  messages: Message[]
  tools?: ToolDefinition[]
  temperature?: number
  max_tokens?: number
  system_prompt?: string
  json_mode?: boolean
}

// ---------------------------------------------------------------------------
// Response
// ---------------------------------------------------------------------------

export interface LLMResponse {
  content: string
  reasoning?: string
  tool_calls?: ToolCall[]
  usage?: { prompt_tokens: number; completion_tokens: number }
  model: string
  provider: string
}

// ---------------------------------------------------------------------------
// Provider contract
// ---------------------------------------------------------------------------

export interface LLMChunk {
  content?: string
  reasoning?: string
  tool_calls?: ToolCall[]
  done: boolean
}

export interface LLMProvider {
  readonly provider: string
  readonly model: string
  complete(options: LLMOptions): Promise<LLMResponse>
  stream?(options: LLMOptions): AsyncIterable<LLMChunk>
}
