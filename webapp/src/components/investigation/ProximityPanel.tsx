'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

/** Key persons shown at top of dropdown */
const KEY_PERSONS = new Set([
  'jeffrey-epstein',
  'ghislaine-maxwell',
  'virginia-giuffre',
  'prince-andrew',
  'leslie-wexner',
  'bill-clinton',
  'donald-trump',
  'leon-black',
  'alan-dershowitz',
])

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersonOption {
  readonly name: string
  readonly slug: string
}

interface CoLocation {
  readonly person1: string
  readonly slug1: string
  readonly person2: string
  readonly slug2: string
  readonly location: string
  readonly locSlug: string
  readonly coordinates: string
  readonly visit1Desc: string
  readonly visit2Desc: string
}

interface SharedEvent {
  readonly person1: string
  readonly slug1: string
  readonly person2: string
  readonly slug2: string
  readonly event: string
  readonly date: string
  readonly type: string
}

interface SharedDocument {
  readonly person1: string
  readonly slug1: string
  readonly person2: string
  readonly slug2: string
  readonly document: string
  readonly docSlug: string
  readonly type: string
}

interface ProximityData {
  readonly coLocations: CoLocation[]
  readonly sharedEvents: SharedEvent[]
  readonly sharedDocuments: SharedDocument[]
  readonly persons: PersonOption[]
}

interface ProximityPanelProps {
  readonly casoSlug: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProximityPanel({ casoSlug }: ProximityPanelProps) {
  const [persons, setPersons] = useState<PersonOption[]>([])
  const [selected, setSelected] = useState<string[]>(['jeffrey-epstein', 'ghislaine-maxwell'])
  const [data, setData] = useState<ProximityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isQuerying, setIsQuerying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  // Load person list on mount + auto-fetch for pre-selected pair
  useEffect(() => {
    async function loadPersons() {
      try {
        const res = await fetch(`/api/caso/${casoSlug}/proximity?persons=jeffrey-epstein,ghislaine-maxwell`)
        if (!res.ok) throw new Error('Failed to load persons')
        const json = await res.json()
        setPersons(json.data.persons)
        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load persons')
      } finally {
        setIsLoading(false)
      }
    }
    loadPersons()
  }, [casoSlug])

  // Fetch proximity data when selection changes
  const fetchProximity = useCallback(async (slugs: string[]) => {
    if (slugs.length < 2) {
      setData(null)
      return
    }

    setIsQuerying(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/caso/${casoSlug}/proximity?persons=${slugs.join(',')}`,
      )
      if (!res.ok) throw new Error('Failed to load proximity data')
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proximity data')
    } finally {
      setIsQuerying(false)
    }
  }, [casoSlug])

  function togglePerson(slug: string) {
    setSelected((prev) => {
      let next: string[]
      if (prev.includes(slug)) {
        next = prev.filter((s) => s !== slug)
      } else if (prev.length >= 3) {
        // Replace the oldest selection
        next = [...prev.slice(1), slug]
      } else {
        next = [...prev, slug]
      }
      fetchProximity(next)
      return next
    })
  }

  function removePerson(slug: string) {
    setSelected((prev) => {
      const next = prev.filter((s) => s !== slug)
      fetchProximity(next)
      return next
    })
  }

  const filteredPersons = persons
    .filter((p) => p.name.toLowerCase().includes(searchFilter.toLowerCase()))
    .sort((a, b) => {
      const aKey = KEY_PERSONS.has(a.slug) ? 0 : 1
      const bKey = KEY_PERSONS.has(b.slug) ? 0 : 1
      if (aKey !== bKey) return aKey - bKey
      return a.name.localeCompare(b.name)
    })

  const selectedPersons = persons.filter((p) => selected.includes(p.slug))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        Loading persons...
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center py-20 text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Person selector */}
      <div className="relative">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Select Persons (2-3)
        </label>

        {/* Selected tags */}
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedPersons.map((p) => (
            <span
              key={p.slug}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200"
            >
              <Link
                href={`/caso/${casoSlug}/actor/${p.slug}`}
                className="hover:text-blue-400 transition-colors"
              >
                {p.name}
              </Link>
              <button
                onClick={() => removePerson(p.slug)}
                className="ml-1 text-zinc-500 hover:text-zinc-200"
                aria-label={`Remove ${p.name}`}
              >
                x
              </button>
            </span>
          ))}
        </div>

        {/* Dropdown trigger */}
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-300 hover:border-zinc-600"
        >
          {selected.length === 0
            ? 'Click to select persons...'
            : `${selected.length} selected — click to modify`}
        </button>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-xl">
            <div className="sticky top-0 border-b border-zinc-800 bg-zinc-900 p-2">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter persons..."
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                autoFocus
              />
            </div>
            {filteredPersons.map((p, i) => {
              const isSelected = selected.includes(p.slug)
              const isKey = KEY_PERSONS.has(p.slug)
              const prevIsKey = i > 0 && KEY_PERSONS.has(filteredPersons[i - 1].slug)
              const showSeparator = !isKey && (i === 0 || prevIsKey)
              return (
                <div key={p.slug}>
                  {showSeparator && (
                    <div className="border-t border-zinc-700 px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-600">
                      Other persons
                    </div>
                  )}
                  <button
                    onClick={() => {
                      togglePerson(p.slug)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <span className="mr-2 inline-block w-4 text-center">
                      {isSelected ? '\u2713' : ''}
                    </span>
                    {isKey && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                    {p.name}
                  </button>
                </div>
              )
            })}
            {filteredPersons.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-zinc-500">
                No persons match your filter
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Stats bar */}
      {data && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">
              {data.coLocations.length} shared location{data.coLocations.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-zinc-300">
              {data.sharedEvents.length} shared event{data.sharedEvents.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-zinc-300">
              {data.sharedDocuments.length} shared document{data.sharedDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isQuerying && (
        <div className="py-4 text-center text-sm text-zinc-500">
          Analyzing proximity patterns...
        </div>
      )}

      {/* Empty state */}
      {!data && !isQuerying && selected.length < 2 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-zinc-500">
            Select 2 or more persons to analyze proximity patterns
          </p>
        </div>
      )}

      {/* Error state */}
      {error && data && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {data && !isQuerying && (
        <div className="space-y-8">
          {/* Co-Locations */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">Co-Locations</h2>
            {data.coLocations.length === 0 ? (
              <p className="text-sm text-zinc-500">No shared locations found between selected persons.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.coLocations.map((loc, i) => (
                  <div
                    key={`${loc.locSlug}-${loc.slug1}-${loc.slug2}-${i}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <h3 className="mb-2 font-medium text-zinc-100">
                      <Link href={`/caso/${casoSlug}/grafo`} className="hover:text-emerald-400 transition-colors">{loc.location}</Link>
                    </h3>
                    {loc.coordinates && (
                      <p className="mb-2 text-xs text-zinc-500">{loc.coordinates}</p>
                    )}
                    <div className="space-y-2">
                      <div className="rounded-md bg-zinc-950/50 px-3 py-2">
                        <Link href={`/caso/${casoSlug}/actor/${loc.slug1}`} className="text-xs font-medium text-emerald-400 hover:text-emerald-300">{loc.person1}</Link>
                        <p className="text-sm text-zinc-300">
                          {loc.visit1Desc || 'No visit description available'}
                        </p>
                      </div>
                      <div className="rounded-md bg-zinc-950/50 px-3 py-2">
                        <Link href={`/caso/${casoSlug}/actor/${loc.slug2}`} className="text-xs font-medium text-blue-400 hover:text-blue-300">{loc.person2}</Link>
                        <p className="text-sm text-zinc-300">
                          {loc.visit2Desc || 'No visit description available'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shared Timeline */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">Shared Timeline</h2>
            {data.sharedEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">No shared events found between selected persons.</p>
            ) : (
              <div className="space-y-3">
                {data.sharedEvents.map((evt, i) => (
                  <div
                    key={`${evt.event}-${evt.date}-${i}`}
                    className="flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div className="min-w-[100px] shrink-0">
                      <p className="text-sm font-mono text-zinc-400">{evt.date || 'Unknown'}</p>
                      <span className="mt-1 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {evt.type}
                      </span>
                    </div>
                    <div>
                      <Link href={`/caso/${casoSlug}/cronologia`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">{evt.event}</Link>
                      <p className="mt-1 text-sm text-zinc-400">
                        <Link href={`/caso/${casoSlug}/actor/${evt.slug1}`} className="hover:text-zinc-200 transition-colors">{evt.person1}</Link>
                        {' & '}
                        <Link href={`/caso/${casoSlug}/actor/${evt.slug2}`} className="hover:text-zinc-200 transition-colors">{evt.person2}</Link>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shared Documents */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">Shared Documents</h2>
            {data.sharedDocuments.length === 0 ? (
              <p className="text-sm text-zinc-500">No shared documents found between selected persons.</p>
            ) : (
              <div className="space-y-3">
                {data.sharedDocuments.map((doc, i) => (
                  <div
                    key={`${doc.document}-${i}`}
                    className="flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <span className="mt-0.5 inline-block shrink-0 rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400">
                      {doc.type.replace(/_/g, ' ')}
                    </span>
                    <div>
                      <Link href={`/caso/${casoSlug}/evidencia/${doc.docSlug}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">{doc.document}</Link>
                      <p className="mt-1 text-sm text-zinc-400">
                        Mentions{' '}
                        <Link href={`/caso/${casoSlug}/actor/${doc.slug1}`} className="hover:text-zinc-200 transition-colors">{doc.person1}</Link>
                        {' & '}
                        <Link href={`/caso/${casoSlug}/actor/${doc.slug2}`} className="hover:text-zinc-200 transition-colors">{doc.person2}</Link>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
