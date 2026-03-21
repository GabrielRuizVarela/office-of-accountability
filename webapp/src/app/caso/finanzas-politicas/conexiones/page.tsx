'use client'

import { useLanguage } from '@/lib/language-context'
import { ConexionesGraph } from './ConexionesGraph'

const t = {
  title: { en: 'Connections', es: 'Conexiones' },
  subtitle: {
    en: 'Interactive graph with 133 nodes and 142 relationships. Filter by Revolving Door, Offshore Network, Money Trail, or Power Families.',
    es: 'Grafo interactivo con 133 nodos y 142 relaciones. Filtre por Puerta Giratoria, Red Offshore, Rastro del Dinero o Familias del Poder.',
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
