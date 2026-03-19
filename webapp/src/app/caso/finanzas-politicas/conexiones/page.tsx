import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conexiones',
  description:
    'Grafo interactivo de conexiones entre politicos, empresas, entidades offshore y contratos.',
}

export default function ConexionesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">Conexiones</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Grafo interactivo de relaciones entre politicos, empresas, entidades
        offshore y contratos del Estado.
      </p>

      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-8 py-20">
        <div className="mb-4 text-4xl text-zinc-700">
          <svg
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <circle cx="5" cy="5" r="2" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="12" cy="19" r="2" />
            <line x1="7" y1="5" x2="17" y2="5" />
            <line x1="6" y1="7" x2="11" y2="17" />
            <line x1="18" y1="7" x2="13" y2="17" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-300">Proximamente</h2>
        <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
          La visualizacion interactiva del grafo de conexiones esta en
          desarrollo. El grafo contiene 113.283 nodos y 975.909 relaciones
          cruzando 8 fuentes de datos.
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          Mientras tanto, explora los hallazgos en las otras secciones:
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/caso/finanzas-politicas/investigacion"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            Investigacion
          </Link>
          <Link
            href="/caso/finanzas-politicas/dinero"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            El Dinero
          </Link>
        </div>
      </div>
    </div>
  )
}
