'use client'

import { useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ZoomControlsProps {
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onZoomToFit: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ZoomControls({ onZoomIn, onZoomOut, onZoomToFit }: ZoomControlsProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-t-lg border border-zinc-700 bg-zinc-900/90 text-zinc-400 backdrop-blur-sm transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Acercar"
        title="Acercar"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
        </svg>
      </button>

      <button
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center border border-zinc-700 bg-zinc-900/90 text-zinc-400 backdrop-blur-sm transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Alejar"
        title="Alejar"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
        </svg>
      </button>

      <button
        onClick={onZoomToFit}
        className="flex h-8 w-8 items-center justify-center rounded-b-lg border border-zinc-700 bg-zinc-900/90 text-zinc-400 backdrop-blur-sm transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Ajustar vista"
        title="Ajustar vista"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </button>
    </div>
  )
}
