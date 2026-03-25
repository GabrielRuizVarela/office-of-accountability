'use client'

/**
 * Caso Libra — Predictions page (coming soon).
 *
 * Will show pre-computed simulation results as predictions about
 * how key actors are likely to respond to new evidence, based on
 * swarm intelligence analysis.
 */

import { useLanguage, type Lang } from '@/lib/language-context'

const t = {
  comingSoon: { es: 'Proximamente', en: 'Coming Soon' },
  title: {
    es: 'Predicciones con Inteligencia de Enjambre',
    en: 'Swarm Intelligence Predictions',
  },
  subtitle: {
    es: 'Usamos simulacion multi-agente para explorar escenarios hipoteticos del caso $LIBRA. Agentes autonomos con las personalidades de los actores reales simulan como se desarrollarian eventos alternativos en redes sociales.',
    en: 'We use multi-agent simulation to explore hypothetical scenarios in the $LIBRA case. Autonomous agents with the personalities of real actors simulate how alternative events would unfold on social media.',
  },
  howItWorks: { es: 'Como funciona', en: 'How it works' },
  questionsInDev: { es: 'Preguntas en desarrollo', en: 'Questions in development' },
  questionsSubtitle: {
    es: 'Estas son las predicciones que estamos generando. Los resultados completos estaran disponibles proximamente.',
    en: 'These are the predictions we are generating. Full results will be available soon.',
  },
  inProgress: { es: 'En progreso', en: 'In progress' },
  simEngine: { es: 'Motor de simulacion', en: 'Simulation engine' },
  localExec: { es: 'ejecucion local', en: 'local execution' },
  data: { es: 'Datos', en: 'Data' },
} satisfies Record<string, Record<Lang, string>>

const STEPS = [
  {
    step: '1',
    title: { es: 'Escenario', en: 'Scenario' },
    desc: {
      es: 'Se plantea una pregunta hipotetica sobre el caso',
      en: 'A hypothetical question about the case is posed',
    },
  },
  {
    step: '2',
    title: { es: 'Simulacion', en: 'Simulation' },
    desc: {
      es: '11 agentes con IA simulan las reacciones de cada actor clave',
      en: '11 AI agents simulate each key actor\'s reactions',
    },
  },
  {
    step: '3',
    title: { es: 'Prediccion', en: 'Prediction' },
    desc: {
      es: 'Se genera un informe con las consecuencias mas probables',
      en: 'A report is generated with the most likely consequences',
    },
  },
]

const PREDICTIONS = [
  {
    question: {
      es: 'Que pasa si Hayden Davis coopera con la justicia argentina?',
      en: 'What happens if Hayden Davis cooperates with Argentine justice?',
    },
    preview: {
      es: 'Simulacion de 11 agentes sugiere que la cooperacion de Davis desencadenaria acusaciones en cadena contra intermediarios locales, forzando al gobierno a distanciarse publicamente.',
      en: 'Simulation of 11 agents suggests Davis cooperation would trigger chain accusations against local intermediaries, forcing the government to publicly distance itself.',
    },
  },
  {
    question: {
      es: 'Como reaccionaria el mercado si Milei enfrenta juicio politico?',
      en: 'How would the market react if Milei faces impeachment?',
    },
    preview: {
      es: 'El analisis predice una caida del 15-25% en activos argentinos con recuperacion parcial en 72 horas, mientras actores cripto aceleran la salida de fondos del pais.',
      en: 'Analysis predicts a 15-25% drop in Argentine assets with partial recovery within 72 hours, as crypto actors accelerate fund exits from the country.',
    },
  },
  {
    question: {
      es: 'Que pasaria si se publican los registros completos de llamadas de Santiago Caputo?',
      en: 'What would happen if Santiago Caputo\'s complete call records are published?',
    },
    preview: {
      es: 'Los agentes simulados muestran que la publicacion forzaria la renuncia de al menos un funcionario y activaria nuevas lineas de investigacion judicial.',
      en: 'Simulated agents show publication would force at least one official\'s resignation and activate new lines of judicial investigation.',
    },
  },
  {
    question: {
      es: 'Que pasa si aparecen mas billeteras vinculadas a funcionarios?',
      en: 'What happens if more wallets linked to officials are discovered?',
    },
    preview: {
      es: 'La simulacion indica que nuevas billeteras generarian un ciclo mediatico de 2 semanas con impacto directo en la aprobacion presidencial, llevandola por debajo del 35%.',
      en: 'Simulation indicates new wallets would generate a 2-week media cycle with direct impact on presidential approval, pushing it below 35%.',
    },
  },
]

export default function PrediccionesPage() {
  const { lang } = useLanguage()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-purple-400">
          {t.comingSoon[lang]}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-50 sm:text-3xl">
          {t.title[lang]}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
          {t.subtitle[lang]}
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t.howItWorks[lang]}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-sm font-bold text-purple-400">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{s.title[lang]}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview predictions */}
      <div>
        <h2 className="text-lg font-bold text-zinc-50">{t.questionsInDev[lang]}</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {t.questionsSubtitle[lang]}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PREDICTIONS.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
            >
              <h3 className="text-sm font-semibold text-zinc-100">
                {p.question[lang]}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {p.preview[lang]}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {t.inProgress[lang]}
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
          {t.simEngine[lang]}:{' '}
          <span className="text-zinc-400">
          {lang === 'es' ? 'Inteligencia de enjambre multi-agente' : 'Multi-agent swarm intelligence'}
          </span>
          {' · '}LLM:{' '}
          <span className="text-zinc-400">{t.localExec[lang]}</span>
          {' · '}{t.data[lang]}:{' '}
          <span className="text-zinc-400">Neo4j knowledge graph</span>{' '}
          {lang === 'es'
            ? 'con 8 actores, 18 eventos, 40 relaciones'
            : 'with 8 actors, 18 events, 40 relationships'}
        </p>
      </div>
    </div>
  )
}
