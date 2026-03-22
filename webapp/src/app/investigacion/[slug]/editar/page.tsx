'use client'

/**
 * Edit investigation page at /investigacion/[slug]/editar.
 *
 * Auth required — redirects to sign-in if unauthenticated.
 * Loads existing investigation by slug, then wraps InvestigationForm
 * with update/delete logic.
 */

import { useCallback, useEffect, useReducer } from 'react'
import { useParams } from 'next/navigation'

import { useSession } from '@/components/auth/SessionProvider'
import {
  InvestigationForm,
  type InvestigationFormData,
} from '@/components/investigation/InvestigationForm'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface PageState {
  readonly investigationId: string | null
  readonly initialData: InvestigationFormData | null
  readonly isLoading: boolean
  readonly error: string | null
}

type PageAction =
  | { readonly type: 'LOADED'; readonly id: string; readonly data: InvestigationFormData }
  | { readonly type: 'ERROR'; readonly error: string }
  | { readonly type: 'SET_LOADING' }

function pageReducer(_state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'LOADED':
      return { investigationId: action.id, initialData: action.data, isLoading: false, error: null }
    case 'ERROR':
      return { investigationId: null, initialData: null, isLoading: false, error: action.error }
    case 'SET_LOADING':
      return { investigationId: null, initialData: null, isLoading: true, error: null }
  }
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function EditInvestigationContent() {
  const { session, status } = useSession()
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''

  const [state, dispatch] = useReducer(pageReducer, {
    investigationId: null,
    initialData: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = `/auth/signin?callbackUrl=/investigacion/${slug}/editar`
    }
  }, [status, slug])

  // Load investigation data
  useEffect(() => {
    if (status !== 'authenticated' || !slug) return

    const controller = new AbortController()

    async function loadInvestigation() {
      dispatch({ type: 'SET_LOADING' })

      try {
        // Search by slug: list mine and find matching slug
        const res = await fetch(`/api/investigations/mine?limit=50`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          dispatch({ type: 'ERROR', error: 'Error al cargar la investigación' })
          return
        }

        const json = await res.json()
        const items = json.data as ReadonlyArray<{
          readonly id: string
          readonly slug: string
          readonly title: string
          readonly summary: string
          readonly status: string
          readonly tags: readonly string[]
        }>

        const match = items.find((item) => item.slug === slug)
        if (!match) {
          dispatch({ type: 'ERROR', error: 'Investigación no encontrada' })
          return
        }

        // Fetch full investigation body by ID
        const detailRes = await fetch(`/api/investigations/${match.id}`, {
          signal: controller.signal,
        })

        if (!detailRes.ok) {
          dispatch({ type: 'ERROR', error: 'Error al cargar los detalles' })
          return
        }

        const detailJson = await detailRes.json()
        const inv = detailJson.data.investigation

        dispatch({
          type: 'LOADED',
          id: inv.id,
          data: {
            title: inv.title,
            summary: inv.summary,
            tags: inv.tags,
            body: inv.body,
            referencedNodeIds: inv.referenced_node_ids,
            status: inv.status === 'published' ? 'published' : 'draft',
          },
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        dispatch({ type: 'ERROR', error: 'Error de conexión' })
      }
    }

    void loadInvestigation()

    return () => controller.abort()
  }, [status, slug])

  const handleSave = useCallback(
    async (data: InvestigationFormData): Promise<string> => {
      if (!state.investigationId) {
        throw new Error('No se pudo identificar la investigación')
      }

      const res = await fetchWithCsrf(`/api/investigations/${state.investigationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
          body: data.body,
          tags: data.tags,
          status: data.status,
          referenced_node_ids: data.referencedNodeIds,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Error al actualizar la investigación')
      }

      return json.data.investigation.slug as string
    },
    [state.investigationId],
  )

  const handleDelete = useCallback(async () => {
    if (!state.investigationId) {
      throw new Error('No se pudo identificar la investigación')
    }

    const res = await fetchWithCsrf(`/api/investigations/${state.investigationId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error || 'Error al eliminar la investigación')
    }
  }, [state.investigationId])

  if (status === 'loading' || state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando investigación...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Redirigiendo a inicio de sesión...
        </p>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          <a
            href="/mis-investigaciones"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Volver a mis investigaciones
          </a>
        </div>
      </div>
    )
  }

  if (!state.initialData) {
    return null
  }

  return (
    <InvestigationForm
      heading="Editar investigación"
      initialData={state.initialData}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  )
}

export default function EditInvestigationPage() {
  return <EditInvestigationContent />
}
