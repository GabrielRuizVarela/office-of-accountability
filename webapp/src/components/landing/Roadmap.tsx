'use client'

import { useTranslations } from 'next-intl'
import { roadmapPhases } from '@/config/roadmap'

const STATUS_STYLES: Record<string, { badge: string; line: string }> = {
  completed: { badge: 'bg-emerald-500/20 text-emerald-400', line: 'bg-emerald-500' },
  'in-progress': { badge: 'bg-purple-500/20 text-purple-400', line: 'bg-purple-500' },
  next: { badge: 'bg-amber-500/20 text-amber-400', line: 'bg-amber-500/40' },
  future: { badge: 'bg-zinc-700/50 text-zinc-500', line: 'bg-zinc-700' },
}

const DEFAULT_STATUS = STATUS_STYLES['future']

export function Roadmap() {
  const t = useTranslations('roadmap')
  const tPhases = useTranslations('roadmapPhases')

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>
      <div className="space-y-6">
        {roadmapPhases.map((phase) => {
          const styles = STATUS_STYLES[phase.status] ?? DEFAULT_STATUS
          return (
            <div
              key={phase.id}
              className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block h-2 w-2 rounded-full ${styles.line}`} />
                    <h3 className="text-base font-bold text-zinc-100">{tPhases(`${phase.id}.title`)}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}
                    >
                      {tPhases(`${phase.id}.statusLabel`)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{tPhases(`${phase.id}.goal`)}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-1.5 text-xs text-zinc-500 sm:grid-cols-2">
                {Array.from({ length: phase.featureCount }, (_, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-zinc-600">—</span>
                    {tPhases(`${phase.id}.features.${i}`)}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
