/**
 * Investigation reading page — server-rendered at /investigacion/[slug].
 *
 * Features:
 * - SSR with data fetched at request time
 * - Schema.org JSON-LD for SEO (Article type)
 * - Dynamic OG tags for WhatsApp/social sharing
 * - TipTap body rendered read-only with clickable graph node embeds
 * - Author info, tags, published date
 */

import type { Metadata } from 'next'
import NextImage from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getInvestigationBySlug } from '@/lib/investigation'
import type { Investigation } from '@/lib/investigation'

import { InvestigationBodyView } from '@/components/investigation/InvestigationBodyView'

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
  const result = await getInvestigationBySlug(slug)

  if (!result || result.investigation.status !== 'published') {
    return { title: 'Investigación no encontrada' }
  }

  const { investigation } = result
  const title = `${investigation.title} | ORC`
  const description =
    investigation.summary || `Investigación publicada en la Oficina de Rendición de Cuentas`

  const ogImage = `/api/og/investigation/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/investigacion/${slug}`,
      siteName: 'Oficina de Rendición de Cuentas',
      images: [{ url: ogImage, width: 1200, height: 630, alt: investigation.title }],
      ...(investigation.published_at && {
        publishedTime: investigation.published_at,
      }),
      ...(investigation.updated_at && {
        modifiedTime: investigation.updated_at,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/investigacion/${slug}`,
    },
  }
}

// ---------------------------------------------------------------------------
// Page component (Server Component)
// ---------------------------------------------------------------------------

export default async function InvestigationPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getInvestigationBySlug(slug)

  if (!result || result.investigation.status !== 'published') {
    notFound()
  }

  const { investigation, author } = result

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="transition-colors hover:text-zinc-300">
              ORC
            </Link>
            <span>/</span>
            <Link href="/investigaciones" className="transition-colors hover:text-zinc-300">
              Investigaciones
            </Link>
            <span>/</span>
            <span className="truncate text-zinc-300">{investigation.title}</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
          {investigation.title}
        </h1>

        {/* Meta row: author + date */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          {author.name && (
            <span className="flex items-center gap-1.5">
              <AuthorAvatar name={author.name} image={author.image} />
              <span>{author.name}</span>
            </span>
          )}
          {investigation.published_at && (
            <>
              {author.name && <span className="text-zinc-600">·</span>}
              <time dateTime={investigation.published_at}>
                {formatDate(investigation.published_at)}
              </time>
            </>
          )}
        </div>

        {/* Summary */}
        {investigation.summary && (
          <p className="mt-6 text-lg leading-relaxed text-zinc-300">{investigation.summary}</p>
        )}

        {/* Tags */}
        {investigation.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {investigation.tags.map((tag) => (
              <Link
                key={tag}
                href={`/investigaciones?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Divider */}
        <hr className="my-8 border-zinc-800" />

        {/* Body */}
        <article className="min-h-[200px]">
          <InvestigationBodyView content={investigation.body} />
        </article>

        {/* Footer */}
        <footer className="mt-12 border-t border-zinc-800 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Publicado el{' '}
              {investigation.published_at ? formatDate(investigation.published_at) : 'N/D'}
              {investigation.updated_at !== investigation.published_at && (
                <> · Actualizado el {formatDate(investigation.updated_at)}</>
              )}
            </p>
            <Link
              href="/investigaciones"
              className="text-sm text-blue-400 transition-colors hover:text-blue-300"
            >
              Ver todas las investigaciones
            </Link>
          </div>
        </footer>
      </main>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(investigation, author, slug)),
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AuthorAvatar({ name, image }: { readonly name: string; readonly image: string | null }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (image) {
    return (
      <NextImage
        src={image}
        alt={name}
        className="h-6 w-6 rounded-full object-cover"
        width={24}
        height={24}
        unoptimized
      />
    )
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-medium text-zinc-300">
      {initials}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

function buildJsonLd(
  investigation: Investigation,
  author: { readonly name: string | null; readonly image: string | null },
  slug: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: investigation.title,
    ...(investigation.summary && { description: investigation.summary }),
    url: `/investigacion/${slug}`,
    ...(investigation.published_at && { datePublished: investigation.published_at }),
    ...(investigation.updated_at && { dateModified: investigation.updated_at }),
    ...(author.name && {
      author: {
        '@type': 'Person',
        name: author.name,
        ...(author.image && { image: author.image }),
      },
    }),
    ...(investigation.tags.length > 0 && { keywords: investigation.tags.join(', ') }),
    publisher: {
      '@type': 'Organization',
      name: 'Oficina de Rendición de Cuentas',
    },
    inLanguage: 'es',
  }
}
