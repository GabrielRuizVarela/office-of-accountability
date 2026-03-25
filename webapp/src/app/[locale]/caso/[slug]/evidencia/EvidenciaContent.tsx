'use client'

import { useLanguage, type Lang } from '@/lib/language-context'
import { DocumentCard } from '@/components/investigation/DocumentCard'

const t = {
  title: { es: 'Evidencia y Documentos', en: 'Evidence & Documents' },
  subtitle: (count: number): Record<Lang, string> => ({
    es: `${count} documentos de fuentes publicas vinculados a la investigacion.`,
    en: `${count} documents from public sources linked to the investigation.`,
  }),
  empty: {
    es: 'No hay documentos cargados aun.',
    en: 'No documents loaded yet.',
  },
} as const

interface Props {
  readonly slug: string
  readonly documents: readonly Record<string, unknown>[]
}

export function EvidenciaContent({ slug, documents }: Props) {
  const { lang } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">{t.title[lang]}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {t.subtitle(documents.length)[lang]}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id as string}
            slug={doc.slug as string}
            investigationSlug={slug}
            title={doc.title as string}
            docType={doc.doc_type as string}
            summary={doc.summary as string | undefined}
            datePublished={doc.date_published as string | undefined}
          />
        ))}
      </div>

      {documents.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500">{t.empty[lang]}</p>
      )}
    </div>
  )
}
