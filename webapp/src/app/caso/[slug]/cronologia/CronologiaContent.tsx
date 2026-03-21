'use client'

import { useLanguage, type Lang } from '@/lib/language-context'
import { Timeline } from '@/components/investigation/Timeline'
import type { TimelineItem } from '@/lib/caso-libra/types'

const t = {
  title: { es: 'Cronologia', en: 'Timeline' },
  subtitle: (count: number): Record<Lang, string> => ({
    es: `${count} eventos desde el lanzamiento del token hasta las investigaciones judiciales.`,
    en: `${count} events from the token launch to the judicial investigations.`,
  }),
} as const

interface Props {
  readonly events: readonly TimelineItem[]
}

export function CronologiaContent({ events }: Props) {
  const { lang } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">{t.title[lang]}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {t.subtitle(events.length)[lang]}
        </p>
      </div>
      <Timeline events={events} />
    </div>
  )
}
