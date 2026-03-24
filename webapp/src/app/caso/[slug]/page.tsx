/**
 * Generic case landing page — catches slugs that don't have dedicated folders.
 * Specific cases (caso-epstein, finanzas-politicas, caso-libra) have their own
 * folders with custom layouts and pages.
 */

import { notFound } from 'next/navigation'

export default async function GenericCasoPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Known cases with dedicated routes — this page should not handle them
  const DEDICATED_CASES = ['caso-epstein', 'finanzas-politicas', 'caso-libra']
  if (DEDICATED_CASES.includes(slug)) {
    // Should be handled by their own folder, but just in case
    notFound()
  }

  // For unknown slugs, return 404
  notFound()
}
