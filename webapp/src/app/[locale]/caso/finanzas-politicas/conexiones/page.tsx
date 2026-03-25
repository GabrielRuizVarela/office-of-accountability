'use client'

import { useLanguage } from '@/lib/language-context'
import { ConexionesGraph } from './ConexionesGraph'

const t = {
  title: { en: 'Connections', es: 'Conexiones' },
  subtitle: {
    en: '34,776 cross-matched entities across 9 datasets. 2,155 revolving door cases, 146 shell companies, 29,602 linked asset declarations. Filter by Revolving Door, Offshore Network, Money Trail, or Power Families.',
    es: '34.776 entidades cruzadas entre 9 datasets. 2.155 casos de puerta giratoria, 146 empresas fantasma, 29.602 declaraciones juradas vinculadas. Filtre por Puerta Giratoria, Red Offshore, Rastro del Dinero o Familias del Poder.',
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
