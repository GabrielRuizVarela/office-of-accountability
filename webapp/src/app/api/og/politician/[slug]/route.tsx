/**
 * OG image API route for politician profiles.
 *
 * GET /api/og/politician/[slug] → 1200x630 PNG
 *
 * Design: Dark card with politician name, party, province, chamber,
 * and vote count. Matches the site's zinc/dark theme.
 */

import React from 'react'

import { getPoliticianBySlug } from '@/lib/graph'
import { politicianSlugSchema } from '@/lib/graph/validation'
import { ogImageResponse } from '@/lib/og'

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params

  const parsed = politicianSlugSchema.safeParse(slug)
  if (!parsed.success) {
    return new Response('Not found', { status: 404 })
  }

  const politician = await getPoliticianBySlug(parsed.data)

  if (!politician) {
    return new Response('Politician not found', { status: 404 })
  }

  const chamberLabel = formatChamber(politician.chamber)
  const partyName = politician.party?.name ?? ''
  const provinceName = politician.provinceNode?.name ?? politician.province ?? ''

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
          Oficina de Rendicion de Cuentas
        </span>
      </div>

      {/* Center: politician info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#fafafa',
            maxWidth: '900px',
          }}
        >
          {politician.name}
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {partyName ? <Pill text={partyName} color="#a855f7" bgColor="#3b0764" /> : null}
          {provinceName ? <Pill text={provinceName} color="#10b981" bgColor="#022c22" /> : null}
          {chamberLabel ? <Pill text={chamberLabel} color="#3b82f6" bgColor="#172554" /> : null}
        </div>
      </div>

      {/* Bottom: stats */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
        <Stat label="Votaciones" value={String(politician.totalVotes)} />
        <Stat label="Presencia" value={`${Math.round(politician.presencePct)}%`} />
      </div>
    </div>
  )

  return ogImageResponse({ element })
}

// ---------------------------------------------------------------------------
// Sub-components (satori-compatible)
// ---------------------------------------------------------------------------

function Pill({
  text,
  color,
  bgColor,
}: {
  readonly text: string
  readonly color: string
  readonly bgColor: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: bgColor,
        borderRadius: '9999px',
        padding: '8px 20px',
        fontSize: '22px',
        fontWeight: 400,
        color,
      }}
    >
      {text}
    </div>
  )
}

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '16px', color: '#71717a', fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: '36px', fontWeight: 700, color: '#fafafa' }}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatChamber(chamber: string): string {
  const chambers: Readonly<Record<string, string>> = {
    diputados: 'Diputados',
    senadores: 'Senadores',
  }
  return chambers[chamber.toLowerCase()] ?? chamber
}
