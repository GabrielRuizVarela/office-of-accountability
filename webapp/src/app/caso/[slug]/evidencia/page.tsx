/**
 * Evidence/documents list page for Caso Libra.
 */

import { getDocuments } from '@/lib/caso-libra'
import { DocumentCard } from '@/components/investigation/DocumentCard'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const documents = await getDocuments()

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
