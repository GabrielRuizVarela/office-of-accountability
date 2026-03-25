import Link from 'next/link'
import type { ReactNode } from 'react'

const DOT_COLORS: Record<string, string> = {
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-500',
  stone: 'bg-stone-400',
}

const LINE_COLORS: Record<string, string> = {
  purple: 'from-zinc-800 to-purple-500',
  red: 'from-zinc-800 to-red-500',
  emerald: 'from-zinc-800 to-emerald-500',
  sky: 'from-zinc-800 to-sky-500',
  amber: 'from-zinc-800 to-amber-500',
  yellow: 'from-zinc-800 to-yellow-500',
  stone: 'from-zinc-800 to-stone-400',
}

const ACCENT_COLORS: Record<string, string> = {
  purple: 'text-purple-400',
  red: 'text-red-400',
  emerald: 'text-emerald-400',
  sky: 'text-sky-400',
  amber: 'text-amber-400',
  yellow: 'text-yellow-400',
  stone: 'text-stone-400',
}

export interface ChapterLink {
  href: string
  label: string
  color: string
}

interface ChapterProps {
  readonly number: string
  readonly label: string
  readonly color: string
  readonly title: string
  readonly children: ReactNode
  readonly links: ChapterLink[]
  readonly wip?: boolean
}

export function Chapter({ number, label, color, title, children, links, wip }: ChapterProps) {
  const dotColor = DOT_COLORS[color] ?? 'bg-zinc-500'
  const lineColor = LINE_COLORS[color] ?? 'from-zinc-800 to-zinc-500'

  return (
    <section
      className={`border-b border-zinc-800/50 px-4 py-12 text-center ${wip ? 'opacity-70' : ''}`}
    >
      {/* Connector */}
      <div className="mx-auto flex flex-col items-center gap-1">
        <div className={`h-8 w-px bg-gradient-to-b ${lineColor}`} />
        <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
      </div>

      {/* Chapter label */}
      <p className="mt-5 text-[10px] tracking-[3px] text-zinc-600 uppercase">
        {`Capítulo ${number}`}
      </p>
      <p className="mt-1 text-[10px] text-zinc-500">{label}</p>

      {/* Title */}
      <h3 className="mx-auto mt-3 max-w-md font-serif text-xl font-bold leading-tight text-zinc-50 sm:text-[22px]">
        {title}
      </h3>

      {/* WIP badge */}
      {wip && (
        <span className="mt-3 inline-block rounded border border-dashed border-zinc-600 px-3 py-1 text-[10px] tracking-wider text-zinc-500 uppercase">
          En construcción
        </span>
      )}

      {/* Context — passed as children for safe rendering */}
      <div className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{children}</div>

      {/* Links */}
      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {links.map((link) => {
            const accent = ACCENT_COLORS[link.color] ?? 'text-zinc-400'
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 border-b border-zinc-700 pb-0.5 text-xs transition-colors hover:border-zinc-400 hover:text-zinc-200 ${accent}`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${DOT_COLORS[link.color] ?? 'bg-zinc-500'}`}
                />
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
