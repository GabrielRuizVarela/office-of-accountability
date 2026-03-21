/**
 * Client config registry — maps caso slugs to InvestigationClientConfig.
 *
 * Central lookup for static frontend configuration per investigation.
 * Import caso-specific configs and register them here.
 */

import type { InvestigationClientConfig } from './types'
import type { CasoSlug } from './utils'
import { casoEpsteinConfig } from '@/lib/caso-epstein/config'
import { casoLibraConfig } from '@/lib/caso-libra/config'
import { casoFinanzasPoliticasConfig } from '@/lib/caso-finanzas-politicas/config'

const registry: ReadonlyMap<CasoSlug, InvestigationClientConfig> = new Map([
  ['caso-epstein', casoEpsteinConfig],
  ['caso-libra', casoLibraConfig],
  ['caso-finanzas-politicas', casoFinanzasPoliticasConfig],
])

/**
 * Get the client config for a specific investigation by slug.
 * Returns undefined if the slug is not registered.
 */
export function getClientConfig(
  slug: string,
): InvestigationClientConfig | undefined {
  return registry.get(slug as CasoSlug)
}

/**
 * List all registered investigation client configs.
 */
export function listClientConfigs(): InvestigationClientConfig[] {
  return [...registry.values()]
}
