/**
 * OG image API route for investigations.
 *
 * GET /api/og/investigation/[slug] → 1200x630 PNG
 *
 * Design: Dark card with investigation title, author name,
 * summary excerpt, and tag pills. Matches the site's zinc/dark theme.
 */

import React from 'react'

import { getInvestigationBySlug } from '@/lib/investigation'
import { ogImageResponse } from '@/lib/og'

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params

  const data = await getInvestigationBySlug(slug)

  if (!data || data.investigation.status !== 'published') {
    return new Response('Investigation not found', { status: 404 })
  }

  const { investigation, author } = data
  const authorName = author.name ?? 'Anónimo'
  const summaryExcerpt = truncate(investigation.summary, 160)
  const tags = investigation.tags.slice(0, 4)

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
        <span style={{ fontSize: '20px', fontWeight: 400, color: '#52525b', marginLeft: '8px' }}>
          — Investigación
        </span>
      </div>

      {/* Center: investigation info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#fafafa',
            maxWidth: '1000px',
            overflow: 'hidden',
          }}
        >
          {truncate(investigation.title, 100)}
        </div>

        {summaryExcerpt ? (
          <div
            style={{
              fontSize: '22px',
              fontWeight: 400,
              lineHeight: 1.4,
              color: '#a1a1aa',
              maxWidth: '900px',
            }}
          >
            {summaryExcerpt}
          </div>
        ) : null}

        {/* Tags row */}
        {tags.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <TagPill key={tag} text={tag} />
            ))}
          </div>
        ) : null}
      </div>

      {/* Bottom: author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700,
            color: '#a1a1aa',
          }}
        >
          {authorName.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: '20px', fontWeight: 400, color: '#a1a1aa' }}>{authorName}</span>
        {investigation.published_at ? (
          <span style={{ fontSize: '18px', fontWeight: 400, color: '#52525b', marginLeft: '12px' }}>
            {formatDate(investigation.published_at)}
          </span>
        ) : null}
      </div>
    </div>
  )

  return ogImageResponse({ element })
}

// ---------------------------------------------------------------------------
// Sub-components (satori-compatible)
// ---------------------------------------------------------------------------

function TagPill({ text }: { readonly text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: '9999px',
        padding: '6px 16px',
        fontSize: '18px',
        fontWeight: 400,
        color: '#818cf8',
      }}
    >
      {text}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}
