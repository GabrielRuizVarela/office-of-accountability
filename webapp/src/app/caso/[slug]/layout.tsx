import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { detectLang } from '@/lib/i18n'
import { LanguageProvider, type Lang } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'
import { getClientConfigDynamic } from '@/lib/investigations/registry'

const CASE_META: Readonly<
  Record<string, { defaultLang: Lang; es: { title: string; description: string }; en: { title: string; description: string } }>
> = {
  'caso-libra': {
    defaultLang: 'es',
    es: {
      title: 'Caso Libra — Oficina de Rendición de Cuentas',
      description:
        'Investigación comunitaria sobre el token $LIBRA promovido por el presidente Milei. Datos públicos, blockchain y documentos parlamentarios.',
    },
    en: {
      title: 'Libra Case — Office of Accountability',
      description:
        'Community investigation into the $LIBRA token promoted by President Milei. Public data, blockchain, and parliamentary documents.',
    },
  },
  'caso-epstein': {
    defaultLang: 'en',
    en: {
      title: 'Epstein Case — Office of Accountability',
      description:
        'Trafficking and power network. 7,287 entities, court documents, flight records, and factchecking.',
    },
    es: {
      title: 'Caso Epstein — Oficina de Rendición de Cuentas',
      description:
        'Red de tráfico y poder. 7.287 entidades, documentos judiciales, registros de vuelos y verificación de datos.',
    },
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const caseMeta = CASE_META[slug]

  const h = await headers()
  const lang = detectLang(h.get('accept-language'))

  if (caseMeta) {
    const meta = caseMeta[lang] ?? caseMeta[caseMeta.defaultLang]
    return {
      title: meta.title,
      description: meta.description,
    }
  }

  // Fallback: try dynamic registry (Neo4j-backed investigations)
  const dynamicConfig = await getClientConfigDynamic(slug)
  if (dynamicConfig) {
    return {
      title: `${dynamicConfig.name[lang]} — Oficina de Rendición de Cuentas`,
      description: dynamicConfig.description[lang] || undefined,
    }
  }

  return { title: 'Investigación — Oficina de Rendición de Cuentas' }
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
