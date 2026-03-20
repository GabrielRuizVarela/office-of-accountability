'use client'

import { useEffect, useRef, useState, use } from 'react'

import { ForceGraph } from '../../../../components/graph/ForceGraph'
import type { ForceGraphHandle } from '../../../../components/graph/ForceGraph'
import type { GraphData } from '../../../../lib/neo4j/types'

export default function VuelosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const graphRef = useRef<ForceGraphHandle>(null)
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await fetch(`/api/caso/${slug}/flights`)
        if (!res.ok) throw new Error('Failed to load flight data')
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flights')
      } finally {
        setIsLoading(false)
      }
    }
    fetchFlights()
  }, [slug])

  // Compute stats from graph data
  const flightCount = data.nodes.filter((n) => n.labels.includes('Flight')).length
  const passengerCount = data.nodes.filter((n) => n.labels.includes('Person')).length
  const locationCount = data.nodes.filter((n) => n.labels.includes('Location')).length

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-zinc-500">
        Loading flight data...
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
      {/* Stats bar */}
      <div className="flex items-center gap-4 border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-zinc-400">{flightCount} Flights</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-zinc-400">{passengerCount} Passengers</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">{locationCount} Locations</span>
        </div>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => graphRef.current?.zoomIn()}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            +
          </button>
          <button
            onClick={() => graphRef.current?.zoomOut()}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            −
          </button>
          <button
            onClick={() => graphRef.current?.zoomToFit()}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1">
        <ForceGraph ref={graphRef} data={data} />
      </div>
    </div>
  )
}
