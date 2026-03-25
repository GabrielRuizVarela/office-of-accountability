'use client'

import { useLanguage } from '@/lib/language-context'
import { ACTORS } from '@/lib/caso-monopolios/investigation-data'

const SECTOR_COLORS: Record<string, string> = {
  telecom: '#3b82f6',
  energy: '#f59e0b',
  food: '#10b981',
  media: '#a855f7',
  banking: '#06b6d4',
  mining: '#ef4444',
  agroexport: '#84cc16',
  construction: '#f97316',
  pharma: '#ec4899',
  transport: '#6366f1',
  cross_sector: '#71717a',
  regulatory_capture: '#dc2626',
}

const SECTOR_LABELS: Record<string, Record<'es' | 'en', string>> = {
  telecom: { es: 'Telecomunicaciones', en: 'Telecom' },
  energy: { es: 'Energia', en: 'Energy' },
  food: { es: 'Alimentos', en: 'Food' },
  media: { es: 'Medios', en: 'Media' },
  banking: { es: 'Banca', en: 'Banking' },
  mining: { es: 'Mineria', en: 'Mining' },
  agroexport: { es: 'Agroexportacion', en: 'Agro-export' },
  construction: { es: 'Construccion', en: 'Construction' },
  pharma: { es: 'Farmaceutica', en: 'Pharma' },
  transport: { es: 'Transporte', en: 'Transport' },
  cross_sector: { es: 'Multi-sector', en: 'Cross-sector' },
  regulatory_capture: { es: 'Regulatoria', en: 'Regulatory' },
}

export default function ActoresPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-100">
        {lang === 'es' ? 'Actores Clave' : 'Key Actors'}
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        {ACTORS.length} {lang === 'es'
          ? 'familias y grupos monopolicos perfilados con empresas, entidades offshore y control sectorial.'
          : 'monopoly families and groups profiled with companies, offshore entities, and sector control.'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ACTORS.map((actor) => (
          <div key={actor.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            {/* Name as link if source_url exists */}
            {actor.source_url ? (
              <a
                href={actor.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-zinc-100 underline decoration-zinc-700 hover:text-amber-400 hover:decoration-amber-400/50"
              >
                {actor.name} ↗
              </a>
            ) : (
              <h3 className="text-base font-bold text-zinc-100">{actor.name}</h3>
            )}
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {lang === 'es' ? actor.role_es : actor.role_en}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              {lang === 'es' ? actor.description_es : actor.description_en}
            </p>

            {/* Stats row */}
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="rounded bg-zinc-800/60 px-2 py-1">
                <span className="text-sm font-bold text-zinc-200">{actor.companies_count}</span>
                <span className="ml-1 text-[10px] text-zinc-500">
                  {lang === 'es' ? 'empresas' : 'companies'}
                </span>
              </div>
              {actor.offshore_count > 0 && (
                <div className="rounded bg-red-500/10 px-2 py-1">
                  <span className="text-sm font-bold text-red-400">{actor.offshore_count}</span>
                  <span className="ml-1 text-[10px] text-red-400/70">offshore</span>
                </div>
              )}
            </div>

            {/* Sector tags as links to conexiones */}
            <div className="mt-3 flex flex-wrap gap-1">
              {actor.sectors.map((s) => (
                <a
                  key={s}
                  href="/caso/monopolios/conexiones"
                  className="rounded px-1.5 py-0.5 text-[9px] font-medium transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: (SECTOR_COLORS[s] ?? '#71717a') + '22',
                    color: SECTOR_COLORS[s] ?? '#71717a',
                  }}
                >
                  {SECTOR_LABELS[s]?.[lang] ?? s}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
