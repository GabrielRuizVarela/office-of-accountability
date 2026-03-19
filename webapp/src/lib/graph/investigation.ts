const STORAGE_KEY = 'orc-investigations'
const MAX_STORAGE_BYTES = 4 * 1024 * 1024

export interface SavedInvestigation {
  readonly name: string
  readonly savedAt: string
  readonly nodeIds: readonly string[]
  readonly pinnedPositions: ReadonlyArray<{ id: string; x: number; y: number }>
  readonly zoom?: number
  readonly centerX?: number
  readonly centerY?: number
}

export function listInvestigations(): SavedInvestigation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedInvestigation[]
  } catch { return [] }
}

export function saveInvestigation(investigation: SavedInvestigation): { ok: boolean; warning?: string } {
  const existing = listInvestigations()
  const filtered = existing.filter((i) => i.name !== investigation.name)
  filtered.push(investigation)
  const json = JSON.stringify(filtered)
  if (json.length > MAX_STORAGE_BYTES) {
    return { ok: false, warning: 'Almacenamiento casi lleno. Elimina investigaciones antiguas.' }
  }
  try {
    localStorage.setItem(STORAGE_KEY, json)
    return { ok: true }
  } catch {
    return { ok: false, warning: 'No se pudo guardar — almacenamiento lleno.' }
  }
}

export function deleteInvestigation(name: string): void {
  const existing = listInvestigations()
  const filtered = existing.filter((i) => i.name !== name)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
