/**
 * LLM provider factory — resolves a ModelConfig node to an LLMProvider instance.
 */

import type { ModelConfig } from '../types'
import type { LLMProvider } from './types'
import { createLlamaCppProvider } from './llamacpp'
import { createOpenAIProvider } from './openai'
import { createAnthropicProvider } from './anthropic'

/**
 * Resolve API key from ModelConfig's api_key_env field.
 * Falls back to conventional env var names if api_key_env is not set.
 * Note: In Cloudflare Workers, keys are passed via env bindings (not process.env).
 * The MCP proxy passes the key in the API call — this factory is for Node.js/Next.js only.
 */
function resolveApiKey(config: ModelConfig): string | undefined {
  if (config.api_key_env) {
    return process.env[config.api_key_env]
  }
  // Conventional fallbacks
  switch (config.provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY
    default:
      return undefined
  }
}

export function createProvider(config: ModelConfig): LLMProvider {
  const apiKey = resolveApiKey(config)

  switch (config.provider) {
    case 'llamacpp':
      return createLlamaCppProvider({
        endpoint: config.endpoint,
        model: config.model,
      })
    case 'openai':
      return createOpenAIProvider({
        endpoint: config.endpoint,
        model: config.model,
        apiKey,
      })
    case 'anthropic':
      return createAnthropicProvider({
        endpoint: config.endpoint,
        model: config.model,
        apiKey,
      })
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`)
  }
}
