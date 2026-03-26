'use client'

import { useRef, useState } from 'react'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataImportProps {
  casoSlug: string
}

type ImportTab = 'csv' | 'url' | 'entity'

type EntityType = 'Person' | 'Organization' | 'Event' | 'Document' | 'Location'

const ENTITY_TYPES: EntityType[] = ['Person', 'Organization', 'Event', 'Document', 'Location']

const COLUMN_MAPPING_OPTIONS = [
  'name', 'slug', 'role', 'description', 'nationality',
  'org_type', 'date', 'source_url', 'title', 'type', 'amount', 'Skip',
]

const ENTITY_FIELDS: Record<EntityType, { key: string; label: string; required?: boolean; type?: string }[]> = {
  Person: [
    { key: 'name', label: 'Name', required: true },
    { key: 'role', label: 'Role' },
    { key: 'description', label: 'Description' },
    { key: 'nationality', label: 'Nationality' },
  ],
  Organization: [
    { key: 'name', label: 'Name', required: true },
    { key: 'org_type', label: 'Organization Type' },
    { key: 'description', label: 'Description' },
  ],
  Event: [
    { key: 'title', label: 'Title', required: true },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'description', label: 'Description' },
  ],
  Document: [
    { key: 'title', label: 'Title', required: true },
    { key: 'source_url', label: 'Source URL', type: 'url' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'doc_type', label: 'Document Type' },
  ],
  Location: [
    { key: 'name', label: 'Name', required: true },
    { key: 'description', label: 'Description' },
    { key: 'address', label: 'Address' },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ id, label, activeTab, onClick }: {
  id: ImportTab
  label: string
  activeTab: ImportTab
  onClick: (id: ImportTab) => void
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        activeTab === id
          ? 'border-blue-500 text-blue-400'
          : 'border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  )
}

// ─── CSV Tab ──────────────────────────────────────────────────────────────────

function CsvTab({ casoSlug }: { casoSlug: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [entityType, setEntityType] = useState<EntityType>('Person')
  const [csvContent, setCsvContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ proposals_created: number; duplicates_skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setCsvContent(text)
      const lines = text.split('\n').filter(Boolean)
      if (lines.length === 0) return

      const parsedHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
      setHeaders(parsedHeaders)

      const defaultMapping: Record<string, string> = {}
      for (const h of parsedHeaders) defaultMapping[h] = 'Skip'
      setColumnMapping(defaultMapping)

      const rows: string[][] = []
      for (let i = 1; i <= 3 && i < lines.length; i++) {
        rows.push(lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
      }
      setPreviewRows(rows)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!csvContent) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetchWithCsrf(`/api/casos/${casoSlug}/engine/ingest/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv_content: csvContent,
          column_mapping: columnMapping,
          label: entityType,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`)
      } else {
        setResult(json.data ?? json)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">CSV File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full cursor-pointer rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-xs file:text-zinc-200 hover:border-zinc-600"
        />
      </div>

      {headers.length > 0 && (
        <>
          {/* Column preview */}
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-400">Preview (first 3 rows)</p>
            <div className="overflow-x-auto rounded border border-zinc-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-800">
                    {headers.map((h) => (
                      <th key={h} className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-zinc-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-t border-zinc-700 odd:bg-zinc-900 even:bg-zinc-800/50">
                      {headers.map((_, j) => (
                        <td key={j} className="max-w-[120px] truncate px-2 py-1.5 text-zinc-400">
                          {row[j] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column mapping */}
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-400">Column Mapping</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {headers.map((h) => (
                <div key={h} className="flex flex-col gap-0.5">
                  <label className="text-xs text-zinc-500">{h}</label>
                  <select
                    value={columnMapping[h] ?? 'Skip'}
                    onChange={(e) => setColumnMapping((prev) => ({ ...prev, [h]: e.target.value }))}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
                  >
                    {COLUMN_MAPPING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Entity type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Importing…' : 'Import'}
          </button>
        </>
      )}

      {result && (
        <p className="text-sm text-green-400">
          {result.proposals_created} proposals created, {result.duplicates_skipped} duplicates skipped
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400">Error: {error}</p>
      )}
    </div>
  )
}

// ─── URL Tab ──────────────────────────────────────────────────────────────────

interface UrlResult {
  title?: string
  content_summary?: string
  entities_found?: number
}

function UrlTab({ casoSlug }: { casoSlug: string }) {
  const [url, setUrl] = useState('')
  const [extractEntities, setExtractEntities] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UrlResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetchWithCsrf(`/api/casos/${casoSlug}/engine/ingest/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), extract_entities: extractEntities }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`)
      } else {
        setResult(json.data ?? json)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={extractEntities}
          onChange={(e) => setExtractEntities(e.target.checked)}
          className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
        />
        Extract entities
      </label>

      <button
        onClick={handleImport}
        disabled={loading || !url.trim()}
        className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Importing…' : 'Import'}
      </button>

      {result && (
        <div className="rounded border border-zinc-700 bg-zinc-800/50 p-3 text-sm">
          {result.title && (
            <p className="font-medium text-zinc-200">{result.title}</p>
          )}
          {result.content_summary && (
            <p className="mt-1 text-zinc-400">
              {result.content_summary.slice(0, 200)}
              {result.content_summary.length > 200 ? '…' : ''}
            </p>
          )}
          {result.entities_found != null && (
            <p className="mt-2 text-xs text-zinc-500">{result.entities_found} entities found</p>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-400">Error: {error}</p>
      )}
    </div>
  )
}

// ─── Add Entity Tab ───────────────────────────────────────────────────────────

function AddEntityTab({ casoSlug }: { casoSlug: string }) {
  const [entityType, setEntityType] = useState<EntityType>('Person')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [proposalId, setProposalId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleTypeChange(type: EntityType) {
    setEntityType(type)
    setFields({})
    setProposalId(null)
    setError(null)
  }

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setProposalId(null)

    // Build properties from non-empty fields
    const properties: Record<string, string> = {}
    for (const [k, v] of Object.entries(fields)) {
      if (v.trim()) properties[k] = v.trim()
    }

    try {
      const res = await fetchWithCsrf(`/api/casos/${casoSlug}/engine/ingest/entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: entityType, properties }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`)
      } else {
        const id = json.data?.proposal_id ?? json.proposal_id ?? json.data?.id ?? 'unknown'
        setProposalId(String(id))
        setFields({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const currentFields = ENTITY_FIELDS[entityType]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Entity Type</label>
        <select
          value={entityType}
          onChange={(e) => handleTypeChange(e.target.value as EntityType)}
          className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {currentFields.map(({ key, label, required, type }) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              {label}
              {required && <span className="ml-1 text-red-400">*</span>}
            </label>
            <input
              type={type ?? 'text'}
              value={fields[key] ?? ''}
              onChange={(e) => setField(key, e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              placeholder={label}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add Entity'}
      </button>

      {proposalId && (
        <p className="text-sm text-green-400">
          Proposal created: <code className="text-green-300">{proposalId}</code>
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400">Error: {error}</p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DataImport({ casoSlug }: DataImportProps) {
  const [activeTab, setActiveTab] = useState<ImportTab>('csv')

  const IMPORT_TABS: { id: ImportTab; label: string }[] = [
    { id: 'csv', label: 'Upload CSV' },
    { id: 'url', label: 'Import URL' },
    { id: 'entity', label: 'Add Entity' },
  ]

  return (
    <div className="flex flex-col gap-0">
      {/* Inner tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-0">
        {IMPORT_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'csv' && <CsvTab casoSlug={casoSlug} />}
        {activeTab === 'url' && <UrlTab casoSlug={casoSlug} />}
        {activeTab === 'entity' && <AddEntityTab casoSlug={casoSlug} />}
      </div>
    </div>
  )
}
