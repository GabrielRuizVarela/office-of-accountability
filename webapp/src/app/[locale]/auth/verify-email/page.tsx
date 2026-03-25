'use client'

/**
 * Email verification page at /auth/verify-email.
 *
 * Receives email + token from URL search params and calls
 * the verify-email API endpoint to complete verification.
 */

import { Link } from '@/i18n/navigation'
import { useCallback, useEffect, useReducer } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

type Status = 'loading' | 'success' | 'error'

interface PageState {
  readonly status: Status
  readonly error: string | null
}

type PageAction =
  | { readonly type: 'SET_SUCCESS' }
  | { readonly type: 'SET_ERROR'; readonly error: string }

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_SUCCESS':
      return { status: 'success', error: null }
    case 'SET_ERROR':
      return { status: 'error', error: action.error }
  }
}

export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  const [state, dispatch] = useReducer(pageReducer, {
    status: 'loading',
    error: null,
  })

  const verify = useCallback(async () => {
    if (!email || !token) {
      dispatch({ type: 'SET_ERROR', error: t('invalidVerificationLink') })
      return
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      })

      const data = await res.json()

      if (!res.ok) {
        dispatch({
          type: 'SET_ERROR',
          error: data.error || t('verifyEmailError'),
        })
        return
      }

      dispatch({ type: 'SET_SUCCESS' })
    } catch {
      dispatch({
        type: 'SET_ERROR',
        error: t('connectionError'),
      })
    }
  }, [email, token, t])

  useEffect(() => {
    verify()
  }, [verify])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ORC
        </Link>

        {state.status === 'loading' && (
          <div className="mt-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {t('verifyingEmail')}
            </p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="mt-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {t('emailVerified')}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t('emailVerifiedSuccess')}
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t('signIn')}
            </Link>
          </div>
        )}

        {state.status === 'error' && (
          <div className="mt-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {t('verificationError')}
            </h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('backToSignInPage')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
