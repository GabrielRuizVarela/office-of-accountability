'use client'

/**
 * Sign-in page at /auth/signin.
 *
 * Credentials form (email/password) with optional Google OAuth button.
 * Posts credentials to /api/auth/callback/credentials via fetch,
 * then redirects on success.
 */

import Link from 'next/link'
import { useCallback, useReducer } from 'react'

interface FormState {
  readonly email: string
  readonly password: string
  readonly error: string | null
  readonly isSubmitting: boolean
}

type FormAction =
  | { readonly type: 'SET_FIELD'; readonly field: 'email' | 'password'; readonly value: string }
  | { readonly type: 'SET_ERROR'; readonly error: string }
  | { readonly type: 'SET_SUBMITTING'; readonly isSubmitting: boolean }
  | { readonly type: 'CLEAR_ERROR' }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.error, isSubmitting: false }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting, error: null }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
  }
}

const INITIAL_STATE: FormState = {
  email: '',
  password: '',
  error: null,
  isSubmitting: false,
}

export default function SignInPage() {
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: true })

      try {
        // Auth.js requires a CSRF token for POST requests
        const csrfRes = await fetch('/api/auth/csrf')
        const { csrfToken } = await csrfRes.json()

        const res = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            email: state.email,
            password: state.password,
            csrfToken,
            redirect: 'false',
          }),
          redirect: 'manual',
        })

        // Auth.js returns a redirect on success
        if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 200) {
          // Check if the response indicates an error via URL
          const url = res.url || ''
          if (url.includes('error=')) {
            dispatch({ type: 'SET_ERROR', error: 'Email o contraseña incorrectos' })
            return
          }
          window.location.href = '/'
          return
        }

        dispatch({ type: 'SET_ERROR', error: 'Email o contraseña incorrectos' })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Error de conexión. Intenta de nuevo.' })
      }
    },
    [state.email, state.password],
  )

  const handleFieldChange = useCallback(
    (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_FIELD', field, value: e.target.value })
    },
    [],
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ORC
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ingresá a tu cuenta para contribuir
          </p>
        </div>

        {/* Error alert */}
        {state.error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
          >
            {state.error}
          </div>
        )}

        {/* Credentials form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={state.email}
              onChange={handleFieldChange('email')}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={state.password}
              onChange={handleFieldChange('password')}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              placeholder="********"
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={state.isSubmitting}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {state.isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-500 dark:text-zinc-500">o</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Google OAuth — <a> intentional: API route triggers full-page OAuth redirect */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/auth/signin/google"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </a>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿No tenés cuenta?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
