import { Masthead } from '@/components/landing/Masthead'
import { NarrativeIntro } from '@/components/landing/NarrativeIntro'
import { Chapter } from '@/components/landing/Chapter'
import { Transition } from '@/components/landing/Transition'
import { WhatsNext } from '@/components/landing/WhatsNext'
import { CallToAction } from '@/components/landing/CallToAction'

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl">
      <Masthead />
      <NarrativeIntro />

      {/* Chapter I — Caso Libra */}
      <Chapter
        number="I"
        label="La primera prueba"
        color="purple"
        title="Caso Libra: La Memecoin del Presidente"
        links={[{ href: '/caso/caso-libra', label: 'Ver investigación →', color: 'purple' }]}
      >
        Milei promovió <strong className="font-semibold text-zinc-200">$LIBRA</strong> a 19
        millones de seguidores. El precio colapsó 94% en horas. El motor procesó transacciones
        blockchain, documentos parlamentarios y redes sociales.{' '}
        <strong className="font-semibold text-zinc-200">$251M+</strong> en pérdidas,{' '}
        <strong className="font-semibold text-zinc-200">114K</strong> billeteras afectadas.
      </Chapter>

      <Transition text="El motor funcionó. Necesitábamos probarlo con volumen real de datos." />

      {/* Chapter II — Caso Epstein */}
      <Chapter
        number="II"
        label="Prueba de escala"
        color="red"
        title="Caso Epstein: Red de tráfico y poder"
        links={[{ href: '/caso/caso-epstein', label: 'Ver investigación →', color: 'red' }]}
      >
        Un caso con miles de documentos, cientos de actores, décadas de historia.{' '}
        <strong className="font-semibold text-zinc-200">7,276</strong> entidades,{' '}
        <strong className="font-semibold text-zinc-200">374</strong> actores,{' '}
        <strong className="font-semibold text-zinc-200">1,044</strong> documentos judiciales
        procesados. El motor escaló.
      </Chapter>

      <Transition text="Los resultados mejoraban con cada caso. Menos intervención humana, más profundidad. Pero siempre con validación." />

      {/* Chapter III — Finanzas Políticas */}
      <Chapter
        number="III"
        label="El descubrimiento"
        color="emerald"
        title="Finanzas Políticas Argentinas"
        links={[
          { href: '/caso/finanzas-politicas', label: 'Ver investigación →', color: 'emerald' },
        ]}
      >
        Empezamos con los datasets de Como Voto. Expandimos a declaraciones juradas, sociedades
        offshore, financiamiento de campañas. La investigación se convirtió en un buceo profundo en
        las conexiones entre{' '}
        <strong className="font-semibold text-zinc-200">políticos y dinero</strong>.{' '}
        <strong className="font-semibold text-zinc-200">329</strong> legisladores,{' '}
        <strong className="font-semibold text-zinc-200">7</strong> fuentes de datos cruzadas.
      </Chapter>

      <Transition text="Los resultados fueron sorprendentes. Decidimos probar con otros datos públicos abiertos." />

      {/* Chapter IV — Obras Públicas + Monopolios */}
      <Chapter
        number="IV"
        label="Datos abiertos"
        color="sky"
        title="Obras Públicas y Monopolios"
        links={[
          { href: '/caso/obras-publicas', label: 'Obras Públicas →', color: 'sky' },
          { href: '/caso/monopolios', label: 'Monopolios →', color: 'amber' },
        ]}
      >
        Contratos de obra pública: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos.{' '}
        <strong className="font-semibold text-zinc-200">56,122</strong> entidades,{' '}
        <strong className="font-semibold text-zinc-200">7,486</strong> obras,{' '}
        <strong className="font-semibold text-zinc-200">13,277</strong> cruces contra el grafo de
        finanzas. En paralelo, el estado de monopolización de{' '}
        <strong className="font-semibold text-zinc-200">18 sectores</strong> de la economía
        argentina. <strong className="font-semibold text-zinc-200">USD 22.5B</strong> en costo anual
        estimado.
      </Chapter>

      <Transition text="El 24 de marzo trajo nueva información. Creamos pipelines para consolidar datos de la dictadura en un grafo unificado." />

      {/* Chapter V — Dictadura */}
      <Chapter
        number="V"
        label="24 de Marzo 2026"
        color="stone"
        title="Caso Dictadura: 1976–1983"
        links={[{ href: '/caso/caso-dictadura', label: 'Ver investigación →', color: 'stone' }]}
      >
        Dictadura militar argentina. Múltiples pipelines de ingesta consolidados en un grafo
        unificado. <strong className="font-semibold text-zinc-200">9,415</strong> víctimas
        documentadas, <strong className="font-semibold text-zinc-200">774</strong> centros
        clandestinos de detención,{' '}
        <strong className="font-semibold text-zinc-200">14,512</strong> nodos. Nuevas conexiones,
        nuevas pistas. La investigación continúa.
      </Chapter>

      {/* Chapter VI — Riesgo Nuclear (WIP) */}
      <Chapter
        number="VI"
        label="En desarrollo"
        color="yellow"
        title="Riesgo Nuclear Global"
        links={[{ href: '/caso/riesgo-nuclear', label: 'Ver progreso →', color: 'yellow' }]}
        wip
      >
        Monitoreo diario de señales de escalada nuclear: desarrollos militares, declaraciones
        oficiales, tratados, pruebas de misiles y datos OSINT.{' '}
        <strong className="font-semibold text-zinc-200">31</strong> fuentes,{' '}
        <strong className="font-semibold text-zinc-200">9</strong> estados nucleares monitoreados.
        Pipeline de ingesta y evaluación de riesgo en construcción.
      </Chapter>

      <WhatsNext />
      <CallToAction />
    </div>
  )
}
