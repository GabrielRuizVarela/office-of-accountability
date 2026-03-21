/**
 * LLM provider factory — resolves a ModelConfig node to an LLMProvider instance.
 */

import type { ModelConfig } from '../types'
import type { LLMProvider } from './types'
import { createLlamaCppProvider } from './llamacpp'
import { createOpenAIProvider } from './openai'
import { createAnthropicProvider } from './anthropic'

export function createProvider(config: ModelConfig): LLMProvider {
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
      })
    case 'anthropic':
      return createAnthropicProvider({
        endpoint: config.endpoint,
        model: config.model,
      })
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`)
  }
}
