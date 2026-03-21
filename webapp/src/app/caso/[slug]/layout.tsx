import type { Metadata } from 'next'

import { LanguageProvider, type Lang } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'
import { DynamicHtmlLang, BilingualDocTitle } from '@/components/layout/DynamicTitle'

const CASE_META: Readonly<
  Record<string, { title: Record<Lang, string>; description: Record<Lang, string>; defaultLang: Lang }>
> = {
  'caso-libra': {
    title: {
      es: 'Caso Libra — Oficina de Rendicion de Cuentas',
      en: 'Libra Case — Office of Accountability',
    },
    description: {
      es: 'Investigacion comunitaria sobre el token $LIBRA promovido por el presidente Milei. Datos publicos, blockchain, y documentos parlamentarios.',
      en: 'Community investigation into the $LIBRA token promoted by President Milei. Public data, blockchain, and parliamentary documents.',
    },
    defaultLang: 'es',
  },
  'caso-epstein': {
    title: {
      es: 'Caso Epstein — Oficina de Rendicion de Cuentas',
      en: 'Epstein Case — Office of Accountability',
    },
    description: {
      es: 'Red de trafico y poder. 7,287 entidades, documentos judiciales, registros de vuelos y verificacion de hechos.',
      en: 'Trafficking and power network. 7,287 entities, court documents, flight records, and factchecking.',
    },
    defaultLang: 'en',
  },
  'finanzas-politicas': {
    title: {
      es: 'Finanzas Politicas Argentinas',
      en: 'Argentine Political Finance',
    },
    description: {
      es: 'Investigacion sobre conexiones entre poder politico y dinero en Argentina. 617 politicos en 2+ datasets, 8 fuentes cruzadas.',
      en: 'Investigation into connections between political power and money in Argentina. 617 politicians in 2+ datasets, 8 cross-referenced sources.',
    },
    defaultLang: 'es',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = CASE_META[slug]
  const lang = meta?.defaultLang ?? 'es'

  return {
    title: meta?.title[lang] ?? 'Investigacion — Oficina de Rendicion de Cuentas',
    description: meta?.description[lang],
  }
}

export default async function CasoLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const defaultLang = CASE_META[slug]?.defaultLang ?? 'es'

  return (
    <LanguageProvider defaultLang={defaultLang}>
      <DynamicHtmlLang />
      <BilingualDocTitle titles={CASE_META[slug]?.title} />
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </LanguageProvider>
  )
}
