'use client'

/**
 * Search existing graph nodes to seed a new investigation.
 * Includes a "Create new entity" inline form for entities not yet in the graph.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeedEntity {
  readonly id: string
  readonly name: string
  readonly label: string
}

interface SearchResultItem {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly caso_slug?: string
}

export interface SeedEntitySearchProps {
  readonly onSelect: (entity: SeedEntity) => void
  readonly onCreateNew: (entity: { name: string; type: string }) => void
}

const ENTITY_TYPES = ['Person', 'Organization', 'Event', 'Document', 'Location'] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SeedEntitySearch({ onSelect, onCreateNew }: SeedEntitySearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<readonly SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<string>('Person')

  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setIsLoading(true)

      try {
        const res = await fetch(`/api/graph/search?q=${encodeURIComponent(query)}&limit=10`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          setResults([])
          setShowDropdown(true)
          return
        }
        const json = await res.json()
        if (json.success && Array.isArray(json.data?.nodes)) {
          const items: SearchResultItem[] = json.data.nodes.map(
            (n: { id: string; labels?: string[]; properties?: { name?: string; caso_slug?: string } }) => ({
              id: n.id,
              name: n.properties?.name ?? n.id,
              label: n.labels?.[0] ?? 'Unknown',
              caso_slug: n.properties?.caso_slug,
            }),
          )
          setResults(items)
        } else {
          setResults([])
        }
        setShowDropdown(true)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setResults([])
        setShowDropdown(true)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      setQuery(item.name)
      setShowDropdown(false)
      onSelect({ id: item.id, name: item.name, label: item.label })
    },
    [onSelect],
  )

  const handleCreateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = newName.trim()
      if (!trimmed) return
      onCreateNew({ name: trimmed, type: newType })
      setNewName('')
      setShowCreateForm(false)
    },
    [newName, newType, onCreateNew],
  )

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true)
          }}
          placeholder="Search by name..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-purple-500" />
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg">
            {results.length > 0 ? (
              <ul className="max-h-56 overflow-y-auto py-1">
                {results.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                    <span className="shrink-0 rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400">
                      {item.label}
                    </span>
                    {item.caso_slug && (
                      <span className="shrink-0 text-xs text-zinc-500">{item.caso_slug}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-3 text-center text-sm text-zinc-500">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {/* Create new entity option */}
            <div className="border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false)
                  setShowCreateForm(true)
                  setNewName(query)
                }}
                className="w-full px-3 py-2 text-left text-sm text-purple-400 transition-colors hover:bg-zinc-800"
              >
                + Create new entity
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline create form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 space-y-3"
        >
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">New entity</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Entity name"
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500"
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
            >
              Use entity
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Trigger create form when dropdown not visible */}
      {!showDropdown && !showCreateForm && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          + Create new entity instead
        </button>
      )}
    </div>
  )
}
