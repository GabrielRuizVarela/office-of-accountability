'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { Timeline } from '@/components/investigation/Timeline'
import type { TimelineItem } from '@/lib/caso-libra/types'

const t = {
  title: { es: 'Cronologia', en: 'Timeline' },
  subtitle: {
    default: (count: number): Record<Locale, string> => ({
      es: `${count} eventos desde el lanzamiento del token hasta las investigaciones judiciales.`,
      en: `${count} events from the token launch to the judicial investigations.`,
    }),
    'riesgo-nuclear': (count: number): Record<Locale, string> => ({
      es: `Monitoreo diario de senales de escalada nuclear. ${count} eventos registrados.`,
      en: `Daily monitoring of nuclear escalation signals. ${count} events recorded.`,
    }),
  },
} as const

interface Props {
  readonly events: readonly TimelineItem[]
  readonly slug?: string
}

export function CronologiaContent({ events, slug }: Props) {
  const locale = useLocale() as Locale

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">{t.title[locale]}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {(t.subtitle[slug as keyof typeof t.subtitle] ?? t.subtitle.default)(events.length)[locale]}
        </p>
      </div>
      <Timeline events={events} />
    </div>
  )
}
