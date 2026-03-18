'use client'

import { useEffect, useRef, useState, use } from 'react'

import { ForceGraph } from '../../../../components/graph/ForceGraph'
import type { ForceGraphHandle } from '../../../../components/graph/ForceGraph'
import type { GraphData } from '../../../../lib/neo4j/types'
import { CASO_EPSTEIN_SLUG } from '../../../../lib/caso-epstein/types'

const LABEL_CONFIG: ReadonlyArray<{ label: string; color: string; name: string }> = [
  { label: 'Person', color: '#3b82f6', name: 'People' },
  { label: 'Organization', color: '#8b5cf6', name: 'Organizations' },
  { label: 'Location', color: '#10b981', name: 'Locations' },
  { label: 'Event', color: '#f59e0b', name: 'Events' },
  { label: 'Document', color: '#ef4444', name: 'Documents' },
  { label: 'LegalCase', color: '#ec4899', name: 'Legal Cases' },
  { label: 'Flight', color: '#f97316', name: 'Flights' },
]

export default function GrafoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const graphRef = useRef<ForceGraphHandle>(null)
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visibleLabels, setVisibleLabels] = useState<Set<string> | null>(null)

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch(`/api/caso/${slug}/graph`)
        if (!res.ok) throw new Error('Failed to load graph data')
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph')
      } finally {
        setIsLoading(false)
      }
    }
    fetchGraph()
  }, [slug])

  const toggleLabel = (label: string) => {
    setVisibleLabels((prev) => {
      if (!prev) {
        // First toggle: show all except this one
        const allLabels = new Set(LABEL_CONFIG.map((l) => l.label))
        allLabels.delete(label)
        return allLabels
      }
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      // If all are visible, reset to null (show all)
      if (next.size === LABEL_CONFIG.length) return null
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-zinc-500">
        Loading network graph...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Controls bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {LABEL_CONFIG.map(({ label, color, name }) => {
            const isActive = !visibleLabels || visibleLabels.has(label)
            return (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'bg-zinc-900 text-zinc-600'
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: isActive ? color : '#3f3f46' }}
                />
                {name}
              </button>
            )
          })}
        </div>

        {/* Zoom controls */}
        <div className="flex gap-1">
          <button
            onClick={() => graphRef.current?.zoomIn()}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => graphRef.current?.zoomOut()}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => graphRef.current?.zoomToFit()}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
            aria-label="Zoom to fit"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1">
        <ForceGraph
          ref={graphRef}
          data={data}
          selectedNodeId={selectedNodeId}
          onNodeClick={setSelectedNodeId}
          visibleLabels={visibleLabels}
        />
      </div>

      {/* Node count */}
      <div className="border-t border-zinc-800 px-4 py-1.5 text-xs text-zinc-500">
        {data.nodes.length} nodes · {data.links.length} connections
      </div>
    </div>
  )
}
