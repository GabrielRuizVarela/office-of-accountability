import Link from 'next/link'
import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { LegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: 'Caso Libra — Oficina de Rendicion de Cuentas',
  description:
    'Investigacion comunitaria sobre el token $LIBRA promovido por el presidente Milei. Datos publicos, blockchain, y documentos parlamentarios.',
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
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold text-zinc-50">
              ORC
            </Link>
            <span className="text-zinc-700">/</span>
            <Link
              href={`/caso/${slug}`}
              className="text-sm font-medium text-zinc-300 hover:text-zinc-100"
            >
              Caso Libra
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-zinc-400 hover:text-zinc-100">
              Inicio
            </Link>
            <Link href="/explorar" className="text-zinc-400 hover:text-zinc-100">
              Explorar
            </Link>
          </nav>
        </div>
        <InvestigationNav slug={slug} />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      {/* Footer with legal disclaimer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
          <LegalDisclaimer />
          <p className="text-center text-xs text-zinc-600">
            Oficina de Rendicion de Cuentas — Datos abiertos para la democracia argentina
          </p>
        </div>
      </footer>
    </div>
  )
}
