'use client'

/**
 * Investigation creation wizard — client component.
 *
 * Step 1: Name & Describe
 * Step 2: Seed Entity (optional)
 * Step 3: Scope (1-hop neighbors, only if seed selected)
 * Step 4: Creating… (loading + redirect on success)
 */

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { ScopeSelector } from '@/components/investigation/ScopeSelector'
import { SeedEntitySearch, type SeedEntity } from '@/components/investigation/SeedEntitySearch'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3 | 4

interface WizardState {
  nameEs: string
  nameEn: string
  descriptionEs: string
  tagsInput: string
  seedEntity: SeedEntity | null
  scopeSelectedIds: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= current ? 'bg-purple-500' : 'bg-zinc-800'
          }`}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

export function NuevoWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)

  const [state, setState] = useState<WizardState>({
    nameEs: '',
    nameEn: '',
    descriptionEs: '',
    tagsInput: '',
    seedEntity: null,
    scopeSelectedIds: [],
  })

  // -------------------------------------------------------------------------
  // Step 1: Name & Describe
  // -------------------------------------------------------------------------

  const canAdvanceStep1 = state.nameEs.trim().length > 0 && state.nameEn.trim().length > 0

  // -------------------------------------------------------------------------
  // Step 2: Seed Entity
  // -------------------------------------------------------------------------

  const handleEntitySelect = useCallback((entity: SeedEntity) => {
    setState((prev) => ({ ...prev, seedEntity: entity }))
    setStep(3)
  }, [])

  const handleCreateNew = useCallback((entity: { name: string; type: string }) => {
    // Treat as a virtual seed — no real graph ID yet, mark with a prefix
    setState((prev) => ({
      ...prev,
      seedEntity: { id: `new:${entity.type}:${entity.name}`, name: entity.name, label: entity.type },
    }))
    setStep(3)
  }, [])

  const handleSkipSeed = useCallback(() => {
    setState((prev) => ({ ...prev, seedEntity: null, scopeSelectedIds: [] }))
    // Skip step 3 and go straight to creation
    handleCreate({ ...state, seedEntity: null, scopeSelectedIds: [] })
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // Step 3: Scope
  // -------------------------------------------------------------------------

  const handleScopeChange = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, scopeSelectedIds: ids }))
  }, [])

  // -------------------------------------------------------------------------
  // Step 4: Create
  // -------------------------------------------------------------------------

  const handleCreate = useCallback(
    async (overrideState?: WizardState) => {
      const s = overrideState ?? state
      setStep(4)
      setError(null)

      const tags = s.tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      // Only pass seed_entity_id if it's a real graph node (not a "new:" virtual)
      const seedId =
        s.seedEntity && !s.seedEntity.id.startsWith('new:') ? s.seedEntity.id : undefined

      try {
        const res = await fetch('/api/casos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_es: s.nameEs.trim(),
            name_en: s.nameEn.trim(),
            description_es: s.descriptionEs.trim(),
            description_en: '',
            tags,
            seed_entity_id: seedId,
            node_types: [],
          }),
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          setError(json.error ?? 'Failed to create investigation')
          setStep(3)
          return
        }

        router.push(`/caso/${json.data.caso_slug}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
        setStep(3)
      }
    },
    [state, router],
  )

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const totalSteps = state.seedEntity ? 4 : 3

  return (
    <div>
      {/* Step indicator (don't show on loading step) */}
      {step < 4 && <StepIndicator current={step} total={totalSteps} />}

      {/* ------------------------------------------------------------------ */}
      {/* Step 1: Name & Describe                                             */}
      {/* ------------------------------------------------------------------ */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">New Investigation</h1>
            <p className="mt-1 text-sm text-zinc-500">Give it a name in both languages.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Title (Spanish) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={state.nameEs}
                onChange={(e) => setState((p) => ({ ...p, nameEs: e.target.value }))}
                placeholder="ej. Caso Epstein Argentina"
                maxLength={200}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Title (English) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={state.nameEn}
                onChange={(e) => setState((p) => ({ ...p, nameEn: e.target.value }))}
                placeholder="e.g. Epstein Argentina Case"
                maxLength={200}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Description{' '}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <textarea
                value={state.descriptionEs}
                onChange={(e) => setState((p) => ({ ...p, descriptionEs: e.target.value }))}
                placeholder="Brief description of the investigation..."
                rows={3}
                maxLength={1000}
                className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Tags{' '}
                <span className="font-normal text-zinc-500">(optional, comma-separated)</span>
              </label>
              <input
                type="text"
                value={state.tagsInput}
                onChange={(e) => setState((p) => ({ ...p, tagsInput: e.target.value }))}
                placeholder="corruption, finance, argentina"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canAdvanceStep1}
            className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 2: Seed Entity                                                 */}
      {/* ------------------------------------------------------------------ */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Seed Entity</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Start from an existing entity in the graph, or skip to begin empty.
            </p>
          </div>

          <SeedEntitySearch onSelect={handleEntitySelect} onCreateNew={handleCreateNew} />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSkipSeed}
              className="ml-auto text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Skip — start empty
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 3: Scope                                                       */}
      {/* ------------------------------------------------------------------ */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Select Scope</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose which connected entities to include in your investigation.
              {state.seedEntity && (
                <span className="ml-1 text-zinc-400">
                  Seed: <span className="font-medium text-zinc-300">{state.seedEntity.name}</span>
                </span>
              )}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {state.seedEntity && !state.seedEntity.id.startsWith('new:') ? (
            <ScopeSelector
              seedEntityId={state.seedEntity.id}
              onSelectionChange={handleScopeChange}
            />
          ) : (
            <p className="text-sm text-zinc-500">
              New entity — no existing neighbors to include.
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => handleCreate()}
              className="ml-auto rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              Create Investigation
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 4: Creating…                                                   */}
      {/* ------------------------------------------------------------------ */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {error ? (
            <div className="space-y-4">
              <p className="text-sm text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  handleCreate()
                }}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-purple-500" />
              <p className="text-sm text-zinc-400">Creating your investigation...</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
