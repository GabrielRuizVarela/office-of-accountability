'use client'

/**
 * Auth error page at /auth/error.
 *
 * Displays authentication errors with user-friendly messages.
 * Auth.js redirects here on OAuth failures, account conflicts, etc.
 */

import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useTranslations } from 'next-intl'

const ERROR_KEYS = [
  'Configuration',
  'AccessDenied',
  'Verification',
  'OAuthSignin',
  'OAuthCallback',
  'OAuthCreateAccount',
  'EmailCreateAccount',
  'Callback',
  'OAuthAccountNotLinked',
  'CredentialsSignin',
  'Default',
] as const

function ErrorContent() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const errorType = searchParams.get('error') || 'Default'
  const key = ERROR_KEYS.includes(errorType as (typeof ERROR_KEYS)[number])
    ? errorType
    : 'Default'
  const message = t(`errors.${key}`)

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mb-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t('authError')}
        </h1>
      </div>

      <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/auth/signin"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {t('tryAgain')}
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  const t = useTranslations('auth')
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <Suspense fallback={<div className="text-sm text-zinc-500">{t('loading')}</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  )
}
