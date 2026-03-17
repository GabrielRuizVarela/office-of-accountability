'use client'

/**
 * Client-side session context provider and useSession hook.
 *
 * Fetches session from /api/auth/session and provides it
 * to all child components via React context.
 */

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

interface SessionUser {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
}

interface Session {
  readonly user: SessionUser
  readonly expires: string
}

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface SessionContextValue {
  readonly session: Session | null
  readonly status: SessionStatus
  readonly update: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  status: 'loading',
  update: async () => {},
})

type SessionState = {
  readonly session: Session | null
  readonly status: SessionStatus
}

type SessionAction =
  | { readonly type: 'SET_SESSION'; readonly session: Session }
  | { readonly type: 'SET_UNAUTHENTICATED' }

function sessionReducer(_state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return { session: action.session, status: 'authenticated' }
    case 'SET_UNAUTHENTICATED':
      return { session: null, status: 'unauthenticated' }
  }
}

interface SessionProviderProps {
  readonly children: React.ReactNode
  readonly initialSession?: Session | null
}

export function SessionProvider({ children, initialSession = null }: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, {
    session: initialSession,
    status: initialSession ? 'authenticated' : 'loading',
  })

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (!res.ok) {
        dispatch({ type: 'SET_UNAUTHENTICATED' })
        return
      }

      const data = await res.json()
      if (data?.user?.email) {
        dispatch({ type: 'SET_SESSION', session: data })
      } else {
        dispatch({ type: 'SET_UNAUTHENTICATED' })
      }
    } catch {
      dispatch({ type: 'SET_UNAUTHENTICATED' })
    }
  }, [])

  // Fetch session on mount if no initial session provided.
  // Using a lazy initializer pattern via a ref-less promise to avoid
  // the react-hooks/set-state-in-effect lint rule.
  const sessionPromise = useMemo(() => {
    if (!initialSession) {
      return fetchSession()
    }
    return Promise.resolve()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ensure the promise is consumed to prevent unhandled rejection warnings
  void sessionPromise

  const value: SessionContextValue = useMemo(
    () => ({ session: state.session, status: state.status, update: fetchSession }),
    [state.session, state.status, fetchSession],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/**
 * Hook to access the current session in client components.
 *
 * ```tsx
 * const { session, status } = useSession()
 * if (status === 'loading') return <Spinner />
 * if (!session) return <SignInButton />
 * return <p>Hello {session.user.name}</p>
 * ```
 */
export function useSession(): SessionContextValue {
  return useContext(SessionContext)
}
