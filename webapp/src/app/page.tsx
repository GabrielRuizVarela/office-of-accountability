import { headers } from 'next/headers'
import Link from 'next/link'

import { createTranslator } from '@/i18n/messages'
import { detectLang } from '@/lib/i18n'

import { Hero } from '@/components/landing/Hero'
import { InvestigationCard } from '@/components/landing/InvestigationCard'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { Roadmap } from '@/components/landing/Roadmap'
import { investigations } from '@/config/investigations'

const NEW_INVESTIGATION_LABEL: Record<'es' | 'en', string> = {
  es: 'Nueva Investigacion',
  en: 'New Investigation',
}

export default async function Home() {
  const headersList = await headers()
  const lang = detectLang(headersList.get('accept-language'))

  const t = createTranslator('investigations')
  const activeInvestigations = investigations.filter((i) => i.status === 'active')

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>
          <Link
            href="/nuevo"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            {NEW_INVESTIGATION_LABEL[lang]}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeInvestigations.map((config) => (
            <InvestigationCard key={config.slug} config={config} />
          ))}
        </div>
      </section>

      <FeatureShowcase />

      <Roadmap />
    </>
  )
}
