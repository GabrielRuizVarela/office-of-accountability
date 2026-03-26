'use client'

/**
 * Displays 1-hop neighbors of a seed entity as a checkbox list.
 * Calls onSelectionChange with the current selected node IDs whenever selection changes.
 */

import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NeighborNode {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly connectionCount: number
}

export interface ScopeSelectorProps {
  readonly seedEntityId: string
  readonly onSelectionChange: (selectedIds: string[]) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScopeSelector({ seedEntityId, onSelectionChange }: ScopeSelectorProps) {
  const [neighbors, setNeighbors] = useState<readonly NeighborNode[]>([])
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch neighbors on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch(`/api/graph/expand/${encodeURIComponent(seedEntityId)}?depth=1&limit=50`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        if (!json.success || !Array.isArray(json.data?.nodes)) {
          setNeighbors([])
          return
        }

        // Build a connection count map from links
        const countMap = new Map<string, number>()
        if (Array.isArray(json.data.links)) {
          for (const link of json.data.links) {
            const src = typeof link.source === 'string' ? link.source : link.source?.id
            const tgt = typeof link.target === 'string' ? link.target : link.target?.id
            if (src && src !== seedEntityId) countMap.set(src, (countMap.get(src) ?? 0) + 1)
            if (tgt && tgt !== seedEntityId) countMap.set(tgt, (countMap.get(tgt) ?? 0) + 1)
          }
        }

        const nodes: NeighborNode[] = (
          json.data.nodes as Array<{
            id: string
            labels?: string[]
            properties?: { name?: string }
          }>
        )
          .filter((n) => n.id !== seedEntityId)
          .map((n) => ({
            id: n.id,
            name: n.properties?.name ?? n.id,
            label: n.labels?.[0] ?? 'Unknown',
            connectionCount: countMap.get(n.id) ?? 1,
          }))

        setNeighbors(nodes)
        // Default: all selected
        const allIds = new Set(nodes.map((n) => n.id))
        setSelected(allIds)
        onSelectionChange(Array.from(allIds))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load neighbors')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedEntityId])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      onSelectionChange(Array.from(next))
      return next
    })
  }

  function selectAll() {
    const all = new Set(neighbors.map((n) => n.id))
    setSelected(all)
    onSelectionChange(Array.from(all))
  }

  function deselectAll() {
    setSelected(new Set())
    onSelectionChange([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-purple-500" />
        Loading neighbors...
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
        {error}
      </p>
    )
  }

  if (neighbors.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No neighbors found for this entity. The investigation will start empty.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">
          {selected.size} / {neighbors.length} selected
        </span>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={deselectAll}
          className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Deselect All
        </button>
      </div>

      {/* Checkbox list */}
      <ul className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-2">
        {neighbors.map((node) => (
          <li key={node.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={selected.has(node.id)}
                onChange={() => toggle(node.id)}
                className="h-4 w-4 rounded border-zinc-600 accent-purple-500"
              />
              <span className="min-w-0 flex-1 truncate text-zinc-200">{node.name}</span>
              <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                {node.label}
              </span>
              <span className="shrink-0 text-xs text-zinc-600">{node.connectionCount}x</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
