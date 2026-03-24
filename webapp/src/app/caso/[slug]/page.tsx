/**
 * Dynamic caso landing page — fallback for slugs without their own directory.
 * Case-specific pages: caso-epstein/, caso-libra/, finanzas-politicas/.
 */

import { redirect } from 'next/navigation'

const KNOWN_SLUGS = new Set(['caso-epstein', 'caso-libra', 'finanzas-politicas', 'monopolios'])

export default async function CasoFallbackPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Known slugs have their own directories and won't hit this fallback.
  // Unknown slugs redirect to the homepage.
  if (!KNOWN_SLUGS.has(slug)) {
    redirect('/')
  }

  // This shouldn't be reached — known slugs match their own directory first.
  redirect(`/caso/${slug}`)
}
