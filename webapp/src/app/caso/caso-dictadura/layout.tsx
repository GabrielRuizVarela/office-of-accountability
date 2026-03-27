import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: {
    template: '%s | Caso Dictadura — Oficina de Rendicion de Cuentas',
    default: 'Caso Dictadura 1976-1983 — Oficina de Rendicion de Cuentas',
  },
  description:
    'Dictadura militar argentina 1976-1983. 14,512 nodos, 31,607 relaciones. 9,415 victimas, 774 CCDs, 54 brechas de rendicion de cuentas. Documentos SIDE desclasificados 2026.',
  openGraph: {
    type: 'website',
    siteName: 'Oficina de Rendicion de Cuentas',
  },
}

export default function CasoDictaduraLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <InvestigationNav slug="caso-dictadura" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </div>
  )
}
