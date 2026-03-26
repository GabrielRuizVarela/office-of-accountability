'use client'

/**
 * Create investigation page at /investigacion/nueva.
 *
 * Auth required - redirects to sign-in if unauthenticated.
 * Wraps InvestigationForm with create-specific save logic.
 */

import { useCallback, useEffect } from 'react'

import { useSession } from '@/components/auth/SessionProvider'
import {
  InvestigationForm,
  type InvestigationFormData,
} from '@/components/investigation/InvestigationForm'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'

function CreateInvestigationContent() {
  const { session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin?callbackUrl=/investigacion/nueva'
    }
  }, [status])

  const handleSave = useCallback(async (data: InvestigationFormData): Promise<string> => {
    const res = await fetchWithCsrf('/api/investigations', {
      method: 'POST',
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
      throw new Error(json.error || 'Error al crear la investigación')
    }

    return json.data.investigation.slug as string
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando...</p>
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

  return <InvestigationForm heading="Nueva investigación" onSave={handleSave} />
}

export default function CreateInvestigationPage() {
  return <CreateInvestigationContent />
}
