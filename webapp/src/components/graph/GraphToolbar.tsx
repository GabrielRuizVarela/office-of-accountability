'use client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphToolbarProps {
  readonly onFindPath: () => void
  readonly onClearGraph: () => void
  readonly onSave: () => void
  readonly onLoad: () => void
  readonly onUnpinAll: () => void
  readonly onUndo: () => void
  readonly canUndo: boolean
  readonly hasData: boolean
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      aria-label={title}
      title={title}
    >
      {children}
    </button>
  )
}

function Separator() {
  return <div className="mx-1 h-4 w-px bg-zinc-800" />
}

// ---------------------------------------------------------------------------
// Icons (16x16, Heroicons outline style)
// ---------------------------------------------------------------------------

const iconProps = {
  className: 'h-4 w-4',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  strokeWidth: 1.5,
} as const

function IconFindPath() {
  return (
    <svg {...iconProps}>
      {/* arrows-right-left */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  )
}

function IconClear() {
  return (
    <svg {...iconProps}>
      {/* trash */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function IconSave() {
  return (
    <svg {...iconProps}>
      {/* arrow-down-tray */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  )
}

function IconLoad() {
  return (
    <svg {...iconProps}>
      {/* arrow-up-tray */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
      />
    </svg>
  )
}

function IconUnpin() {
  return (
    <svg {...iconProps}>
      {/* map-pin with slash */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  )
}

function IconUndo() {
  return (
    <svg {...iconProps}>
      {/* arrow-uturn-left */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GraphToolbar({
  onFindPath,
  onClearGraph,
  onSave,
  onLoad,
  onUnpinAll,
  onUndo,
  canUndo,
  hasData,
}: GraphToolbarProps) {
  if (!hasData) return null

  return (
    <div className="flex items-center gap-0.5 border-b border-zinc-800 bg-zinc-950/90 px-4 py-1.5 backdrop-blur-sm">
      {/* Group 1: Find Path, Clear Graph */}
      <ToolbarButton onClick={onFindPath} title="Buscar ruta">
        <IconFindPath />
      </ToolbarButton>
      <ToolbarButton onClick={onClearGraph} title="Limpiar grafo">
        <IconClear />
      </ToolbarButton>

      <Separator />

      {/* Group 2: Save, Load */}
      <ToolbarButton onClick={onSave} title="Guardar investigación">
        <IconSave />
      </ToolbarButton>
      <ToolbarButton onClick={onLoad} title="Cargar investigación">
        <IconLoad />
      </ToolbarButton>

      <Separator />

      {/* Group 3: Unpin All, Undo */}
      <ToolbarButton onClick={onUnpinAll} title="Desfijar todos">
        <IconUnpin />
      </ToolbarButton>
      {canUndo && (
        <ToolbarButton onClick={onUndo} title="Deshacer (Ctrl+Z)">
          <IconUndo />
        </ToolbarButton>
      )}
    </div>
  )
}
