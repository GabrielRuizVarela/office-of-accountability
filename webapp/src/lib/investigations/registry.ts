/**
 * Central registry resolving casoSlug -> InvestigationClientConfig.
 *
 * Each investigation's config is imported directly, making the registry
 * statically analyzable and tree-shakeable.
 */

import type { InvestigationClientConfig } from './types'

import { config as libraConfig } from '../caso-libra/config'
import { config as finanzasConfig } from '../caso-finanzas-politicas/config'
import { config as epsteinConfig } from '../caso-epstein/config'

// ---------------------------------------------------------------------------
// Registry state
// ---------------------------------------------------------------------------

const REGISTRY: Record<string, InvestigationClientConfig> = {
  'caso-libra': libraConfig,
  'caso-finanzas-politicas': finanzasConfig,
  'caso-epstein': epsteinConfig,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up an investigation's client config by slug.
 * Returns null if no investigation is registered with that slug.
 */
export function getInvestigationConfig(slug: string): InvestigationClientConfig | null {
  return REGISTRY[slug] ?? null
}

/**
 * Get all registered investigation configs.
 */
export function getAllInvestigations(): InvestigationClientConfig[] {
  return Object.values(REGISTRY)
}
