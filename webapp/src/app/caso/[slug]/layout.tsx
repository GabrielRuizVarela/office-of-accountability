import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { LegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

const CASE_META: Readonly<Record<string, { title: string; description: string }>> = {
  'caso-libra': {
    title: 'Caso Libra — Oficina de Rendicion de Cuentas',
    description:
      'Investigacion comunitaria sobre el token $LIBRA promovido por el presidente Milei. Datos publicos, blockchain, y documentos parlamentarios.',
  },
  'caso-epstein': {
    title: 'Caso Epstein — Oficina de Rendicion de Cuentas',
    description:
      'Red de trafico y poder. 7,287 entidades, documentos judiciales, registros de vuelo y verificacion de hechos.',
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

  return (
    <>
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <LegalDisclaimer />
        </div>
      </main>
    </>
  )
}
