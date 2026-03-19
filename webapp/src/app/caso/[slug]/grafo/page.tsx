'use client'

import { useEffect, useRef, useState, use } from 'react'

import { ForceGraph } from '../../../../components/graph/ForceGraph'
import type { ForceGraphHandle } from '../../../../components/graph/ForceGraph'
import type { GraphData, GraphNode, GraphLink } from '../../../../lib/neo4j/types'
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

      {/* Graph + Detail Panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ForceGraph
            ref={graphRef}
            data={data}
            selectedNodeId={selectedNodeId}
            onNodeClick={setSelectedNodeId}
            visibleLabels={visibleLabels}
          />
        </div>

        {/* Inline detail panel */}
        {selectedNodeId && (() => {
          const node = data.nodes.find((n) => n.id === selectedNodeId)
          if (!node) return null
          const connectedLinks = data.links.filter(
            (l) => l.source === selectedNodeId || l.target === selectedNodeId,
          )
          const neighborIds = new Set(
            connectedLinks.map((l) =>
              l.source === selectedNodeId ? l.target : l.source,
            ),
          )
          const neighbors = data.nodes.filter((n) => neighborIds.has(n.id))

          const LABEL_COLORS_MAP: Record<string, string> = {
            Person: '#3b82f6', Organization: '#8b5cf6', Location: '#10b981',
            Event: '#f59e0b', Document: '#ef4444', LegalCase: '#ec4899', Flight: '#f97316',
          }

          return (
            <div className="flex h-full w-80 flex-col border-l border-zinc-800 bg-zinc-950 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <h2 className="truncate text-sm font-semibold text-zinc-100">
                  {String(node.properties.name ?? node.properties.title ?? node.id)}
                </h2>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Labels */}
              <div className="border-b border-zinc-800 px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {node.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${LABEL_COLORS_MAP[label] ?? '#94a3b8'}20`,
                        color: LABEL_COLORS_MAP[label] ?? '#94a3b8',
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LABEL_COLORS_MAP[label] ?? '#94a3b8' }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Properties */}
              <div className="border-b border-zinc-800 px-4 py-3">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Properties</h3>
                <dl className="space-y-1.5">
                  {Object.entries(node.properties)
                    .filter(([k]) => !['id', 'caso_slug', 'slug'].includes(k))
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-sm">
                        <dt className="flex-shrink-0 text-zinc-500">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</dt>
                        <dd className="min-w-0 truncate text-zinc-300">{String(value ?? '-')}</dd>
                      </div>
                    ))}
                </dl>
              </div>

              {/* Connections */}
              <div className="px-4 py-3">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Connections ({connectedLinks.length})
                </h3>
                <ul className="space-y-0.5">
                  {connectedLinks.map((link, i) => {
                    const neighborId = link.source === selectedNodeId ? link.target : link.source
                    const neighbor = data.nodes.find((n) => n.id === neighborId)
                    if (!neighbor) return null
                    const direction = link.source === selectedNodeId ? '→' : '←'
                    return (
                      <li key={`${link.source}-${link.target}-${link.type}-${i}`}>
                        <button
                          onClick={() => {
                            setSelectedNodeId(neighborId)
                            graphRef.current?.centerOnNode(neighborId)
                          }}
                          className="group flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-zinc-800/50"
                        >
                          <span className="text-zinc-600">{direction}</span>
                          <span
                            className="h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: LABEL_COLORS_MAP[neighbor.labels[0]] ?? '#94a3b8' }}
                          />
                          <span className="min-w-0 flex-1 truncate text-zinc-300 group-hover:text-zinc-100">
                            {String(neighbor.properties.name ?? neighbor.properties.title ?? neighbor.id)}
                          </span>
                          <span className="flex-shrink-0 text-xs text-zinc-600">{link.type.replace(/_/g, ' ')}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Node count */}
      <div className="border-t border-zinc-800 px-4 py-1.5 text-xs text-zinc-500">
        {data.nodes.length} nodes · {data.links.length} connections
      </div>
    </div>
  )
}
