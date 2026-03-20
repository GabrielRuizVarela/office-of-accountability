import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { LegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: 'Caso Epstein — Oficina de Rendicion de Cuentas',
  description:
    'Red de trafico y poder. 7,287 entidades, documentos judiciales, registros de vuelo y verificacion de hechos.',
}

export default function CasoEpsteinLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <>
      <InvestigationNav slug="caso-epstein" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <LegalDisclaimer />
        </div>
      </main>
    </>
  )
}
