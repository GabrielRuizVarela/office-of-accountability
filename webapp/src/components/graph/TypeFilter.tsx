'use client'

import { useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypeFilterProps {
  readonly availableTypes: readonly string[]
  readonly visibleTypes: ReadonlySet<string>
  readonly onChange: (visibleTypes: ReadonlySet<string>) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LABEL_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6',
  Party: '#8b5cf6',
  Province: '#10b981',
  LegislativeVote: '#f59e0b',
  Legislation: '#ef4444',
  Investigation: '#ec4899',
  User: '#6b7280',
}

const LABEL_DISPLAY: Readonly<Record<string, string>> = {
  Politician: 'Politicos',
  Party: 'Partidos',
  Province: 'Provincias',
  LegislativeVote: 'Votaciones',
  Legislation: 'Legislacion',
  Investigation: 'Investigaciones',
  User: 'Usuarios',
}

const DEFAULT_COLOR = '#94a3b8'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLabelColor(label: string): string {
  return LABEL_COLORS[label] ?? DEFAULT_COLOR
}

function getLabelDisplayName(label: string): string {
  return LABEL_DISPLAY[label] ?? label
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TypeFilter({ availableTypes, visibleTypes, onChange }: TypeFilterProps) {
  const allVisible = useMemo(
    () => availableTypes.every((t) => visibleTypes.has(t)),
    [availableTypes, visibleTypes],
  )

  const noneVisible = useMemo(() => visibleTypes.size === 0, [visibleTypes])

  const handleToggle = useCallback(
    (label: string) => {
      const next = new Set(visibleTypes)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      onChange(next)
    },
    [visibleTypes, onChange],
  )

  const handleToggleAll = useCallback(() => {
    if (allVisible) {
      onChange(new Set())
    } else {
      onChange(new Set(availableTypes))
    }
  }, [allVisible, availableTypes, onChange])

  if (availableTypes.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Toggle all button */}
      <button
        onClick={handleToggleAll}
        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
          allVisible
            ? 'border-zinc-600 bg-zinc-800 text-zinc-300'
            : 'border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
        }`}
        aria-label={allVisible ? 'Ocultar todos los tipos' : 'Mostrar todos los tipos'}
        aria-pressed={allVisible}
      >
        {noneVisible ? 'Mostrar todos' : 'Todos'}
      </button>

      {/* Individual type toggles */}
      {availableTypes.map((label) => {
        const isActive = visibleTypes.has(label)
        const color = getLabelColor(label)

        return (
          <button
            key={label}
            onClick={() => handleToggle(label)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'border-transparent text-white'
                : 'border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
            }`}
            style={
              isActive
                ? { backgroundColor: `${color}30`, borderColor: `${color}60`, color }
                : undefined
            }
            aria-label={`${isActive ? 'Ocultar' : 'Mostrar'} ${getLabelDisplayName(label)}`}
            aria-pressed={isActive}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: isActive ? color : '#52525b',
              }}
            />
            {getLabelDisplayName(label)}
          </button>
        )
      })}
    </div>
  )
}
