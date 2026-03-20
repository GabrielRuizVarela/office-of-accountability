/**
 * Central registry resolving casoSlug → InvestigationClientConfig.
 *
 * Per-investigation config files (e.g., caso-epstein/config.ts) call
 * registerInvestigation() to populate the registry at import time.
 */

import type { InvestigationClientConfig } from './types'

// ---------------------------------------------------------------------------
// Registry state
// ---------------------------------------------------------------------------

const REGISTRY: Record<string, InvestigationClientConfig> = {}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register an investigation's client config.
 * Called by per-investigation config files during module initialization.
 */
export function registerInvestigation(config: InvestigationClientConfig): void {
  REGISTRY[config.casoSlug] = config
}

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
