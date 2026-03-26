'use client'

import { useState, useMemo } from 'react'

import { useLanguage, type Lang } from '@/lib/language-context'
import { TargetCard } from '@/components/investigation/TargetCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActorData {
  readonly id: string
  readonly name: string
  readonly role_es: string
  readonly role_en: string
  readonly description_es: string
  readonly description_en: string
  readonly nationality: string
  readonly status_es?: string
  readonly status_en?: string
  readonly party?: string
  readonly datasets?: number
  readonly source_url?: string
}

interface ObjetivosContentProps {
  readonly slug: string
  readonly actors: readonly ActorData[]
}

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

const t = {
  title: { es: 'Objetivos de la Investigacion', en: 'Investigation Targets' },
  subtitle: {
    es: 'Todos los actores bajo investigacion con su red de conexiones en el grafo.',
    en: 'All actors under investigation with their graph connection network.',
  },
  search: { es: 'Buscar por nombre...', en: 'Search by name...' },
  noResults: { es: 'Sin resultados', en: 'No results' },
  count: { es: 'objetivos', en: 'targets' },
} satisfies Record<string, Record<Lang, string>>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ObjetivosContent({ slug, actors }: ObjetivosContentProps) {
  const { lang } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return actors
    const q = search.toLowerCase()
    return actors.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.role_es.toLowerCase().includes(q) ||
        a.role_en.toLowerCase().includes(q) ||
        (a.party && a.party.toLowerCase().includes(q)),
    )
  }, [actors, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">{t.title[lang]}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t.subtitle[lang]}</p>
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search[lang]}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-purple-500"
        />
        <span className="shrink-0 text-xs text-zinc-500">
          {filtered.length} {t.count[lang]}
        </span>
      </div>

      {/* Actor grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-600">
          {t.noResults[lang]}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((actor) => (
            <TargetCard
              key={actor.id}
              id={actor.id}
              name={actor.name}
              role={lang === 'es' ? actor.role_es : actor.role_en}
              description={
                lang === 'es' ? actor.description_es : actor.description_en
              }
              nationality={actor.nationality}
              status={
                lang === 'es' ? actor.status_es : actor.status_en
              }
              party={actor.party}
              datasets={actor.datasets}
              sourceUrl={actor.source_url}
              actorSlug={toSlug(actor.name)}
              investigationSlug={slug}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  )
}
