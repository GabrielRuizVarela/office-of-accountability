'use client'

/**
 * User menu component.
 *
 * Shows sign-in link when unauthenticated, or a dropdown
 * with user info and sign-out when authenticated.
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useSession } from './SessionProvider'

export function UserMenu() {
  const { session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleSignOut = useCallback(async () => {
    setIsOpen(false)
    window.location.href = '/api/auth/signout'
  }, [])

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <Link
        href="/auth/signin"
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
      >
        Ingresar
      </Link>
    )
  }

  const initials = (session.user.name || session.user.email)
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white transition-opacity hover:opacity-80"
        title={session.user.name || session.user.email}
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={32}
            height={32}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
          {/* User info */}
          <div className="border-b border-zinc-800 px-4 py-3">
            {session.user.name && (
              <p className="text-sm font-medium text-zinc-100">{session.user.name}</p>
            )}
            <p className="truncate text-xs text-zinc-400">{session.user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setIsOpen(false)}
              className="block w-full px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              Mi perfil
            </Link>
            <Link
              href="/mis-investigaciones"
              onClick={() => setIsOpen(false)}
              className="block w-full px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              Mis investigaciones
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
