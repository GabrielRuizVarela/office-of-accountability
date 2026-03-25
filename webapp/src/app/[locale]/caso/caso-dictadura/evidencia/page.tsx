'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { EVIDENCE_DOCS } from '@/lib/caso-dictadura/investigation-data'

export default function EvidenciaPage() {
  const locale = useLocale() as Locale

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          {locale === 'es' ? 'Evidencia' : 'Evidence'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {locale === 'es'
            ? `${EVIDENCE_DOCS.length} documentos clave verificados contra fuentes publicas`
            : `${EVIDENCE_DOCS.length} key documents verified against public sources`}
        </p>
      </header>

      <div className="space-y-4">
        {EVIDENCE_DOCS.map((doc) => (
          <div key={doc.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-zinc-100">{doc.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{locale === 'es' ? doc.type_es : doc.type_en}</span>
                  <span>&middot;</span>
                  <span>{doc.date}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {locale === 'es' ? doc.summary_es : doc.summary_en}
                </p>
                {doc.source_url && (
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-amber-400 hover:text-amber-300"
                  >
                    {locale === 'es' ? 'Ver fuente' : 'View source'} &rarr;
                  </a>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                doc.verification_status === 'verified'
                  ? 'bg-green-500/10 text-green-400'
                  : doc.verification_status === 'partially_verified'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-zinc-500/10 text-zinc-500'
              }`}>
                {doc.verification_status === 'verified'
                  ? (locale === 'es' ? 'Verificado' : 'Verified')
                  : doc.verification_status === 'partially_verified'
                    ? (locale === 'es' ? 'Parcial' : 'Partial')
                    : (locale === 'es' ? 'Sin verificar' : 'Unverified')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
