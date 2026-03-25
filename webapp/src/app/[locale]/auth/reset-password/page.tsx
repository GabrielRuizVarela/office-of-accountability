'use client'

/**
 * Password reset page at /auth/reset-password.
 *
 * Receives email + token from URL search params.
 * Collects new password and calls the reset-password API endpoint.
 */

import { Link } from '@/i18n/navigation'
import { useCallback, useReducer } from 'react'
import { useSearchParams } from 'next/navigation'

interface FormState {
  readonly password: string
  readonly confirmPassword: string
  readonly status: 'idle' | 'submitting' | 'success'
  readonly error: string | null
}

type FormAction =
  | { readonly type: 'SET_FIELD'; readonly field: 'password' | 'confirmPassword'; readonly value: string }
  | { readonly type: 'SET_SUBMITTING' }
  | { readonly type: 'SET_SUCCESS' }
  | { readonly type: 'SET_ERROR'; readonly error: string }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, error: null }
    case 'SET_SUBMITTING':
      return { ...state, status: 'submitting', error: null }
    case 'SET_SUCCESS':
      return { ...state, status: 'success', error: null }
    case 'SET_ERROR':
      return { ...state, status: 'idle', error: action.error }
  }
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  const [state, dispatch] = useReducer(formReducer, {
    password: '',
    confirmPassword: '',
    status: 'idle',
    error: null,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (state.password !== state.confirmPassword) {
        dispatch({ type: 'SET_ERROR', error: 'Las contraseñas no coinciden' })
        return
      }

      if (!email || !token) {
        dispatch({ type: 'SET_ERROR', error: 'Enlace de restablecimiento inválido' })
        return
      }

      dispatch({ type: 'SET_SUBMITTING' })

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token, password: state.password }),
        })

        const data = await res.json()

        if (!res.ok) {
          dispatch({ type: 'SET_ERROR', error: data.error || 'Error al restablecer la contraseña' })
          return
        }

        dispatch({ type: 'SET_SUCCESS' })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Error de conexión. Intenta de nuevo.' })
      }
    },
    [email, token, state.password, state.confirmPassword],
  )

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="text-sm font-semibold text-zinc-500">ORC</Link>
          <h1 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Enlace inválido
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Este enlace de restablecimiento no es válido o expiró.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  if (state.status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="text-sm font-semibold text-zinc-500">ORC</Link>
          <div className="mt-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Contraseña restablecida
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Tu contraseña fue actualizada exitosamente.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ORC
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Elegí una contraseña nueva para tu cuenta
          </p>
        </div>

        {state.error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
          >
            {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={state.password}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={state.confirmPassword}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'confirmPassword', value: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              placeholder="Repetí la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={state.status === 'submitting'}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {state.status === 'submitting' ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
