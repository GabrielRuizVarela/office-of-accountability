'use client'

/**
 * Caso Epstein — Evidence content.
 *
 * Grid of document cards built from EVIDENCE_DOCS in investigation-data.ts.
 */

import Link from 'next/link'

import { useLanguage, type Lang } from '@/lib/language-context'
import {
  EVIDENCE_DOCS,
  type VerificationStatus,
} from '@/lib/caso-epstein/investigation-data'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Documents & evidence', es: 'Documentos y evidencia' },
  headerTitle: { en: 'Epstein Case: Evidence base', es: 'Caso Epstein: Base de evidencia' },
  headerDesc: {
    en: (total: number, verified: number) =>
      `${total} key documents from the investigation. ${verified} verified against primary sources. Court filings, DOJ releases, congressional reports, and investigative journalism.`,
    es: (total: number, verified: number) =>
      `${total} documentos clave de la investigacion. ${verified} verificados contra fuentes primarias. Documentos judiciales, publicaciones del DOJ, informes del Congreso y periodismo investigativo.`,
  },
  documents: { en: 'Documents', es: 'Documentos' },
  verified: { en: 'Verified', es: 'Verificados' },
  partiallyVerified: { en: 'Partially verified', es: 'Parcialmente verificados' },
  viewSource: { en: 'View source document \u2192', es: 'Ver documento fuente \u2192' },
  additionalTitle: { en: 'Additional documents in the graph', es: 'Documentos adicionales en el grafo' },
  additionalDesc: {
    en: 'The investigation knowledge graph contains over 1,000 additional documents indexed from court and government sources. The documents shown here are the most relevant ones selected for the investigation narrative. To explore the full catalog, visit the',
    es: 'El grafo de conocimiento de la investigacion contiene mas de 1.000 documentos adicionales indexados desde fuentes judiciales y gubernamentales. Los documentos mostrados aqui son los mas relevantes seleccionados para la narrativa de la investigacion. Para explorar el catalogo completo, visite el',
  },
  graphExplorer: { en: 'graph explorer', es: 'explorador del grafo' },
  navSummary: { en: '\u2190 Summary', es: '\u2190 Resumen' },
  navTimeline: { en: 'Timeline', es: 'Cronologia' },
  navInvestigation: { en: 'Investigation', es: 'Investigacion' },
} as const

const VERIFICATION_LABELS: Record<VerificationStatus, Record<Lang, string>> = {
  verified: { en: 'Verified', es: 'Verificado' },
  partially_verified: { en: 'Partially verified', es: 'Parcialmente verificado' },
  unverified: { en: 'Unverified', es: 'No verificado' },
}

const VERIFICATION_CLS: Record<VerificationStatus, string> = {
  verified: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  partially_verified: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  unverified: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EpsteinEvidenciaContent({ slug }: { readonly slug: string }) {
  const { lang } = useLanguage()
  const basePath = `/caso/${slug}`

  const sortedDocs = [...EVIDENCE_DOCS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const verifiedCount = EVIDENCE_DOCS.filter(
    (d) => d.verification_status === 'verified',
  ).length

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          {t.headerBadge[lang]}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {t.headerTitle[lang]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
          {t.headerDesc[lang](EVIDENCE_DOCS.length, verifiedCount)}
        </p>
      </header>

      {/* Stats bar */}
      <div className="flex flex-wrap justify-center gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-red-400">{EVIDENCE_DOCS.length}</p>
          <p className="text-xs text-zinc-500">{t.documents[lang]}</p>
        </div>
        <div className="h-10 w-px bg-zinc-800" />
        <div>
          <p className="text-2xl font-bold text-emerald-400">{verifiedCount}</p>
          <p className="text-xs text-zinc-500">{t.verified[lang]}</p>
        </div>
        <div className="h-10 w-px bg-zinc-800" />
        <div>
          <p className="text-2xl font-bold text-amber-400">
            {EVIDENCE_DOCS.length - verifiedCount}
          </p>
          <p className="text-xs text-zinc-500">{t.partiallyVerified[lang]}</p>
        </div>
      </div>

      {/* Document grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedDocs.map((doc) => (
          <a
            key={doc.id}
            href={doc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-red-600/40 hover:bg-zinc-900/60"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="flex-1 text-sm font-semibold text-zinc-100 group-hover:text-red-300">
                {doc.title}
              </h3>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${VERIFICATION_CLS[doc.verification_status]}`}
              >
                {VERIFICATION_LABELS[doc.verification_status][lang]}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
              <span className="rounded bg-zinc-800/60 px-2 py-0.5 font-medium">
                {lang === 'en' ? doc.type_en : doc.type_es}
              </span>
              <span>
                {new Date(doc.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <p className="mt-3 flex-1 text-xs leading-relaxed text-zinc-400">
              {lang === 'en' ? doc.summary_en : doc.summary_es}
            </p>

            <p className="mt-3 text-xs text-red-400/60 group-hover:text-red-400">
              {t.viewSource[lang]}
            </p>
          </a>
        ))}
      </div>

      {/* Note about Neo4j docs */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-200">
          {t.additionalTitle[lang]}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          {t.additionalDesc[lang]}{' '}
          <Link
            href={`${basePath}/grafo`}
            className="text-red-400 underline decoration-red-400/30 hover:text-red-300"
          >
            {t.graphExplorer[lang]}
          </Link>
          .
        </p>
      </section>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href={`${basePath}/resumen`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navSummary[lang]}
        </Link>
        <Link
          href={`${basePath}/cronologia`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navTimeline[lang]}
        </Link>
        <Link
          href={`${basePath}/investigacion`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navInvestigation[lang]}
        </Link>
      </nav>
    </div>
  )
}
