'use client'

import { useLanguage } from '@/lib/language-context'
import { ConexionesGraph } from './ConexionesGraph'

const t = {
  title: { en: 'Connections', es: 'Conexiones' },
  subtitle: {
    en: 'Interactive graph of relationships between politicians, companies, offshore entities and government contracts. Showing politicians present in 3 or more data sources. Click a node to see details.',
    es: 'Grafo interactivo de relaciones entre politicos, empresas, entidades offshore y contratos del Estado. Se muestran los politicos presentes en 3 o mas fuentes de datos. Hace clic en un nodo para ver detalles.',
  },
} as const

export default function ConexionesPage() {
  const { lang } = useLanguage()

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="px-4 py-4">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50">{t.title[lang]}</h1>
        <p className="text-sm text-zinc-400">
          {t.subtitle[lang]}
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ConexionesGraph />
      </div>
    </div>
  )
}
