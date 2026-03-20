import type { Metadata } from 'next'
import Link from 'next/link'

import {
  IMPACT_STATS,
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
} from '@/lib/caso-finanzas-politicas/investigation-data'

export const metadata: Metadata = {
  title: 'Finanzas Politicas Argentinas',
  description:
    'Investigacion sobre conexiones entre poder politico y dinero en Argentina. 617 politicos en 2+ datasets, 9 fuentes cruzadas, 2.16M nodos.',
}

const BASE_PATH = '/caso/finanzas-politicas'

export default function FinanzasPoliticasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
          Investigacion de datos abiertos — Oficina de Rendicion de Cuentas
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          Finanzas Politicas Argentinas
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Investigacion sobre conexiones entre poder politico y dinero.
          Cruce de ocho fuentes de datos publicos para identificar politicos
          con entidades offshore no declaradas, contratistas que donaron
          ilegalmente a campanas, y flujos de dinero entre fondos publicos
          y estructuras opacas.
        </p>
      </section>

      {/* Key Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {IMPACT_STATS.map((stat) => (
          <div
            key={stat.value}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
          >
            <p className="text-2xl font-bold text-zinc-50 sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-zinc-400">{stat.label_es}</p>
            <p className="mt-0.5 text-xs text-zinc-600">{stat.source}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-50">
          Resumen Ejecutivo
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          Esta investigacion cruzo ocho fuentes de datos publicos — registros de
          votacion legislativa (Como Voto), filtraciones offshore (ICIJ Panama
          Papers y Pandora Papers), declaraciones de aportes de campana (CNE),
          nombramientos y contratos del Boletin Oficial, el registro societario
          de la IGJ, directores de empresas (CNV/IGJ), declaraciones juradas
          patrimoniales (DDJJ), y un proceso de enriquecimiento cruzado — para
          identificar patrones de opacidad financiera en la politica argentina.
        </p>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          Los hallazgos mas graves involucran a legisladores en ejercicio con
          entidades offshore activas no declaradas, contratistas del Estado que
          donaron ilegalmente a campanas electorales, y el caso Macri que
          aparece en{' '}
          <strong className="text-zinc-100">cinco datasets simultaneamente</strong>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>{FACTCHECK_ITEMS.length} afirmaciones verificadas</span>
          <span>·</span>
          <span>{TIMELINE_EVENTS.length} eventos documentados</span>
          <span>·</span>
          <span>{ACTORS.length} actores clave</span>
        </div>
      </section>

      {/* CTAs */}
      <section className="mb-6">
        <Link
          href={`${BASE_PATH}/investigacion`}
          className="block rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          <h3 className="text-lg font-bold text-blue-200">
            Investigacion verificada
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {FACTCHECK_ITEMS.length} afirmaciones verificadas contra fuentes
            publicas, organizadas por severidad. Offshore, contratistas, y
            flujos de dinero.
          </p>
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EntryPoint
          href={`${BASE_PATH}/cronologia`}
          title="Cronologia"
          description="Linea de tiempo desde la fundacion de SOCMA (1976) hasta la denuncia penal de Mariano Macri (2024)."
          color="#f59e0b"
        />
        <EntryPoint
          href={`${BASE_PATH}/dinero`}
          title="El Dinero"
          description="Rastreo de flujos financieros: deuda del Correo, blanqueo SOCMA, transferencias a Suiza, donaciones de campana."
          color="#10b981"
        />
        <EntryPoint
          href={`${BASE_PATH}/conexiones`}
          title="Conexiones"
          description="Grafo interactivo de relaciones entre politicos, empresas, entidades offshore y contratos (proximo)."
          color="#8b5cf6"
        />
        <EntryPoint
          href={`${BASE_PATH}/investigacion`}
          title="Actores Clave"
          description={`${ACTORS.length} personas y organizaciones con presencia en multiples datasets.`}
          color="#ef4444"
        />
      </section>
    </div>
  )
}

function EntryPoint({
  href,
  title,
  description,
  color,
}: {
  readonly href: string
  readonly title: string
  readonly description: string
  readonly color: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
    >
      <div
        className="mb-2 h-1 w-8 rounded-full"
        style={{ backgroundColor: color }}
      />
      <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-blue-400">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </Link>
  )
}
