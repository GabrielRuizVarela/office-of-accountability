/**
 * LLM provider factory — resolves a ModelConfig node to an LLMProvider instance.
 *
 * Only llamacpp is supported. New providers can be added as single-file modules.
 */

import type { ModelConfig } from '../types'
import type { LLMProvider } from './types'
import { createLlamaCppProvider } from './llamacpp'

export function createProvider(config: ModelConfig): LLMProvider {
  switch (config.provider) {
    case 'llamacpp':
      return createLlamaCppProvider({
        endpoint: config.endpoint,
        model: config.model,
      })
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`)
  }
}
