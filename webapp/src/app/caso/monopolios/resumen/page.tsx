'use client'

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'

const TITLE: Record<Lang, string> = {
  es: 'El Oligopolio Argentino: 18 Sectores, Una Red de Poder',
  en: 'The Argentine Oligopoly: 18 Sectors, One Power Network',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'Investigacion basada en 2,45 millones de nodos, 4,69 millones de relaciones, 44 archivos de investigacion y 75 afirmaciones verificadas.',
  en: 'Investigation based on 2.45 million nodes, 4.69 million relationships, 44 research files, and 75 factchecked claims.',
}

interface Chapter {
  id: string
  title: Record<Lang, string>
  content: Record<Lang, string>
}

const CHAPTERS: Chapter[] = [
  {
    id: 'origins',
    title: { es: 'Origenes: Las privatizaciones de 1989-1999', en: 'Origins: The 1989-1999 privatizations' },
    content: {
      es: 'Los monopolios actuales nacieron de las privatizaciones menemistas. ENTel se convirtio en el duopolio Telecom-Telefonica (ahora fusionandose bajo Clarin). SEGBA se dividio en Edenor-Edesur (ahora bajo Mindlin y Enel). Gas del Estado creo TGS (Mindlin) y TGN (Techint/Eurnekian) con licencias extendidas hasta 2047. SOMISA fue vendida a Techint por ~1/7 de su valor libros, creando el monopolio siderurgico de Ternium. Aerolineas Argentinas fue desguazada por Iberia y Marsans — su flota cayo de 28 aviones propios a 2. Roberto Dromi declaro: "nada de lo que deba ser estatal permanecera en manos del Estado."',
      en: 'Current monopolies were born from Menem-era privatizations. ENTel became the Telecom-Telefonica duopoly (now merging under Clarin). SEGBA was split into Edenor-Edesur (now under Mindlin and Enel). Gas del Estado created TGS (Mindlin) and TGN (Techint/Eurnekian) with licenses extended to 2047. SOMISA was sold to Techint for ~1/7 book value, creating the Ternium steel monopoly. Aerolineas Argentinas was stripped by Iberia and Marsans — its fleet fell from 28 owned planes to 2. Roberto Dromi declared: "nothing that should be state-owned will remain in the hands of the State."',
    },
  },
  {
    id: 'empires',
    title: { es: 'Los imperios: 10 familias, 400+ empresas', en: 'The empires: 10 families, 400+ companies' },
    content: {
      es: 'Diez grupos familiares controlan los sectores clave. Vila-Manzano lidera con 70+ empresas (America TV + Telefe + Edenor). Mindlin controla 52 empresas energeticas (generacion + distribucion = mercado cautivo). Magnetto/Clarin tiene 35 empresas (medios + telecom, 46% banda ancha). Eurnekian controla 35 empresas (35 aeropuertos + energia). Roggio tiene 33 empresas de servicios publicos + 3 entidades BVI. Werthein opera 30 empresas (seguros + banca). Blaquier/Ledesma tiene 28 empresas + 7 entidades offshore (la mayor red offshore de cualquier familia monopolica). Coto domina el retail del AMBA con 26 empresas + entidad en Panama. Braun/La Anonima tiene 26 empresas con monopolio patagonico. Perez Companc controla 23 empresas via Molinos Rio de la Plata.',
      en: 'Ten family groups control the key sectors. Vila-Manzano leads with 70+ companies (America TV + Telefe + Edenor). Mindlin controls 52 energy companies (generation + distribution = captive market). Magnetto/Clarin has 35 companies (media + telecom, 46% broadband). Eurnekian controls 35 companies (35 airports + energy). Roggio has 33 public service companies + 3 BVI entities. Werthein operates 30 companies (insurance + banking). Blaquier/Ledesma has 28 companies + 7 offshore entities (largest offshore network of any monopoly family). Coto dominates AMBA retail with 26 companies + Panama entity. Braun/La Anonima has 26 companies with Patagonian monopoly. Perez Companc controls 23 companies via Molinos Rio de la Plata.',
    },
  },
  {
    id: 'offshore',
    title: { es: 'La red offshore: 60 entidades en 5 jurisdicciones', en: 'The offshore network: 60 entities across 5 jurisdictions' },
    content: {
      es: 'Se identificaron 60 entidades offshore vinculadas a familias monopolicas, 25 aun activas. BVI domina con 29 entidades (Blaquier 8, Roggio 3, De Narvaez 3, Cartellone 2). Panama tiene 4 entidades (Coto, Blaquier, Cartellone). Las Islas Cook albergan el fideicomiso Madanes Quintanilla (Aluar). Malta tiene la entidad de Galuccio (Vista Oil). Roggio creo 3 entidades BVI MIENTRAS estaba bajo investigacion criminal — Alcogal lo clasifico como riesgo Nivel 6. Alfredo Coto tiene Leopold Company S.A. activa en Panama desde 2012. La familia De Narvaez tiene una investigacion activa de AFIP por evasion fiscal agravada.',
      en: 'We identified 60 offshore entities linked to monopoly families, 25 still active. BVI dominates with 29 entities (Blaquier 8, Roggio 3, De Narvaez 3, Cartellone 2). Panama has 4 entities (Coto, Blaquier, Cartellone). Cook Islands houses the Madanes Quintanilla trust (Aluar). Malta has Galuccio\'s entity (Vista Oil). Roggio created 3 BVI entities WHILE under criminal investigation — Alcogal classified him as Level 6 risk. Alfredo Coto has Leopold Company S.A. active in Panama since 2012. The De Narvaez family has an active AFIP investigation for aggravated tax evasion.',
    },
  },
  {
    id: 'bribery',
    title: { es: 'El nexo del soborno: Cuadernos + Odebrecht', en: 'The bribery nexus: Cuadernos + Odebrecht' },
    content: {
      es: 'Los 5 mayores contratistas de obras publicas por monto (ARS 13 billones combinados) son todos actores monopolicos. La UTE SUPERCEMENTO-ROGGIO-CARRANZA tiene un contrato de ARS 5,7 billones. 8 de 14 acusados en Cuadernos estan en nuestra lista de monopolios. Roggio confeso el 5% de comisiones ilegales. Calcaterra ofrecio ARS 2.942,6M para su sobreseimiento (rechazado). Rocca fue sobreseido porque la fiscalia perdio el plazo de apelacion. Odebrecht pago USD 35M en sobornos en Argentina — cero condenas tras 10 anos. El aparato de sobornos y la estructura monopolica son la misma red.',
      en: 'The top 5 public works contractors by award amount (ARS 13 trillion combined) are all monopoly actors. The SUPERCEMENTO-ROGGIO-CARRANZA UTE holds an ARS 5.7T contract. 8 of 14 Cuadernos defendants are on our monopoly list. Roggio confessed to 5% kickbacks. Calcaterra offered ARS 2,942.6M for dismissal (rejected). Rocca was cleared because prosecutors missed the appeal deadline. Odebrecht paid USD 35M in Argentine bribes — zero convictions after 10 years. The bribery apparatus and the monopoly structure are the same network.',
    },
  },
  {
    id: 'consumer',
    title: { es: 'El costo al consumidor: USD 22.500M por ano', en: 'The consumer cost: USD 22.5B per year' },
    content: {
      es: 'El costo estimado de la monopolizacion al consumidor argentino es de USD 22.500M anuales (3,3% del PIB). Los medicamentos cuestan 26% mas que el promedio latinoamericano — PAMI documento sobreprecios de hasta 1.327% en oncologicos. La brecha productor-gondola en alimentos es de 3,7x (CAME 2025). El aluminio es un monopolio puro (HHI 10.000) con energia subsidiada al 63-80% de descuento. La OCDE estima que reformas pro-competencia podrian impulsar el PIB un 9,5% acumulado para 2050. El quintil mas pobre pierde el 15% de sus ingresos por precios monopolicos, contra solo 3% del quintil mas rico.',
      en: 'The estimated cost of monopolization to Argentine consumers is USD 22.5B annually (3.3% of GDP). Drugs cost 26% more than the Latin American average — PAMI documented markups up to 1,327% on oncology drugs. The farm-to-shelf food markup is 3.7x (CAME 2025). Aluminium is a pure monopoly (HHI 10,000) with energy subsidized at 63-80% discount. OECD estimates pro-competition reforms could boost GDP by 9.5% cumulatively by 2050. The poorest quintile loses 15% of income to monopoly pricing, vs only 3% for the richest.',
    },
  },
  {
    id: 'milei',
    title: { es: 'La era Milei: desregulacion y nuevos riesgos', en: 'The Milei era: deregulation and new risks' },
    content: {
      es: 'El DNU 70/2023 elimino topes de licencias de medios, la Ley de Gondolas, y controles de precios. Esto permitio la venta de Telefe a Vila-Manzano (USD 95M), dando al grupo control de los 2 canales mas vistos. El RIGI otorga 30 anos de estabilidad fiscal a mineras extranjeras con regalias del 3%. La ANC reemplazo a la CNDC en noviembre 2025, pero el control previo de fusiones no se activa hasta noviembre 2026 — creando un vacio regulatorio durante la mayor ola de fusiones desde los 90. Visa readquirio Prisma (80% del procesamiento de tarjetas) durante esta ventana. Edenor+Edesur generaron ARS 274.000M de ganancia en 9 meses.',
      en: 'DNU 70/2023 eliminated media license caps, the shelf-space law, and price controls. This enabled the Telefe sale to Vila-Manzano (USD 95M), giving the group control of the 2 most-watched channels. RIGI grants 30-year tax stability to foreign miners with 3% royalties. ANC replaced CNDC in November 2025, but ex-ante merger control doesn\'t activate until November 2026 — creating a regulatory vacuum during the largest merger wave since the 1990s. Visa reacquired Prisma (80% card processing) during this window. Edenor+Edesur generated ARS 274B profit in 9 months.',
    },
  },
]

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{TITLE[lang]}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{SUBTITLE[lang]}</p>
      </header>

      <div className="space-y-10">
        {CHAPTERS.map((ch, i) => (
          <section key={ch.id}>
            <h2 className="mb-3 text-lg font-bold text-zinc-200">
              <span className="mr-2 text-zinc-600">{String(i + 1).padStart(2, '0')}</span>
              {ch.title[lang]}
            </h2>
            <p className="text-sm leading-7 text-zinc-400">{ch.content[lang]}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
