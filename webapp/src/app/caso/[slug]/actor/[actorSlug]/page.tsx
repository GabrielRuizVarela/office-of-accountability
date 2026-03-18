import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ActorCard } from '../../../../../components/investigation/ActorCard'
import { getPersonBySlug } from '../../../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string; actorSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { actorSlug } = await params
  const result = await getPersonBySlug(actorSlug)
  if (!result) return { title: 'Person Not Found' }

  return {
    title: result.person.name,
    description: result.person.description,
  }
}

export default async function ActorPage({ params }: PageProps) {
  const { slug, actorSlug } = await params
  const result = await getPersonBySlug(actorSlug)

  if (!result) return notFound()

  const { person, connections } = result

  // Group connections by label
  const people = connections.nodes.filter((n) => n.labels.includes('Person') && n.id !== person.id)
  const orgs = connections.nodes.filter((n) => n.labels.includes('Organization'))
  const locations = connections.nodes.filter((n) => n.labels.includes('Location'))
  const events = connections.nodes.filter((n) => n.labels.includes('Event'))
  const docs = connections.nodes.filter((n) => n.labels.includes('Document'))
  const cases = connections.nodes.filter((n) => n.labels.includes('LegalCase'))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/caso/${slug}`} className="hover:text-zinc-300">
          Investigation
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{person.name}</span>
      </div>

      {/* Profile header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">{person.name}</h1>
        <p className="mt-1 text-sm font-medium text-blue-400">{person.role}</p>
        <p className="mt-1 text-xs text-zinc-500">{person.nationality}</p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">{person.description}</p>
      </div>

      {/* Connections grid */}
      <div className="space-y-8">
        {people.length > 0 && (
          <ConnectionSection
            title="Associated People"
            color="#3b82f6"
            casoSlug={slug}
          >
            {people.map((node) => (
              <Link
                key={node.id}
                href={`/caso/${slug}/actor/${node.properties.slug ?? node.id}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700"
              >
                <div className="text-sm font-medium text-zinc-100">
                  {String(node.properties.name ?? node.id)}
                </div>
                {node.properties.role && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {String(node.properties.role)}
                  </div>
                )}
              </Link>
            ))}
          </ConnectionSection>
        )}

        {orgs.length > 0 && (
          <ConnectionSection title="Organizations" color="#8b5cf6" casoSlug={slug}>
            {orgs.map((node) => (
              <div key={node.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="text-sm font-medium text-zinc-100">
                  {String(node.properties.name ?? node.id)}
                </div>
                {node.properties.org_type && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {String(node.properties.org_type)}
                  </div>
                )}
              </div>
            ))}
          </ConnectionSection>
        )}

        {locations.length > 0 && (
          <ConnectionSection title="Locations" color="#10b981" casoSlug={slug}>
            {locations.map((node) => (
              <div key={node.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="text-sm font-medium text-zinc-100">
                  {String(node.properties.name ?? node.id)}
                </div>
                {node.properties.address && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {String(node.properties.address)}
                  </div>
                )}
              </div>
            ))}
          </ConnectionSection>
        )}

        {events.length > 0 && (
          <ConnectionSection title="Related Events" color="#f59e0b" casoSlug={slug}>
            {events.map((node) => (
              <div key={node.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="text-sm font-medium text-zinc-100">
                  {String(node.properties.title ?? node.id)}
                </div>
                {node.properties.date && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {String(node.properties.date)}
                  </div>
                )}
              </div>
            ))}
          </ConnectionSection>
        )}

        {docs.length > 0 && (
          <ConnectionSection title="Documents" color="#ef4444" casoSlug={slug}>
            {docs.map((node) => (
              <Link
                key={node.id}
                href={`/caso/${slug}/evidencia/${node.properties.slug ?? node.id}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700"
              >
                <div className="text-sm font-medium text-zinc-100">
                  {String(node.properties.title ?? node.id)}
                </div>
                {node.properties.doc_type && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {String(node.properties.doc_type)}
                  </div>
                )}
              </Link>
            ))}
          </ConnectionSection>
        )}

        {cases.length > 0 && (
          <ConnectionSection title="Legal Cases" color="#ec4899" casoSlug={slug}>
            {cases.map((node) => (
              <div key={node.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="text-sm font-medium text-zinc-100">
                  {String(node.properties.title ?? node.id)}
                </div>
                {node.properties.court && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {String(node.properties.court)}
                  </div>
                )}
              </div>
            ))}
          </ConnectionSection>
        )}
      </div>
    </div>
  )
}

function ConnectionSection({
  title,
  color,
  casoSlug,
  children,
}: {
  title: string
  color: string
  casoSlug: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}
