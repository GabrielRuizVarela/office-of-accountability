'use client'

import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useCallback, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GraphNodeEmbedAttrs {
  readonly nodeId: string
  readonly label: string
  readonly name: string
}

interface NodeData {
  readonly id: string
  readonly label: string
  readonly name: string
}

// ---------------------------------------------------------------------------
// Label colors (matches ForceGraph / SearchBar)
// ---------------------------------------------------------------------------

const LABEL_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6',
  Party: '#8b5cf6',
  Province: '#10b981',
  LegislativeVote: '#f59e0b',
  Legislation: '#ef4444',
  Investigation: '#ec4899',
}

// ---------------------------------------------------------------------------
// Node View Component (rendered inside editor)
// ---------------------------------------------------------------------------

function GraphNodeEmbedView(props: {
  readonly node: { attrs: GraphNodeEmbedAttrs }
  readonly deleteNode: () => void
  readonly selected: boolean
}) {
  const { nodeId, label, name } = props.node.attrs
  const color = LABEL_COLORS[label] ?? '#94a3b8'

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-sm transition-colors ${
          props.selected
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
        }`}
        data-node-id={nodeId}
        title={`${label}: ${name}`}
      >
        <span
          className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-zinc-200">{name}</span>
        <button
          type="button"
          className="ml-0.5 text-zinc-500 hover:text-zinc-300"
          onClick={props.deleteNode}
          aria-label={`Eliminar referencia a ${name}`}
        >
          ×
        </button>
      </span>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------
// TipTap Extension
// ---------------------------------------------------------------------------

export const GraphNodeEmbedExtension = Node.create({
  name: 'graphNodeEmbed',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      nodeId: { default: '' },
      label: { default: '' },
      name: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-graph-node-embed]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-graph-node-embed': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GraphNodeEmbedView as React.ComponentType<unknown>)
  },
})

// ---------------------------------------------------------------------------
// Embed picker component (search + insert)
// ---------------------------------------------------------------------------

interface GraphNodePickerProps {
  readonly onSelect: (node: NodeData) => void
  readonly onClose: () => void
}

export function GraphNodePicker({ onSelect, onClose }: GraphNodePickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<readonly NodeData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ q: searchQuery, limit: '8' })
      const response = await fetch(`/api/graph/search?${params.toString()}`)

      if (!response.ok) {
        setResults([])
        return
      }

      const json = await response.json()
      if (!json.success || !json.data?.nodes) {
        setResults([])
        return
      }

      const items: NodeData[] = (
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
              : typeof n.properties.full_name === 'string'
                ? n.properties.full_name
                : n.id,
      }))
      setResults(items)
    } catch {
      setResults([])
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

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar nodo del grafo…"
        className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
        autoFocus
      />

      {isLoading && <div className="py-2 text-center text-xs text-zinc-500">Buscando…</div>}

      {!isLoading && results.length > 0 && (
        <ul className="mt-1 max-h-48 overflow-y-auto">
          {results.map((node) => (
            <li key={node.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                onClick={() => onSelect(node)}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: LABEL_COLORS[node.label] ?? '#94a3b8' }}
                />
                <span className="min-w-0 flex-1 truncate text-left">{node.name}</span>
                <span className="flex-shrink-0 text-xs text-zinc-500">{node.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && query.length >= 2 && results.length === 0 && (
        <div className="py-2 text-center text-xs text-zinc-500">Sin resultados</div>
      )}
    </div>
  )
}
