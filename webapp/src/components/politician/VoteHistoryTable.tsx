'use client'

import { useCallback, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoteRecord {
  readonly sessionId: string
  readonly sessionTitle: string
  readonly sessionDate: string
  readonly sessionResult: string
  readonly sessionType: string
  readonly vote: string
  readonly chamber: string
}

interface VoteHistoryResponse {
  readonly votes: readonly VoteRecord[]
  readonly totalCount: number
  readonly page: number
  readonly limit: number
  readonly hasMore: boolean
}

export interface VoteHistoryTableProps {
  readonly slug: string
  readonly initialData: VoteHistoryResponse
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VOTE_COLORS: Readonly<Record<string, string>> = {
  AFIRMATIVO: 'bg-emerald-500/20 text-emerald-400',
  NEGATIVO: 'bg-red-500/20 text-red-400',
  ABSTENCION: 'bg-yellow-500/20 text-yellow-400',
  AUSENTE: 'bg-zinc-500/20 text-zinc-500',
}

const VOTE_LABELS: Readonly<Record<string, string>> = {
  AFIRMATIVO: 'A favor',
  NEGATIVO: 'En contra',
  ABSTENCION: 'Abstención',
  AUSENTE: 'Ausente',
}

const PAGE_SIZE = 20

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VoteHistoryTable({ slug, initialData }: VoteHistoryTableProps) {
  const [data, setData] = useState<VoteHistoryResponse>(initialData)
  const [currentPage, setCurrentPage] = useState(initialData.page)
  const [isLoading, setIsLoading] = useState(false)

  const fetchPage = useCallback(
    async (page: number) => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        })
        const response = await fetch(
          `/api/politico/${encodeURIComponent(slug)}/votes?${params.toString()}`,
        )
        if (!response.ok) return

        const json = await response.json()
        if (json.success && json.data) {
          setData(json.data as VoteHistoryResponse)
          setCurrentPage(page)
        }
      } catch {
        // Keep current data on error
      } finally {
        setIsLoading(false)
      }
    },
    [slug],
  )

  // Reset when slug changes
  useEffect(() => {
    setData(initialData)
    setCurrentPage(initialData.page)
  }, [initialData])

  const totalPages = Math.ceil(data.totalCount / PAGE_SIZE)

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-zinc-100">
        Historial de votaciones
        <span className="ml-2 text-sm font-normal text-zinc-500">({data.totalCount} votos)</span>
      </h2>

      {data.votes.length === 0 ? (
        <p className="text-sm text-zinc-500">No se encontraron votaciones.</p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Asunto</th>
                  <th className="px-4 py-3 font-medium">Voto</th>
                  <th className="px-4 py-3 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody className={isLoading ? 'opacity-50' : ''}>
                {data.votes.map((vote) => (
                  <tr
                    key={`${vote.sessionId}-${vote.vote}`}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                      {formatDate(vote.sessionDate)}
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-zinc-200">
                      {vote.sessionTitle}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${VOTE_COLORS[vote.vote] ?? VOTE_COLORS.AUSENTE}`}
                      >
                        {VOTE_LABELS[vote.vote] ?? vote.vote}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{vote.sessionResult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Pagina {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchPage(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchPage(currentPage + 1)}
                  disabled={!data.hasMore || isLoading}
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}
