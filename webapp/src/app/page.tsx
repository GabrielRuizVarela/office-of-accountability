/**
 * Homepage — main landing page for the ORC platform.
 *
 * Server component that fetches latest investigations and provides
 * navigation to all platform sections: graph explorer, investigations,
 * politician profiles, and user auth.
 */

import Link from 'next/link'

import { listInvestigations } from '@/lib/investigation'
import type { InvestigationListItem } from '@/lib/investigation'

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getLatestInvestigations(): Promise<readonly InvestigationListItem[]> {
  try {
    const result = await listInvestigations(1, 3)
    return result.items
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Home() {
  const latestInvestigations = await getLatestInvestigations()

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-zinc-50">
            ORC
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/explorar" className="text-zinc-400 transition-colors hover:text-zinc-100">
              Explorar
            </Link>
            <Link
              href="/investigaciones"
              className="text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Investigaciones
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500" />
            Plataforma de conocimiento cívico
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            Oficina de Rendición de Cuentas
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Explorá las conexiones entre legisladores, votaciones y legislación argentina.
            Investigá, documentá y compartí.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explorar"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              <GraphIcon />
              Explorar el grafo
            </Link>
            <Link
              href="/investigaciones"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <DocumentIcon />
              Ver investigaciones
            </Link>
          </div>
        </div>
      </section>

      {/* Featured investigation: Caso Libra */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <Link
          href="/caso/caso-libra"
          className="group flex flex-col gap-4 rounded-xl border border-purple-600/30 bg-gradient-to-br from-zinc-900 to-purple-950/20 p-6 transition-colors hover:border-purple-500/50 sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
            Investigacion destacada
          </div>
          <h2 className="text-2xl font-bold text-zinc-50 group-hover:text-purple-300 sm:text-3xl">
            Caso Libra: La Memecoin del Presidente
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            El 14 de febrero de 2025, Milei promovio $LIBRA a 19M de seguidores. El precio colapso
            94% en horas. 114,000+ billeteras perdieron $251M+. Explora la evidencia: blockchain,
            registros parlamentarios, pericias telefonicas.
          </p>
          <div className="flex gap-4 text-sm">
            <span className="font-semibold text-purple-400">$251M+</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">114,000+ billeteras</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">94% caida</span>
          </div>
          <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300">
            Explorar investigacion &rarr;
          </span>
        </Link>
      </section>

      {/* Section cards */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SectionCard
            href="/explorar"
            title="Grafo Interactivo"
            description="Visualizá las relaciones entre políticos, partidos, provincias y votaciones en un grafo explorable."
            icon={<GraphIcon />}
          />
          <SectionCard
            href="/investigaciones"
            title="Investigaciones"
            description="Artículos que conectan datos del grafo con análisis ciudadano. Creá y publicá las tuyas."
            icon={<DocumentIcon />}
          />
          <SectionCard
            href="/auth/signup"
            title="Contribuí"
            description="Registrate para crear investigaciones, vincular nodos del grafo y aportar al conocimiento cívico."
            icon={<UserPlusIcon />}
          />
        </div>
      </section>

      {/* Latest investigations */}
      {latestInvestigations.length > 0 && (
        <section className="border-t border-zinc-800 bg-zinc-900/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-50 sm:text-2xl">
                Últimas investigaciones
              </h2>
              <Link
                href="/investigaciones"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                Ver todas &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestInvestigations.map((item) => (
                <InvestigationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats / info */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          <StatBlock label="Legisladores" value="329" detail="257 Diputados + 72 Senadores" />
          <StatBlock label="Cámaras" value="2" detail="Diputados y Senado de la Nación" />
          <StatBlock label="Datos" value="Gold" detail="Pipeline verificado vía Como Voto" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:justify-between">
          <p>Oficina de Rendición de Cuentas — Datos abiertos para la democracia argentina</p>
          <nav className="flex gap-4">
            <Link href="/explorar" className="transition-colors hover:text-zinc-300">
              Explorar
            </Link>
            <Link href="/investigaciones" className="transition-colors hover:text-zinc-300">
              Investigaciones
            </Link>
            <Link href="/auth/signin" className="transition-colors hover:text-zinc-300">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({
  href,
  title,
  description,
  icon,
}: {
  readonly href: string
  readonly title: string
  readonly description: string
  readonly icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-purple-600/20 group-hover:text-purple-400">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </Link>
  )
}

function InvestigationCard({ item }: { readonly item: InvestigationListItem }) {
  return (
    <article className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
      <Link
        href={`/investigacion/${item.slug}`}
        className="text-lg font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-purple-400"
      >
        {item.title}
      </Link>
      {item.summary && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">{item.summary}</p>
      )}
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-zinc-500">
        {item.author_name && <span className="truncate">{item.author_name}</span>}
        {item.published_at && (
          <>
            {item.author_name && <span className="text-zinc-700">&middot;</span>}
            <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
          </>
        )}
      </div>
    </article>
  )
}

function StatBlock({
  label,
  value,
  detail,
}: {
  readonly label: string
  readonly value: string
  readonly detail: string
}) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-zinc-50">{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-300">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Icons (inline SVGs, 20x20)
// ---------------------------------------------------------------------------

function GraphIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
      <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function UserPlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}
