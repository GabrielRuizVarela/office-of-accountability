/**
 * Politician profile page — server-rendered at /politico/[slug].
 *
 * Features:
 * - SSR with data fetched at request time
 * - Schema.org JSON-LD for SEO (Person type)
 * - Dynamic OG tags for WhatsApp/social sharing
 * - Vote history table (client component, paginated)
 * - Graph sub-view showing politician's connections
 */

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPoliticianBySlug, getPoliticianVoteHistory, politicianSlugSchema } from '@/lib/graph'
import type { PoliticianProfile } from '@/lib/graph'
import { getInvestigationsReferencingNode } from '@/lib/investigation'

import { PoliticianGraph } from '@/components/politician/PoliticianGraph'
import { ShareButton } from '@/components/ui/ShareButton'
import { VoteHistoryTable } from '@/components/politician/VoteHistoryTable'

// ---------------------------------------------------------------------------
// ISR: revalidate every 15 minutes (bounded staleness)
// ---------------------------------------------------------------------------

export const revalidate = 900

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

// ---------------------------------------------------------------------------
// Metadata (OG tags)
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  if (!politicianSlugSchema.safeParse(slug).success) {
    return { title: 'Politico no encontrado' }
  }

  const politician = await getPoliticianBySlug(slug)

  if (!politician) {
    return { title: 'Politico no encontrado' }
  }

  const title = `${politician.name} — Votaciones y perfil | ORC`
  const description = buildDescription(politician)

  const ogImage = `/api/og/politician/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/politico/${slug}`,
      siteName: 'Oficina de Rendición de Cuentas',
      images: [{ url: ogImage, width: 1200, height: 630, alt: politician.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/politico/${slug}`,
    },
  }
}

// ---------------------------------------------------------------------------
// Page component (Server Component)
// ---------------------------------------------------------------------------

export default async function PoliticianPage({ params }: PageProps) {
  const { slug } = await params

  if (!politicianSlugSchema.safeParse(slug).success) {
    notFound()
  }

  const [politician, voteHistory, relatedInvestigations] = await Promise.all([
    getPoliticianBySlug(slug),
    getPoliticianVoteHistory(slug, 1, 20),
    getInvestigationsReferencingNode(slug, 10),
  ])

  if (!politician) {
    notFound()
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Profile header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Photo */}
          {politician.photo && (
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
              <Image
                src={politician.photo}
                alt={`Foto de ${politician.name}`}
                fill
                className="object-cover"
                sizes="96px"
                priority
                unoptimized
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-50">{politician.name}</h1>
            {politician.fullName && politician.fullName !== politician.name && (
              <p className="mt-1 text-zinc-400">{politician.fullName}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-3">
              {politician.party && (
                <span className="inline-flex items-center rounded-full bg-purple-500/15 px-3 py-1 text-sm text-purple-400">
                  {politician.party.name}
                </span>
              )}
              {politician.provinceNode && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-400">
                  {politician.provinceNode.name}
                </span>
              )}
              {politician.chamber && (
                <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-400">
                  {formatChamber(politician.chamber)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Votos totales" value={String(politician.totalVotes)} />
          <StatCard label="Presencia" value={`${Math.round(politician.presencePct)}%`} />
          <StatCard label="Cámara" value={formatChamber(politician.chamber)} />
          <StatCard label="Provincia" value={politician.province || 'N/D'} />
        </div>

        {/* Share */}
        <div className="mb-8">
          <ShareButton
            text={`Mirá el perfil de ${politician.name} en la Oficina de Rendición de Cuentas`}
            title={`${politician.name} — ORC`}
          />
        </div>

        {/* Graph sub-view */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-100">Conexiones</h2>
          <div className="h-80 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
            <PoliticianGraph politicianId={politician.id} />
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            <Link
              href={`/explorar?node=${encodeURIComponent(politician.id)}`}
              className="transition-colors hover:text-zinc-400"
            >
              Abrir en explorador completo
            </Link>
          </p>
        </section>

        {/* Related investigations */}
        {relatedInvestigations.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">Investigaciones</h2>
            <div className="space-y-3">
              {relatedInvestigations.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/investigacion/${inv.slug}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <h3 className="font-medium text-zinc-100">{inv.title}</h3>
                  {inv.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{inv.summary}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                    {inv.author_name && <span>{inv.author_name}</span>}
                    {inv.published_at && (
                      <time dateTime={inv.published_at}>
                        {new Date(inv.published_at).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Vote history */}
        <VoteHistoryTable slug={slug} initialData={voteHistory} />
      </main>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(politician, slug)),
        }}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatChamber(chamber: string): string {
  const chambers: Readonly<Record<string, string>> = {
    diputados: 'Diputados',
    senadores: 'Senadores',
  }
  return chambers[chamber.toLowerCase()] ?? chamber
}

function buildDescription(politician: PoliticianProfile): string {
  const parts = [
    `Perfil de ${politician.name}`,
    politician.party ? `(${politician.party.name})` : null,
    politician.chamber ? `— ${formatChamber(politician.chamber)}` : null,
    politician.province ? `por ${politician.province}` : null,
    politician.totalVotes > 0 ? `— ${politician.totalVotes} votaciones registradas` : null,
  ]

  return parts.filter(Boolean).join(' ')
}

function buildJsonLd(politician: PoliticianProfile, slug: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: politician.name,
    ...(politician.fullName && { alternateName: politician.fullName }),
    ...(politician.photo && { image: politician.photo }),
    url: `/politico/${slug}`,
    jobTitle: politician.chamber
      ? `${formatChamber(politician.chamber)} de la Nación Argentina`
      : 'Legislador/a',
    ...(politician.party && {
      memberOf: {
        '@type': 'Organization',
        name: politician.party.name,
      },
    }),
    ...(politician.province && {
      workLocation: {
        '@type': 'Place',
        name: politician.province,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'AR',
          addressRegion: politician.province,
        },
      },
    }),
    nationality: {
      '@type': 'Country',
      name: 'Argentina',
    },
  }
}
