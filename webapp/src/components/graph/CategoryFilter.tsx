'use client'

import { useCallback, useMemo } from 'react'

import type { GraphData, GraphNode } from '../../lib/neo4j/types'
import {
  SUBCATEGORY_CONFIGS,
  getNodeCategory,
  getLabelColor,
  getLabelDisplayName,
  LABEL_COLORS,
  DEFAULT_NODE_COLOR,
} from '../../lib/graph/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryFilterProps {
  readonly data: GraphData
  readonly hiddenCategories: ReadonlySet<string>
  readonly onChange: (hidden: Set<string>) => void
  readonly visibleLabels?: ReadonlySet<string> | null
}

// ---------------------------------------------------------------------------
// Category key helpers  (label::category for subcategories, label for plain)
// ---------------------------------------------------------------------------

export function categoryKey(label: string, category?: string): string {
  return category ? `${label}::${category}` : label
}

export function parseCategoryKey(key: string): { label: string; category?: string } {
  const idx = key.indexOf('::')
  if (idx === -1) return { label: key }
  return { label: key.slice(0, idx), category: key.slice(idx + 2) }
}

/** Check if a node should be hidden based on the hidden-categories set */
export function isNodeHiddenByCategory(node: GraphNode, hidden: ReadonlySet<string>): boolean {
  if (hidden.size === 0) return false
  const label = node.labels[0]
  if (!label) return false

  if (label in SUBCATEGORY_CONFIGS) {
    const cat = getNodeCategory(node)
    return hidden.has(categoryKey(label, cat))
  }
  return hidden.has(categoryKey(label))
}

// ---------------------------------------------------------------------------
// Internal: group nodes into category buckets
// ---------------------------------------------------------------------------

interface CategoryBucket {
  key: string
  label: string
  category?: string
  displayName: string
  color: string
  count: number
}

function buildBuckets(
  data: GraphData,
  visibleLabels: ReadonlySet<string> | null | undefined,
): Map<string, CategoryBucket> {
  const buckets = new Map<string, CategoryBucket>()

  for (const node of data.nodes) {
    const label = node.labels[0]
    if (!label) continue
    if (visibleLabels && !node.labels.some((l) => visibleLabels.has(l))) continue

    if (label in SUBCATEGORY_CONFIGS) {
      const cat = getNodeCategory(node)
      const key = categoryKey(label, cat)
      const existing = buckets.get(key)
      if (existing) {
        existing.count++
      } else {
        const cfg = SUBCATEGORY_CONFIGS[label]
        buckets.set(key, {
          key,
          label,
          category: cat,
          displayName: cfg.display[cat] ?? cat,
          color: cfg.colors[cat] ?? DEFAULT_NODE_COLOR,
          count: 1,
        })
      }
    } else {
      const key = categoryKey(label)
      const existing = buckets.get(key)
      if (existing) {
        existing.count++
      } else {
        buckets.set(key, {
          key,
          label,
          displayName: getLabelDisplayName(label),
          color: getLabelColor(label),
          count: 1,
        })
      }
    }
  }

  return buckets
}

// ---------------------------------------------------------------------------
// Group buckets by label for rendering
// ---------------------------------------------------------------------------

interface LabelGroup {
  label: string
  displayName: string
  color: string
  buckets: CategoryBucket[]
}

function groupByLabel(buckets: Map<string, CategoryBucket>): LabelGroup[] {
  const groups = new Map<string, LabelGroup>()

  for (const bucket of buckets.values()) {
    let group = groups.get(bucket.label)
    if (!group) {
      group = {
        label: bucket.label,
        displayName: getLabelDisplayName(bucket.label),
        color: LABEL_COLORS[bucket.label] ?? DEFAULT_NODE_COLOR,
        buckets: [],
      }
      groups.set(bucket.label, group)
    }
    group.buckets.push(bucket)
  }

  // Sort buckets within each group by count descending
  for (const group of groups.values()) {
    group.buckets.sort((a, b) => b.count - a.count)
  }

  // Sort groups by total count descending
  return [...groups.values()].sort(
    (a, b) =>
      b.buckets.reduce((s, b2) => s + b2.count, 0) - a.buckets.reduce((s, b2) => s + b2.count, 0),
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryFilter({ data, hiddenCategories, onChange, visibleLabels }: CategoryFilterProps) {
  const buckets = useMemo(() => buildBuckets(data, visibleLabels), [data, visibleLabels])
  const groups = useMemo(() => groupByLabel(buckets), [buckets])

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

  /** Double-click: isolate this category (hide everything else) */
  const handleIsolate = useCallback(
    (key: string) => {
      const allKeys = [...buckets.keys()]
      const next = new Set(allKeys.filter((k) => k !== key))
      onChange(next)
    },
    [buckets, onChange],
  )

  /** Reset a label group (unhide all its buckets) */
  const handleResetGroup = useCallback(
    (group: LabelGroup) => {
      const next = new Set(hiddenCategories)
      for (const b of group.buckets) {
        next.delete(b.key)
      }
      onChange(next)
    },
    [hiddenCategories, onChange],
  )

  const handleClearAll = useCallback(() => {
    onChange(new Set())
  }, [onChange])

  if (groups.length === 0) return null

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          {/* Group header — click to reset group */}
          {group.buckets.length > 1 && (
            <button
              onClick={() => handleResetGroup(group)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              {group.displayName}
            </button>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {group.buckets.map((bucket) => {
              const isHidden = hiddenCategories.has(bucket.key)

              return (
                <button
                  key={bucket.key}
                  onClick={() => handleToggle(bucket.key)}
                  onDoubleClick={() => handleIsolate(bucket.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    !isHidden
                      ? 'border-transparent text-white'
                      : 'border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
                  style={
                    !isHidden
                      ? {
                          backgroundColor: `${bucket.color}30`,
                          borderColor: `${bucket.color}60`,
                          color: bucket.color,
                        }
                      : undefined
                  }
                  aria-label={`${isHidden ? 'Mostrar' : 'Ocultar'} ${bucket.displayName}`}
                  aria-pressed={!isHidden}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: !isHidden ? bucket.color : '#52525b',
                    }}
                  />
                  {bucket.displayName}
                  <span className="text-[10px] opacity-60">{bucket.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {hiddenCategories.size > 0 && (
        <button
          onClick={handleClearAll}
          className="rounded-full border border-zinc-700 bg-transparent px-2.5 py-1 text-xs font-medium text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
