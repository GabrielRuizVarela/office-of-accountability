/**
 * OG image for Caso Libra investigation.
 *
 * GET /api/og/caso/[slug] → 1200x630 PNG
 */

import React from 'react'

import { ogImageResponse } from '@/lib/og'

export async function GET(): Promise<Response> {
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

      {/* Center */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#fafafa',
          }}
        >
          Caso Libra: La Memecoin del Presidente
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 400,
            color: '#a1a1aa',
            maxWidth: '900px',
          }}
        >
          Investigacion comunitaria basada en datos publicos
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <StatPill value="$251M+" label="perdidas" />
          <StatPill value="114,000+" label="billeteras" />
          <StatPill value="94%" label="caida" />
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '18px', color: '#52525b' }}>
        <span>Blockchain</span>
        <span>Congreso</span>
        <span>Pericias</span>
        <span>Registros Publicos</span>
      </div>
    </div>
  )

  return ogImageResponse({ element })
}

function StatPill({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#1a1a2e',
        borderRadius: '9999px',
        padding: '8px 20px',
      }}
    >
      <span style={{ fontSize: '22px', fontWeight: 700, color: '#a78bfa' }}>{value}</span>
      <span style={{ fontSize: '18px', fontWeight: 400, color: '#71717a' }}>{label}</span>
    </div>
  )
}
