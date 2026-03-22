'use client'

/**
 * User profile page at /perfil.
 *
 * Auth required — view and edit display name.
 * Uses fetchWithCsrf for PATCH mutation.
 */

import { useCallback, useEffect, useReducer } from 'react'

import { useSession } from '@/components/auth/SessionProvider'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserProfile {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
  readonly verification_tier: number
  readonly created_at: string
}

interface State {
  readonly profile: UserProfile | null
  readonly loading: boolean
  readonly saving: boolean
  readonly editingName: boolean
  readonly nameInput: string
  readonly error: string | null
  readonly success: string | null
}

type Action =
  | { readonly type: 'FETCH_START' }
  | { readonly type: 'FETCH_SUCCESS'; readonly profile: UserProfile }
  | { readonly type: 'FETCH_ERROR'; readonly error: string }
  | { readonly type: 'START_EDITING' }
  | { readonly type: 'CANCEL_EDITING' }
  | { readonly type: 'SET_NAME_INPUT'; readonly value: string }
  | { readonly type: 'SAVE_START' }
  | { readonly type: 'SAVE_SUCCESS'; readonly profile: UserProfile }
  | { readonly type: 'SAVE_ERROR'; readonly error: string }
  | { readonly type: 'CLEAR_MESSAGE' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, profile: action.profile, nameInput: action.profile.name ?? '' }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'START_EDITING':
      return { ...state, editingName: true, success: null, error: null }
    case 'CANCEL_EDITING':
      return { ...state, editingName: false, nameInput: state.profile?.name ?? '' }
    case 'SET_NAME_INPUT':
      return { ...state, nameInput: action.value }
    case 'SAVE_START':
      return { ...state, saving: true, error: null, success: null }
    case 'SAVE_SUCCESS':
      return { ...state, saving: false, editingName: false, profile: action.profile, success: 'Nombre actualizado', nameInput: action.profile.name ?? '' }
    case 'SAVE_ERROR':
      return { ...state, saving: false, error: action.error }
    case 'CLEAR_MESSAGE':
      return { ...state, success: null, error: null }
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<number, { readonly label: string; readonly className: string }> = {
  0: { label: 'Observador', className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  1: { label: 'Participante', className: 'bg-blue-900/50 text-blue-400 border-blue-800' },
  2: { label: 'Verificado', className: 'bg-green-900/50 text-green-400 border-green-800' },
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

export default function PerfilPage() {
  return <PerfilContent />
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function PerfilContent() {
  const { session, status: sessionStatus } = useSession()

  const [state, dispatch] = useReducer(reducer, {
    profile: null,
    loading: true,
    saving: false,
    editingName: false,
    nameInput: '',
    error: null,
    success: null,
  })

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      window.location.href = '/auth/signin?callbackUrl=/perfil'
    }
  }, [sessionStatus])

  const fetchProfile = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const res = await fetch('/api/profile')
      const json = await res.json()
      if (!json.success || !json.data) {
        dispatch({ type: 'FETCH_ERROR', error: json.error ?? 'Error al cargar perfil' })
        return
      }
      dispatch({ type: 'FETCH_SUCCESS', profile: json.data })
    } catch {
      dispatch({ type: 'FETCH_ERROR', error: 'Error de conexion' })
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      void fetchProfile()
    }
  }, [sessionStatus, fetchProfile])

  const handleSaveName = useCallback(async () => {
    const trimmed = state.nameInput.trim()
    if (!trimmed) {
      dispatch({ type: 'SAVE_ERROR', error: 'El nombre no puede estar vacio' })
      return
    }

    dispatch({ type: 'SAVE_START' })
    try {
      const res = await fetchWithCsrf('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const json = await res.json()
      if (!json.success || !json.data) {
        dispatch({ type: 'SAVE_ERROR', error: json.error ?? 'Error al guardar' })
        return
      }
      dispatch({ type: 'SAVE_SUCCESS', profile: json.data })
    } catch {
      dispatch({ type: 'SAVE_ERROR', error: 'Error de conexion' })
    }
  }, [state.nameInput])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        void handleSaveName()
      } else if (e.key === 'Escape') {
        dispatch({ type: 'CANCEL_EDITING' })
      }
    },
    [handleSaveName],
  )

  // Clear success/error messages after 4s
  useEffect(() => {
    if (!state.success && !state.error) return
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_MESSAGE' }), 4000)
    return () => clearTimeout(timer)
  }, [state.success, state.error])

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
        <p className="text-sm text-zinc-400">Redirigiendo a inicio de sesion...</p>
      </div>
    )
  }

  const tier = TIER_LABELS[state.profile?.verification_tier ?? 0] ?? TIER_LABELS[0]

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-50">Mi perfil</h1>

        {/* Messages */}
        {state.success && (
          <div className="mt-4 rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-sm text-green-400">
            {state.success}
          </div>
        )}
        {state.error && !state.loading && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        {/* Loading */}
        {state.loading && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
              Cargando perfil...
            </div>
          </div>
        )}

        {/* Profile card */}
        {state.profile && !state.loading && (
          <div className="mt-6 space-y-6">
            {/* Name field */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Nombre
              </label>
              {state.editingName ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={state.nameInput}
                    onChange={(e) => dispatch({ type: 'SET_NAME_INPUT', value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    disabled={state.saving}
                    autoFocus
                    maxLength={200}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Tu nombre"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveName()}
                    disabled={state.saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                  >
                    {state.saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'CANCEL_EDITING' })}
                    disabled={state.saving}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg text-zinc-100">{state.profile.name ?? 'Sin nombre'}</p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'START_EDITING' })}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>

            {/* Email field (read-only) */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Email
              </label>
              <p className="mt-2 text-sm text-zinc-300">{state.profile.email}</p>
            </div>

            {/* Verification tier */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Nivel de verificacion
              </label>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tier.className}`}
                >
                  {tier.label}
                </span>
              </div>
            </div>

            {/* Account info */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Cuenta creada
              </label>
              <p className="mt-2 text-sm text-zinc-300">{formatDate(state.profile.created_at)}</p>
            </div>
          </div>
        )}
    </main>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}
