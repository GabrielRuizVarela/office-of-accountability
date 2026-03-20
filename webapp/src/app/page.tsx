import { createTranslator } from '@/i18n/messages'

import { Hero } from '@/components/landing/Hero'
import { InvestigationCard } from '@/components/landing/InvestigationCard'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { Roadmap } from '@/components/landing/Roadmap'
import { GraphShowcase } from '@/components/graph/GraphShowcase'
import { investigations } from '@/config/investigations'

export default function Home() {
  const t = createTranslator('investigations')
  const activeInvestigations = investigations.filter((i) => i.status === 'active')

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <GraphShowcase
          variant="full"
          heading="Relaciones reales del grafo"
          ctaHref="/explorar"
          ctaLabel="Explorar el grafo completo"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>
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
