import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: 'Epstein Case — Office of Accountability',
  description:
    'Trafficking and power network. 7,276 entities, court documents, flight records, and factchecking.',
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
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </>
  )
}
