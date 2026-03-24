'use client'

/**
 * Investigation summary/narrative page — routes based on slug.
 */

import { useParams } from 'next/navigation'
import { NuclearRiskArticle } from './NuclearRiskArticle'
import { LibraArticle } from './LibraArticle'

export default function ResumenPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  if (slug === 'riesgo-nuclear') {
    return <NuclearRiskArticle />
  }

  return <LibraArticle />
}
