'use client'

import { createTranslator } from '@/i18n/messages'
import { useLanguage } from '@/lib/language-context'
import { roadmapPhases } from '@/config/roadmap'

const VISION_KEYS = ['platform', 'collaboration', 'consensus'] as const

const STATUS_DOT: Record<string, string> = {
  completed: 'bg-emerald-500',
  'in-progress': 'bg-purple-500',
  next: 'bg-amber-500',
  future: 'bg-zinc-600',
}

const STATUS_TEXT: Record<string, string> = {
  completed: 'text-emerald-400',
  'in-progress': 'text-purple-400',
  next: 'text-amber-400',
  future: 'text-zinc-500',
}

export function WhatsNext() {
  const { lang } = useLanguage()
  const t = createTranslator('whatsNext', lang)

  return (
    <section className="mx-auto max-w-xl border-t-[3px] border-double border-zinc-600 px-4 py-14 text-center">
      <p className="mb-6 text-zinc-600">· · ·</p>
      <h2 className="font-serif text-2xl font-bold text-zinc-50">{t('title')}</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
        {t('description')}
      </p>

      {/* Vision items */}
      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 text-left">
        {VISION_KEYS.map((key) => (
          <div key={key} className="flex items-baseline gap-2.5 text-[13px] text-zinc-300">
            <span className="text-zinc-600">→</span>
            <span>
              <strong className="text-zinc-50">{t(`${key}.title`)}</strong>
              {' — '}
              {t(`${key}.description`)}
            </span>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <h3 className="mt-12 font-serif text-lg font-bold text-zinc-50">{t('roadmapTitle')}</h3>
      <div className="mx-auto mt-6 flex max-w-md flex-col gap-4 text-left">
        {roadmapPhases.map((phase) => (
          <div key={phase.id} className="flex gap-3">
            <div className="mt-1.5 flex flex-col items-center">
              <div className={`h-2 w-2 rounded-full ${STATUS_DOT[phase.status] ?? 'bg-zinc-600'}`} />
              <div className="mt-1 h-full w-px bg-zinc-800" />
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-zinc-200">{phase.title}</span>
                <span className={`text-[10px] tracking-wider uppercase ${STATUS_TEXT[phase.status] ?? 'text-zinc-500'}`}>
                  {phase.statusLabel}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{phase.goal}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
