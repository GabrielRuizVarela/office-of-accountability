'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ScrollReveal } from './ScrollReveal'

const DOT_COLORS: Record<string, string> = {
  purple: 'bg-purple-500 text-purple-500',
  red: 'bg-red-500 text-red-500',
  emerald: 'bg-emerald-500 text-emerald-500',
  sky: 'bg-sky-500 text-sky-500',
  amber: 'bg-amber-500 text-amber-500',
  yellow: 'bg-yellow-500 text-yellow-500',
  stone: 'bg-stone-400 text-stone-400',
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
  const dotColor = DOT_COLORS[color] ?? 'bg-zinc-500 text-zinc-500'
  const lineColor = LINE_COLORS[color] ?? 'from-zinc-800 to-zinc-500'

  return (
    <section
      className={`border-b border-zinc-800/50 px-4 py-12 text-center ${wip ? 'opacity-70' : ''}`}
    >
      {/* Connector — line draws down, then dot appears */}
      <div className="mx-auto flex flex-col items-center gap-1">
        <ScrollReveal variant="draw-down">
          <div className={`h-8 w-px bg-gradient-to-b ${lineColor}`} />
        </ScrollReveal>
        <ScrollReveal variant="fade" delay={300}>
          <div className={`h-2.5 w-2.5 rounded-full dot-glow ${dotColor}`} />
        </ScrollReveal>
      </div>

      {/* Chapter label + title + content — staggered fade up */}
      <ScrollReveal delay={400}>
        <p className="mt-5 text-[10px] tracking-[3px] text-zinc-600 uppercase">
          {`Capítulo ${number}`}
        </p>
        <p className="mt-1 text-[10px] text-zinc-500">{label}</p>
      </ScrollReveal>

      <ScrollReveal delay={500}>
        <h3 className="mx-auto mt-3 max-w-md font-serif text-xl font-bold leading-tight text-zinc-50 sm:text-[22px]">
          {title}
        </h3>
      </ScrollReveal>

      {/* WIP badge */}
      {wip && (
        <ScrollReveal delay={550}>
          <span className="mt-3 inline-block rounded border border-dashed border-zinc-600 px-3 py-1 text-[10px] tracking-wider text-zinc-500 uppercase">
            En construcción
          </span>
        </ScrollReveal>
      )}

      {/* Context */}
      <ScrollReveal delay={600}>
        <div className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{children}</div>
      </ScrollReveal>

      {/* Links */}
      {links.length > 0 && (
        <ScrollReveal delay={700}>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {links.map((link) => {
              const accent = ACCENT_COLORS[link.color] ?? 'text-zinc-400'
              const dot = DOT_COLORS[link.color] ?? 'bg-zinc-500 text-zinc-500'
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 border-b border-zinc-700 pb-0.5 text-xs transition-colors hover:border-zinc-400 hover:text-zinc-200 ${accent}`}
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${dot.split(' ')[0]}`}
                  />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </ScrollReveal>
      )}
    </section>
  )
}
