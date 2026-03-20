/**
 * Caso Epstein — Evidencia (documents/evidence page).
 *
 * Grid of document cards built from EVIDENCE_DOCS in investigation-data.ts.
 * Uses _es fields for Spanish content. Each card links to source_url.
 */

import Link from 'next/link'

import {
  EVIDENCE_DOCS,
  type VerificationStatus,
} from '@/lib/caso-epstein/investigation-data'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EvidenciaPage() {
  // Sort evidence docs by date descending (most recent first)
  const sortedDocs = [...EVIDENCE_DOCS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const verifiedCount = EVIDENCE_DOCS.filter(
    (d) => d.verification_status === 'verified',
  ).length

  return (
    <div className="space-y-12 pb-16">
      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* --------------------------------------------------------------- */}
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Documentos y evidencia
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Caso Epstein: Base de evidencia
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
          {EVIDENCE_DOCS.length} documentos clave de la investigacion. {verifiedCount}{' '}
          verificados contra fuentes primarias. Documentos judiciales, publicaciones del DOJ,
          informes del Congreso y periodismo investigativo.
        </p>
      </header>

      {/* --------------------------------------------------------------- */}
      {/* Stats bar                                                        */}
      {/* --------------------------------------------------------------- */}
      <div className="flex flex-wrap justify-center gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-red-400">{EVIDENCE_DOCS.length}</p>
          <p className="text-xs text-zinc-500">Documentos</p>
        </div>
        <div className="h-10 w-px bg-zinc-800" />
        <div>
          <p className="text-2xl font-bold text-emerald-400">{verifiedCount}</p>
          <p className="text-xs text-zinc-500">Verificados</p>
        </div>
        <div className="h-10 w-px bg-zinc-800" />
        <div>
          <p className="text-2xl font-bold text-amber-400">
            {EVIDENCE_DOCS.length - verifiedCount}
          </p>
          <p className="text-xs text-zinc-500">Parcialmente verificados</p>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Document grid                                                    */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedDocs.map((doc) => {
          const vBadge = VERIFICATION_BADGE[doc.verification_status]
          return (
            <a
              key={doc.id}
              href={doc.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-red-600/40 hover:bg-zinc-900/60"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="flex-1 text-sm font-semibold text-zinc-100 group-hover:text-red-300">
                  {doc.title}
                </h3>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${vBadge.cls}`}
                >
                  {vBadge.label}
                </span>
              </div>

              {/* Meta */}
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                <span className="rounded bg-zinc-800/60 px-2 py-0.5 font-medium">
                  {doc.type_es}
                </span>
                <span>
                  {new Date(doc.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Summary */}
              <p className="mt-3 flex-1 text-xs leading-relaxed text-zinc-400">
                {doc.summary_es}
              </p>

              {/* Link hint */}
              <p className="mt-3 text-xs text-red-400/60 group-hover:text-red-400">
                Ver documento fuente &rarr;
              </p>
            </a>
          )
        })}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Note about Neo4j docs                                            */}
      {/* --------------------------------------------------------------- */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-200">
          Documentos adicionales en el grafo
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          El grafo de conocimiento de la investigacion contiene mas de 1.000 documentos
          adicionales indexados desde fuentes judiciales y gubernamentales. Los documentos
          mostrados aqui son los mas relevantes seleccionados para la narrativa de la
          investigacion. Para explorar el catalogo completo, visite el{' '}
          <Link
            href="/caso/caso-epstein/grafo"
            className="text-red-400 underline decoration-red-400/30 hover:text-red-300"
          >
            explorador del grafo
          </Link>
          .
        </p>
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
          Cronologia
        </Link>
        <Link
          href="/caso/caso-epstein/investigacion"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          Investigacion
        </Link>
      </nav>
    </div>
  )
}
