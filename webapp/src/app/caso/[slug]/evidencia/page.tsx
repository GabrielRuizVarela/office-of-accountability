/**
 * Evidence/documents list page.
 *
 * Slug-aware: dispatches to caso-libra or caso-epstein data source.
 */

import { getDocuments as getLibraDocuments } from '@/lib/caso-libra'
import { getDocuments as getEpsteinDocuments } from '@/lib/caso-epstein'
import { DocumentCard } from '@/components/investigation/DocumentCard'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug !== 'caso-libra' && slug !== 'caso-epstein') {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Investigacion no encontrada</h1>
        <p className="mt-4 text-zinc-400">No existe una investigacion con este identificador.</p>
      </div>
    )
  }

  // Epstein's getDocuments requires a casoSlug parameter; Libra's does not.
  const documents =
    slug === 'caso-epstein'
      ? (await getEpsteinDocuments(slug)).map((doc) => ({
          id: doc.id,
          slug: doc.slug,
          title: doc.title,
          doc_type: doc.doc_type,
          summary: doc.summary,
          date_published: doc.date,
        }))
      : await getLibraDocuments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Evidencia y Documentos</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {documents.length} documentos de fuentes publicas vinculados a la investigacion.
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
        <p className="py-12 text-center text-sm text-zinc-500">No hay documentos cargados aun.</p>
      )}
    </div>
  )
}
