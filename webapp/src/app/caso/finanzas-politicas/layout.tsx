import type { Metadata } from 'next'

import { FinanzasPoliticasNav } from './FinanzasPoliticasNav'

export const metadata: Metadata = {
  title: {
    template: '%s | Finanzas Politicas Argentinas',
    default: 'Finanzas Politicas Argentinas',
  },
  description:
    'Investigacion sobre conexiones entre poder politico y dinero en Argentina. 617 politicos en 2+ datasets, 8 fuentes cruzadas.',
  openGraph: {
    type: 'website',
    siteName: 'Oficina de Rendicion de Cuentas',
  },
}

export default function FinanzasPoliticasLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <FinanzasPoliticasNav />
      <main className="flex-1">
        {children}
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-xs leading-relaxed text-amber-200/70">
            <strong className="text-amber-200">Aviso Legal:</strong> Esta
            investigacion se basa en fuentes publicas verificadas: registros
            legislativos (Como Voto), filtraciones offshore (ICIJ), aportes de
            campana (CNE), nombramientos del Boletin Oficial, registro societario
            (IGJ), y declaraciones juradas patrimoniales. La inclusion no implica
            culpabilidad.
          </div>
        </div>
      </main>
    </div>
  )
}
