/**
 * OG image API route for Epstein investigation.
 *
 * GET /api/og/caso/[slug] → 1200x630 PNG
 *
 * Design: Dark card with investigation title, subtitle,
 * and aggregate stats (persons, events, documents).
 */

import React from 'react'

import { CASO_EPSTEIN_SLUG, getActors, getTimeline, getDocuments } from '@/lib/caso-epstein'
import { ogImageResponse } from '@/lib/og'

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params

  if (slug !== CASO_EPSTEIN_SLUG) {
    return new Response('Not found', { status: 404 })
  }

  const [persons, events, documents] = await Promise.all([
    getActors(CASO_EPSTEIN_SLUG),
    getTimeline(CASO_EPSTEIN_SLUG),
    getDocuments(CASO_EPSTEIN_SLUG),
  ])

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
      </div>

      {/* Center: title and subtitle */}
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
          Epstein Investigation
        </div>

        <div
          style={{
            fontSize: '26px',
            fontWeight: 400,
            lineHeight: 1.4,
            color: '#a1a1aa',
          }}
        >
          Network Analysis
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Pill text="Knowledge Graph" color="#818cf8" bgColor="#1a1a2e" />
          <Pill text="Flight Logs" color="#34d399" bgColor="#022c22" />
          <Pill text="Court Documents" color="#fbbf24" bgColor="#422006" />
        </div>
      </div>

      {/* Bottom: stats */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-end' }}>
        <Stat label="Persons" value={String(persons.length)} />
        <Stat label="Events" value={String(events.length)} />
        <Stat label="Documents" value={String(documents.length)} />
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
        fontSize: '20px',
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
