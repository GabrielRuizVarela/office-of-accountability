'use client'

import { useCallback, useMemo } from 'react'

import type { GraphData, GraphNode } from '../../lib/neo4j/types'
import {
  getNodeCategory,
  SUBCATEGORY_CONFIGS,
  LABEL_DISPLAY,
} from '../../lib/graph/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryFilterProps {
  /** Current graph data — used to compute available categories */
  readonly data: GraphData
  /** Set of hidden category keys (e.g. "Person:Victim", "Document:Court Filing") */
  readonly hiddenCategories: ReadonlySet<string>
  readonly onChange: (hiddenCategories: Set<string>) => void
  /** Only show subcategories for these labels (null = all) */
  readonly visibleLabels?: ReadonlySet<string> | null
}

/** A category key is "Label:Category" (e.g. "Person:Legal") */
function categoryKey(label: string, category: string) {
  return `${label}:${category}`
}

export function parseCategoryKey(key: string): { label: string; category: string } {
  const idx = key.indexOf(':')
  return { label: key.slice(0, idx), category: key.slice(idx + 1) }
}

/** Check whether a node is hidden by category filter */
export function isNodeHiddenByCategory(
  node: GraphNode,
  hiddenCategories: ReadonlySet<string>,
): boolean {
  if (hiddenCategories.size === 0) return false
  const cat = getNodeCategory(node)
  if (!cat) return false
  return hiddenCategories.has(categoryKey(node.labels[0], cat))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CategoryGroup {
  label: string
  labelDisplay: string
  categories: Array<{ name: string; color: string; display: string; count: number }>
  total: number
}

export function CategoryFilter({ data, hiddenCategories, onChange, visibleLabels }: CategoryFilterProps) {
  const groups = useMemo<CategoryGroup[]>(() => {
    const counts = new Map<string, number>()

    for (const node of data.nodes) {
      const cat = getNodeCategory(node)
      if (!cat) continue
      const key = categoryKey(node.labels[0], cat)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const result: CategoryGroup[] = []
    for (const [label, config] of Object.entries(SUBCATEGORY_CONFIGS)) {
      // Skip labels that are hidden by the main label filter
      if (visibleLabels && !visibleLabels.has(label)) continue

      const categories: CategoryGroup['categories'] = []
      let total = 0
      for (const [name, color] of Object.entries(config.colors)) {
        const key = categoryKey(label, name)
        const count = counts.get(key) ?? 0
        if (count === 0) continue
        total += count
        categories.push({
          name,
          color,
          display: config.display[name] ?? name,
          count,
        })
      }
      if (categories.length > 1) {
        categories.sort((a, b) => b.count - a.count)
        result.push({
          label,
          labelDisplay: LABEL_DISPLAY[label] ?? label,
          categories,
          total,
        })
      }
    }
    return result
  }, [data.nodes, visibleLabels])

  const handleToggle = useCallback(
    (key: string) => {
      const next = new Set(hiddenCategories)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      onChange(next)
    },
    [hiddenCategories, onChange],
  )

  const handleIsolate = useCallback(
    (label: string, categoryNames: string[], keepName: string) => {
      const next = new Set(hiddenCategories)
      for (const name of categoryNames) {
        if (name === keepName) {
          next.delete(categoryKey(label, name))
        } else {
          next.add(categoryKey(label, name))
        }
      }
      onChange(next)
    },
    [hiddenCategories, onChange],
  )

  const handleShowAll = useCallback(
    (label: string, categoryNames: string[]) => {
      const next = new Set(hiddenCategories)
      for (const name of categoryNames) {
        next.delete(categoryKey(label, name))
      }
      onChange(next)
    },
    [hiddenCategories, onChange],
  )

  if (groups.length === 0) return null

  const activeFilterCount = hiddenCategories.size

  return (
    <div className="flex items-start gap-3">
      {groups.map(({ label, labelDisplay, categories, total }) => {
        const names = categories.map((c) => c.name)
        const hiddenCount = names.filter((n) => hiddenCategories.has(categoryKey(label, n))).length
        const anyHidden = hiddenCount > 0

        return (
          <div key={label} className="flex items-center gap-1">
            {/* Group label with reset */}
            <button
              onClick={() => handleShowAll(label, names)}
              className={`mr-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                anyHidden
                  ? 'text-zinc-300 hover:text-zinc-100'
                  : 'text-zinc-600'
              }`}
              title={anyHidden ? `Mostrar todos (${labelDisplay})` : labelDisplay}
            >
              {labelDisplay}
              {anyHidden && (
                <span className="ml-1 text-[9px] text-amber-400">{total - hiddenCount}/{total}</span>
              )}
            </button>

            {/* Category pills */}
            {categories.map(({ name, color, display, count }) => {
              const key = categoryKey(label, name)
              const isActive = !hiddenCategories.has(key)

              return (
                <button
                  key={key}
                  onClick={() => handleToggle(key)}
                  onDoubleClick={() => handleIsolate(label, names, name)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all ${
                    isActive
                      ? 'border-transparent text-white'
                      : 'border-zinc-800 bg-transparent text-zinc-600 hover:border-zinc-700 hover:text-zinc-500'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: `${color}20`, borderColor: `${color}40`, color }
                      : undefined
                  }
                  title={`${display} (${count}) — doble click para aislar`}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: isActive ? color : '#3f3f46' }}
                  />
                  {display}
                  <span className="tabular-nums text-[9px] opacity-50">{count}</span>
                </button>
              )
            })}

            {/* Vertical separator between groups */}
            <span className="ml-1.5 h-3 w-px bg-zinc-800" />
          </div>
        )
      })}

      {/* Clear all filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={() => onChange(new Set())}
          className="ml-auto rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
