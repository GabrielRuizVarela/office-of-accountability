/**
 * Objetivos (Targets) page — shows all investigation actors
 * with expandable cards featuring mini force-graphs of their
 * graph neighborhood and relationship lists.
 */

import { ACTORS as EPSTEIN_ACTORS } from '@/lib/caso-epstein/investigation-data'
import { ACTORS as LIBRA_ACTORS } from '@/lib/caso-libra/investigation-data'
import { ACTORS as FINANZAS_ACTORS } from '@/lib/caso-finanzas-politicas/investigation-data'

import { ObjetivosContent } from './ObjetivosContent'

// Normalize actors from different cases into a common shape
interface NormalizedActor {
  id: string
  name: string
  role_es: string
  role_en: string
  description_es: string
  description_en: string
  nationality: string
  status_es?: string
  status_en?: string
  party?: string
  datasets?: number
  source_url?: string
}

function normalize(actors: readonly Record<string, unknown>[]): NormalizedActor[] {
  return actors.map((a) => ({
    id: String(a.id ?? ''),
    name: String(a.name ?? ''),
    role_es: String(a.role_es ?? ''),
    role_en: String(a.role_en ?? ''),
    description_es: String(a.description_es ?? ''),
    description_en: String(a.description_en ?? ''),
    nationality: String(a.nationality ?? 'Argentina'),
    status_es: a.status_es ? String(a.status_es) : undefined,
    status_en: a.status_en ? String(a.status_en) : undefined,
    party: a.party ? String(a.party) : undefined,
    datasets: typeof a.datasets === 'number' ? a.datasets : undefined,
    source_url: a.source_url ? String(a.source_url) : undefined,
  }))
}

const CASE_ACTORS: Readonly<Record<string, readonly Record<string, unknown>[]>> = {
  'caso-epstein': EPSTEIN_ACTORS as unknown as Record<string, unknown>[],
  'caso-libra': LIBRA_ACTORS as unknown as Record<string, unknown>[],
  'finanzas-politicas': FINANZAS_ACTORS as unknown as Record<string, unknown>[],
}

export default async function ObjetivosPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const raw = CASE_ACTORS[slug] ?? []
  const actors = normalize(raw)

  return <ObjetivosContent slug={slug} actors={actors} />
}
