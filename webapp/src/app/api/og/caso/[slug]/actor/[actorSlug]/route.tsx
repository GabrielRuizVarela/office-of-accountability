/**
 * OG image for a Caso Libra actor.
 *
 * GET /api/og/caso/[slug]/actor/[actorSlug] → 1200x630 PNG
 */

import React from 'react'

import { getPersonBySlug } from '@/lib/caso-libra'
import { ogImageResponse } from '@/lib/og'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; actorSlug: string }> },
): Promise<Response> {
  const { actorSlug } = await params

  if (!actorSlug || actorSlug.length > 200) {
    return new Response('Not found', { status: 404 })
  }

  const data = await getPersonBySlug(actorSlug)

  if (!data) {
    return new Response('Actor not found', { status: 404 })
  }

  const person = data.person
  const name = (person.name as string) ?? 'Actor'
  const role = person.role as string | undefined
  const description = person.description as string | undefined

  const element = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#09090b',
        padding: '60px',
        fontFamily: 'Inter',
        color: '#fafafa',
      }}
    >
      {/* Top: branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#a855f7',
          }}
        />
        <span style={{ fontSize: '20px', fontWeight: 400, color: '#a1a1aa' }}>
          Caso Libra — Oficina de Rendicion de Cuentas
        </span>
      </div>

      {/* Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#1e3a5f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 700,
            color: '#60a5fa',
          }}
        >
          {name.charAt(0)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1 }}>
            {truncate(name, 40)}
          </div>
          {role ? (
            <div style={{ fontSize: '22px', fontWeight: 400, color: '#a1a1aa' }}>
              {truncate(role, 80)}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {description ? (
          <div style={{ fontSize: '18px', fontWeight: 400, color: '#71717a', maxWidth: '900px' }}>
            {truncate(description, 160)}
          </div>
        ) : null}
        <div style={{ fontSize: '16px', fontWeight: 400, color: '#3f3f46' }}>
          Investigacion comunitaria basada en datos publicos
        </div>
      </div>
    </div>
  )

  return ogImageResponse({ element })
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}
