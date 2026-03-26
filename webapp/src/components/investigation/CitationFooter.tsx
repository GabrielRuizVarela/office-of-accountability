import type { Citation } from './CitedText'

// ---------------------------------------------------------------------------
// Accent-color mapping for footer link classes
// ---------------------------------------------------------------------------

const LINK_CLASSES: Record<string, string> = {
  amber: 'text-amber-400/70 underline decoration-amber-400/20 hover:text-amber-300',
  purple: 'text-purple-400/70 underline decoration-purple-400/20 hover:text-purple-300',
  red: 'text-red-400/70 underline decoration-red-400/20 hover:text-red-300',
  blue: 'text-blue-400/70 underline decoration-blue-400/20 hover:text-blue-300',
  green: 'text-green-400/70 underline decoration-green-400/20 hover:text-green-300',
  cyan: 'text-cyan-400/70 underline decoration-cyan-400/20 hover:text-cyan-300',
}

const FALLBACK_LINK = 'text-zinc-400/70 underline decoration-zinc-400/20 hover:text-zinc-300'

// ---------------------------------------------------------------------------
// CitationFooter — renders the numbered reference list for a section
// ---------------------------------------------------------------------------

/**
 * Renders a rounded border box with numbered citation references.
 *
 * Usage:
 * ```tsx
 * <CitationFooter citations={chapter.citations} accentColor="amber" />
 * ```
 */
export function CitationFooter({
  citations,
  accentColor,
}: {
  citations?: readonly Citation[]
  accentColor: string
}) {
  if (!citations || citations.length === 0) return null

  const linkClass = LINK_CLASSES[accentColor] ?? FALLBACK_LINK

  return (
    <div className="mt-4 rounded border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
      <ul className="space-y-1">
        {citations.map((c) => (
          <li key={c.id} className="text-xs text-zinc-500">
            <span className="mr-1.5 font-bold text-zinc-400">[{c.id}]</span>
            {c.url ? (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {c.text}
              </a>
            ) : (
              c.text
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
