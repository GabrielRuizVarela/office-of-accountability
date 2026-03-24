export type ConfidenceTier = 'gold' | 'silver' | 'bronze'

export type IngestionSource = 'seed' | 'rhowardstone' | 'epstein-exposed' | 'courtlistener' | 'documentcloud' | 'doj' | 'community' | 'dleerdefi' | 'iaea' | 'nato' | 'us-dod' | 'state-dept' | 'aca' | 'bulletin'

export interface IngestionMeta {
  readonly ingestion_wave: number
  readonly confidence_tier: ConfidenceTier
  readonly source: IngestionSource
}

export type DedupResult = 'exact_match' | 'fuzzy_match' | 'no_match'

export interface ConflictRecord {
  readonly incomingId: string
  readonly incomingName: string
  readonly existingId: string
  readonly existingName: string
  readonly matchType: 'fuzzy_match'
  readonly distance: number
  readonly source: IngestionSource
  readonly wave: number
}

export interface WaveReport {
  readonly wave: number
  readonly source: IngestionSource
  readonly nodesCreated: number
  readonly nodesSkipped: number
  readonly edgesCreated: number
  readonly edgesSkipped: number
  readonly conflicts: ConflictRecord[]
  readonly durationMs: number
}

export interface ResumeState {
  readonly wave: number
  readonly source: IngestionSource
  readonly lastCursor: string | null
  readonly lastPage: number
  readonly nodesProcessed: number
  readonly startedAt: string
}
