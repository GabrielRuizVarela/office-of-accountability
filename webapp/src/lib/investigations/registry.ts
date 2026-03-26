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
import { getDriver } from '@/lib/neo4j/client'

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

// ---------------------------------------------------------------------------
// Dynamic registry — Neo4j fallback with in-memory TTL cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  config: InvestigationClientConfig
  expiresAt: number
}

const DYNAMIC_CACHE_TTL_MS = 5 * 60 * 1_000 // 5 minutes

const dynamicCache = new Map<string, CacheEntry>()

/**
 * Get a client config by slug, checking the static registry first, then an
 * in-memory TTL cache, and finally querying Neo4j for dynamically-created
 * investigations stored as `InvestigationConfig` nodes.
 *
 * Returns null if the slug is not found anywhere.
 */
export async function getClientConfigDynamic(
  slug: string,
): Promise<InvestigationClientConfig | null> {
  // 1. Fast path: static registry
  const static_ = registry.get(slug as CasoSlug)
  if (static_) return static_

  // 2. In-memory cache
  const cached = dynamicCache.get(slug)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.config
  }

  // 3. Query Neo4j
  try {
    const driver = getDriver()
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (c:InvestigationConfig {caso_slug: $slug}) RETURN c',
        { slug },
      )

      if (result.records.length === 0) return null

      const node = result.records[0].get('c')
      const props = node.properties as Record<string, unknown>

      const nameEs =
        typeof props.name_es === 'string'
          ? props.name_es
          : typeof props.name === 'string'
            ? props.name
            : slug
      const nameEn =
        typeof props.name_en === 'string'
          ? props.name_en
          : typeof props.name === 'string'
            ? props.name
            : slug
      const descEs = typeof props.description_es === 'string' ? props.description_es : ''
      const descEn = typeof props.description_en === 'string' ? props.description_en : ''

      const config: InvestigationClientConfig = {
        casoSlug: slug,
        name: { es: nameEs, en: nameEn },
        description: { es: descEs, en: descEn },
        tabs: ['resumen', 'investigacion', 'grafo', 'cronologia', 'evidencia'],
        features: {
          wallets: false,
          simulation: false,
          flights: false,
          submissions: true,
          platformGraph: true,
        },
        hero: {
          title: { es: nameEs, en: nameEn },
          subtitle: { es: descEs, en: descEn },
        },
        sources: [],
      }

      dynamicCache.set(slug, { config, expiresAt: Date.now() + DYNAMIC_CACHE_TTL_MS })
      return config
    } finally {
      await session.close()
    }
  } catch {
    return null
  }
}
