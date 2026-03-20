/**
 * Homepage — main landing page for the ORC platform.
 */

import Link from 'next/link'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-zinc-50">
            ORC
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/caso/caso-libra" className="text-zinc-400 transition-colors hover:text-zinc-100">
              Caso Libra
            </Link>
            <Link href="/caso/caso-epstein" className="text-zinc-400 transition-colors hover:text-zinc-100">
              Caso Epstein
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500" />
            Plataforma de conocimiento civico
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            Oficina de Rendicion de Cuentas
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Investigaciones abiertas con datos verificables. Grafos de conocimiento, cronologias,
            evidencia documental y analisis de red.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/caso/caso-libra"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              <DocumentIcon />
              Caso Libra
            </Link>
            <Link
              href="/caso/caso-epstein"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <CaseIcon />
              Caso Epstein
            </Link>
          </div>
        </div>
      </section>

      {/* Investigations */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-bold text-zinc-50 sm:text-2xl">Investigaciones</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Caso Libra */}
          <Link
            href="/caso/caso-libra"
            className="group flex flex-col gap-4 rounded-xl border border-purple-600/30 bg-gradient-to-br from-zinc-900 to-purple-950/20 p-6 transition-colors hover:border-purple-500/50"
          >
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
              Investigacion activa
            </div>
            <h3 className="text-xl font-bold text-zinc-50 group-hover:text-purple-300">
              Caso Libra: La Memecoin del Presidente
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Milei promovio $LIBRA a 19M de seguidores. El precio colapso 94% en horas.
              114,000+ billeteras perdieron $251M+.
            </p>
            <div className="flex gap-4 text-sm">
              <span className="font-semibold text-purple-400">$251M+</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">114,000+ billeteras</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">94% caida</span>
            </div>
            <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300">
              Explorar &rarr;
            </span>
          </Link>

          {/* Caso Epstein */}
          <Link
            href="/caso/caso-epstein"
            className="group flex flex-col gap-4 rounded-xl border border-red-500/20 bg-gradient-to-br from-zinc-900 to-red-950/20 p-6 transition-colors hover:border-red-500/40"
          >
            <div className="flex items-center gap-2 text-xs text-red-400">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Investigacion activa
            </div>
            <h3 className="text-xl font-bold text-zinc-50 group-hover:text-red-300">
              Caso Epstein: Red de trafico y poder
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              7,287 entidades y 21,944 relaciones documentadas. Documentos judiciales,
              registros de vuelo, 72 verificaciones de hechos.
            </p>
            <div className="flex gap-4 text-sm">
              <span className="font-semibold text-red-400">7,287</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">355 actores</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">1,044 documentos</span>
            </div>
            <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
              Explorar &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:justify-between">
          <p>Oficina de Rendicion de Cuentas — Datos abiertos</p>
          <nav className="flex gap-4">
            <Link href="/caso/caso-libra" className="transition-colors hover:text-zinc-300">
              Caso Libra
            </Link>
            <Link href="/caso/caso-epstein" className="transition-colors hover:text-zinc-300">
              Caso Epstein
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Icons (inline SVGs, 20x20)
// ---------------------------------------------------------------------------

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

function CaseIcon() {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  )
}
