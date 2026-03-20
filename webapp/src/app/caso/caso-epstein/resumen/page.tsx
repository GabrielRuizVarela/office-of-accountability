/**
 * Caso Epstein — Resumen (narrative overview).
 *
 * Structured summary built from FACTCHECK_ITEMS and TIMELINE_EVENTS
 * in @/lib/caso-epstein/investigation-data. Spanish-first, bilingual data.
 */

import Link from 'next/link'

import {
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  IMPACT_STATS,
  type FactcheckStatus,
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

function StatusBadge({ status }: { readonly status: FactcheckStatus }) {
  const { label, cls } = STATUS_BADGE[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  // Show the first 12 key factcheck items for the summary
  const keyFacts = FACTCHECK_ITEMS.slice(0, 12)

  // Show the most significant timeline events (a curated subset)
  const keyEvents = TIMELINE_EVENTS.filter((e) =>
    [
      'te-wexner-hires',
      'te-npa-plea',
      'te-perversion-justice',
      'te-epstein-arrested',
      'te-epstein-death',
      'te-maxwell-convicted',
      'te-brunel-death',
      'te-documents-unsealed',
      'te-transparency-act',
      'te-doj-phase2',
      'te-andrew-arrested',
      'te-congress-subpoena-bondi',
    ].includes(e.id),
  )

  return (
    <article className="space-y-12 pb-16">
      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* --------------------------------------------------------------- */}
      <header className="border-b border-zinc-800 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Resumen de la investigacion
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Caso Epstein: Red de trafico y poder
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          Jeffrey Epstein construyo una red global de trafico sexual financiada con miles de
          millones de dolares, protegida por un acuerdo federal secreto durante 11 anos, y
          conectada con figuras del poder politico, financiero y judicial en al menos tres
          continentes. Esta es la historia documentada con fuentes judiciales, registros de
          vuelo, y 72 verificaciones de hechos.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/caso/caso-epstein/investigacion"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Ver investigacion completa
          </Link>
          <Link
            href="/caso/caso-epstein/cronologia"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            Cronologia
          </Link>
        </div>
      </header>

      {/* --------------------------------------------------------------- */}
      {/* Impact stats                                                     */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-bold text-zinc-50">La investigacion en numeros</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {IMPACT_STATS.slice(0, 8).map((stat) => (
            <div
              key={stat.label_es}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-red-400">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{stat.label_es}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Key verified facts                                               */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Hechos verificados clave
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          72 afirmaciones verificadas contra fuentes judiciales, parlamentarias y periodisticas.
        </p>
        <div className="mt-6 space-y-4">
          {keyFacts.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="flex-1 text-sm leading-relaxed text-zinc-200">
                  {item.claim_es}
                </p>
                <StatusBadge status={item.status} />
              </div>
              {item.detail_es && (
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  {item.detail_es}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-zinc-600">Fuente:</span>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-400/80 underline decoration-red-400/20 hover:text-red-300"
                >
                  {item.source}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/caso/caso-epstein/investigacion"
            className="text-sm text-red-400 hover:text-red-300"
          >
            Ver los 72 hechos verificados &rarr;
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Simplified timeline                                              */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          Cronologia simplificada
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Los hitos mas importantes del caso, desde 1987 hasta marzo de 2026.
        </p>
        <div className="relative mt-6 ml-4 border-l-2 border-zinc-800 pl-6">
          {keyEvents.map((event) => (
            <div key={event.id} className="relative mb-8 last:mb-0">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-red-500 bg-zinc-950" />

              <time className="text-xs font-medium text-zinc-500">
                {new Date(event.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                {event.title_es}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {event.description_es}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/caso/caso-epstein/cronologia"
            className="text-sm text-red-400 hover:text-red-300"
          >
            Ver cronologia completa &rarr;
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Narrative sections                                               */}
      {/* --------------------------------------------------------------- */}
      <section className="space-y-8">
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          La historia
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              El origen: Wexner y el poder notarial
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              En 1987, Leslie Wexner — fundador de L Brands y una de las personas mas ricas
              de Estados Unidos — contrato a un oscuro ex profesor de matematicas llamado
              Jeffrey Epstein como su gestor financiero personal. En 1991, Wexner otorgo a
              Epstein poder notarial completo sobre sus finanzas. Durante los siguientes 11
              anos, aproximadamente $1.000 millones fueron transferidos a Epstein. Con ese
              dinero, Epstein adquirio las propiedades que se convirtieron en la
              infraestructura de su operacion: la mansion en Manhattan, la isla Little St.
              James, y la residencia en Palm Beach.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              El escudo: 11 anos de impunidad
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Cuando la policia de Palm Beach comenzo a investigar en 2005, el fiscal federal
              Alexander Acosta nego extraordinario acuerdo: Epstein se declaro culpable de
              cargos estatales menores, cumplio 13 meses con permiso de trabajo, y todos los
              cargos federales fueron retirados — tanto para Epstein como para sus
              coconspiradoras no nombradas. Las victimas ni siquiera fueron notificadas.
              Acosta supuestamente dijo al equipo de transicion de Trump que Epstein
              &ldquo;pertenecia a inteligencia&rdquo; y que el asunto estaba &ldquo;por encima
              de su nivel salarial.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              La ruptura del silencio
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              En noviembre de 2018, Julie K. Brown publico &ldquo;Perversion of Justice&rdquo;
              en el Miami Herald, identificando cerca de 80 victimas y exponiendo la mecanica
              del acuerdo de 2008. En julio de 2019, Epstein fue arrestado en el aeropuerto de
              Teterboro. Treinta y cinco dias despues, fue encontrado muerto en su celda — los
              guardias dormian, las camaras fallaron, y habia sido retirado de vigilancia
              antisuicidio dias antes. En 2021, Ghislaine Maxwell fue condenada por 5 de 6
              cargos. En febrero de 2022, Jean-Luc Brunel — otro testigo clave — fue encontrado
              muerto en su celda de prision en Paris.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              La cascada de 2025-2026
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              La Ley de Transparencia de los Archivos Epstein fue promulgada en noviembre de
              2025, obligando al DOJ a publicar todos los registros no clasificados. Las tres
              fases de publicacion — 6 millones de paginas, 2.000 videos, 180.000 imagenes —
              desencadenaron una cascada sin precedentes: el Principe Andrew arrestado, Peter
              Mandelson arrestado, Thorbjorn Jagland imputado, al menos 9 dimisiones
              corporativas, y el Congreso citando a la Fiscal General por presunto ocultamiento
              de archivos.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      {/* Disclaimer                                                       */}
      {/* --------------------------------------------------------------- */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          Esta investigacion se basa en fuentes publicas verificadas, incluyendo documentos
          judiciales, registros de vuelo, informes parlamentarios, analisis de grafos de
          conocimiento y periodismo de investigacion. No constituye asesoramiento legal. La
          inclusion de una persona no implica culpabilidad. Donde se indica
          &ldquo;alegado&rdquo; o &ldquo;en investigacion,&rdquo; la afirmacion no ha sido
          confirmada de forma independiente.
        </p>
      </section>
    </article>
  )
}
