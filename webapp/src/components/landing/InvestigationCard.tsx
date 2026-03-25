import Link from 'next/link'
import { createTranslator } from '@/i18n/messages'
import type { InvestigationConfig } from '@/config/investigations'

const COLOR_MAP: Record<
  string,
  {
    border: string
    borderHover: string
    bg: string
    accent: string
    titleHover: string
    dot: string
  }
> = {
  purple: {
    border: 'border-purple-600/30',
    borderHover: 'hover:border-purple-500/50',
    bg: 'from-zinc-900 to-purple-950/20',
    accent: 'text-purple-400',
    titleHover: 'group-hover:text-purple-300',
    dot: 'bg-purple-500',
  },
  red: {
    border: 'border-red-500/20',
    borderHover: 'hover:border-red-500/40',
    bg: 'from-zinc-900 to-red-950/20',
    accent: 'text-red-400',
    titleHover: 'group-hover:text-red-300',
    dot: 'bg-red-500',
  },
  emerald: {
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
    bg: 'from-zinc-900 to-emerald-950/20',
    accent: 'text-emerald-400',
    titleHover: 'group-hover:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  amber: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
    bg: 'from-zinc-900 to-amber-950/20',
    accent: 'text-amber-400',
    titleHover: 'group-hover:text-amber-300',
    dot: 'bg-amber-500',
  },
  blue: {
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/40',
    bg: 'from-zinc-900 to-blue-950/20',
    accent: 'text-blue-400',
    titleHover: 'group-hover:text-blue-300',
    dot: 'bg-blue-500',
  },
  sky: {
    border: 'border-sky-500/20',
    borderHover: 'hover:border-sky-500/40',
    bg: 'from-zinc-900 to-sky-950/20',
    accent: 'text-sky-400',
    titleHover: 'group-hover:text-sky-300',
    dot: 'bg-sky-500',
  },
  yellow: {
    border: 'border-yellow-500/20',
    borderHover: 'hover:border-yellow-500/40',
    bg: 'from-zinc-900 to-yellow-950/20',
    accent: 'text-yellow-400',
    titleHover: 'group-hover:text-yellow-300',
    dot: 'bg-yellow-500',
  },
}

const DEFAULT_COLORS = COLOR_MAP.purple

interface InvestigationCardProps {
  readonly config: InvestigationConfig
}

export function InvestigationCard({ config }: InvestigationCardProps) {
  const t = createTranslator('investigations')
  const colors = COLOR_MAP[config.color] ?? DEFAULT_COLORS

  return (
    <Link
      href={config.href}
      className={`group flex flex-col gap-4 rounded-xl border bg-gradient-to-br p-6 transition-colors ${colors.border} ${colors.borderHover} ${colors.bg}`}
    >
      <div className={`flex items-center gap-2 text-xs ${colors.accent}`}>
        <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
        {config.subtitle}
      </div>
      <h3 className={`text-xl font-bold text-zinc-50 ${colors.titleHover}`}>{config.title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{config.description}</p>
      {config.stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {config.stats.map((stat, i) => (
            <span key={stat.label} className="flex items-center gap-1">
              {i > 0 && <span className="mr-2 text-zinc-600">|</span>}
              <span className={i === 0 ? `font-semibold ${colors.accent}` : 'text-zinc-400'}>
                {stat.value}
              </span>
              <span className="text-zinc-500">{stat.label}</span>
            </span>
          ))}
        </div>
      )}
      <span className={`text-sm font-medium ${colors.accent}`}>{t('explore')} &rarr;</span>
    </Link>
  )
}
