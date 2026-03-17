/**
 * Province page — lists all politicians representing a given province.
 *
 * Server-rendered at /provincias/[province] (province slug, e.g. "buenos-aires").
 */

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPoliticiansByProvince } from '@/lib/graph'
import type { PoliticianSummary } from '@/lib/graph'

// ---------------------------------------------------------------------------
// Slug validation
// ---------------------------------------------------------------------------

/** Province slugs: lowercase alphanumeric + hyphens, 1-100 chars */
const PROVINCE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function isValidProvinceSlug(slug: string): boolean {
  return slug.length >= 1 && slug.length <= 100 && PROVINCE_SLUG_RE.test(slug)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  readonly params: Promise<{ province: string }>
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { province: provinceSlug } = await params

  if (!isValidProvinceSlug(provinceSlug)) {
    return { title: 'Provincia no encontrada' }
  }

  const data = await getPoliticiansByProvince(provinceSlug)

  if (!data) {
    return { title: 'Provincia no encontrada' }
  }

  const title = `Legisladores de ${data.province.name} | ORC`
  const description = `${data.province.politicianCount} legisladores de ${data.province.name} — votaciones, perfiles y conexiones.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/provincias/${provinceSlug}`,
      siteName: 'Oficina de Rendición de Cuentas',
    },
    alternates: {
      canonical: `/provincias/${provinceSlug}`,
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ProvincePage({ params }: PageProps) {
  const { province: provinceSlug } = await params

  if (!isValidProvinceSlug(provinceSlug)) {
    notFound()
  }

  const data = await getPoliticiansByProvince(provinceSlug)

  if (!data) {
    notFound()
  }

  const { province, politicians } = data

  // Group by chamber
  const diputados = politicians.filter((p) => p.chamber.toLowerCase() === 'diputados')
  const senadores = politicians.filter((p) => p.chamber.toLowerCase() === 'senadores')
  const other = politicians.filter(
    (p) => p.chamber.toLowerCase() !== 'diputados' && p.chamber.toLowerCase() !== 'senadores',
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="transition-colors hover:text-zinc-300">
              ORC
            </Link>
            <span>/</span>
            <Link href="/provincias" className="transition-colors hover:text-zinc-300">
              Provincias
            </Link>
            <span>/</span>
            <span className="text-zinc-300">{province.name}</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-zinc-50">{province.name}</h1>
        <p className="mt-2 text-zinc-400">
          {province.politicianCount} legislador{province.politicianCount !== 1 ? 'es' : ''} registrado
          {province.politicianCount !== 1 ? 's' : ''}
        </p>

        {/* Diputados */}
        {diputados.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">
              Diputados ({diputados.length})
            </h2>
            <PoliticianGrid politicians={diputados} />
          </section>
        )}

        {/* Senadores */}
        {senadores.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">
              Senadores ({senadores.length})
            </h2>
            <PoliticianGrid politicians={senadores} />
          </section>
        )}

        {/* Other (diputados+senadores or unknown) */}
        {other.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">
              Otros ({other.length})
            </h2>
            <PoliticianGrid politicians={other} />
          </section>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PoliticianGrid({
  politicians,
}: {
  readonly politicians: readonly PoliticianSummary[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {politicians.map((p) => (
        <PoliticianCard key={p.id} politician={p} />
      ))}
    </div>
  )
}

function PoliticianCard({ politician }: { readonly politician: PoliticianSummary }) {
  return (
    <Link
      href={`/politico/${politician.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
    >
      {/* Photo */}
      {politician.photo ? (
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
          <Image
            src={politician.photo}
            alt={politician.name}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-lg font-bold text-zinc-500">
          {politician.name.charAt(0)}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-100 group-hover:text-white">
          {politician.name}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
          {politician.party && (
            <span className="truncate rounded bg-purple-500/10 px-1.5 py-0.5 text-purple-400">
              {politician.party}
            </span>
          )}
          <span>{politician.totalVotes} votos</span>
          <span>{Math.round(politician.presencePct)}% presencia</span>
        </div>
      </div>
    </Link>
  )
}
