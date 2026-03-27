'use client'

/**
 * Investigations index page at /investigaciones.
 *
 * Public page showing published investigations in a card grid.
 * Supports tag filtering via query param or clickable tag pills.
 * Paginated with load-more button.
 */

import Link from 'next/link'
import NextImage from 'next/image'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

import type { InvestigationListItem } from '@/lib/investigation/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface TagsResponse {
  readonly success: boolean
  readonly data?: readonly string[]
}

interface State {
  readonly investigations: readonly InvestigationListItem[]
  readonly tags: readonly string[]
  readonly activeTag: string | null
  readonly page: number
  readonly hasMore: boolean
  readonly total: number
  readonly loading: boolean
  readonly loadingMore: boolean
  readonly error: string | null
}

type Action =
  | { readonly type: 'SET_TAG'; readonly tag: string | null }
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
  | { readonly type: 'SET_TAGS'; readonly tags: readonly string[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TAG':
      return {
        ...state,
        activeTag: action.tag,
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
    case 'SET_TAGS':
      return { ...state, tags: action.tags }
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIMIT = 12

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InvestigacionesPage() {
  const initialTag = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('tag') || null
  }, [])

  const [state, dispatch] = useReducer(reducer, {
    investigations: [],
    tags: [],
    activeTag: initialTag,
    page: 1,
    hasMore: false,
    total: 0,
    loading: true,
    loadingMore: false,
    error: null,
  })

  const fetchInvestigations = useCallback(
    async (page: number, tag: string | null, append: boolean) => {
      dispatch({ type: append ? 'FETCH_MORE_START' : 'FETCH_START' })

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(LIMIT),
        })
        if (tag) params.set('tag', tag)

        const res = await fetch(`/api/investigations?${params.toString()}`)
        const json: ApiResponse = await res.json()

        if (!json.success || !json.data || !json.meta) {
          dispatch({ type: 'FETCH_ERROR', error: json.error || 'Error al cargar investigaciones' })
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
    },
    [],
  )

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/investigations/tags')
      const json: TagsResponse = await res.json()
      if (json.success && json.data) {
        dispatch({ type: 'SET_TAGS', tags: json.data })
      }
    } catch {
      // Tags are non-critical — fail silently
    }
  }, [])

  // Fetch tags on mount
  useEffect(() => {
    void fetchTags()
  }, [fetchTags])

  // Fetch investigations when tag changes
  useEffect(() => {
    void fetchInvestigations(1, state.activeTag, false)
  }, [state.activeTag, fetchInvestigations])

  const handleTagClick = useCallback((tag: string | null) => {
    dispatch({ type: 'SET_TAG', tag })
    // Update URL without navigation
    const url = new URL(window.location.href)
    if (tag) {
      url.searchParams.set('tag', tag)
    } else {
      url.searchParams.delete('tag')
    }
    window.history.replaceState({}, '', url.toString())
  }, [])

  const handleLoadMore = useCallback(() => {
    void fetchInvestigations(state.page + 1, state.activeTag, true)
  }, [state.page, state.activeTag, fetchInvestigations])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Title + CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">Investigaciones</h1>
            {state.total > 0 && (
              <p className="mt-1 text-sm text-zinc-500">
                {state.total} investigaci{state.total === 1 ? 'ón' : 'ones'} publicada
                {state.total === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        {/* Tag filters */}
        {state.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleTagClick(null)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                state.activeTag === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
              }`}
            >
              Todas
            </button>
            {state.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  state.activeTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {state.loading && (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
              Cargando investigaciones...
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
        {!state.loading && !state.error && state.investigations.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-zinc-400">
              {state.activeTag
                ? `No hay investigaciones con la etiqueta "${state.activeTag}".`
                : 'Aún no hay investigaciones publicadas.'}
            </p>
            {state.activeTag && (
              <button
                type="button"
                onClick={() => handleTagClick(null)}
                className="mt-3 text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                Ver todas
              </button>
            )}
          </div>
        )}

        {/* Investigation cards grid */}
        {state.investigations.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {state.investigations.map((item) => (
              <InvestigationCard key={item.id} item={item} onTagClick={handleTagClick} />
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
// Card component
// ---------------------------------------------------------------------------

function InvestigationCard({
  item,
  onTagClick,
}: {
  readonly item: InvestigationListItem
  readonly onTagClick: (tag: string) => void
}) {
  return (
    <article className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
      {/* Title */}
      <Link
        href={`/investigacion/${item.slug}`}
        className="text-lg font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-blue-400"
      >
        {item.title}
      </Link>

      {/* Summary */}
      {item.summary && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">{item.summary}</p>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 5).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onTagClick(tag)
              }}
              className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer: author + date */}
      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-zinc-500">
        {item.author_name && (
          <span className="flex items-center gap-1.5">
            <AuthorAvatar name={item.author_name} image={item.author_image} size={20} />
            <span className="truncate">{item.author_name}</span>
          </span>
        )}
        {item.published_at && (
          <>
            {item.author_name && <span className="text-zinc-700">·</span>}
            <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
          </>
        )}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AuthorAvatar({
  name,
  image,
  size,
}: {
  readonly name: string
  readonly image: string | null
  readonly size: number
}) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (image) {
    return (
      <NextImage
        src={image}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        width={size}
        height={size}
        unoptimized
      />
    )
  }

  return (
    <span
      className="flex items-center justify-center rounded-full bg-zinc-700 text-[9px] font-medium text-zinc-300"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
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
