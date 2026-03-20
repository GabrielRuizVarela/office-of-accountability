'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { LABEL_COLORS, LINK_COLORS, LABEL_DISPLAY, DEFAULT_NODE_COLOR, DEFAULT_LINK_COLOR } from '@/lib/graph/constants'
import type { ShowcaseData, ShowcaseEdge, ShowcaseHub } from '@/lib/graph'

/** Display-friendly relationship type labels */
const REL_TYPE_DISPLAY: Record<string, string> = {
  FLEW_WITH: 'flew with',
  FINANCED: 'financed',
  ASSOCIATED_WITH: 'associated with',
  OWNED: 'owned',
  MENTIONED_IN: 'mentioned in',
  VISITED: 'visited',
  EMPLOYED_BY: 'employed by',
  AFFILIATED_WITH: 'affiliated with',
  PARTICIPATED_IN: 'participated in',
  FILED_IN: 'filed in',
  DOCUMENTED_BY: 'documented by',
}

interface GraphShowcaseProps {
  /** Render variant: 'full' shows edges + hubs, 'compact' shows edges only */
  readonly variant?: 'full' | 'compact'
  /** Optional heading override */
  readonly heading?: string
  /** Link target for CTA */
  readonly ctaHref?: string
  /** CTA label */
  readonly ctaLabel?: string
}

export function GraphShowcase({
  variant = 'full',
  heading,
  ctaHref = '/explorar',
  ctaLabel,
}: GraphShowcaseProps) {
  const [data, setData] = useState<ShowcaseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/graph/showcase')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) setData(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
      </div>
    )
  }

  if (!data || (data.edges.length === 0 && data.hubs.length === 0)) return null

  return (
    <div className="space-y-6">
      {heading && (
        <h3 className="text-lg font-bold text-zinc-100">{heading}</h3>
      )}

      {/* Relationship examples */}
      {data.edges.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.edges.map((edge, i) => (
            <EdgePill key={`${edge.sourceName}-${edge.relType}-${edge.targetName}-${i}`} edge={edge} />
          ))}
        </div>
      )}

      {/* Hub nodes — only in full variant */}
      {variant === 'full' && data.hubs.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {data.hubs.map((hub) => (
            <HubCard key={hub.name} hub={hub} />
          ))}
        </div>
      )}

      {/* CTA */}
      {ctaHref && ctaLabel && (
        <div className="flex justify-center pt-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-300 transition-colors hover:border-purple-500/50 hover:bg-purple-500/15"
          >
            {ctaLabel}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}

function EdgePill({ edge }: { readonly edge: ShowcaseEdge }) {
  const sourceColor = LABEL_COLORS[edge.sourceLabel] ?? DEFAULT_NODE_COLOR
  const targetColor = LABEL_COLORS[edge.targetLabel] ?? DEFAULT_NODE_COLOR
  const relColor = LINK_COLORS[edge.relType] ?? DEFAULT_LINK_COLOR
  const relDisplay = REL_TYPE_DISPLAY[edge.relType] ?? edge.relType.toLowerCase().replace(/_/g, ' ')

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs">
      {/* Source node */}
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: sourceColor }}
      />
      <span className="font-medium text-zinc-200 truncate max-w-[120px]">{edge.sourceName}</span>

      {/* Relationship arrow */}
      <svg className="h-3 w-16 flex-shrink-0" viewBox="0 0 64 12">
        <line x1="0" y1="6" x2="52" y2="6" stroke={relColor} strokeWidth="1.5" />
        <polygon points="52,2 60,6 52,10" fill={relColor} />
      </svg>

      {/* Relationship label */}
      <span className="flex-shrink-0 text-[10px] uppercase tracking-wider" style={{ color: relColor }}>
        {relDisplay}
      </span>

      <svg className="h-3 w-4 flex-shrink-0" viewBox="0 0 16 12">
        <line x1="0" y1="6" x2="16" y2="6" stroke={relColor} strokeWidth="1.5" />
      </svg>

      {/* Target node */}
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: targetColor }}
      />
      <span className="font-medium text-zinc-200 truncate max-w-[120px]">{edge.targetName}</span>
    </div>
  )
}

function HubCard({ hub }: { readonly hub: ShowcaseHub }) {
  const color = LABEL_COLORS[hub.label] ?? DEFAULT_NODE_COLOR
  const displayLabel = LABEL_DISPLAY[hub.label] ?? hub.label

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-zinc-200 truncate">{hub.name}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
        <span>{displayLabel}</span>
        <span className="tabular-nums">{hub.degree} connections</span>
      </div>
    </div>
  )
}
