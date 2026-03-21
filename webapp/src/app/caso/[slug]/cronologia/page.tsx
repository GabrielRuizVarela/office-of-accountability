/**
 * Caso Libra timeline page — events ordered chronologically.
 */

import type { Metadata } from 'next'

import { detectLang } from '@/lib/i18n'
import { getTimeline } from '@/lib/caso-libra'

import { CronologiaContent } from './CronologiaContent'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLang()
  return {
    title: lang === 'es' ? 'Cronologia' : 'Timeline',
    description:
      lang === 'es'
        ? 'Linea de tiempo de eventos clave en la investigacion.'
        : 'Timeline of key events in the investigation.',
  }
}

export default async function CronologiaPage() {
  const events = await getTimeline()

  return <CronologiaContent events={events} />
}
