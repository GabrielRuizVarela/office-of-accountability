import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Unified entry-point card for case landing pages.
 *
 * Renders a link card with an optional accent-color bar and icon.
 * On hover the border picks up the accent color and the title shifts
 * to match.
 *
 * Usage:
 *   <EntryPoint
 *     href="/caso/caso-libra/cronologia"
 *     label="Timeline"
 *     description="All events from launch to judicial investigations."
 *     accentColor="#a855f7"
 *   />
 */

interface EntryPointProps {
  /** Target URL. */
  readonly href: string
  /** Short title shown in the card. */
  readonly label: string
  /** One-line description beneath the title. */
  readonly description: string
  /**
   * Any valid CSS color value (hex, rgb, hsl, etc.).
   * Used for the top accent bar, hover border tint, and hover title color.
   */
  readonly accentColor: string
  /** Optional leading icon rendered before the accent bar. */
  readonly icon?: ReactNode
}

export function EntryPoint({
  href,
  label,
  description,
  accentColor,
  icon,
}: EntryPointProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:bg-zinc-900"
      style={
        {
          '--ep-accent': accentColor,
        } as React.CSSProperties
      }
    >
      {/* Accent bar + optional icon */}
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-zinc-400 transition-colors group-hover:text-[var(--ep-accent)]">
            {icon}
          </span>
        )}
        <div
          className="h-1 w-8 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-[var(--ep-accent)]">
        {label}
      </h3>
      <p className="text-xs leading-relaxed text-zinc-500">{description}</p>
    </Link>
  )
}
