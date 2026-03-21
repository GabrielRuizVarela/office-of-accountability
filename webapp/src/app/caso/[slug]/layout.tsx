import type { Metadata } from 'next'

import { LanguageProvider, type Lang } from '@/lib/language-context'
import { detectLang, type BilingualText } from '@/lib/i18n'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

interface CaseMeta {
  readonly title: BilingualText
  readonly description: BilingualText
  readonly defaultLang: Lang
}

const CASE_META: Readonly<Record<string, CaseMeta>> = {
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
      es: 'Red de trafico y poder. 7,287 entidades, documentos judiciales, registros de vuelo y verificacion de datos.',
      en: 'Trafficking and power network. 7,287 entities, court documents, flight records, and factchecking.',
    },
    defaultLang: 'en',
  },
}

const FALLBACK_TITLE: BilingualText = {
  es: 'Investigacion — Oficina de Rendicion de Cuentas',
  en: 'Investigation — Office of Accountability',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = CASE_META[slug]
  const lang = meta ? await detectLang(meta.defaultLang) : await detectLang()

  return {
    title: meta?.title[lang] ?? FALLBACK_TITLE[lang],
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
