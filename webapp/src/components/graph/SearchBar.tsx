'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { GraphNode } from '../../lib/neo4j/types'
import { LABEL_COLORS, getNodeLabel } from '../../lib/graph/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchResultItem {
  readonly id: string
  readonly label: string
  readonly name: string
  readonly type: string
}

export interface SearchBarProps {
  readonly onSelect: (nodeId: string) => void
  readonly placeholder?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSearchResult(node: GraphNode): SearchResultItem {
  return {
    id: node.id,
    label: node.labels[0] ?? 'Unknown',
    name: getNodeLabel(node),
    type: node.labels[0] ?? 'Unknown',
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchBar({
  onSelect,
  placeholder = 'Buscar político, ley, votación…',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<readonly SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)

    try {
      const params = new URLSearchParams({ q: searchQuery, limit: '10' })
      const response = await fetch(`/api/graph/search?${params.toString()}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        setResults([])
        setIsOpen(false)
        return
      }

      const json = await response.json()

      if (!json.success || !json.data?.nodes) {
        setResults([])
        setIsOpen(false)
        return
      }

      const items = (json.data.nodes as GraphNode[]).map(toSearchResult)
      setResults(items)
      setIsOpen(items.length > 0)
      setActiveIndex(-1)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      performSearch(query)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      setQuery(item.name)
      setIsOpen(false)
      onSelect(item.id)
    },
    [onSelect],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
          break
        }
        case 'Enter': {
          event.preventDefault()
          if (activeIndex >= 0 && activeIndex < results.length) {
            handleSelect(results[activeIndex])
          }
          break
        }
        case 'Escape': {
          event.preventDefault()
          setIsOpen(false)
          inputRef.current?.blur()
          break
        }
      }
    },
    [isOpen, results, activeIndex, handleSelect],
  )

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search input */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-8 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results-listbox"
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          id="search-results-listbox"
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
        >
          {results.map((item, index) => (
            <li
              key={item.id}
              id={`search-result-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors ${
                index === activeIndex
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-300 hover:bg-zinc-800/50'
              }`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {/* Label color dot */}
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: LABEL_COLORS[item.label] ?? '#94a3b8' }}
              />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="flex-shrink-0 text-xs text-zinc-500">{item.type}</span>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && results.length === 0 && query.length >= MIN_QUERY_LENGTH && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-center text-sm text-zinc-500 shadow-lg">
          Sin resultados para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
