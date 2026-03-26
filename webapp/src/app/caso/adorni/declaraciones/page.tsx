'use client'

import { useMemo, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { STATEMENTS, type Statement } from '@/lib/caso-adorni/investigation-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterKey = 'all' | 'verified' | 'unverified'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  title: { en: 'Statements vs. Facts', es: 'Declaraciones vs. Hechos' },
  subtitle: {
    en: 'Cross-checking claims made in official press conferences against verified public records.',
    es: 'Cruzando declaraciones realizadas en conferencias de prensa oficiales contra registros publicos verificados.',
  },
  total: { en: 'Total', es: 'Total' },
  verifiedTrue: { en: 'Verified', es: 'Verificado' },
  unverified: { en: 'Unverified', es: 'Sin Verificar' },
  all: { en: 'All', es: 'Todas' },
  context: { en: 'Context', es: 'Contexto' },
  verification: { en: 'Verification', es: 'Verificacion' },
  source: { en: 'Source', es: 'Fuente' },
  video: { en: 'Video', es: 'Video' },
  empty: {
    en: 'No statements have been loaded yet. Check back as the investigation progresses.',
    es: 'Aun no se han cargado declaraciones. Vuelva a consultar a medida que avance la investigacion.',
  },
  noMatch: {
    en: 'No statements match the selected filter.',
    es: 'Ninguna declaracion coincide con el filtro seleccionado.',
  },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeclaracionesPage() {
  const { lang } = useLanguage()
  const [filter, setFilter] = useState<FilterKey>('all')

  const statements = STATEMENTS ?? []

  const stats = useMemo(() => {
    let verified = 0
    let unverified = 0

    for (const s of statements) {
      if (s.verified) verified++
      else unverified++
    }

    return { total: statements.length, verified, unverified }
  }, [statements])

  const filtered = useMemo(() => {
    if (filter === 'all') return statements
    if (filter === 'verified') return statements.filter((s) => s.verified)
    return statements.filter((s) => !s.verified)
  }, [statements, filter])

  const filters: { key: FilterKey; label: { en: string; es: string }; count: number }[] = [
    { key: 'all', label: t.all, count: stats.total },
    { key: 'verified', label: t.verifiedTrue, count: stats.verified },
    { key: 'unverified', label: t.unverified, count: stats.unverified },
  ]

  // Empty state
  if (statements.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-50">{t.title[lang]}</h1>
        <p className="mb-8 text-sm text-zinc-400">{t.subtitle[lang]}</p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-12 text-center text-sm text-zinc-500">
          {t.empty[lang]}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">{t.title[lang]}</h1>
      <p className="mb-6 text-sm text-zinc-400">{t.subtitle[lang]}</p>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label={t.total[lang]} value={stats.total} color="text-zinc-100" />
        <StatCard label={t.verifiedTrue[lang]} value={stats.verified} color="text-green-400" />
        <StatCard label={t.unverified[lang]} value={stats.unverified} color="text-zinc-400" />
      </div>

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {f.label[lang]} ({f.count})
          </button>
        ))}
      </div>

      {/* Statement cards */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-12 text-center text-sm text-zinc-500">
          {t.noMatch[lang]}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((stmt) => (
            <StatementCard key={stmt.id} stmt={stmt} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatementCard({ stmt, lang }: { readonly stmt: Statement; readonly lang: 'en' | 'es' }) {
  const dotColor = stmt.verified ? 'bg-green-400' : 'bg-zinc-500'
  const badgeBg = stmt.verified ? 'bg-green-500/10 border-green-500/30' : 'bg-zinc-500/10 border-zinc-500/30'
  const badgeText = stmt.verified ? 'text-green-400' : 'text-zinc-400'
  const badgeLabel = stmt.verified
    ? (lang === 'es' ? 'Verificado' : 'Verified')
    : (lang === 'es' ? 'Sin Verificar' : 'Unverified')

  const claim = lang === 'es' ? stmt.claim_es : stmt.claim_en
  const context = lang === 'es' ? stmt.context_es : stmt.context_en
  const verification = lang === 'es' ? stmt.verification_es : stmt.verification_en

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      {/* Date & status badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">{stmt.date}</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeBg} ${badgeText}`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {badgeLabel}
        </span>
      </div>

      {/* Claim */}
      <h3 className="mb-2 text-sm font-semibold text-zinc-100">{claim}</h3>

      {/* Context */}
      {context && (
        <p className="mb-3 text-xs leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-500">
            {lang === 'es' ? 'Contexto' : 'Context'}:
          </span>{' '}
          {context}
        </p>
      )}

      {/* Verification result */}
      {verification && (
        <p className="mb-3 text-xs leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-500">
            {lang === 'es' ? 'Verificacion' : 'Verification'}:
          </span>{' '}
          {verification}
        </p>
      )}

      {/* Links */}
      <div className="flex gap-3">
        {stmt.source_url && (
          <a
            href={stmt.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
          >
            {lang === 'es' ? 'Fuente' : 'Source'}
          </a>
        )}
        {stmt.video_url && (
          <a
            href={stmt.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
          >
            Video
          </a>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  )
}
