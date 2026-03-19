'use client'

/**
 * Caso Libra — Predictions page (coming soon).
 *
 * Will show pre-computed simulation results as predictions about
 * how key actors are likely to respond to new evidence, based on
 * swarm intelligence analysis with MiroFish.
 */

const PREDICTIONS = [
  {
    question_es: 'Que pasa si Hayden Davis coopera con la justicia argentina?',
    question_en: 'What happens if Hayden Davis cooperates with Argentine justice?',
    preview_es:
      'Simulacion de 11 agentes sugiere que la cooperacion de Davis desencadenaria acusaciones en cadena contra intermediarios locales, forzando al gobierno a distanciarse publicamente.',
    preview_en:
      'Simulation of 11 agents suggests Davis cooperation would trigger chain accusations against local intermediaries, forcing the government to publicly distance itself.',
  },
  {
    question_es: 'Como reaccionaria el mercado si Milei enfrenta juicio politico?',
    question_en: 'How would the market react if Milei faces impeachment?',
    preview_es:
      'El analisis predice una caida del 15-25% en activos argentinos con recuperacion parcial en 72 horas, mientras actores cripto aceleran la salida de fondos del pais.',
    preview_en:
      'Analysis predicts a 15-25% drop in Argentine assets with partial recovery within 72 hours, as crypto actors accelerate fund exits from the country.',
  },
  {
    question_es: 'Que pasaria si se publican los registros completos de llamadas de Santiago Caputo?',
    question_en: 'What would happen if Santiago Caputo\'s complete call records are published?',
    preview_es:
      'Los agentes simulados muestran que la publicacion forzaria la renuncia de al menos un funcionario y activaria nuevas lineas de investigacion judicial.',
    preview_en:
      'Simulated agents show publication would force at least one official\'s resignation and activate new lines of judicial investigation.',
  },
  {
    question_es: 'Que pasa si aparecen mas billeteras vinculadas a funcionarios?',
    question_en: 'What happens if more wallets linked to officials are discovered?',
    preview_es:
      'La simulacion indica que nuevas billeteras generarian un ciclo mediatico de 2 semanas con impacto directo en la aprobacion presidencial, llevandola por debajo del 35%.',
    preview_en:
      'Simulation indicates new wallets would generate a 2-week media cycle with direct impact on presidential approval, pushing it below 35%.',
  },
]

export default function PrediccionesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-purple-400">
          Proximamente
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-50 sm:text-3xl">
          Predicciones con Inteligencia de Enjambre
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
          Usamos simulacion multi-agente para explorar escenarios hipoteticos del caso $LIBRA.
          Agentes autonomos con las personalidades de los actores reales simulan como se
          desarrollarian eventos alternativos en redes sociales.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Como funciona
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Escenario',
              desc: 'Se plantea una pregunta hipotetica sobre el caso',
            },
            {
              step: '2',
              title: 'Simulacion',
              desc: '11 agentes con IA simulan las reacciones de cada actor clave',
            },
            {
              step: '3',
              title: 'Prediccion',
              desc: 'Se genera un informe con las consecuencias mas probables',
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-sm font-bold text-purple-400">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{s.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview predictions */}
      <div>
        <h2 className="text-lg font-bold text-zinc-50">Preguntas en desarrollo</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Estas son las predicciones que estamos generando. Los resultados completos estaran
          disponibles proximamente.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PREDICTIONS.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
            >
              <h3 className="text-sm font-semibold text-zinc-100">
                {p.question_es}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {p.preview_es}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  En progreso
                </span>
                <span className="text-xs text-zinc-600">11 agentes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech info */}
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-5">
        <p className="text-xs leading-relaxed text-zinc-500">
          Motor de simulacion:{' '}
          <span className="text-zinc-400">MiroFish</span> (inteligencia de enjambre multi-agente)
          {' · '}LLM:{' '}
          <span className="text-zinc-400">Qwen 3.5 9B</span> (ejecucion local)
          {' · '}Datos:{' '}
          <span className="text-zinc-400">Neo4j knowledge graph</span> con 8 actores, 18 eventos, 40 relaciones
        </p>
      </div>
    </div>
  )
}
