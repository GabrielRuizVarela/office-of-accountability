'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface SearchResult {
  id: string
  label: string
  type: string
}

interface PathFinderProps {
  onFindPath: (sourceId: string, targetId: string) => void
  onClose: () => void
  initialSourceId?: string | null
  initialTargetId?: string | null
}

function useNodeSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (query.length < 2) {
      setResults([])
      return
    }

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      try {
        const res = await fetch(`/api/graph/search?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const json = await res.json()
        if (!json.success || !json.data?.nodes) return
        const items: SearchResult[] = (json.data.nodes as Array<{ id: string; labels: string[]; properties: Record<string, unknown> }>).map(
          (n) => ({
            id: n.id,
            label: (n.properties.name as string) ?? (n.properties.slug as string) ?? n.id,
            type: n.labels[0] ?? '',
          }),
        )
        setResults(items)
      } catch {
        // abort or network error — ignore
      } finally {
        setLoading(false)
      }
    }, 250)
  }, [])

  const clear = useCallback(() => {
    setResults([])
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
  }, [])

  return { results, loading, search, clear }
}

export function PathFinder({ onFindPath, onClose, initialSourceId, initialTargetId }: PathFinderProps) {
  const [sourceId, setSourceId] = useState<string | null>(initialSourceId ?? null)
  const [targetId, setTargetId] = useState<string | null>(initialTargetId ?? null)
  const [sourceText, setSourceText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [activeField, setActiveField] = useState<'source' | 'target' | null>(null)

  const sourceSearch = useNodeSearch()
  const targetSearch = useNodeSearch()

  const sourceInputRef = useRef<HTMLInputElement>(null)
  const targetInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus appropriate field on mount
  useEffect(() => {
    if (initialSourceId && !initialTargetId) {
      targetInputRef.current?.focus()
    } else if (!initialSourceId && initialTargetId) {
      sourceInputRef.current?.focus()
    } else {
      sourceInputRef.current?.focus()
    }
  }, [initialSourceId, initialTargetId])

  // Fetch display names for initial IDs
  useEffect(() => {
    if (initialSourceId && !sourceText) {
      fetch(`/api/graph/search?q=${encodeURIComponent(initialSourceId)}&limit=1`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.nodes?.[0]) {
            const n = json.data.nodes[0]
            setSourceText((n.properties?.name as string) ?? n.id)
          } else {
            setSourceText(initialSourceId)
          }
        })
        .catch(() => setSourceText(initialSourceId))
    }
  }, [initialSourceId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialTargetId && !targetText) {
      fetch(`/api/graph/search?q=${encodeURIComponent(initialTargetId)}&limit=1`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.nodes?.[0]) {
            const n = json.data.nodes[0]
            setTargetText((n.properties?.name as string) ?? n.id)
          } else {
            setTargetText(initialTargetId)
          }
        })
        .catch(() => setTargetText(initialTargetId))
    }
  }, [initialTargetId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSourceChange = useCallback((value: string) => {
    setSourceText(value)
    setSourceId(null)
    sourceSearch.search(value)
  }, [sourceSearch])

  const handleTargetChange = useCallback((value: string) => {
    setTargetText(value)
    setTargetId(null)
    targetSearch.search(value)
  }, [targetSearch])

  const selectSource = useCallback((item: SearchResult) => {
    setSourceId(item.id)
    setSourceText(item.label)
    sourceSearch.clear()
    setActiveField(null)
    targetInputRef.current?.focus()
  }, [sourceSearch])

  const selectTarget = useCallback((item: SearchResult) => {
    setTargetId(item.id)
    setTargetText(item.label)
    targetSearch.clear()
    setActiveField(null)
  }, [targetSearch])

  const handleSubmit = useCallback(() => {
    if (sourceId && targetId) {
      onFindPath(sourceId, targetId)
    }
  }, [sourceId, targetId, onFindPath])

  const canSubmit = sourceId !== null && targetId !== null

  return (
    <div className="z-20 flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/95 px-4 py-2 backdrop-blur-sm">
      <span className="flex-shrink-0 text-xs font-medium text-zinc-400">Ruta:</span>

      {/* Source input */}
      <div className="relative">
        <input
          ref={sourceInputRef}
          type="text"
          value={sourceText}
          onChange={(e) => handleSourceChange(e.target.value)}
          onFocus={() => setActiveField('source')}
          onBlur={() => setTimeout(() => setActiveField(null), 150)}
          placeholder="Origen..."
          className="w-44 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500"
        />
        {activeField === 'source' && sourceSearch.results.length > 0 && (
          <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded border border-zinc-700 bg-zinc-800 shadow-lg">
            {sourceSearch.results.map((item) => (
              <button
                key={item.id}
                onMouseDown={(e) => { e.preventDefault(); selectSource(item) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-700"
              >
                <span className="truncate">{item.label}</span>
                <span className="ml-auto flex-shrink-0 text-xs text-zinc-500">{item.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg className="h-4 w-4 flex-shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>

      {/* Target input */}
      <div className="relative">
        <input
          ref={targetInputRef}
          type="text"
          value={targetText}
          onChange={(e) => handleTargetChange(e.target.value)}
          onFocus={() => setActiveField('target')}
          onBlur={() => setTimeout(() => setActiveField(null), 150)}
          placeholder="Destino..."
          className="w-44 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500"
        />
        {activeField === 'target' && targetSearch.results.length > 0 && (
          <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded border border-zinc-700 bg-zinc-800 shadow-lg">
            {targetSearch.results.map((item) => (
              <button
                key={item.id}
                onMouseDown={(e) => { e.preventDefault(); selectTarget(item) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-700"
              >
                <span className="truncate">{item.label}</span>
                <span className="ml-auto flex-shrink-0 text-xs text-zinc-500">{item.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex-shrink-0 rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Buscar
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Cerrar buscador de rutas"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
