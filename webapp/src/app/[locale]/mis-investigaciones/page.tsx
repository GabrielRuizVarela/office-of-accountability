'use client'

/**
 * My investigations dashboard at /mis-investigaciones.
 *
 * Auth required — shows the user's drafts, published, and archived investigations.
 * Supports filtering by status and links to create/edit pages.
 */

import Link from 'next/link'
import { useCallback, useEffect, useReducer } from 'react'

import { SessionProvider, useSession } from '@/components/auth/SessionProvider'
import type { InvestigationListItem } from '@/lib/investigation/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | 'draft' | 'published' | 'archived'

interface ApiResponse {
  readonly success: boolean
  readonly data?: readonly InvestigationListItem[]
  readonly error?: string
  readonly meta?: {
    readonly total: number
    readonly page: number
    readonly limit: number
    readonly hasMore: boolean
  }
}

interface State {
  readonly investigations: readonly InvestigationListItem[]
  readonly statusFilter: StatusFilter
  readonly page: number
  readonly hasMore: boolean
  readonly total: number
  readonly loading: boolean
  readonly loadingMore: boolean
  readonly error: string | null
}

type Action =
  | { readonly type: 'SET_FILTER'; readonly filter: StatusFilter }
  | { readonly type: 'FETCH_START' }
  | { readonly type: 'FETCH_MORE_START' }
  | {
      readonly type: 'FETCH_SUCCESS'
      readonly data: readonly InvestigationListItem[]
      readonly meta: { readonly total: number; readonly page: number; readonly hasMore: boolean }
    }
  | {
      readonly type: 'FETCH_MORE_SUCCESS'
      readonly data: readonly InvestigationListItem[]
      readonly meta: { readonly total: number; readonly page: number; readonly hasMore: boolean }
    }
  | { readonly type: 'FETCH_ERROR'; readonly error: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        statusFilter: action.filter,
        investigations: [],
        page: 1,
        hasMore: false,
        total: 0,
      }
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_MORE_START':
      return { ...state, loadingMore: true, error: null }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        investigations: action.data,
        page: action.meta.page,
        hasMore: action.meta.hasMore,
        total: action.meta.total,
      }
    case 'FETCH_MORE_SUCCESS':
      return {
        ...state,
        loadingMore: false,
        investigations: [...state.investigations, ...action.data],
        page: action.meta.page,
        hasMore: action.meta.hasMore,
        total: action.meta.total,
      }
    case 'FETCH_ERROR':
      return { ...state, loading: false, loadingMore: false, error: action.error }
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIMIT = 12

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Todas',
  draft: 'Borradores',
  published: 'Publicadas',
  archived: 'Archivadas',
}

const STATUS_BADGE: Record<string, { readonly label: string; readonly className: string }> = {
  draft: { label: 'Borrador', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-800' },
  published: {
    label: 'Publicada',
    className: 'bg-green-900/50 text-green-400 border-green-800',
  },
  archived: { label: 'Archivada', className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
}

const FILTER_OPTIONS: readonly StatusFilter[] = ['all', 'draft', 'published', 'archived']

// ---------------------------------------------------------------------------
// Page wrapper (provides session)
// ---------------------------------------------------------------------------

export default function MisInvestigacionesPage() {
  return (
    <SessionProvider>
      <MisInvestigacionesContent />
    </SessionProvider>
  )
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function MisInvestigacionesContent() {
  const { session, status: sessionStatus } = useSession()

  const [state, dispatch] = useReducer(reducer, {
    investigations: [],
    statusFilter: 'all',
    page: 1,
    hasMore: false,
    total: 0,
    loading: true,
    loadingMore: false,
    error: null,
  })

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      window.location.href = '/auth/signin?callbackUrl=/mis-investigaciones'
    }
  }, [sessionStatus])

  const fetchInvestigations = useCallback(async (page: number, append: boolean) => {
    dispatch({ type: append ? 'FETCH_MORE_START' : 'FETCH_START' })

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      })

      const res = await fetch(`/api/investigations/mine?${params.toString()}`)
      const json: ApiResponse = await res.json()

      if (!json.success || !json.data || !json.meta) {
        dispatch({
          type: 'FETCH_ERROR',
          error: json.error || 'Error al cargar investigaciones',
        })
        return
      }

      dispatch({
        type: append ? 'FETCH_MORE_SUCCESS' : 'FETCH_SUCCESS',
        data: json.data,
        meta: json.meta,
      })
    } catch {
      dispatch({ type: 'FETCH_ERROR', error: 'Error de conexión' })
    }
  }, [])

  // Fetch on mount and when filter changes (client-side filter)
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      void fetchInvestigations(1, false)
    }
  }, [sessionStatus, fetchInvestigations])

  const handleLoadMore = useCallback(() => {
    void fetchInvestigations(state.page + 1, true)
  }, [state.page, fetchInvestigations])

  const handleFilterChange = useCallback((filter: StatusFilter) => {
    dispatch({ type: 'SET_FILTER', filter })
  }, [])

  // Client-side status filter (the /mine endpoint returns all statuses)
  const filtered =
    state.statusFilter === 'all'
      ? state.investigations
      : state.investigations.filter((i) => i.status === state.statusFilter)

  // Loading / redirect states
  if (sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-400">Cargando...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-400">Redirigiendo a inicio de sesión...</p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Title + CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">Mis investigaciones</h1>
          <Link
            href="/investigacion/nueva"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Nueva investigación
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-zinc-900 p-1">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm transition-colors ${
                state.statusFilter === filter
                  ? 'bg-zinc-800 font-medium text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {STATUS_LABELS[filter]}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {state.loading && (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
              Cargando...
            </div>
          </div>
        )}

        {/* Error state */}
        {state.error && !state.loading && (
          <div className="mt-16 text-center">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}

        {/* Empty state */}
        {!state.loading && !state.error && filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-zinc-400">
              {state.statusFilter === 'all'
                ? 'Aún no tenés investigaciones.'
                : `No tenés investigaciones con estado "${STATUS_LABELS[state.statusFilter].toLowerCase()}".`}
            </p>
            <Link
              href="/investigacion/nueva"
              className="mt-3 inline-block text-sm text-blue-400 transition-colors hover:text-blue-300"
            >
              Crear tu primera investigación
            </Link>
          </div>
        )}

        {/* Investigation list */}
        {filtered.length > 0 && (
          <div className="mt-6 space-y-3">
            {filtered.map((item) => (
              <InvestigationRow key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Load more */}
        {state.hasMore && !state.loading && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={state.loadingMore}
              className="rounded-lg border border-zinc-700 px-6 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 disabled:opacity-50"
            >
              {state.loadingMore ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
    </main>
  )
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function InvestigationRow({ item }: { readonly item: InvestigationListItem }) {
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.draft

  const editUrl =
    item.status === 'published'
      ? `/investigacion/${item.slug}/editar`
      : `/investigacion/${item.slug}/editar`

  const viewUrl = item.status === 'published' ? `/investigacion/${item.slug}` : null

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={editUrl}
            className="truncate font-medium text-zinc-100 transition-colors hover:text-blue-400"
          >
            {item.title}
          </Link>
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        {item.summary && <p className="mt-1 truncate text-sm text-zinc-500">{item.summary}</p>}
        <p className="mt-1 text-xs text-zinc-600">
          {item.updated_at ? `Actualizado ${formatDate(item.updated_at)}` : ''}
          {item.tags.length > 0 && ` · ${item.tags.join(', ')}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {viewUrl && (
          <Link
            href={viewUrl}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Ver
          </Link>
        )}
        <Link
          href={editUrl}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          Editar
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}
