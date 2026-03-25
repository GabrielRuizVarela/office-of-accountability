'use client'

/**
 * Forgot password page at /auth/forgot-password.
 *
 * Collects email and sends a password reset request.
 * Always shows success to prevent email enumeration.
 */

import { Link } from '@/i18n/navigation'
import { useCallback, useReducer } from 'react'
import { useTranslations } from 'next-intl'

interface FormState {
  readonly email: string
  readonly status: 'idle' | 'submitting' | 'sent'
  readonly error: string | null
}

type FormAction =
  | { readonly type: 'SET_EMAIL'; readonly value: string }
  | { readonly type: 'SET_SUBMITTING' }
  | { readonly type: 'SET_SENT' }
  | { readonly type: 'SET_ERROR'; readonly error: string }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.value, error: null }
    case 'SET_SUBMITTING':
      return { ...state, status: 'submitting', error: null }
    case 'SET_SENT':
      return { ...state, status: 'sent', error: null }
    case 'SET_ERROR':
      return { ...state, status: 'idle', error: action.error }
  }
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [state, dispatch] = useReducer(formReducer, {
    email: '',
    status: 'idle',
    error: null,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      dispatch({ type: 'SET_SUBMITTING' })

      try {
        const res = await fetch('/api/auth/request-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.email }),
        })

        if (!res.ok) {
          const data = await res.json()
          dispatch({ type: 'SET_ERROR', error: data.error || t('sendEmailError') })
          return
        }

        dispatch({ type: 'SET_SENT' })
      } catch {
        dispatch({ type: 'SET_ERROR', error: t('connectionError') })
      }
    },
    [state.email, t],
  )

  if (state.status === 'sent') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ORC
          </Link>
          <div className="mt-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {t('checkYourEmail')}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t.rich('resetEmailSent', {
                email: state.email,
                b: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('backToSignInPage')}
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
            {t('resetPassword')}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t('forgotPasswordSubtitle')}
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
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={state.email}
              onChange={(e) => dispatch({ type: 'SET_EMAIL', value: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              placeholder="tu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={state.status === 'submitting'}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {state.status === 'submitting' ? t('sending') : t('sendResetLink')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('backToSignInPage')}
          </Link>
        </p>
      </div>
    </div>
  )
}
