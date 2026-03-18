/**
 * OG image API route for Epstein investigation actor profiles.
 *
 * GET /api/og/caso/[slug]/actor/[actorSlug] → 1200x630 PNG
 *
 * Design: Dark card with person name, role, connection count,
 * and Epstein Investigation branding.
 */

import React from 'react'

import { CASO_EPSTEIN_SLUG, getPersonBySlug } from '@/lib/caso-epstein'
import { ogImageResponse } from '@/lib/og'

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; actorSlug: string }> },
): Promise<Response> {
  const { slug, actorSlug } = await params

  if (slug !== CASO_EPSTEIN_SLUG) {
    return new Response('Not found', { status: 404 })
  }

  const data = await getPersonBySlug(actorSlug)

  if (!data) {
    return new Response('Person not found', { status: 404 })
  }

  const { person, connections } = data
  const connectionCount = connections.links.length

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
          Office of Accountability
        </span>
        <span style={{ fontSize: '20px', fontWeight: 400, color: '#52525b', marginLeft: '8px' }}>
          — Epstein Investigation
        </span>
      </div>

      {/* Center: person info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Avatar circle with initial */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            color: '#a1a1aa',
          }}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#fafafa',
            maxWidth: '900px',
          }}
        >
          {person.name}
        </div>

        {person.role ? (
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              lineHeight: 1.4,
              color: '#a1a1aa',
            }}
          >
            {person.role}
          </div>
        ) : null}
      </div>

      {/* Bottom: stats */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-end' }}>
        <Stat label="Connections" value={String(connectionCount)} />
      </div>
    </div>
  )

  return ogImageResponse({ element })
}

// ---------------------------------------------------------------------------
// Sub-components (satori-compatible)
// ---------------------------------------------------------------------------

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '16px', color: '#71717a', fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: '36px', fontWeight: 700, color: '#fafafa' }}>{value}</span>
    </div>
  )
}
