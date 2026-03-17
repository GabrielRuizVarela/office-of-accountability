export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Oficina de Rendición de Cuentas
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Plataforma de conocimiento cívico para la política argentina.
          Explorá las conexiones entre legisladores, votaciones y legislación.
        </p>
        <div className="flex gap-4">
          <a
            href="/explorar"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Explorar el grafo
          </a>
        </div>
      </main>
    </div>
  )
}
