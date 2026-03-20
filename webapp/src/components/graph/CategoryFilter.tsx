'use client'

import { useCallback, useMemo } from 'react'

import type { GraphData, GraphNode } from '../../lib/neo4j/types'
import {
  getNodeCategory,
  SUBCATEGORY_CONFIGS,
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
  categories: Array<{ name: string; color: string; display: string; count: number }>
}

export function CategoryFilter({ data, hiddenCategories, onChange }: CategoryFilterProps) {
  // Build category counts from current data
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
      const categories: CategoryGroup['categories'] = []
      for (const [name, color] of Object.entries(config.colors)) {
        const key = categoryKey(label, name)
        const count = counts.get(key) ?? 0
        if (count === 0) continue
        categories.push({
          name,
          color,
          display: config.display[name] ?? name,
          count,
        })
      }
      if (categories.length > 0) {
        // Sort by count descending
        categories.sort((a, b) => b.count - a.count)
        result.push({ label, categories })
      }
    }
    return result
  }, [data.nodes])

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

  const handleHideAll = useCallback(
    (label: string, categoryNames: string[]) => {
      const next = new Set(hiddenCategories)
      for (const name of categoryNames) {
        next.add(categoryKey(label, name))
      }
      onChange(next)
    },
    [hiddenCategories, onChange],
  )

  if (groups.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {groups.map(({ label, categories }) => {
        const names = categories.map((c) => c.name)
        const allHidden = names.every((n) => hiddenCategories.has(categoryKey(label, n)))

        return (
          <div key={label} className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() =>
                allHidden
                  ? handleShowAll(label, names)
                  : handleHideAll(label, names)
              }
              className="rounded-full border border-zinc-700 bg-transparent px-2 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-400"
            >
              {label}
            </button>
            {categories.map(({ name, color, display, count }) => {
              const key = categoryKey(label, name)
              const isActive = !hiddenCategories.has(key)

              return (
                <button
                  key={key}
                  onClick={() => handleToggle(key)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'border-transparent text-white'
                      : 'border-zinc-700 bg-transparent text-zinc-600 hover:border-zinc-600 hover:text-zinc-500'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: `${color}25`, borderColor: `${color}50`, color }
                      : undefined
                  }
                  title={`${display} (${count})`}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: isActive ? color : '#52525b' }}
                  />
                  {display}
                  <span className="text-[9px] opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
