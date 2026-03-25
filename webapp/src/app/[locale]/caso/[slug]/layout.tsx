import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.cases' })

  const fallbackTitle = locale === 'es'
    ? 'Investigacion — Oficina de Rendicion de Cuentas'
    : 'Investigation — Office of Accountability'

  let title: string
  try {
    title = t(`${slug}.title`)
    // next-intl returns the key path if not found — detect that
    if (title === `${slug}.title`) title = fallbackTitle
  } catch {
    title = fallbackTitle
  }

  let description: string | undefined
  try {
    const desc = t(`${slug}.description`)
    description = desc === `${slug}.description` ? undefined : desc
  } catch {
    description = undefined
  }

  return {
    title,
    description,
    alternates: {
      languages: {
        es: `/es/caso/${slug}`,
        en: `/en/caso/${slug}`,
      },
    },
  }
}

export default async function CasoLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params

  return (
    <>
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </>
  )
}
