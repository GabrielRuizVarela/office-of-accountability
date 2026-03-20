/**
 * Caso Epstein — Investigacion (full evidence/investigation page).
 *
 * Displays FACTCHECK_ITEMS, ACTORS, MONEY_FLOWS, EVIDENCE_DOCS,
 * IMPACT_STATS, and GOVERNMENT_RESPONSES from investigation-data.ts.
 * Uses _es fields for Spanish content throughout.
 */

import Link from 'next/link'

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
// Helpers
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<FactcheckStatus, { label: string; cls: string }> = {
  confirmed: {
    label: 'Confirmado',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  alleged: {
    label: 'Alegado',
    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  denied: {
    label: 'Negado',
    cls: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  under_investigation: {
    label: 'En investigacion',
    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
}

const VERIFICATION_BADGE: Record<VerificationStatus, { label: string; cls: string }> = {
  verified: {
    label: 'Verificado',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  partially_verified: {
    label: 'Parcialmente verificado',
    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  unverified: {
    label: 'No verificado',
    cls: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  },
}

function Badge({
  label,
  cls,
}: {
  readonly label: string
  readonly cls: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  )
}

function formatUSD(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(0)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InvestigacionPage() {
  const confirmedCount = FACTCHECK_ITEMS.filter((i) => i.status === 'confirmed').length
  const allegedCount = FACTCHECK_ITEMS.filter((i) => i.status === 'alleged').length
  const underInvestigationCount = FACTCHECK_ITEMS.filter(
    (i) => i.status === 'under_investigation',
  ).length

  return (
    <div className="space-y-14 pb-16">
      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* --------------------------------------------------------------- */}
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Investigacion completa
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Caso Epstein: Datos y evidencia
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
          {FACTCHECK_ITEMS.length} hechos verificados ({confirmedCount} confirmados,{' '}
          {allegedCount} alegados, {underInvestigationCount} en investigacion) &middot;{' '}
          {ACTORS.length} actores documentados &middot; {EVIDENCE_DOCS.length} documentos de
          evidencia
        </p>
      </header>

      {/* --------------------------------------------------------------- */}
      {/* Impact stats                                                     */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-bold text-zinc-50">Impacto</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.label_es}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-red-400">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{stat.label_es}</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">{stat.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Factcheck items                                                  */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Hechos verificados ({FACTCHECK_ITEMS.length})
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {FACTCHECK_ITEMS.map((item) => {
            const badge = STATUS_BADGE[item.status]
            return (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed text-zinc-200">
                    {item.claim_es}
                  </p>
                  <Badge label={badge.label} cls={badge.cls} />
                </div>
                {item.detail_es && (
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {item.detail_es}
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
            )
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Actors                                                           */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Actores documentados ({ACTORS.length})
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTORS.map((actor) => (
            <div
              key={actor.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{actor.name}</h3>
                <span className="text-xs text-zinc-600">{actor.nationality}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-red-400/80">{actor.role_es}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {actor.description_es}
              </p>
              {actor.status_es && (
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  {actor.status_es}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Money flows                                                      */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Flujos financieros
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                <th className="pb-3 pr-4 font-medium">De</th>
                <th className="pb-3 pr-4 font-medium">A</th>
                <th className="pb-3 pr-4 font-medium text-right">Monto</th>
                <th className="pb-3 pr-4 font-medium">Periodo</th>
                <th className="pb-3 font-medium">Fuente</th>
              </tr>
            </thead>
            <tbody>
              {MONEY_FLOWS.map((flow) => (
                <tr key={flow.id} className="border-b border-zinc-800/50">
                  <td className="py-3 pr-4 text-zinc-200">{flow.from_label}</td>
                  <td className="py-3 pr-4 text-zinc-200">{flow.to_label}</td>
                  <td className="py-3 pr-4 text-right font-mono text-red-400">
                    {formatUSD(flow.amount_usd)}
                  </td>
                  <td className="py-3 pr-4 text-zinc-500">{flow.date}</td>
                  <td className="py-3 text-xs text-zinc-500">{flow.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Evidence documents                                               */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Documentos de evidencia ({EVIDENCE_DOCS.length})
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EVIDENCE_DOCS.map((doc) => {
            const vBadge = VERIFICATION_BADGE[doc.verification_status]
            return (
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
                  <Badge label={vBadge.label} cls={vBadge.cls} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {doc.type_es} &middot; {doc.date}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {doc.summary_es}
                </p>
              </a>
            )
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Government responses                                             */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Respuestas gubernamentales
        </h2>
        <div className="relative mt-6 ml-4 border-l-2 border-zinc-800 pl-6">
          {GOVERNMENT_RESPONSES.map((resp) => (
            <div key={resp.id} className="relative mb-8 last:mb-0">
              <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-red-500 bg-zinc-950" />
              <time className="text-xs font-medium text-zinc-500">
                {new Date(resp.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                {resp.action_es}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {resp.effect_es}
              </p>
              {resp.source_url && (
                <a
                  href={resp.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-red-400/70 underline decoration-red-400/20 hover:text-red-300"
                >
                  Ver fuente
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Navigation                                                       */}
      {/* --------------------------------------------------------------- */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href="/caso/caso-epstein/resumen"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          &larr; Resumen
        </Link>
        <Link
          href="/caso/caso-epstein/cronologia"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          Cronologia &rarr;
        </Link>
        <Link
          href="/caso/caso-epstein/evidencia"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          Evidencia &rarr;
        </Link>
      </nav>
    </div>
  )
}
