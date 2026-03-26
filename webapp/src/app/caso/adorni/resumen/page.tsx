'use client'

/**
 * Caso Adorni - Narrative summary page.
 *
 * A bilingual investigative journalism piece covering the Adorni
 * spokesperson investigation across 13 waves. Chapters will be
 * populated as the investigation progresses.
 */

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Citation {
  readonly id: number
  readonly text: string
  readonly url?: string
}

interface Chapter {
  readonly id: string
  readonly title: Record<Lang, string>
  readonly paragraphs: Record<Lang, readonly string[]>
  readonly pullQuote?: Record<Lang, string>
  readonly citations?: readonly Citation[]
}

// ---------------------------------------------------------------------------
// Header content
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  es: 'Caso Adorni: El Vocero',
  en: 'The Adorni Case: The Spokesperson',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'Investigacion de trece olas sobre el vocero presidencial, la pauta oficial, las declaraciones verificadas, los contratos mediaticos, y las conexiones entre comunicacion gubernamental y poder economico.',
  en: 'Thirteen-wave investigation into the presidential spokesperson, official advertising spend, verified statements, media contracts, and the connections between government communication and economic power.',
}

const READING_TIME: Record<Lang, string> = {
  es: '~25 min de lectura',
  en: '~25 min read',
}

const LAST_UPDATED: Record<Lang, string> = {
  es: 'Actualizado: marzo 2026',
  en: 'Last updated: March 2026',
}

// ---------------------------------------------------------------------------
// Chapters - will be populated by Wave 13
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = [
  {
    id: 'el-vocero',
    title: { es: 'I. El Vocero', en: 'I. The Spokesperson' },
    paragraphs: {
      es: [
        'Manuel Adorni llego al gobierno de Javier Milei como comentarista economico de television. En diciembre de 2023, el Decreto 86/2023 lo designo Vocero Presidencial con rango de Secretario de Estado. En septiembre de 2024, el Decreto 834/2024 lo ascendio a Secretario de Comunicacion y Medios, dandole control sobre la pauta oficial y los medios estatales. En octubre de 2025, se convirtio en Jefe de Gabinete de Ministros - el cargo mas alto del gabinete argentino. [1]',
        'Su CUIT (20-28052206-7) revela una trayectoria empresarial anterior: actividades de servicios personales desde 2013, asesoria empresarial y contabilidad desde 2020, y una sociedad al 50% con su esposa Bettina Julieta Angeletti en AS Innovacion Profesional S.R.L., registrada en el Boletin Oficial. [2]',
        'Lo que esta investigacion de 13 olas descubrio no es la historia de un vocero que comete un error. Es un mapa de presuntos conflictos de interes que, segun denuncias penales y registros publicos, vincularian al Jefe de Gabinete con licitaciones de presunta competencia simulada, contratos presuntamente triangulados, bienes no incluidos en sus declaraciones juradas, y conexiones con personas investigadas en el caso cripto LIBRA, segun registros judiciales.',
      ],
      en: [
        'Manuel Adorni arrived in Javier Milei\'s government as a television economic commentator. In December 2023, Decree 86/2023 designated him Presidential Spokesperson with rank of Secretary of State. In September 2024, Decree 834/2024 promoted him to Secretary of Communication and Media, granting him control over official advertising and state media. In October 2025, he became Chief of Cabinet - the highest cabinet position in Argentina. [1]',
        'His CUIT (20-28052206-7) reveals a prior business trajectory: personal services since 2013, business advisory and accounting since 2020, and a 50/50 partnership with his wife Bettina Julieta Angeletti in AS Innovacion Profesional S.R.L., registered in the Boletin Oficial. [2]',
        'What this 13-wave investigation uncovered is not the story of a spokesperson making a mistake. It is a map of alleged conflicts of interest that, according to criminal complaints and public records, would connect the Chief of Cabinet to tenders with alleged simulated competition, allegedly triangulated contracts, assets not included in his sworn declarations, and connections to persons under investigation in the LIBRA crypto scandal, according to judicial records.',
      ],
    },
    pullQuote: { es: 'Con mi dinero hago lo que quiero. - Manuel Adorni, 25 de marzo de 2026', en: 'I do whatever I want with my money. - Manuel Adorni, March 25, 2026' },
    citations: [
      { id: 1, text: 'Chequeado - Perfil de Manuel Adorni', url: 'https://chequeado.com/personajes/quien-es-manuel-adorni/' },
      { id: 2, text: 'Boletin Oficial - AS Innovacion Profesional S.R.L.', url: 'https://www.boletinoficial.gob.ar/pdf/linkQR/elgyazJaYndib2QreFpJZ1U0d1UwZz09' },
    ],
  },
  {
    id: 'la-licitacion-fantasma',
    title: { es: 'II. La Licitacion Bajo Sospecha', en: 'II. The Tender Under Scrutiny' },
    paragraphs: {
      es: [
        'El 14 de mayo de 2025, Adorni - entonces Secretario de Comunicacion - lanzo una licitacion para servicios de mensajeria masiva: 36 millones de SMS, 600 millones de emails y 12 millones de llamadas automaticas para 2026. El 30 de diciembre de 2025, ya como Jefe de Gabinete, firmo la adjudicacion a ATX S.A. por $3.650.226.300 de pesos. [1]',
        'Tres empresas participaron: ATX S.A. (ganadora), Area Tech S.A. (eliminada) y Movilgate S.R.L. (segunda). Los datos de la Inspeccion General de Justicia (IGJ) revelan que las tres empresas comparten directivos y direcciones, lo que sugiere posibles vinculos societarios.',
        'Ruben Santiago Ward (DNI 24.676.344) es presidente de ATX. Pablo Javier Casal es presidente de Area Tech. Ambos fueron socios en Lugalu S.A. Ward y Casal comparten la misma direccion comercial: Pedro Chutro 3135, CABA. Area Tech no presento la garantia de oferta - un patron que, segun especialistas en contratacion publica, puede ser indicativo de competencia simulada. [2]',
        'El hallazgo mas significativo: Rodrigo Paez Canosa (DNI 25.896.026) es director suplente de ATX, ex-empleado de Area Tech, Y ex-empleado de Movilgate. Un solo individuo conecta las tres "competidoras." La IGJ confirma que Paez Canosa es ademas directivo de Lugalu y Neutronica - ambas tambien de Ward. [3]',
        'ATX cobro $0,045 por SMS en el primer contrato pero $0,076 en el segundo - un aumento del 69% por servicio identico.',
        'Nota: la conexion basica Adorni-ATX-Ward y el vinculo Casal-Lugalu fueron reportados primero por el diputado Rodolfo Tailhade y cubiertos por Sumario, Canal de las Noticias y DataClave. Lo que esta investigacion aporta es la confirmacion via IGJ por DNI de que Paez Canosa es director registrado (no solo ex-empleado) en ATX, Lugalu y Neutronica simultaneamente - y que la red de Ward abarca 11 empresas, no las 2-3 reportadas por los medios.',
      ],
      en: [
        'On May 14, 2025, Adorni - then Communications Secretary - launched a tender for mass messaging: 36 million SMS, 600 million emails, and 12 million automated calls for 2026. On December 30, 2025, now as Chief of Cabinet, he signed the award to ATX S.A. for $3,650,226,300 pesos. [1]',
        'Three companies bid: ATX S.A. (winner), Area Tech S.A. (eliminated), and Movilgate S.R.L. (second place). IGJ (corporate registry) data reveals the three companies share directors and addresses, suggesting possible corporate links.',
        'Ruben Santiago Ward (DNI 24,676,344) is ATX president. Pablo Javier Casal is Area Tech president. Both were partners in Lugalu S.A. Ward and Casal share the same business address: Pedro Chutro 3135, CABA. Area Tech failed to present the bid guarantee - a pattern that, according to public procurement experts, may indicate simulated competition. [2]',
        'The most significant finding: Rodrigo Paez Canosa (DNI 25,896,026) is ATX substitute director, former Area Tech employee, AND former Movilgate employee. A single individual connects all three "competitors." IGJ confirms Paez Canosa is also a director at Lugalu and Neutronica - both also Ward companies. [3]',
        'ATX charged $0.045 per SMS in Contract 1 but $0.076 in Contract 2 - a 69% increase for identical service.',
        'Note: the basic Adorni-ATX-Ward connection and the Casal-Lugalu link were first reported by Diputado Rodolfo Tailhade and covered by Sumario, Canal de las Noticias, and DataClave. What this investigation adds is the IGJ-confirmed DNI match proving Paez Canosa is a registered director (not just a former employee) at ATX, Lugalu, and Neutronica simultaneously - and that Ward\'s network extends to 11 companies, not the 2-3 reported in media.',
      ],
    },
    pullQuote: { es: 'Ward controla 11 empresas. Paez Canosa aparece en 4 de ellas. Las tres "competidoras" comparten directivos, direcciones y socios. La prensa reporto 2-3 empresas de Ward - la IGJ revela 11.', en: 'Ward controls 11 companies. Paez Canosa appears in 4 of them. The three "competitors" share directors, addresses, and partners. Media reported 2-3 Ward companies - IGJ reveals 11.' },
    citations: [
      { id: 1, text: 'Canal de las Noticias - Adorni licitacion SMS ATX', url: 'https://www.canaldelasnoticias.com/adorni-licitacion-sms-atx-sa-ward-millones-dolares/' },
      { id: 2, text: 'Ambito - Irregularidades y conflictos de interes', url: 'https://www.ambito.com/politica/denuncian-manuel-adorni-irregularidades-sospechas-conflicto-intereses-y-licitaciones-la-lupa-n6257361' },
      { id: 3, text: 'IGJ - Datos confirmados de directivos de ATX, Lugalu, Neutronica', url: 'https://www.argentina.gob.ar/justicia/igj' },
    ],
  },
  {
    id: 'el-imperio-ward',
    title: { es: 'III. El Imperio Ward', en: 'III. The Ward Empire' },
    paragraphs: {
      es: [
        'La consulta a la base de datos de la IGJ revela que Ruben Santiago Ward no es simplemente el presidente de ATX. Es director de 11 empresas: ATX, 5 On Line (5OL), Exi Group, Lugalu, Doru Inversiones, Neutronica, PW Producciones, Impakto, Wazzup, Unicall y WC.',
        'Diego Paez (DNI 92.297.127) aparece como directivo en 5 de las empresas de Ward: ATX, Impakto, PW Producciones, Neutronica y Lugalu. Juan Ignacio Ward (DNI 44.096.749) - hijo de Ruben - es directivo en Exi y Wazzup.',
        'Exi Group y 5OL son empresas de cobro de deudas con miles de denuncias de consumidores por hostigamiento telefonico, reclamo de deudas prescriptas y colocacion fraudulenta de personas en Situacion 5 del BCRA. [1]',
        'ATX ya tenia 9 contratos gubernamentales previos (desde 2015) con RENAPER y el Ministerio de Educacion, por un total de al menos $244 millones de pesos. No es una empresa nueva - es un contratista serial del Estado. Este dato no fue reportado por ningun medio - fue descubierto mediante cruce por CUIT con la base de datos de contratistas existente.',
        'Hallazgo exclusivo de esta investigacion: la amplitud de la red de Ward (11 empresas), la superposicion de directivos (Diego Paez en 5, Paez Canosa en 4, Juan Ignacio Ward en 2), y la existencia de contratos previos de ATX y Lugalu en la base de datos de obras publicas no habian sido reportados por ningun medio ni incluidos en las denuncias penales existentes.',
      ],
      en: [
        'Querying the IGJ database reveals that Ruben Santiago Ward is not simply ATX\'s president. He is a director of 11 companies: ATX, 5 On Line (5OL), Exi Group, Lugalu, Doru Inversiones, Neutronica, PW Producciones, Impakto, Wazzup, Unicall, and WC.',
        'Diego Paez (DNI 92,297,127) appears as director at 5 Ward companies: ATX, Impakto, PW Producciones, Neutronica, and Lugalu. Juan Ignacio Ward (DNI 44,096,749) - Ruben\'s son - is a director at Exi and Wazzup.',
        'Exi Group and 5OL are debt collection companies with thousands of consumer complaints for telephone harassment, claiming prescribed debts, and fraudulently placing people in BCRA Situation 5. [1]',
        'ATX already had 9 prior government contracts (since 2015) with RENAPER and the Ministry of Education, totaling at least $244 million pesos. This is not a new company - it is a serial government contractor. This fact was not reported by any media outlet - it was discovered by cross-referencing ATX\'s CUIT against the existing contractor database.',
        'Exclusive finding: the breadth of Ward\'s network (11 companies), the officer overlap (Diego Paez at 5, Paez Canosa at 4, Juan Ignacio Ward at 2), and the existence of prior ATX and Lugalu contracts in the public works database had not been reported by any media outlet or included in existing criminal complaints.',
      ],
    },
    citations: [
      { id: 1, text: 'C5N - Exi Group: el entramado detras de las estafas millonarias', url: 'https://www.c5n.com/sociedad/exi-group-el-entramado-detras-las-estafas-millonarias-n128662' },
    ],
  },
  {
    id: 'la-triangulacion',
    title: { es: 'IV. La Triangulacion', en: 'IV. The Triangulation' },
    paragraphs: {
      es: [
        'Bettina Julieta Angeletti (CUIT 27-29865407-0), esposa de Adorni, fundo la consultora +Be en julio de 2024. No es una entidad juridica separada - opera bajo su CUIT personal como monotributista.',
        '+Be cobro $6.370.000 de pesos a National Shipping S.A. por "capacitacion de ejecutivos." National Shipping es contratista de YPF desde hace 28 anos, con contratos anuales de aproximadamente USD $140 millones. Manuel Adorni es miembro del directorio de YPF como representante del Estado. [1]',
        'Segun la denuncia de la diputada Pagano y registros publicos, el presunto mecanismo de triangulacion operaria de la siguiente manera: entidades estatales (ARCA, AySA, Banco Nacion, Aerolineas Argentinas) contratan a Datco Group (CUIT 30-59611620-1). Datco habria subcontratado a +Be. De confirmarse, los fondos fluirian indirectamente del Estado a la familia del Jefe de Gabinete. [2]',
        'Datco tiene 5 contratos gubernamentales y 6 licitaciones en la base de datos existente, incluyendo un contrato de $11.4 millones con la Jefatura de Gabinete de Ministros - la misma dependencia que ahora dirige Adorni.',
      ],
      en: [
        'Bettina Julieta Angeletti (CUIT 27-29865407-0), Adorni\'s wife, founded +Be consulting in July 2024. It is not a separate legal entity - it operates under her personal CUIT as a sole proprietorship.',
        '+Be charged $6,370,000 pesos to National Shipping S.A. for "executive training." National Shipping has been a YPF contractor for 28 years, with annual contracts of approximately USD $140 million. Manuel Adorni is a YPF board member as state representative. [1]',
        'According to Deputy Pagano\'s complaint and public records, the alleged triangulation mechanism would work as follows: state entities (ARCA, AySA, Banco Nacion, Aerolineas Argentinas) contract Datco Group (CUIT 30-59611620-1). Datco allegedly subcontracts +Be. If confirmed, funds would flow indirectly from the State to the Chief of Cabinet\'s family. [2]',
        'Datco holds 5 government contracts and 6 bids in the existing database, including an $11.4 million contract with the Chief of Cabinet\'s Office - the same agency Adorni now runs.',
      ],
    },
    citations: [
      { id: 1, text: 'iProfesional - Bettina Angeletti bajo la lupa', url: 'https://www.iprofesional.com/politica/450390-bettina-angeletti-bajo-lupa-contratos-millonarios-impacta-gobierno' },
      { id: 2, text: 'La Politica Online - YPF y ARCA contrataron a esposa de Adorni', url: 'https://www.lapoliticaonline.com/politica/denuncian-que-ypf-y-arca-contrataron-a-la-esposa-de-adorni/' },
    ],
  },
  {
    id: 'tecnopolis',
    title: { es: 'V. El Nodo Tecnopolis', en: 'V. The Tecnopolis Node' },
    paragraphs: {
      es: [
        'La concesion de Tecnopolis es un contrato de 25 anos valorado en $183.300 millones de pesos ($611 millones mensuales). La AABE (Agencia de Administracion de Bienes del Estado) supervisa la licitacion - y la AABE reporta al Jefe de Gabinete, es decir, a Adorni.',
        'Entre los licitantes pre-seleccionados esta DirecTV Argentina, asociada con Grupo Foggia (CUIT 30-71448507-1). La IGJ confirma que Mara Natalia Gorini (DNI 24.128.338) es directiva de Grupo Foggia. Gorini es simultaneamente asesora de Karina Milei, Secretaria General de la Presidencia. [1]',
        'Grupo Foggia es ademas cliente de +Be, la consultora de Angeletti. Los registros publicos muestran las siguientes conexiones: Adorni preside AABE, que supervisa la concesion; uno de los licitantes (Foggia) es cliente de la consultora de la esposa de Adorni; y Foggia esta vinculado a Karina Milei a traves de Gorini. Esta configuracion plantea interrogantes sobre posibles conflictos de interes.',
      ],
      en: [
        'The Tecnopolis concession is a 25-year contract valued at $183.3 billion pesos ($611 million monthly). AABE (State Asset Administration Agency) oversees the tender - and AABE reports to the Chief of Cabinet, i.e., Adorni.',
        'Among pre-selected bidders is DirecTV Argentina, associated with Grupo Foggia (CUIT 30-71448507-1). IGJ confirms Mara Natalia Gorini (DNI 24,128,338) is a Grupo Foggia director. Gorini simultaneously serves as advisor to Karina Milei, Secretary General of the Presidency. [1]',
        'Grupo Foggia is also a client of +Be, Angeletti\'s consulting firm. Public records show the following connections: Adorni heads AABE, which oversees the concession; one bidder (Foggia) is a client of Adorni\'s wife\'s consulting firm; and Foggia is linked to Karina Milei through Gorini. This configuration raises questions about potential conflicts of interest.',
      ],
    },
    citations: [
      { id: 1, text: 'Perfil - Denuncian irregularidades en Tecnopolis', url: 'https://www.perfil.com/noticias/politica/denuncian-a-manuel-adorni-por-presuntas-irregularidades-en-contrataciones-y-la-concesion-de-tecnopolis.phtml' },
    ],
  },
  {
    id: 'los-vuelos',
    title: { es: 'VI. Los Vuelos', en: 'VI. The Flights' },
    paragraphs: {
      es: [
        'En febrero de 2026, durante el feriado de Carnaval, Adorni viajo con su familia en un jet privado Honda Jet (matricula LVHWA83, operado por Alphacentauri S.A.) a Punta del Este. El vuelo de ida costo $6.984.180 pesos. Fue pagado por Imhouse S.A. - la productora de Marcelo Grandio, amigo personal de Adorni. [1]',
        'Grandio conducia "Giros en linea recta" en TV Publica, que habia quedado bajo la orbita de Adorni tres meses antes de que Imhouse consiguiera su primer contrato con el canal estatal. El juez federal Ariel Lijo ordeno el levantamiento del secreto fiscal y bancario de Imhouse S.A. [2]',
        'En marzo de 2026, Angeletti viajo en el avion presidencial ARG-01 (costo operativo ida y vuelta estimado en USD $242.000-$308.000) a Nueva York durante la Argentina Week. La delegacion se alojo en The Langham, Fifth Avenue ($540-$1.563/noche). Adorni lo justifico diciendo "vengo una semana a deslomarme a Nueva York, queria que me acompane" - luego admitio que la expresion fue "desafortunada." Dijo que ella habia comprado un pasaje comercial de mas de USD $5.000 pero fue "invitada" por el presidente Milei. No pudo explicar quien pago su hotel ni sus gastos de viaje, ni especificar que "actividades paralelas" tenia en Nueva York. [3]',
        'La contradiccion esta documentada: en agosto de 2024, el propio Adorni anuncio el Decreto 712/2024 prohibiendo el uso de aviones estatales para familiares. Sus palabras textuales en ese momento: "Cuando utilizas para beneficio personal cuestiones del Estado, estas abusando de tu posicion de poder." [4]',
      ],
      en: [
        'In February 2026, during the Carnival holiday, Adorni traveled with his family on a private Honda Jet (registration LVHWA83, operated by Alphacentauri S.A.) to Punta del Este. The outbound flight cost $6,984,180 pesos. It was paid by Imhouse S.A. - the production company of Marcelo Grandio, Adorni\'s personal friend. [1]',
        'Grandio hosted "Giros en linea recta" on TV Publica, which had come under Adorni\'s oversight three months before Imhouse secured its first contract with the state channel. Federal judge Ariel Lijo ordered the lifting of fiscal and banking secrecy for Imhouse S.A. [2]',
        'In March 2026, Angeletti traveled on presidential aircraft ARG-01 (round-trip operating cost estimated at USD $242,000-$308,000) to New York during Argentina Week. The delegation stayed at The Langham, Fifth Avenue ($540-$1,563/night). Adorni justified it saying "I come to break my back for a week in New York, I wanted her to come with me" - later admitting the phrasing was "unfortunate." He claimed she had bought a commercial ticket for over USD $5,000 but was "invited" by President Milei himself. He could not explain who paid for her hotel or travel expenses, nor what "parallel activities" she had in New York. [3]',
        'The contradiction is documented: in August 2024, Adorni himself announced Decreto 712/2024 prohibiting state aircraft use for family members. His exact words at the time: "When you use State resources for personal benefit, you are abusing your position of power." [4]',
      ],
    },
    citations: [
      { id: 1, text: 'La Nacion - Detalles del vuelo privado', url: 'https://www.lanacion.com.ar/politica/revelan-los-detalles-del-vuelo-privado-que-tomo-manuel-adorni-con-su-familia-en-el-feriado-de-nid11032026/' },
      { id: 2, text: 'Canal 26 - Lijo ordena abrir cuentas de Imhouse', url: 'https://www.canal26.com/politica/2026/03/21/investigacion-a-manuel-adorni-el-juez-federal-ariel-lijo-ordeno-abrir-las-cuentas-de-la-empresa-que-pago-su-viaje/' },
      { id: 3, text: 'elDiarioAR - Adorni dijo que su esposa viajo "invitada" por Milei', url: 'https://www.eldiarioar.com/politica/escandalo-avion-presidencial-adorni-dijo-esposa-viajo-invitada-javier-milei_1_13068858.html' },
      { id: 4, text: 'Chequeado - Decreto 712/2024 vs viaje con esposa: que dice la Ley de Etica Publica', url: 'https://chequeado.com/el-explicador/del-no-se-usara-para-familiares-al-viaje-con-su-esposa-la-polemica-por-el-uso-del-avion-presidencial-de-adorni-y-que-dice-la-ley-de-etica-publica/' },
    ],
  },
  {
    id: 'el-patrimonio',
    title: { es: 'VII. El Patrimonio', en: 'VII. The Patrimony' },
    paragraphs: {
      es: [
        'La declaracion jurada patrimonial de Adorni, presentada fuera de termino el 7 de noviembre de 2024, muestra un patrimonio de $107.9 millones de pesos con deudas de $95.4 millones. Su patrimonio anterior era de $11.6 millones - un aumento de aproximadamente 500% en terminos nominales, aunque la inflacion del 211% en 2023 explica parte del crecimiento. [1]',
        'Declaro USD $42.500 en efectivo, justificados como prestamos de su madre Silvia Pais y una jubilada de 95 anos llamada Norma Zuccolo. El origen de estos fondos es materia de la investigacion judicial en curso (CFP 1003/2026).',
        'Su esposa Angeletti compro una casa de dos pisos en el Country Club Indio Cua Golf Club (Unidad Funcional 380, Exaltacion de la Cruz) el 15 de noviembre de 2024. Esta propiedad no fue declarada. Tambien se detecto un departamento en Caballito no declarado. [2]',
        'Su sueldo como Jefe de Gabinete era de $3.584.006 brutos mensuales (pre-aumento). Los gastos familiares en tarjeta de credito ascienden a $17-20 millones mensuales, llegando a $30 millones en algunos bimestres. [3]',
      ],
      en: [
        'Adorni\'s sworn asset declaration, filed late on November 7, 2024, shows assets of $107.9 million pesos with $95.4 million in debts. His previous patrimony was $11.6 million - an increase of approximately 500% in nominal terms, though 211% inflation in 2023 explains part of the growth. [1]',
        'He declared USD $42,500 in cash, justified as loans from his mother Silvia Pais and a 95-year-old retiree named Norma Zuccolo. The origin of these funds is a matter of the ongoing judicial investigation (CFP 1003/2026).',
        'His wife Angeletti purchased a two-story house at Indio Cua Golf Club (Functional Unit 380, Exaltacion de la Cruz) on November 15, 2024. This property was not declared. An undeclared apartment in Caballito was also detected. [2]',
        'His salary as Chief of Cabinet was $3,584,006 gross monthly (pre-increase). Family credit card spending amounts to $17-20 million monthly, reaching $30 million in some two-month periods. [3]',
      ],
    },
    citations: [
      { id: 1, text: 'Chequeado - Bienes declarados por Adorni', url: 'https://chequeado.com/el-explicador/polemica-por-los-viajes-de-manuel-adorni-que-bienes-declaro-el-jefe-de-gabinete/' },
      { id: 2, text: 'Perfil - Casa en country Indio Cua', url: 'https://www.perfil.com/noticias/judiciales/manuel-adorni-suma-otra-polemica-ahora-le-adjudican-una-casa-en-un-country-de-exaltacion-de-la-cruz.phtml' },
      { id: 3, text: 'MinutoUno - Gastos vs sueldo', url: 'https://www.minutouno.com/politica/no-cierra-manuel-adorni-cobra-3500000-y-su-familia-tiene-gastos-17000000-solo-tarjetas-credito-n6255724' },
    ],
  },
  {
    id: 'el-hilo-libra',
    title: { es: 'VIII. El Hilo LIBRA', en: 'VIII. The LIBRA Thread' },
    paragraphs: {
      es: [
        'El 19 de octubre de 2024, Adorni asistio a una reunion en el Hotel Libertador entre el presidente Milei, su hermana Karina Milei, el trader cripto Mauricio Novelli y Julian Peh, CEO de KIP Protocol (Singapur). Esta reunion es considerada un evento clave previo al lanzamiento del token $LIBRA que Milei luego promociono en redes sociales, causando perdidas de USD $251 millones a inversores. [1]',
        'El analisis forense del telefono de Novelli revelo flyers listando a Adorni como orador confirmado del "Tech Forum 2" - un evento cripto planificado para abril de 2025 que fue cancelado tras el estallido del escandalo LIBRA. Adorni nego la propuesta cuando fue consultado. [2]',
        'El FBI y el Departamento de Justicia de Estados Unidos abrieron una investigacion. El DHS monitorea posible lavado de dinero. Un juez argentino congelo activos vinculados al principal sospechoso, Hayden Davis, en una causa de USD $100 millones.',
        'Esta investigacion conecto a Adorni con caso-libra mediante 4 relaciones SAME_ENTITY: Karina Milei, Santiago Caputo, Julian Peh y Mauricio Novelli aparecen en ambas investigaciones.',
      ],
      en: [
        'On October 19, 2024, Adorni attended a meeting at the Hotel Libertador between President Milei, his sister Karina Milei, crypto trader Mauricio Novelli, and Julian Peh, CEO of KIP Protocol (Singapore). This meeting is considered a key event prior to the $LIBRA token launch that Milei later promoted on social media, causing USD $251 million in investor losses. [1]',
        'Forensic analysis of Novelli\'s phone revealed flyers listing Adorni as a confirmed speaker at "Tech Forum 2" - a crypto event planned for April 2025 that was cancelled after the LIBRA scandal broke. Adorni denied the proposal when asked. [2]',
        'The FBI and US Department of Justice opened an investigation. DHS is monitoring potential money laundering. An Argentine judge froze assets linked to the primary suspect, Hayden Davis, in a USD $100 million case.',
        'This investigation connected Adorni to caso-libra through 4 SAME_ENTITY relationships: Karina Milei, Santiago Caputo, Julian Peh, and Mauricio Novelli appear in both investigations.',
      ],
    },
    citations: [
      { id: 1, text: 'Perfil - Adorni tambien es parte del caso Libra', url: 'https://noticias.perfil.com/noticias/politica/lo-que-le-faltaba-a-adorni-despues-de-nueva-york-tambien-es-parte-del-caso-libra.phtml' },
      { id: 2, text: 'DataClave - Tech Forum 2 planificado por Novelli', url: 'https://www.dataclave.com.ar/poder/escandalo-cripto--tech-forum-2--el-evento-que-planificaba-novelli-pero-se-frustro-por--libra_a69befe9f2e65bf0bc8f518f0' },
    ],
  },
  {
    id: 'las-declaraciones',
    title: { es: 'IX. Las Declaraciones', en: 'IX. The Statements' },
    paragraphs: {
      es: [
        'Esta investigacion catalogo 17 declaraciones publicas disputadas de Adorni entre febrero de 2024 y marzo de 2026, incluyendo la contradiccion entre el Decreto 712/2024 y el viaje de su esposa en el avion presidencial.',
        '"No existe la posibilidad de que haya hambre en la Argentina" (febrero 2024) - contradecido por datos de la UCA sobre inseguridad alimentaria. "Las universidades no son auditadas" (abril 2024) - la AGN y la SIGEN las auditan. "La pobreza esta bajando" (mayo 2024) - el INDEC mostro 52.9% de pobreza. "Los jubilados nunca perdieron poder adquisitivo" (marzo 2025) - la minima cayo 5.8% en terminos reales. [1]',
        'La Embajada de China corrigio publicamente a Adorni por afirmar falsamente que 30 camiones habian llegado de China para combatir el COVID. El Ministerio de Defensa argentino conocia el proposito real de los vehiculos. [2]',
        'El 25 de marzo de 2026, Adorni dio una conferencia de prensa de 19 minutos de presentacion y 30 minutos de preguntas. Dijo "no tengo nada que esconder" y "con mi dinero hago lo que quiero." Se fue sin responder sobre las propiedades no declaradas.',
      ],
      en: [
        'This investigation catalogued 17 disputed public statements by Adorni between February 2024 and March 2026, including the contradiction between Decree 712/2024 and his wife's travel on the presidential aircraft.',
        '"There is no possibility of hunger in Argentina" (February 2024) - contradicted by UCA food insecurity data. "Universities are not audited" (April 2024) - AGN and SIGEN audit them. "Poverty is falling" (May 2024) - INDEC showed 52.9% poverty. "Retirees never lost purchasing power" (March 2025) - minimum pensions fell 5.8% in real terms. [1]',
        'The Chinese Embassy publicly corrected Adorni for falsely claiming 30 trucks had arrived from China to fight COVID. Argentina\'s own Defense Ministry knew the vehicles\' actual purpose. [2]',
        'On March 25, 2026, Adorni held a press conference with 19 minutes of presentation and 30 minutes of questions. He said "I have nothing to hide" and "I do whatever I want with my money." He left without answering about undeclared properties.',
      ],
    },
    citations: [
      { id: 1, text: 'Chequeado - Verificaciones de Adorni', url: 'https://chequeado.com/personajes/quien-es-manuel-adorni/' },
      { id: 2, text: 'Infocielo - Embajada China confronta a Adorni', url: 'https://infocielo.com/politica-y-economia/la-embajada-china-confronta-declaraciones-falsas-adorni-n782908' },
    ],
  },
  {
    id: 'las-productoras',
    title: { es: 'X. Las Dos Productoras', en: 'X. The Two Producers' },
    paragraphs: {
      es: [
        'El registro publico de ENACOM revela un dato que no habia sido reportado: las unicas dos empresas del entorno de Adorni registradas como productoras audiovisuales son Imhouse S.A. (codigo PR0ACC15A0000, inscripta febrero 2018) y Foggia Group S.A. (codigo PR0ACB60A0000, inscripta abril 2018). Ambas registradas como "Independientes" con dos meses de diferencia. Ninguna otra empresa de la red (Cabosch, ATX, PW Producciones, Wazzup, Alphacentauri) tiene registro ENACOM. [1]',
        'Imhouse produce contenido para TV Publica (bajo control de Adorni) y pago el vuelo privado de Adorni. Foggia es licitante de Tecnopolis (bajo control de Adorni via AABE) y cliente de la consultora de la esposa de Adorni. Las dos unicas productoras registradas de la red son las dos que tienen negocios directos con areas que Adorni controla.',
        'Hallazgo exclusivo de esta investigacion: el registro ENACOM vincula a ambas empresas en el mismo sector regulado (produccion audiovisual), ampliando el presunto conflicto de interes mas alla de las licitaciones individuales.',
      ],
      en: [
        'The ENACOM public registry reveals a previously unreported finding: the only two companies in Adorni\'s network registered as audiovisual producers are Imhouse S.A. (code PR0ACC15A0000, registered February 2018) and Foggia Group S.A. (code PR0ACB60A0000, registered April 2018). Both registered as "Independent" two months apart. No other network company (Cabosch, ATX, PW Producciones, Wazzup, Alphacentauri) has ENACOM registration. [1]',
        'Imhouse produces content for TV Publica (under Adorni\'s control) and paid for Adorni\'s private flight. Foggia is a Tecnopolis bidder (under Adorni\'s control via AABE) and a client of Adorni\'s wife\'s consulting firm. The only two registered producers in the network are the two that have direct business with areas Adorni controls.',
        'Exclusive finding: the ENACOM registry links both companies in the same regulated sector (audiovisual production), expanding the alleged conflict of interest beyond individual tenders.',
      ],
    },
    citations: [
      { id: 1, text: 'ENACOM - Registro Publico de Senales y Productoras', url: 'https://registros-sca.enacom.gob.ar/productoras/' },
    ],
  },
  {
    id: 'las-direcciones',
    title: { es: 'XI. Las Direcciones', en: 'XI. The Addresses' },
    paragraphs: {
      es: [
        'El cruce del Registro Nacional de Sociedades (951.000 empresas, datos abiertos del Ministerio de Justicia) con la base de datos IGJ revela agrupamientos de direcciones que refuerzan la estructura de red:',
        'San Martin 551, CABA: ATX S.A. + Lugalu S.A. + Impakto S.A. - tres empresas de Ward comparten domicilio fiscal. Pedro Chutro 3135, CABA: Area Tech S.A. + Neutronica S.A. - la empresa "competidora" eliminada de la licitacion SMS comparte direccion con otra empresa de Ward donde Paez Canosa tambien es directivo. Esmeralda 288, CABA: Alphacentauri S.A. + Omega Centauri S.A. - la empresa propietaria del Honda Jet comparte direccion con una sociedad creada en septiembre 2025 (un mes antes de que Adorni asumiera como Jefe de Gabinete), con Augusto Bunge como unico directivo en ambas.',
        'La existencia de estos agrupamientos no implica conducta ilicita por si misma - muchas empresas comparten domicilios fiscales. Pero en el contexto de una licitacion donde las tres oferentes comparten directivos, socios y direcciones, los agrupamientos constituyen evidencia circunstancial relevante para la investigacion judicial en curso.',
      ],
      en: [
        'Cross-referencing the National Registry of Companies (951,000 companies, Justice Ministry open data) with the IGJ database reveals address clusters that reinforce the network structure:',
        'San Martin 551, CABA: ATX S.A. + Lugalu S.A. + Impakto S.A. - three Ward companies share a fiscal address. Pedro Chutro 3135, CABA: Area Tech S.A. + Neutronica S.A. - the "competing" company eliminated from the SMS tender shares an address with another Ward company where Paez Canosa is also a director. Esmeralda 288, CABA: Alphacentauri S.A. + Omega Centauri S.A. - the Honda Jet owner company shares an address with a company created in September 2025 (one month before Adorni became Chief of Cabinet), with Augusto Bunge as the sole director of both.',
        'The existence of these clusters does not by itself imply unlawful conduct - many companies share fiscal addresses. But in the context of a tender where all three bidders share directors, partners, and addresses, the clusters constitute circumstantial evidence relevant to the ongoing judicial investigation.',
      ],
    },
    citations: [
      { id: 1, text: 'Registro Nacional de Sociedades - Datos Abiertos', url: 'https://datos.jus.gob.ar/dataset/registro-nacional-de-sociedades' },
    ],
  },
  {
    id: 'el-mapa',
    title: { es: 'XII. El Mapa', en: 'XII. The Map' },
    paragraphs: {
      es: [
        'Al cierre de esta investigacion, el grafo contiene 102 nodos y 133 relaciones. 37 personas, 38 organizaciones, 17 declaraciones disputadas, 5 flujos de dinero y 6 causas judiciales (CFP 1003/2026 ante Lijo, causa Rafecas por avion presidencial, investigacion Lijo por vuelo privado, denuncia ATX/Tecnopolis, ANDIS CFP 3402/2025, y LIBRA CFP 574/2025 con FBI/DOJ). 11 relaciones SAME_ENTITY cruzan con otras investigaciones: caso-libra (Karina Milei, Santiago Caputo, Julian Peh, Mauricio Novelli) y obras-publicas (ATX, Datco, Foggia, Movilgate, Lugalu).',
        'Se verificaron 20 CUITs de personas y organizaciones. Se consultaron 14 fuentes de datos publicos incluyendo IGJ (951K directivos), Registro Nacional de Sociedades (951K empresas), ICIJ Offshore Leaks, ENACOM, ANAC, AFIP, FinCEN Files, OpenSanctions, y las bases de datos de contratistas, donantes y declaraciones juradas existentes. Todas las verificaciones ICIJ y de sanciones estadounidenses resultaron negativas.',
        'Preguntas pendientes que solo la justicia puede responder: (1) Si los registros bancarios de Imhouse muestran pagos a Adorni, lo que probaria una participacion societaria oculta. (2) Quien compro el paquete de 10 vuelos facturado a Agustin Issin Hansen en Uruguay. (3) Los montos de los contratos de +Be canalizados a traves de Datco. (4) El proposito de Omega Centauri S.A., creada en septiembre 2025 en la misma direccion y con el mismo directivo que la empresa propietaria del jet.',
        'Esta investigacion fue construida mediante inteligencia artificial asistida con verificacion humana. Cada hallazgo fue verificado contra fuentes primarias. Donde se encontraron errores en el analisis automatizado, fueron corregidos y documentados. La IA no acusa: revela patrones. Las conclusiones son del lector.',
      ],
      en: [
        'At the close of this investigation, the graph contains 102 nodes and 133 relationships. 37 persons, 38 organizations, 17 disputed statements, 5 money flows, and 6 legal cases (CFP 1003/2026 before Lijo, Rafecas presidential aircraft case, Lijo private flight investigation, ATX/Tecnopolis complaint, ANDIS CFP 3402/2025, and LIBRA CFP 574/2025 with FBI/DOJ). 11 SAME_ENTITY relationships cross-reference with other investigations: caso-libra (Karina Milei, Santiago Caputo, Julian Peh, Mauricio Novelli) and obras-publicas (ATX, Datco, Foggia, Movilgate, Lugalu).',
        'Twenty CUITs for persons and organizations were verified. Fourteen public data sources were queried including IGJ (951K officers), National Registry of Companies (951K companies), ICIJ Offshore Leaks, ENACOM, ANAC, AFIP, FinCEN Files, OpenSanctions, and existing contractor, donor, and asset declaration databases. All ICIJ and US sanctions checks came back negative.',
        'Pending questions that only the judiciary can answer: (1) Whether Imhouse bank records show payments to Adorni, which would prove a hidden partnership. (2) Who purchased the 10-flight package billed to Agustin Issin Hansen in Uruguay. (3) The amounts of +Be contracts channeled through Datco. (4) The purpose of Omega Centauri S.A., created September 2025 at the same address and with the same director as the jet owner company.',
        'This investigation was built through AI-assisted intelligence with human verification. Every finding was verified against primary sources. Where errors were found in automated analysis, they were corrected and documented. The AI does not accuse: it reveals patterns. The conclusions are the reader\'s.',
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Citation rendering helper
// ---------------------------------------------------------------------------

/** Parse [N] markers in text and render them as superscript citation links */
function renderWithCitations(text: string, citations?: readonly Citation[]) {
  if (!citations || citations.length === 0) return text

  const citationMap = new Map(citations.map((c) => [c.id, c]))
  const parts = text.split(/(\[\d+\])/)

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (!match) return part

    const id = parseInt(match[1], 10)
    const citation = citationMap.get(id)
    if (!citation) return part

    if (citation.url) {
      return (
        <a
          key={i}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={citation.text}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400 no-underline hover:bg-blue-500/30 hover:text-blue-300"
        >
          {id}
        </a>
      )
    }

    return (
      <span
        key={i}
        title={citation.text}
        className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-700/50 text-[10px] font-bold text-zinc-400"
      >
        {id}
      </span>
    )
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-prose pb-20">
      {/* Header */}
      <header className="py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {TITLE[lang]}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">{SUBTITLE[lang]}</p>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-zinc-500">
          <span>{READING_TIME[lang]}</span>
          <span className="text-zinc-700">|</span>
          <span>{LAST_UPDATED[lang]}</span>
        </div>
      </header>

      {/* Legal disclaimer - must appear BEFORE narrative content */}
      <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-950/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-amber-200/70">
          {lang === 'es'
            ? 'Todas las personas mencionadas gozan de la presuncion de inocencia. Los hechos descritos se basan en fuentes publicas, registros gubernamentales y denuncias judiciales. Ninguna conclusion de culpabilidad ha sido establecida por tribunal alguno. Las conexiones descritas son hallazgos de registros publicos y no implican necesariamente conducta ilicita.'
            : 'All persons mentioned enjoy the presumption of innocence. The facts described are based on public sources, government records, and judicial complaints. No finding of guilt has been established by any court. The connections described are findings from public records and do not necessarily imply unlawful conduct.'}
        </p>
      </div>

      <hr className="border-zinc-800" />

      {/* Chapters - placeholder until Wave 13 populates them */}
      {chapters.length === 0 ? (
        <section className="py-16 text-center">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
            <p className="text-sm text-zinc-400">
              {lang === 'es'
                ? 'Los capitulos se publicaran a medida que avance la investigacion.'
                : 'Chapters will be populated as the investigation progresses.'}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              {lang === 'es'
                ? '13 olas de investigacion planificadas'
                : '13 investigation waves planned'}
            </p>
          </div>
        </section>
      ) : (
        chapters.map((chapter) => (
          <section key={chapter.id} id={chapter.id} className="py-12">
            <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
              {chapter.title[lang]}
            </h2>

            <div className="mt-6 space-y-4">
              {chapter.paragraphs[lang].map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-zinc-300">
                  {renderWithCitations(p, chapter.citations)}
                </p>
              ))}
            </div>

            {chapter.pullQuote && (
              <blockquote className="my-6 border-l-2 border-blue-400 pl-4 text-lg italic text-zinc-200">
                {chapter.pullQuote[lang]}
              </blockquote>
            )}

            {/* Chapter citations footnotes */}
            {chapter.citations && chapter.citations.length > 0 && (
              <div className="mt-4 rounded border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
                <ul className="space-y-1">
                  {chapter.citations.map((c) => (
                    <li key={c.id} className="text-xs text-zinc-500">
                      <span className="mr-1.5 font-bold text-zinc-400">[{c.id}]</span>
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400/70 underline decoration-blue-400/20 hover:text-blue-300"
                        >
                          {c.text}
                        </a>
                      ) : (
                        c.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <hr className="mt-12 border-zinc-800/60" />
          </section>
        ))
      )}

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Esta investigacion se basa en fuentes publicas verificadas. La inclusion no implica culpabilidad. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente.'
            : 'This investigation is based on verified public sources. Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}
        </p>
      </section>

      {/* Closing */}
      <div className="mt-8 text-center">
        <p className="text-sm italic text-zinc-500">
          {lang === 'es'
            ? 'La investigacion continua. Las preguntas permanecen.'
            : 'The investigation continues. The questions remain.'}
        </p>
      </div>
    </article>
  )
}
