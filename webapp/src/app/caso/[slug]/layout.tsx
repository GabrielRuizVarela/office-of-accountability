import type { Metadata } from 'next'

import { LanguageProvider, type Lang } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

/**
 * Generic [slug] layout — only used for cases WITHOUT dedicated folders.
 * caso-epstein, finanzas-politicas, and caso-libra each have their own
 * layout.tsx in their dedicated folders, so they bypass this file.
 */
const CASE_META: Readonly<Record<string, { title: string; description: string; defaultLang: Lang }>> = {
  'caso-epstein': {
    title: 'Epstein Case — Office of Accountability',
    description:
      'Trafficking and power network. 7,276 entities, court documents, flight records, and factchecking.',
    defaultLang: 'en',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = CASE_META[slug]

  return {
    title: meta?.title ?? 'Investigacion — Oficina de Rendicion de Cuentas',
    description: meta?.description,
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
