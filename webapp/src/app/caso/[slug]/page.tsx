/**
 * Dynamic caso landing page — fallback for slugs without their own directory.
 * Case-specific pages live at caso-epstein/, caso-libra/, finanzas-politicas/.
 */

import { notFound } from 'next/navigation'

import { OverviewContent } from './OverviewContent'

const CASO_STATS: Record<string, readonly { label: string; value: string; color: string }[]> = {
  'caso-epstein': [
    { label: 'Persons', value: '374', color: '#ef4444' },
    { label: 'Events', value: '39', color: '#f59e0b' },
    { label: 'Documents', value: '1,044', color: '#3b82f6' },
    { label: 'Legal Cases', value: '12', color: '#10b981' },
  ],
}

export default async function CasoFallbackPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const stats = CASO_STATS[slug]

  if (!stats) {
    notFound()
  }

  return <OverviewContent slug={slug} stats={stats} />
}
