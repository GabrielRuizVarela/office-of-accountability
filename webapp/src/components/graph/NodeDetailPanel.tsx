'use client'

import { useCallback, useEffect, useState } from 'react'

import type { GraphData, GraphLink, GraphNode } from '../../lib/neo4j/types'
import { getNodeLabel, getLabelColor, getLabelDisplayName } from '../../lib/graph/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NodeDetailPanelProps {
  readonly nodeId: string | null
  readonly onClose: () => void
  readonly onNavigate: (nodeId: string) => void
}

interface NodeDetail {
  readonly node: GraphNode
  readonly neighbors: readonly NeighborGroup[]
  readonly linkCount: number
}

interface NeighborGroup {
  readonly type: string
  readonly direction: 'outgoing' | 'incoming'
  readonly items: readonly NeighborItem[]
}

interface NeighborItem {
  readonly nodeId: string
  readonly name: string
  readonly label: string
  readonly relationshipProps: Readonly<Record<string, unknown>>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HIDDEN_PROPERTIES = new Set([
  'ingestion_hash',
  'source_url',
  'submitted_by',
  'confidence_score',
  'tier',
  'created_at',
  'updated_at',
])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVisibleProperties(node: GraphNode): readonly [string, unknown][] {
  return Object.entries(node.properties).filter(([key]) => !HIDDEN_PROPERTIES.has(key))
}

function formatPropertyValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  return JSON.stringify(value)
}

function formatPropertyKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function groupNeighbors(
  centerNode: GraphNode,
  nodes: readonly GraphNode[],
  links: readonly GraphLink[],
): readonly NeighborGroup[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const groups = new Map<string, NeighborItem[]>()

  for (const link of links) {
    const isOutgoing = link.source === centerNode.id
    const neighborId = isOutgoing ? link.target : link.source
    const neighbor = nodeMap.get(neighborId)
    if (!neighbor) continue

    const direction = isOutgoing ? 'outgoing' : 'incoming'
    const groupKey = `${link.type}:${direction}`

    const existing = groups.get(groupKey) ?? []
    const item: NeighborItem = {
      nodeId: neighbor.id,
      name: getNodeLabel(neighbor),
      label: neighbor.labels[0] ?? 'Unknown',
      relationshipProps: link.properties,
    }

    groups.set(groupKey, [...existing, item])
  }

  return Array.from(groups.entries()).map(([key, items]) => {
    const [type, direction] = key.split(':') as [string, 'outgoing' | 'incoming']
    return { type, direction, items }
  })
}

function buildNodeDetail(nodeId: string, data: GraphData): NodeDetail | null {
  const node = data.nodes.find((n) => n.id === nodeId)
  if (!node) return null

  const neighbors = groupNeighbors(node, data.nodes, data.links)
  return {
    node,
    neighbors,
    linkCount: data.links.length,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NodeDetailPanel({ nodeId, onClose, onNavigate }: NodeDetailPanelProps) {
  const [detail, setDetail] = useState<NodeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNodeDetail = useCallback(async (id: string, signal: AbortSignal) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ limit: '50' })
      const response = await fetch(
        `/api/graph/node/${encodeURIComponent(id)}?${params.toString()}`,
        {
          signal,
        },
      )

      if (!response.ok) {
        const json = await response.json().catch(() => null)
        const message = json?.error ?? `Error ${response.status}`
        setError(message)
        setDetail(null)
        return
      }

      const json = await response.json()

      if (!json.success || !json.data) {
        setError('Respuesta invalida del servidor')
        setDetail(null)
        return
      }

      const result = buildNodeDetail(id, json.data)
      if (!result) {
        setError('Nodo no encontrado en los resultados')
        setDetail(null)
        return
      }

      setDetail(result)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('Error al cargar detalles del nodo')
      setDetail(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!nodeId) {
      setDetail(null)
      setError(null)
      return
    }

    const controller = new AbortController()
    fetchNodeDetail(nodeId, controller.signal)

    return () => controller.abort()
  }, [nodeId, fetchNodeDetail])

  if (!nodeId) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex max-h-[60vh] flex-col border-t border-zinc-800 bg-zinc-950 md:static md:inset-auto md:z-auto md:h-full md:max-h-none md:w-80 md:border-l md:border-t-0">
      {/* Mobile drag handle */}
      <div className="flex justify-center py-2 md:hidden">
        <div className="h-1 w-10 rounded-full bg-zinc-700" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 md:py-3">
        <h2 className="truncate text-sm font-semibold text-zinc-100">
          {detail ? getNodeLabel(detail.node) : 'Cargando...'}
        </h2>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Cerrar panel"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          </div>
        )}

        {error && <div className="px-4 py-6 text-center text-sm text-red-400">{error}</div>}

        {detail && !isLoading && (
          <div className="space-y-0">
            {/* Labels */}
            <div className="border-b border-zinc-800 px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {detail.node.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${getLabelColor(label)}20`,
                      color: getLabelColor(label),
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: getLabelColor(label) }}
                    />
                    {getLabelDisplayName(label)}
                  </span>
                ))}
              </div>
            </div>

            {/* Properties */}
            <div className="border-b border-zinc-800 px-4 py-3">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Propiedades
              </h3>
              <dl className="space-y-1.5">
                {getVisibleProperties(detail.node).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <dt className="flex-shrink-0 text-zinc-500">{formatPropertyKey(key)}</dt>
                    <dd
                      className="min-w-0 truncate text-zinc-300"
                      title={formatPropertyValue(value)}
                    >
                      {formatPropertyValue(value)}
                    </dd>
                  </div>
                ))}
                {getVisibleProperties(detail.node).length === 0 && (
                  <p className="text-sm text-zinc-600">Sin propiedades</p>
                )}
              </dl>
            </div>

            {/* Relationships */}
            <div className="px-4 py-3">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Conexiones ({detail.linkCount})
              </h3>
              {detail.neighbors.length === 0 && (
                <p className="text-sm text-zinc-600">Sin conexiones</p>
              )}
              <div className="space-y-3">
                {detail.neighbors.map((group) => (
                  <div key={`${group.type}:${group.direction}`}>
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <span>{group.direction === 'outgoing' ? '\u2192' : '\u2190'}</span>
                      <span className="font-medium">{group.type.replace(/_/g, ' ')}</span>
                      <span className="text-zinc-600">({group.items.length})</span>
                    </div>
                    <ul className="space-y-0.5">
                      {group.items.slice(0, 10).map((item) => (
                        <li key={item.nodeId}>
                          <button
                            onClick={() => onNavigate(item.nodeId)}
                            className="group flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors hover:bg-zinc-800/50"
                          >
                            <span
                              className="h-2 w-2 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: getLabelColor(item.label) }}
                            />
                            <span className="min-w-0 flex-1 truncate text-zinc-300 group-hover:text-zinc-100">
                              {item.name}
                            </span>
                            {typeof item.relationshipProps.vote === 'string' && (
                              <span className="flex-shrink-0 text-xs text-zinc-600">
                                {item.relationshipProps.vote}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                      {group.items.length > 10 && (
                        <li className="px-2 py-1 text-xs text-zinc-600">
                          +{group.items.length - 10} mas...
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
