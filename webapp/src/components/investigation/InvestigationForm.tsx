'use client'

/**
 * Shared investigation form used by both create and edit pages.
 *
 * Handles title, summary, tags, body (TipTap editor), and status (draft/publish).
 * All state is managed via useReducer for immutability.
 */

import { Link } from '@/i18n/navigation'
import { useCallback, useReducer, useRef } from 'react'

import { InvestigationEditor } from './InvestigationEditor'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvestigationFormData {
  readonly title: string
  readonly summary: string
  readonly tags: readonly string[]
  readonly body: string
  readonly referencedNodeIds: readonly string[]
  readonly status: 'draft' | 'published'
}

export interface InvestigationFormProps {
  /** Form heading (e.g. "Nueva investigación", "Editar investigación") */
  readonly heading: string
  /** Initial form values for editing. Omit for create. */
  readonly initialData?: InvestigationFormData
  /** Called on save with form data. Returns slug on success or throws. */
  readonly onSave: (data: InvestigationFormData) => Promise<string>
  /** Whether a delete action is available (edit mode only) */
  readonly onDelete?: () => Promise<void>
  /** Whether we're currently saving */
  readonly isSaving?: boolean
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface FormState {
  readonly title: string
  readonly summary: string
  readonly tagInput: string
  readonly tags: readonly string[]
  readonly body: string
  readonly referencedNodeIds: readonly string[]
  readonly error: string | null
  readonly isSaving: boolean
}

type FormAction =
  | { readonly type: 'SET_TITLE'; readonly value: string }
  | { readonly type: 'SET_SUMMARY'; readonly value: string }
  | { readonly type: 'SET_TAG_INPUT'; readonly value: string }
  | { readonly type: 'ADD_TAG'; readonly tag: string }
  | { readonly type: 'REMOVE_TAG'; readonly tag: string }
  | { readonly type: 'SET_BODY'; readonly body: string; readonly nodeIds: readonly string[] }
  | { readonly type: 'SET_ERROR'; readonly error: string }
  | { readonly type: 'SET_SAVING'; readonly saving: boolean }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.value, error: null }
    case 'SET_SUMMARY':
      return { ...state, summary: action.value, error: null }
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.value }
    case 'ADD_TAG': {
      const normalized = action.tag.trim().toLowerCase()
      if (!normalized || state.tags.includes(normalized) || state.tags.length >= 20) {
        return { ...state, tagInput: '' }
      }
      return { ...state, tags: [...state.tags, normalized], tagInput: '' }
    }
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter((t) => t !== action.tag) }
    case 'SET_BODY':
      return { ...state, body: action.body, referencedNodeIds: action.nodeIds, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.error, isSaving: false }
    case 'SET_SAVING':
      return { ...state, isSaving: action.saving, error: null }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvestigationForm({
  heading,
  initialData,
  onSave,
  onDelete,
}: InvestigationFormProps) {
  const [state, dispatch] = useReducer(formReducer, {
    title: initialData?.title ?? '',
    summary: initialData?.summary ?? '',
    tagInput: '',
    tags: initialData?.tags ?? [],
    body: initialData?.body ?? '',
    referencedNodeIds: initialData?.referencedNodeIds ?? [],
    error: null,
    isSaving: false,
  })

  const isDeleting = useRef(false)

  const handleEditorChange = useCallback((content: string, nodeIds: readonly string[]) => {
    dispatch({ type: 'SET_BODY', body: content, nodeIds })
  }, [])

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        dispatch({ type: 'ADD_TAG', tag: state.tagInput })
      }
    },
    [state.tagInput],
  )

  const handleSave = useCallback(
    async (status: 'draft' | 'published') => {
      if (!state.title.trim()) {
        dispatch({ type: 'SET_ERROR', error: 'El título es obligatorio' })
        return
      }
      if (!state.body) {
        dispatch({ type: 'SET_ERROR', error: 'El contenido es obligatorio' })
        return
      }

      dispatch({ type: 'SET_SAVING', saving: true })

      try {
        const slug = await onSave({
          title: state.title.trim(),
          summary: state.summary.trim(),
          tags: state.tags,
          body: state.body,
          referencedNodeIds: state.referencedNodeIds,
          status,
        })

        window.location.href =
          status === 'published' ? `/investigacion/${slug}` : '/mis-investigaciones'
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al guardar la investigación'
        dispatch({ type: 'SET_ERROR', error: message })
      }
    },
    [state.title, state.summary, state.tags, state.body, state.referencedNodeIds, onSave],
  )

  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting.current) return

    const confirmed = window.confirm(
      '¿Estás seguro de que querés eliminar esta investigación? Esta acción no se puede deshacer.',
    )
    if (!confirmed) return

    isDeleting.current = true
    dispatch({ type: 'SET_SAVING', saving: true })

    try {
      await onDelete()
      window.location.href = '/mis-investigaciones'
    } catch (error) {
      isDeleting.current = false
      const message = error instanceof Error ? error.message : 'Error al eliminar la investigación'
      dispatch({ type: 'SET_ERROR', error: message })
    }
  }, [onDelete])

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ORC
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{heading}</h1>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={state.isSaving}
                className="rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={state.isSaving}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {state.isSaving ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={state.isSaving}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {state.isSaving ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </header>

      {/* Error */}
      {state.error && (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
          >
            {state.error}
          </div>
        </div>
      )}

      {/* Form */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Título
            </label>
            <input
              id="title"
              type="text"
              value={state.title}
              onChange={(e) => dispatch({ type: 'SET_TITLE', value: e.target.value })}
              placeholder="Título de la investigación"
              maxLength={500}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-lg text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            />
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Resumen{' '}
              <span className="font-normal text-zinc-400 dark:text-zinc-500">(opcional)</span>
            </label>
            <textarea
              id="summary"
              value={state.summary}
              onChange={(e) => dispatch({ type: 'SET_SUMMARY', value: e.target.value })}
              placeholder="Breve descripción de la investigación"
              maxLength={2000}
              rows={3}
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Etiquetas{' '}
              <span className="font-normal text-zinc-400 dark:text-zinc-500">(opcional)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {state.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'REMOVE_TAG', tag })}
                    className="ml-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    aria-label={`Eliminar etiqueta ${tag}`}
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                id="tags"
                type="text"
                value={state.tagInput}
                onChange={(e) => dispatch({ type: 'SET_TAG_INPUT', value: e.target.value })}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (state.tagInput.trim()) {
                    dispatch({ type: 'ADD_TAG', tag: state.tagInput })
                  }
                }}
                placeholder={state.tags.length === 0 ? 'Escribí una etiqueta y presioná Enter' : ''}
                maxLength={100}
                className="min-w-[150px] flex-1 border-0 bg-transparent py-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Body (TipTap Editor) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contenido
            </label>
            <InvestigationEditor
              initialContent={initialData?.body || undefined}
              onChange={handleEditorChange}
              editable
            />
          </div>
        </div>
      </main>
    </div>
  )
}
