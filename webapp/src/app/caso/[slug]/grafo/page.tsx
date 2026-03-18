'use client'

/**
 * Caso Libra knowledge graph view.
 * Uses ForceGraph with all node types colored by label.
 */

import { useCallback, useEffect, useState } from 'react'

import type { GraphData } from '@/lib/neo4j/types'
import { ForceGraph } from '@/components/graph/ForceGraph'

export default function GrafoPage() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/caso-libra/graph')
        if (!res.ok) throw new Error('Error cargando el grafo')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId))
  }, [])

  const selectedNode = selectedNodeId ? data.nodes.find((n) => n.id === selectedNodeId) : null

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-zinc-500">
        Cargando grafo...
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center text-red-400">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-50">Grafo de Conocimiento</h1>
        <div className="flex gap-2 text-[10px]">
          <Legend color="#3b82f6" label="Persona" />
          <Legend color="#f59e0b" label="Evento" />
          <Legend color="#ef4444" label="Documento" />
          <Legend color="#10b981" label="Billetera" />
          <Legend color="#8b5cf6" label="Organizacion" />
          <Legend color="#ec4899" label="Token" />
        </div>
      </div>

      <div className="relative h-[60vh] overflow-hidden rounded-lg border border-zinc-800">
        <ForceGraph data={data} onNodeClick={handleNodeClick} selectedNodeId={selectedNodeId} />

        {/* Detail panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto border-l border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-sm sm:w-80">
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="mb-3 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cerrar
            </button>
            <NodeDetail node={selectedNode} />
          </div>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label }: { readonly color: string; readonly label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-zinc-500">{label}</span>
    </div>
  )
}

function NodeDetail({
  node,
}: {
  readonly node: {
    readonly labels: readonly string[]
    readonly id: string
    readonly properties: Readonly<Record<string, unknown>>
  }
}) {
  const p = node.properties
  const displayName = String(p.name ?? p.title ?? p.symbol ?? p.label ?? node.id)
  const role = typeof p.role === 'string' ? p.role : null
  const description = typeof p.description === 'string' ? p.description : null
  const date = typeof p.date === 'string' ? p.date : null
  const amountUsd = typeof p.amount_usd === 'number' ? p.amount_usd : null

  return (
    <div className="space-y-2">
      <span className="inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
        {node.labels[0]}
      </span>
      <h3 className="text-sm font-semibold text-zinc-100">{displayName}</h3>
      {role && <p className="text-xs text-zinc-400">{role}</p>}
      {description && <p className="text-xs leading-relaxed text-zinc-500">{description}</p>}
      {date && <p className="text-xs text-zinc-500">Fecha: {date}</p>}
      {amountUsd !== null && (
        <p className="text-xs text-emerald-400">${amountUsd.toLocaleString('en-US')} USD</p>
      )}
    </div>
  )
}
