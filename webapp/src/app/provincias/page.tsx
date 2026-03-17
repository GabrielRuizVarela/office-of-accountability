/**
 * Province index page — lists all Argentine provinces with politician counts.
 *
 * Server-rendered at /provincias for province-first browsing.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { getAllProvinces } from '@/lib/graph'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Provincias — Legisladores por provincia | ORC',
  description:
    'Explorar legisladores argentinos por provincia. Ver diputados y senadores de cada jurisdicción.',
  openGraph: {
    title: 'Provincias — Legisladores por provincia | ORC',
    description:
      'Explorar legisladores argentinos por provincia. Ver diputados y senadores de cada jurisdicción.',
    type: 'website',
    url: '/provincias',
    siteName: 'Oficina de Rendición de Cuentas',
  },
  alternates: {
    canonical: '/provincias',
  },
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ProvinciasPage() {
  const provinces = await getAllProvinces()

  const totalPoliticians = provinces.reduce((sum, p) => sum + p.politicianCount, 0)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="transition-colors hover:text-zinc-300">
              ORC
            </Link>
            <span>/</span>
            <span className="text-zinc-300">Provincias</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-zinc-50">Provincias</h1>
        <p className="mt-2 text-zinc-400">
          {totalPoliticians} legisladores en {provinces.length} jurisdicciones
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {provinces.map((province) => (
            <Link
              key={province.id}
              href={`/provincias/${province.id}`}
              className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
            >
              <span className="font-medium text-zinc-100 group-hover:text-white">
                {province.name}
              </span>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-sm text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300">
                {province.politicianCount}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
