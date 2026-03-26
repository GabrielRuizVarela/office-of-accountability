'use client'

import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Shared Citation type — used across all resumen pages
// ---------------------------------------------------------------------------

export interface Citation {
  readonly id: number
  readonly text: string
  readonly url?: string
}

// ---------------------------------------------------------------------------
// Accent-color mapping for Tailwind classes
// ---------------------------------------------------------------------------

const ACCENT_CLASSES: Record<string, { badge: string; badgeHover: string }> = {
  amber: {
    badge: 'bg-amber-500/20 text-amber-400',
    badgeHover: 'hover:bg-amber-500/30 hover:text-amber-300',
  },
  purple: {
    badge: 'bg-purple-500/20 text-purple-400',
    badgeHover: 'hover:bg-purple-500/30 hover:text-purple-300',
  },
  red: {
    badge: 'bg-red-500/20 text-red-400',
    badgeHover: 'hover:bg-red-500/30 hover:text-red-300',
  },
  blue: {
    badge: 'bg-blue-500/20 text-blue-400',
    badgeHover: 'hover:bg-blue-500/30 hover:text-blue-300',
  },
  green: {
    badge: 'bg-green-500/20 text-green-400',
    badgeHover: 'hover:bg-green-500/30 hover:text-green-300',
  },
  cyan: {
    badge: 'bg-cyan-500/20 text-cyan-400',
    badgeHover: 'hover:bg-cyan-500/30 hover:text-cyan-300',
  },
}

const FALLBACK_ACCENT = {
  badge: 'bg-zinc-500/20 text-zinc-400',
  badgeHover: 'hover:bg-zinc-500/30 hover:text-zinc-300',
}

// ---------------------------------------------------------------------------
// CitedText — renders inline [N] citation badges in a text string
// ---------------------------------------------------------------------------

/**
 * Parse `[N]` markers in text and render them as superscript citation badges.
 *
 * Usage:
 * ```tsx
 * <p><CitedText text={paragraph} citations={chapter.citations} accentColor="amber" /></p>
 * ```
 */
export function CitedText({
  text,
  citations,
  accentColor,
}: {
  text: string
  citations?: readonly Citation[]
  accentColor: string
}): ReactNode {
  if (!citations || citations.length === 0) return text

  const accent = ACCENT_CLASSES[accentColor] ?? FALLBACK_ACCENT
  const citationMap = new Map(citations.map((c) => [c.id, c]))
  const parts = text.split(/(\[\d+\])/)

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (!match) return part

    const id = parseInt(match[1], 10)
    const citation = citationMap.get(id)
    if (!citation) return part

    if (citation.url) {
      return (
        <a
          key={i}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={citation.text}
          className={`ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold no-underline ${accent.badge} ${accent.badgeHover}`}
        >
          {id}
        </a>
      )
    }

    return (
      <span
        key={i}
        title={citation.text}
        className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-700/50 text-[10px] font-bold text-zinc-400"
      >
        {id}
      </span>
    )
  })
}
