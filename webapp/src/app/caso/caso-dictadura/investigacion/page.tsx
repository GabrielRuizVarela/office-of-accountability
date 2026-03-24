'use client'

import { useState } from 'react'

import { useLanguage } from '@/lib/language-context'
import {
  FACTCHECK_ITEMS,
  KEY_ACTORS,
  IMPACT_STATS,
  EVIDENCE_DOCS,
  JUDICIAL_RESPONSES,
} from '@/lib/caso-dictadura/investigation-data'

const t = {
  title: { en: 'Investigation', es: 'Investigacion' },
  subtitle: {
    en: '14,512 nodes, 31,607 relationships. 12 data sources. 25 automated waves.',
    es: '14.512 nodos, 31.607 relaciones. 12 fuentes de datos. 25 olas automatizadas.',
  },
  factcheck: { en: 'Factcheck', es: 'Verificacion' },
  actors: { en: 'Key Actors', es: 'Actores Clave' },
  stats: { en: 'Impact', es: 'Impacto' },
  evidence: { en: 'Evidence', es: 'Evidencia' },
  judicial: { en: 'Judicial', es: 'Justicia' },
  confirmed: { en: 'Confirmed', es: 'Confirmado' },
  alleged: { en: 'Alleged', es: 'Alegado' },
  verified: { en: 'Verified', es: 'Verificado' },
  partial: { en: 'Partial', es: 'Parcial' },
} as const

type Tab = 'factcheck' | 'actors' | 'stats' | 'evidence' | 'judicial'

export default function InvestigacionPage() {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('factcheck')

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">{t.title[lang]}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.subtitle[lang]}</p>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap justify-center gap-2">
        {(['factcheck', 'actors', 'stats', 'evidence', 'judicial'] as Tab[]).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {t[id][lang]}
          </button>
        ))}
      </nav>

      {/* Factcheck */}
      {tab === 'factcheck' && (
        <div className="space-y-4">
          {FACTCHECK_ITEMS.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {item.status === 'confirmed' ? t.confirmed[lang] : t.alleged[lang]}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200">
                    {lang === 'es' ? item.claim_es : item.claim_en}
                  </p>
                  {(lang === 'es' ? item.detail_es : item.detail_en) && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      {lang === 'es' ? item.detail_es : item.detail_en}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-600">{item.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actors */}
      {tab === 'actors' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {KEY_ACTORS.map((actor) => (
            <div key={actor.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="font-semibold text-zinc-100">{actor.name}</h3>
              <p className="mt-1 text-xs text-amber-400">{lang === 'es' ? actor.role_es : actor.role_en}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {lang === 'es' ? actor.description_es : actor.description_en}
              </p>
              {(lang === 'es' ? actor.status_es : actor.status_en) && (
                <p className="mt-2 text-xs text-zinc-600">
                  {lang === 'es' ? actor.status_es : actor.status_en}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Impact Stats */}
      {tab === 'stats' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT_STATS.map((stat) => (
            <div key={stat.value} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <p className="text-2xl font-bold text-zinc-50">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-400">{lang === 'es' ? stat.label_es : stat.label_en}</p>
              <p className="mt-0.5 text-xs text-zinc-600">{stat.source}</p>
            </div>
          ))}
        </div>
      )}

      {/* Evidence */}
      {tab === 'evidence' && (
        <div className="space-y-4">
          {EVIDENCE_DOCS.map((doc) => (
            <div key={doc.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-200">{doc.title}</h3>
                  <p className="mt-1 text-xs text-amber-400">{lang === 'es' ? doc.type_es : doc.type_en} &middot; {doc.date}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    {lang === 'es' ? doc.summary_es : doc.summary_en}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  doc.verification_status === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {doc.verification_status === 'verified' ? t.verified[lang] : t.partial[lang]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Judicial */}
      {tab === 'judicial' && (
        <div className="space-y-4">
          {JUDICIAL_RESPONSES.map((jr) => (
            <div key={jr.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-xs text-zinc-600">{jr.date}</p>
              <h3 className="mt-1 text-sm font-semibold text-zinc-200">
                {lang === 'es' ? jr.action_es : jr.action_en}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {lang === 'es' ? jr.effect_es : jr.effect_en}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
