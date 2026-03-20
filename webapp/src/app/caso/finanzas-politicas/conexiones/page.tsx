import type { Metadata } from 'next'

import { ConexionesGraph } from './ConexionesGraph'

export const metadata: Metadata = {
  title: 'Conexiones',
  description:
    'Grafo interactivo de conexiones entre politicos, empresas, entidades offshore y contratos.',
}

export default function ConexionesPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="px-4 py-4">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50">Conexiones</h1>
        <p className="text-sm text-zinc-400">
          Grafo interactivo de relaciones entre politicos, empresas, entidades
          offshore y contratos del Estado. Se muestran los politicos presentes en 3
          o mas fuentes de datos. Hace clic en un nodo para ver detalles.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ConexionesGraph />
      </div>
    </div>
  )
}
