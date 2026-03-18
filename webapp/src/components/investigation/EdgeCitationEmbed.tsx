'use client'

import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useCallback, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EdgeCitationAttrs {
  readonly sourceNodeId: string
  readonly targetNodeId: string
  readonly relType: string
  readonly sourceName: string
  readonly targetName: string
}

interface ProvenanceData {
  readonly source_url?: string
  readonly tier?: string
  readonly confidence_score?: number
  readonly submitted_by?: string
  readonly created_at?: string
}

// ---------------------------------------------------------------------------
// Relationship type labels (Spanish)
// ---------------------------------------------------------------------------

const REL_TYPE_LABELS: Readonly<Record<string, string>> = {
  CAST_VOTE: 'votó en',
  REPRESENTS: 'representa a',
  ON_LEGISLATION: 'sobre legislación',
  REFERENCES: 'referencia a',
  BELONGS_TO: 'pertenece a',
}

const TIER_COLORS: Readonly<Record<string, string>> = {
  gold: '#f59e0b',
  silver: '#94a3b8',
  bronze: '#cd7f32',
}

// ---------------------------------------------------------------------------
// Provenance Tooltip
// ---------------------------------------------------------------------------

function ProvenanceTooltip({ provenance }: { readonly provenance: ProvenanceData }) {
  const tierColor = TIER_COLORS[provenance.tier ?? ''] ?? '#94a3b8'

  return (
    <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs shadow-xl">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold text-zinc-300">Procedencia</span>
        {provenance.tier && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
            style={{ backgroundColor: tierColor, color: '#000' }}
          >
            {provenance.tier}
          </span>
        )}
      </div>

      {provenance.confidence_score !== undefined && (
        <div className="mb-1 text-zinc-400">
          Confianza:{' '}
          <span className="text-zinc-200">
            {Math.round(provenance.confidence_score * 100)}%
          </span>
        </div>
      )}

      {provenance.source_url && (
        <div className="mb-1 truncate text-zinc-400">
          Fuente:{' '}
          <a
            href={provenance.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {new URL(provenance.source_url).hostname}
          </a>
        </div>
      )}

      {provenance.submitted_by && (
        <div className="mb-1 text-zinc-400">
          Contribuido por: <span className="text-zinc-200">{provenance.submitted_by}</span>
        </div>
      )}

      {provenance.created_at && (
        <div className="text-zinc-500">
          {new Date(provenance.created_at).toLocaleDateString('es-AR')}
        </div>
      )}

      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-zinc-700 bg-zinc-900" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor View (editable mode)
// ---------------------------------------------------------------------------

function EdgeCitationEditorView(props: {
  readonly node: { attrs: EdgeCitationAttrs }
  readonly deleteNode: () => void
  readonly selected: boolean
}) {
  const { relType, sourceName, targetName } = props.node.attrs
  const label = REL_TYPE_LABELS[relType] ?? relType

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-sm transition-colors ${
          props.selected
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-zinc-600 bg-zinc-800/60 hover:bg-zinc-800'
        }`}
        title={`${sourceName} ${label} ${targetName}`}
      >
        <span className="text-zinc-400">{sourceName}</span>
        <span className="text-amber-400">→</span>
        <span className="text-xs text-amber-400/80">{label}</span>
        <span className="text-amber-400">→</span>
        <span className="text-zinc-400">{targetName}</span>
        <button
          type="button"
          className="ml-0.5 text-zinc-500 hover:text-zinc-300"
          onClick={props.deleteNode}
          aria-label={`Eliminar citación de relación`}
        >
          ×
        </button>
      </span>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------
// Read-only View (with provenance tooltip on hover)
// ---------------------------------------------------------------------------

function EdgeCitationReadView(props: {
  readonly node: { attrs: EdgeCitationAttrs }
}) {
  const { sourceNodeId, targetNodeId, relType, sourceName, targetName } = props.node.attrs
  const label = REL_TYPE_LABELS[relType] ?? relType
  const [showTooltip, setShowTooltip] = useState(false)
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null)
  const [fetchedOnce, setFetchedOnce] = useState(false)

  const fetchProvenance = useCallback(async () => {
    if (fetchedOnce) return
    setFetchedOnce(true)

    try {
      const params = new URLSearchParams({
        source: sourceNodeId,
        target: targetNodeId,
        type: relType,
      })
      const response = await fetch(`/api/graph/edge-provenance?${params.toString()}`)

      if (!response.ok) {
        setProvenance({})
        return
      }

      const json = await response.json()
      if (json.success && json.data) {
        setProvenance(json.data as ProvenanceData)
      } else {
        setProvenance({})
      }
    } catch {
      setProvenance({})
    }
  }, [sourceNodeId, targetNodeId, relType, fetchedOnce])

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className="relative inline-flex cursor-help items-center gap-1 rounded-md border border-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 text-sm transition-colors hover:border-amber-500/50 hover:bg-zinc-800"
        onMouseEnter={() => {
          setShowTooltip(true)
          fetchProvenance()
        }}
        onMouseLeave={() => setShowTooltip(false)}
        title={`${sourceName} ${label} ${targetName}`}
      >
        <a
          href={`/explorar?node=${encodeURIComponent(sourceNodeId)}`}
          className="text-zinc-300 no-underline hover:text-blue-400"
        >
          {sourceName}
        </a>
        <span className="text-amber-400">→</span>
        <span className="text-xs text-amber-400/80">{label}</span>
        <span className="text-amber-400">→</span>
        <a
          href={`/explorar?node=${encodeURIComponent(targetNodeId)}`}
          className="text-zinc-300 no-underline hover:text-blue-400"
        >
          {targetName}
        </a>

        {showTooltip && provenance && <ProvenanceTooltip provenance={provenance} />}
      </span>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------
// TipTap Extensions
// ---------------------------------------------------------------------------

const edgeCitationAttributes = {
  sourceNodeId: { default: '' },
  targetNodeId: { default: '' },
  relType: { default: '' },
  sourceName: { default: '' },
  targetName: { default: '' },
}

export const EdgeCitationExtension = Node.create({
  name: 'edgeCitation',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return edgeCitationAttributes
  },

  parseHTML() {
    return [{ tag: 'span[data-edge-citation]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-edge-citation': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EdgeCitationEditorView as React.ComponentType<unknown>)
  },
})

export const EdgeCitationReadExtension = Node.create({
  name: 'edgeCitation',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return edgeCitationAttributes
  },

  parseHTML() {
    return [{ tag: 'span[data-edge-citation]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-edge-citation': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EdgeCitationReadView as React.ComponentType<unknown>)
  },
})

// ---------------------------------------------------------------------------
// Edge Picker Component
// ---------------------------------------------------------------------------

interface EdgeData {
  readonly sourceNodeId: string
  readonly targetNodeId: string
  readonly relType: string
  readonly sourceName: string
  readonly targetName: string
}

interface EdgePickerProps {
  readonly onSelect: (edge: EdgeData) => void
  readonly onClose: () => void
}

interface SearchResult {
  readonly id: string
  readonly label: string
  readonly name: string
}

interface EdgeResult {
  readonly relType: string
  readonly targetId: string
  readonly targetName: string
  readonly targetLabel: string
}

export function EdgeCitationPicker({ onSelect, onClose }: EdgePickerProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<readonly SearchResult[]>([])
  const [selectedNode, setSelectedNode] = useState<SearchResult | null>(null)
  const [edges, setEdges] = useState<readonly EdgeResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Search for a source node first
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ q: searchQuery, limit: '6' })
      const response = await fetch(`/api/graph/search?${params.toString()}`)

      if (!response.ok) {
        setSearchResults([])
        return
      }

      const json = await response.json()
      if (!json.success || !json.data?.nodes) {
        setSearchResults([])
        return
      }

      const items: SearchResult[] = (
        json.data.nodes as Array<{
          id: string
          labels: string[]
          properties: Record<string, unknown>
        }>
      ).map((n) => ({
        id: n.id,
        label: n.labels[0] ?? 'Unknown',
        name:
          typeof n.properties.name === 'string'
            ? n.properties.name
            : typeof n.properties.title === 'string'
              ? n.properties.title
              : n.id,
      }))
      setSearchResults(items)
    } catch {
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // After selecting a source node, fetch its edges
  const fetchEdges = useCallback(async (nodeId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/graph/node/${encodeURIComponent(nodeId)}`)

      if (!response.ok) {
        setEdges([])
        return
      }

      const json = await response.json()
      if (!json.success || !json.data) {
        setEdges([])
        return
      }

      const nodesById = new Map<string, { name: string; label: string }>()
      for (const n of json.data.nodes as Array<{ id: string; labels: string[]; properties: Record<string, unknown> }>) {
        nodesById.set(n.id, {
          name:
            typeof n.properties.name === 'string'
              ? n.properties.name
              : typeof n.properties.title === 'string'
                ? n.properties.title
                : n.id,
          label: n.labels[0] ?? 'Unknown',
        })
      }

      const edgeResults: EdgeResult[] = (
        json.data.links as Array<{ source: string; target: string; type: string }>
      )
        .filter((link) => link.source === nodeId || link.target === nodeId)
        .slice(0, 20)
        .map((link) => {
          const targetId = link.source === nodeId ? link.target : link.source
          const targetInfo = nodesById.get(targetId)
          return {
            relType: link.type,
            targetId,
            targetName: targetInfo?.name ?? targetId,
            targetLabel: targetInfo?.label ?? 'Unknown',
          }
        })
      setEdges(edgeResults)
    } catch {
      setEdges([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (selectedNode) {
          setSelectedNode(null)
          setEdges([])
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, selectedNode])

  const handleNodeSelect = useCallback(
    (node: SearchResult) => {
      setSelectedNode(node)
      setSearchResults([])
      setQuery('')
      fetchEdges(node.id)
    },
    [fetchEdges],
  )

  const handleEdgeSelect = useCallback(
    (edge: EdgeResult) => {
      if (!selectedNode) return
      onSelect({
        sourceNodeId: selectedNode.id,
        targetNodeId: edge.targetId,
        relType: edge.relType,
        sourceName: selectedNode.name,
        targetName: edge.targetName,
      })
    },
    [selectedNode, onSelect],
  )

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
      {!selectedNode ? (
        <>
          <div className="mb-1 text-xs text-zinc-500">Paso 1: Buscar nodo de origen</div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nodo..."
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
            autoFocus
          />

          {isLoading && <div className="py-2 text-center text-xs text-zinc-500">Buscando...</div>}

          {!isLoading && searchResults.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto">
              {searchResults.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                    onClick={() => handleNodeSelect(node)}
                  >
                    <span className="min-w-0 flex-1 truncate text-left">{node.name}</span>
                    <span className="flex-shrink-0 text-xs text-zinc-500">{node.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && query.length >= 2 && searchResults.length === 0 && (
            <div className="py-2 text-center text-xs text-zinc-500">Sin resultados</div>
          )}
        </>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-xs text-zinc-500">Paso 2: Seleccionar relación</div>
            <button
              type="button"
              className="text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => {
                setSelectedNode(null)
                setEdges([])
              }}
            >
              ← Volver
            </button>
          </div>
          <div className="mb-2 rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-300">
            {selectedNode.name}
          </div>

          {isLoading && <div className="py-2 text-center text-xs text-zinc-500">Cargando relaciones...</div>}

          {!isLoading && edges.length > 0 && (
            <ul className="max-h-48 overflow-y-auto">
              {edges.map((edge, i) => {
                const label = REL_TYPE_LABELS[edge.relType] ?? edge.relType
                return (
                  <li key={`${edge.relType}-${edge.targetId}-${i}`}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                      onClick={() => handleEdgeSelect(edge)}
                    >
                      <span className="text-amber-400">→</span>
                      <span className="text-xs text-amber-400/80">{label}</span>
                      <span className="text-amber-400">→</span>
                      <span className="min-w-0 flex-1 truncate text-left">{edge.targetName}</span>
                      <span className="flex-shrink-0 text-xs text-zinc-500">{edge.targetLabel}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {!isLoading && edges.length === 0 && (
            <div className="py-2 text-center text-xs text-zinc-500">Sin relaciones</div>
          )}
        </>
      )}
    </div>
  )
}
