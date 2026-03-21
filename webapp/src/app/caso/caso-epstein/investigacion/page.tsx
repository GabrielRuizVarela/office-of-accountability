'use client'

/**
 * Caso Epstein — Investigation (structured evidence/data page).
 *
 * Displays factcheck items, actors, money flows, evidence documents,
 * and government responses. Data-focused — distinct from resumen (narrative)
 * and evidencia (document catalog).
 */

import Link from 'next/link'

import { useLanguage, type Lang } from '@/lib/language-context'
import {
  FACTCHECK_ITEMS,
  ACTORS,
  MONEY_FLOWS,
  EVIDENCE_DOCS,
  IMPACT_STATS,
  GOVERNMENT_RESPONSES,
  type FactcheckStatus,
  type VerificationStatus,
} from '@/lib/caso-epstein/investigation-data'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Data & evidence', es: 'Datos y evidencia' },
  headerTitle: { en: 'Epstein Case: Investigation', es: 'Caso Epstein: Investigacion' },
  confirmed: { en: 'confirmed', es: 'confirmados' },
  alleged: { en: 'alleged', es: 'alegados' },
  underInvestigation: { en: 'under investigation', es: 'en investigacion' },
  verifiedFacts: { en: 'verified facts', es: 'hechos verificados' },
  documentedActors: { en: 'documented actors', es: 'actores documentados' },
  evidenceDocs: { en: 'evidence documents', es: 'documentos de evidencia' },
  readNarrative: { en: '\u2190 Read the full narrative', es: '\u2190 Leer la narrativa completa' },
  impact: { en: 'Impact', es: 'Impacto' },
  verifiedFactsTitle: { en: 'Verified facts', es: 'Hechos verificados' },
  documentedActorsTitle: { en: 'Documented actors', es: 'Actores documentados' },
  financialFlows: { en: 'Financial flows', es: 'Flujos financieros' },
  evidenceDocsTitle: { en: 'Evidence documents', es: 'Documentos de evidencia' },
  govResponses: { en: 'Government responses', es: 'Respuestas gubernamentales' },
  viewSource: { en: 'View source', es: 'Ver fuente' },
  navSummary: { en: '\u2190 Narrative summary', es: '\u2190 Resumen narrativo' },
  navTimeline: { en: 'Timeline', es: 'Cronologia' },
  navEvidence: { en: 'Evidence \u2192', es: 'Evidencia \u2192' },
  from: { en: 'From', es: 'De' },
  to: { en: 'To', es: 'A' },
  amount: { en: 'Amount', es: 'Monto' },
  period: { en: 'Period', es: 'Periodo' },
  source: { en: 'Source', es: 'Fuente' },
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<FactcheckStatus, Record<Lang, string>> = {
  confirmed: { en: 'Confirmed', es: 'Confirmado' },
  alleged: { en: 'Alleged', es: 'Alegado' },
  denied: { en: 'Denied', es: 'Negado' },
  under_investigation: { en: 'Under investigation', es: 'En investigacion' },
}

const STATUS_CLS: Record<FactcheckStatus, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  alleged: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  denied: 'bg-red-500/15 text-red-400 border-red-500/30',
  under_investigation: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

const VERIFICATION_BADGE: Record<VerificationStatus, Record<Lang, string>> = {
  verified: { en: 'Verified', es: 'Verificado' },
  partially_verified: { en: 'Partially verified', es: 'Parcialmente verificado' },
  unverified: { en: 'Unverified', es: 'No verificado' },
}

const VERIFICATION_CLS: Record<VerificationStatus, string> = {
  verified: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  partially_verified: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  unverified: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

function Badge({ label, cls }: { readonly label: string; readonly cls: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function formatUSD(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InvestigacionPage() {
  const { lang } = useLanguage()

  const confirmedCount = FACTCHECK_ITEMS.filter((i) => i.status === 'confirmed').length
  const allegedCount = FACTCHECK_ITEMS.filter((i) => i.status === 'alleged').length
  const underInvestigationCount = FACTCHECK_ITEMS.filter(
    (i) => i.status === 'under_investigation',
  ).length

  const l = (key: 'en' | 'es') => key === lang

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 pb-16">
      {/* Header */}
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          {t.headerBadge[lang]}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {t.headerTitle[lang]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
          {FACTCHECK_ITEMS.length} {t.verifiedFacts[lang]} ({confirmedCount} {t.confirmed[lang]},{' '}
          {allegedCount} {t.alleged[lang]}, {underInvestigationCount} {t.underInvestigation[lang]}) &middot;{' '}
          {ACTORS.length} {t.documentedActors[lang]} &middot; {EVIDENCE_DOCS.length} {t.evidenceDocs[lang]}
        </p>
        <div className="mt-4">
          <Link href="/caso/caso-epstein/resumen" className="text-sm text-red-400 hover:text-red-300">
            {t.readNarrative[lang]}
          </Link>
        </div>
      </header>

      {/* Impact stats */}
      <section>
        <h2 className="text-xl font-bold text-zinc-50">{t.impact[lang]}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.label_en}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-red-400">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{lang === 'en' ? stat.label_en : stat.label_es}</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">{stat.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Factcheck items */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {t.verifiedFactsTitle[lang]} ({FACTCHECK_ITEMS.length})
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {FACTCHECK_ITEMS.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm leading-relaxed text-zinc-200">
                  {lang === 'en' ? item.claim_en : item.claim_es}
                </p>
                <Badge label={STATUS_BADGE[item.status][lang]} cls={STATUS_CLS[item.status]} />
              </div>
              {(lang === 'en' ? item.detail_en : item.detail_es) && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {lang === 'en' ? item.detail_en : item.detail_es}
                </p>
              )}
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-xs text-red-400/70 underline decoration-red-400/20 hover:text-red-300"
              >
                {item.source}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Actors */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {t.documentedActorsTitle[lang]} ({ACTORS.length})
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTORS.map((actor) => (
            <div key={actor.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{actor.name}</h3>
                <span className="text-xs text-zinc-600">{actor.nationality}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-red-400/80">
                {lang === 'en' ? actor.role_en : actor.role_es}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {lang === 'en' ? actor.description_en : actor.description_es}
              </p>
              {(lang === 'en' ? actor.status_en : actor.status_es) && (
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  {lang === 'en' ? actor.status_en : actor.status_es}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Money flows */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {t.financialFlows[lang]}
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                <th className="pb-3 pr-4 font-medium">{t.from[lang]}</th>
                <th className="pb-3 pr-4 font-medium">{t.to[lang]}</th>
                <th className="pb-3 pr-4 font-medium text-right">{t.amount[lang]}</th>
                <th className="pb-3 pr-4 font-medium">{t.period[lang]}</th>
                <th className="pb-3 font-medium">{t.source[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {MONEY_FLOWS.map((flow) => (
                <tr key={flow.id} className="border-b border-zinc-800/50">
                  <td className="py-3 pr-4 text-zinc-200">{flow.from_label}</td>
                  <td className="py-3 pr-4 text-zinc-200">{flow.to_label}</td>
                  <td className="py-3 pr-4 text-right font-mono text-red-400">{formatUSD(flow.amount_usd)}</td>
                  <td className="py-3 pr-4 text-zinc-500">{flow.date}</td>
                  <td className="py-3 text-xs text-zinc-500">{flow.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Evidence documents */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {t.evidenceDocsTitle[lang]} ({EVIDENCE_DOCS.length})
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EVIDENCE_DOCS.map((doc) => (
            <a
              key={doc.id}
              href={doc.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-red-600/40"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="flex-1 text-sm font-semibold text-zinc-100 group-hover:text-red-300">
                  {doc.title}
                </h3>
                <Badge label={VERIFICATION_BADGE[doc.verification_status][lang]} cls={VERIFICATION_CLS[doc.verification_status]} />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {lang === 'en' ? doc.type_en : doc.type_es} &middot; {doc.date}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {lang === 'en' ? doc.summary_en : doc.summary_es}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Government responses */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {t.govResponses[lang]}
        </h2>
        <div className="relative mt-6 ml-4 border-l-2 border-zinc-800 pl-6">
          {GOVERNMENT_RESPONSES.map((resp) => (
            <div key={resp.id} className="relative mb-8 last:mb-0">
              <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-red-500 bg-zinc-950" />
              <time className="text-xs font-medium text-zinc-500">
                {new Date(resp.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                {lang === 'en' ? resp.action_en : resp.action_es}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {lang === 'en' ? resp.effect_en : resp.effect_es}
              </p>
              {resp.source_url && (
                <a
                  href={resp.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-red-400/70 underline decoration-red-400/20 hover:text-red-300"
                >
                  {t.viewSource[lang]}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href="/caso/caso-epstein/resumen"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navSummary[lang]}
        </Link>
        <Link
          href="/caso/caso-epstein/cronologia"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navTimeline[lang]}
        </Link>
        <Link
          href="/caso/caso-epstein/evidencia"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navEvidence[lang]}
        </Link>
      </nav>
    </div>
  )
}
