'use client'

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
  readonly citations?: readonly Citation[]
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  es: 'Caso Adorni',
  en: 'The Adorni Case',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'Licitaciones, patrimonio, vuelos y cruces de datos. 102 entidades, 133 relaciones, 14 fuentes publicas.',
  en: 'Tenders, patrimony, flights, and data cross-references. 102 entities, 133 relationships, 14 public sources.',
}

const READING_TIME: Record<Lang, string> = {
  es: '~15 min de lectura',
  en: '~15 min read',
}

const LAST_UPDATED: Record<Lang, string> = {
  es: 'Actualizado: marzo 2026',
  en: 'Updated: March 2026',
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = [
  {
    id: 'el-funcionario',
    title: { es: 'I. El Funcionario', en: 'I. The Official' },
    paragraphs: {
      es: [
        'Decreto 86/2023: Manuel Adorni designado Vocero Presidencial. Decreto 834/2024: ascendido a Secretario de Comunicacion y Medios, con control sobre la pauta oficial y los medios estatales. Decreto 784/2025: Jefe de Gabinete de Ministros. [1]',
        'CUIT 20-28052206-7. Actividades registradas en AFIP: servicios personales (2013), asesoria empresarial (2020), contabilidad (2020). Sociedad al 50% con su esposa Bettina Julieta Angeletti en AS Innovacion Profesional S.R.L. (Boletin Oficial, febrero 2020). [2]',
        'Tres anos: de panelista de television a controlar la pauta oficial, los medios estatales y la Jefatura de Gabinete. Su esposa mantuvo actividad comercial con contratistas del Estado durante todo ese recorrido.',
      ],
      en: [
        'Decree 86/2023: Manuel Adorni designated Presidential Spokesperson. Decree 834/2024: promoted to Secretary of Communication and Media, with control over official advertising and state media. Decree 784/2025: Chief of Cabinet. [1]',
        'CUIT 20-28052206-7. AFIP-registered activities: personal services (2013), business advisory (2020), accounting (2020). 50/50 partnership with wife Bettina Julieta Angeletti in AS Innovacion Profesional S.R.L. (Boletin Oficial, February 2020). [2]',
        'Three years: from television panelist to controlling official advertising, state media, and the Chief of Cabinet office. His wife maintained commercial activity with state contractors throughout.',
      ],
    },
    citations: [
      { id: 1, text: 'Chequeado - perfil Manuel Adorni', url: 'https://chequeado.com/personajes/quien-es-manuel-adorni/' },
      { id: 2, text: 'Boletin Oficial - AS Innovacion Profesional S.R.L.', url: 'https://www.boletinoficial.gob.ar/pdf/linkQR/elgyazJaYndib2QreFpJZ1U0d1UwZz09' },
    ],
  },
  {
    id: 'la-licitacion',
    title: { es: 'II. La Licitacion', en: 'II. The Tender' },
    paragraphs: {
      es: [
        '14 de mayo de 2025: Adorni lanzo la licitacion de mensajeria masiva (36M SMS, 600M emails, 12M llamadas). 30 de diciembre de 2025: firmo la adjudicacion a ATX S.A. por $3.650.226.300. [1]',
        'Tres oferentes: ATX S.A., Area Tech S.A. y Movilgate S.R.L. Los registros de la IGJ muestran que las tres comparten directivos y direcciones. [2]',
        'Ruben Santiago Ward (DNI 24.676.344), presidente de ATX, y Pablo Javier Casal, presidente de Area Tech, fueron socios en Lugalu S.A. Ambas empresas comparten domicilio fiscal: San Martin 551, CABA. Area Tech no presento garantia de oferta y fue eliminada. [2]',
        'Rodrigo Paez Canosa (DNI 25.896.026) es director suplente de ATX, ex-empleado de Area Tech y ex-empleado de Movilgate. La IGJ lo registra ademas como directivo de Lugalu y Neutronica, ambas de Ward. [3]',
        'ATX cobro $0,045 por SMS en un contrato y $0,076 en otro: 69% de diferencia por servicio identico. [1]',
        'Un solo individuo aparece como directivo o empleado de las tres empresas que compitieron por una licitacion de $3.650 millones. La licitacion fue lanzada y adjudicada por la misma persona: Manuel Adorni.',
        'Nota de atribucion: la conexion Adorni-ATX-Ward y el vinculo Casal-Lugalu fueron reportados por el diputado Tailhade y cubiertos por Sumario, Canal de las Noticias y DataClave. Esta investigacion aporta la confirmacion IGJ por DNI de que Paez Canosa es director registrado en ATX, Lugalu y Neutronica simultaneamente, y que la red de Ward abarca 11 empresas.',
      ],
      en: [
        'May 14, 2025: Adorni launched the mass messaging tender (36M SMS, 600M emails, 12M calls). December 30, 2025: signed the award to ATX S.A. for $3,650,226,300. [1]',
        'Three bidders: ATX S.A., Area Tech S.A., and Movilgate S.R.L. IGJ records show all three share directors and addresses. [2]',
        'Ruben Santiago Ward (DNI 24,676,344), ATX president, and Pablo Javier Casal, Area Tech president, were partners in Lugalu S.A. Both companies share fiscal address: San Martin 551, CABA. Area Tech did not present a bid guarantee and was eliminated. [2]',
        'Rodrigo Paez Canosa (DNI 25,896,026) is ATX substitute director, former Area Tech employee, and former Movilgate employee. IGJ also records him as director at Lugalu and Neutronica, both Ward companies. [3]',
        'ATX charged $0.045 per SMS in one contract and $0.076 in another: 69% difference for identical service. [1]',
        'A single individual appears as director or employee at all three companies that competed for a $3.65 billion tender. The tender was launched and awarded by the same person: Manuel Adorni.',
        'Attribution note: the Adorni-ATX-Ward connection and the Casal-Lugalu link were reported by Deputy Tailhade and covered by Sumario, Canal de las Noticias, and DataClave. This investigation adds IGJ-confirmed DNI proof that Paez Canosa is a registered director at ATX, Lugalu, and Neutronica simultaneously, and that Ward\'s network spans 11 companies.',
      ],
    },
    citations: [
      { id: 1, text: 'Canal de las Noticias - licitacion SMS ATX', url: 'https://www.canaldelasnoticias.com/adorni-licitacion-sms-atx-sa-ward-millones-dolares/' },
      { id: 2, text: 'Ambito - irregularidades y conflictos de interes', url: 'https://www.ambito.com/politica/denuncian-manuel-adorni-irregularidades-sospechas-conflicto-intereses-y-licitaciones-la-lupa-n6257361' },
      { id: 3, text: 'IGJ - directivos ATX, Lugalu, Neutronica (consulta por DNI)', url: 'https://www.argentina.gob.ar/justicia/igj' },
    ],
  },
  {
    id: 'la-red-ward',
    title: { es: 'III. La Red Ward', en: 'III. The Ward Network' },
    paragraphs: {
      es: [
        'Ward es directivo de 11 empresas segun la IGJ: ATX, 5 On Line, Exi Group, Lugalu, Doru Inversiones, Neutronica, PW Producciones, Impakto, Wazzup, Unicall y WC. [1]',
        'Diego Paez (DNI 92.297.127) aparece en 5 de ellas: ATX, Impakto, PW Producciones, Neutronica y Lugalu. Juan Ignacio Ward (DNI 44.096.749), hijo de Ruben, en Exi y Wazzup. [1]',
        'Exi Group y 5OL son empresas de cobro de deudas con miles de denuncias de consumidores. [2]',
        'ATX tenia 9 contratos gubernamentales previos (desde 2015) con RENAPER y el Ministerio de Educacion, por un total de al menos $244 millones. Dato descubierto mediante cruce por CUIT contra la base de datos de contratistas de obras publicas. [3]',
        'Once sociedades, tres directivos compartidos, 9 contratos previos con el Estado. La estructura societaria estaba en la base de datos antes de que Adorni adjudicara la licitacion.',
      ],
      en: [
        'Ward is director at 11 companies per IGJ: ATX, 5 On Line, Exi Group, Lugalu, Doru Inversiones, Neutronica, PW Producciones, Impakto, Wazzup, Unicall, and WC. [1]',
        'Diego Paez (DNI 92,297,127) appears at 5 of them: ATX, Impakto, PW Producciones, Neutronica, and Lugalu. Juan Ignacio Ward (DNI 44,096,749), Ruben\'s son, at Exi and Wazzup. [1]',
        'Exi Group and 5OL are debt collection companies with thousands of consumer complaints. [2]',
        'ATX had 9 prior government contracts (since 2015) with RENAPER and the Ministry of Education, totaling at least $244 million. Discovered by cross-referencing ATX CUIT against the public works contractor database. [3]',
        'Eleven companies, three shared directors, 9 prior state contracts. The corporate structure was in the database before Adorni signed the award.',
      ],
    },
    citations: [
      { id: 1, text: 'IGJ - consulta CompanyOfficer por DNI 24676344', url: 'https://www.argentina.gob.ar/justicia/igj' },
      { id: 2, text: 'C5N - Exi Group', url: 'https://www.c5n.com/sociedad/exi-group-el-entramado-detras-las-estafas-millonarias-n128662' },
      { id: 3, text: 'Compr.ar - contratos ATX S.A. (CUIT 30700595842)', url: 'https://comprar.gob.ar/' },
    ],
  },
  {
    id: 'la-triangulacion',
    title: { es: 'IV. Los Contratos de la Esposa', en: 'IV. The Wife\'s Contracts' },
    paragraphs: {
      es: [
        'Bettina Julieta Angeletti (CUIT 27-29865407-0) fundo la consultora +Be en julio de 2024. Opera bajo su CUIT personal como monotributista. [1]',
        '+Be cobro $6.370.000 a National Shipping S.A. por capacitacion de ejecutivos. National Shipping es contratista de YPF desde hace 28 anos (~USD $140M anuales). Adorni es miembro del directorio de YPF como representante del Estado. [1]',
        'Segun la denuncia de la diputada Pagano: entidades estatales (ARCA, AySA, Banco Nacion, Aerolineas Argentinas) contratan a Datco Group (CUIT 30-59611620-1). Datco habria subcontratado a +Be. Los montos no fueron divulgados publicamente. [2]',
        'Datco tiene 5 contratos gubernamentales en la base de datos existente, incluyendo uno de $11.4 millones con la Jefatura de Gabinete de Ministros. [3]',
        'El funcionario que dirige la Jefatura de Gabinete es director de YPF. Su esposa factura a un contratista de YPF. La entidad que intermedia tiene contratos con la misma Jefatura de Gabinete.',
      ],
      en: [
        'Bettina Julieta Angeletti (CUIT 27-29865407-0) founded +Be consulting in July 2024. Operates under her personal CUIT as sole proprietor. [1]',
        '+Be charged $6,370,000 to National Shipping S.A. for executive training. National Shipping has been a YPF contractor for 28 years (~USD $140M annually). Adorni is a YPF board member as state representative. [1]',
        'Per Deputy Pagano\'s complaint: state entities (ARCA, AySA, Banco Nacion, Aerolineas Argentinas) contract Datco Group (CUIT 30-59611620-1). Datco allegedly subcontracted +Be. Amounts were not publicly disclosed. [2]',
        'Datco holds 5 government contracts in the existing database, including one for $11.4 million with the Chief of Cabinet\'s Office. [3]',
        'The official who runs the Chief of Cabinet\'s Office is a YPF board member. His wife bills a YPF contractor. The intermediary entity holds contracts with the same Chief of Cabinet\'s Office.',
      ],
    },
    citations: [
      { id: 1, text: 'iProfesional - Angeletti bajo la lupa', url: 'https://www.iprofesional.com/politica/450390-bettina-angeletti-bajo-lupa-contratos-millonarios-impacta-gobierno' },
      { id: 2, text: 'La Politica Online - YPF y ARCA contrataron a esposa de Adorni', url: 'https://www.lapoliticaonline.com/politica/denuncian-que-ypf-y-arca-contrataron-a-la-esposa-de-adorni/' },
      { id: 3, text: 'Compr.ar - contratos Datco S.A. (CUIT 30596116201)', url: 'https://comprar.gob.ar/' },
    ],
  },
  {
    id: 'tecnopolis',
    title: { es: 'V. Tecnopolis', en: 'V. Tecnopolis' },
    paragraphs: {
      es: [
        'Concesion de 25 anos. Canon mensual: $611 millones segun el Tribunal de Tasaciones. La AABE supervisa la licitacion. La AABE reporta al Jefe de Gabinete. [1]',
        'Grupo Foggia (CUIT 30-71448507-1) participa del proceso junto a DirecTV Argentina. La IGJ registra a Mara Natalia Gorini (DNI 24.128.338) como directiva de Grupo Foggia. Gorini es asesora de Karina Milei, Secretaria General de la Presidencia. [1]',
        'Grupo Foggia es ademas cliente de +Be, la consultora de Angeletti, segun la denuncia de la diputada Pagano. [1]',
        'Adorni controla la agencia que adjudica la concesion. Una asesora de la hermana del presidente es directiva del licitante. La esposa de Adorni factura al mismo licitante.',
      ],
      en: [
        '25-year concession. Monthly canon: $611 million per the Appraisal Tribunal. AABE oversees the tender. AABE reports to the Chief of Cabinet. [1]',
        'Grupo Foggia (CUIT 30-71448507-1) participates in the process alongside DirecTV Argentina. IGJ records Mara Natalia Gorini (DNI 24,128,338) as a Grupo Foggia director. Gorini is an advisor to Karina Milei, Secretary General of the Presidency. [1]',
        'Grupo Foggia is also a client of +Be, Angeletti\'s consulting firm, per Deputy Pagano\'s complaint. [1]',
        'Adorni controls the agency that awards the concession. An advisor to the president\'s sister is a director at the bidder. Adorni\'s wife bills that same bidder.',
      ],
    },
    citations: [
      { id: 1, text: 'Perfil - irregularidades en Tecnopolis', url: 'https://www.perfil.com/noticias/politica/denuncian-a-manuel-adorni-por-presuntas-irregularidades-en-contrataciones-y-la-concesion-de-tecnopolis.phtml' },
    ],
  },
  {
    id: 'los-vuelos',
    title: { es: 'VI. Los Vuelos', en: 'VI. The Flights' },
    paragraphs: {
      es: [
        '12 de febrero de 2026. Honda Jet LV-HWA, operado por Alphacentauri S.A., San Fernando a Punta del Este. Costo ida: $6.984.180. Pagado por Imhouse S.A., productora de Marcelo Grandio. [1]',
        'Grandio conducia "Giros en linea recta" en TV Publica. El programa debuto el 27 de septiembre de 2024, tres meses despues de que TV Publica quedara bajo la orbita de Adorni. El juez Lijo ordeno el levantamiento del secreto fiscal y bancario de Imhouse. [2]',
        'Marzo de 2026. Angeletti viajo en el avion presidencial ARG-01 a Nueva York. Adorni: "vengo una semana a deslomarme a Nueva York." Luego admitio que la expresion fue "desafortunada." Dijo que ella habia comprado un pasaje comercial de USD $5.000 pero fue "invitada" por el presidente Milei. No especifico quien pago el hotel ni que actividades tenia en Nueva York. [3]',
        'Agosto de 2024. Adorni anuncio el Decreto 712/2024 prohibiendo el uso de aviones estatales para familiares. Sus palabras: "Cuando utilizas para beneficio personal cuestiones del Estado, estas abusando de tu posicion de poder." [4]',
      ],
      en: [
        'February 12, 2026. Honda Jet LV-HWA, operated by Alphacentauri S.A., San Fernando to Punta del Este. Outbound cost: $6,984,180. Paid by Imhouse S.A., Marcelo Grandio\'s production company. [1]',
        'Grandio hosted "Giros en linea recta" on TV Publica. The show debuted September 27, 2024, three months after TV Publica came under Adorni\'s authority. Judge Lijo ordered the lifting of fiscal and banking secrecy for Imhouse. [2]',
        'March 2026. Angeletti traveled on presidential aircraft ARG-01 to New York. Adorni: "I come to break my back for a week in New York." Later admitted the phrasing was "unfortunate." Said she had bought a USD $5,000 commercial ticket but was "invited" by President Milei. Did not specify who paid for the hotel or what activities she had in New York. [3]',
        'August 2024. Adorni announced Decree 712/2024 prohibiting state aircraft use for family members. His words: "When you use State resources for personal benefit, you are abusing your position of power." [4]',
      ],
    },
    citations: [
      { id: 1, text: 'La Nacion - detalles del vuelo privado', url: 'https://www.lanacion.com.ar/politica/revelan-los-detalles-del-vuelo-privado-que-tomo-manuel-adorni-con-su-familia-en-el-feriado-de-nid11032026/' },
      { id: 2, text: 'Canal 26 - Lijo ordena abrir cuentas de Imhouse', url: 'https://www.canal26.com/politica/2026/03/21/investigacion-a-manuel-adorni-el-juez-federal-ariel-lijo-ordeno-abrir-las-cuentas-de-la-empresa-que-pago-su-viaje/' },
      { id: 3, text: 'elDiarioAR - esposa viajo "invitada" por Milei', url: 'https://www.eldiarioar.com/politica/escandalo-avion-presidencial-adorni-dijo-esposa-viajo-invitada-javier-milei_1_13068858.html' },
      { id: 4, text: 'Chequeado - Decreto 712/2024 y Ley de Etica Publica', url: 'https://chequeado.com/el-explicador/del-no-se-usara-para-familiares-al-viaje-con-su-esposa-la-polemica-por-el-uso-del-avion-presidencial-de-adorni-y-que-dice-la-ley-de-etica-publica/' },
    ],
  },
  {
    id: 'el-patrimonio',
    title: { es: 'VII. El Patrimonio', en: 'VII. The Patrimony' },
    paragraphs: {
      es: [
        'DDJJ presentada fuera de termino el 7 de noviembre de 2024. Patrimonio declarado: $107.9 millones. Deudas: $95.4 millones. Declaracion anterior: $11.6 millones. Aumento nominal: ~500%. La inflacion de 2023 fue 211%. [1]',
        'USD $42.500 en efectivo, justificados como prestamos de Silvia Pais (madre) y Norma Zuccolo (jubilada de 95 anos). El origen de estos fondos es materia de la causa CFP 1003/2026. [1]',
        'Angeletti compro la Unidad Funcional 380 en el Country Club Indio Cua Golf Club, Exaltacion de la Cruz, el 15 de noviembre de 2024. No declarada en la DDJJ. Un departamento en Caballito tampoco fue declarado. [2]',
        'Sueldo bruto como Jefe de Gabinete: $3.584.006 mensuales (pre-aumento de enero 2026). Gastos familiares en tarjeta de credito: $17-20 millones mensuales segun MinutoUno, con picos de $30 millones bimestrales. [3]',
        'El sueldo cubre una quinta parte de los gastos declarados en tarjeta. La diferencia no esta explicada en ninguna fuente publica.',
      ],
      en: [
        'DDJJ filed late on November 7, 2024. Declared patrimony: $107.9 million. Debts: $95.4 million. Previous declaration: $11.6 million. Nominal increase: ~500%. 2023 inflation was 211%. [1]',
        'USD $42,500 in cash, justified as loans from Silvia Pais (mother) and Norma Zuccolo (95-year-old retiree). The origin of these funds is part of case CFP 1003/2026. [1]',
        'Angeletti purchased Functional Unit 380 at Indio Cua Golf Club, Exaltacion de la Cruz, on November 15, 2024. Not declared in the DDJJ. A Caballito apartment was also not declared. [2]',
        'Gross salary as Chief of Cabinet: $3,584,006 monthly (pre-January 2026 increase). Family credit card spending: $17-20 million monthly per MinutoUno, with peaks of $30 million bimonthly. [3]',
        'The salary covers one fifth of declared credit card spending. The difference is not explained in any public source.',
      ],
    },
    citations: [
      { id: 1, text: 'Chequeado - bienes declarados por Adorni', url: 'https://chequeado.com/el-explicador/polemica-por-los-viajes-de-manuel-adorni-que-bienes-declaro-el-jefe-de-gabinete/' },
      { id: 2, text: 'Perfil - casa en country Indio Cua', url: 'https://www.perfil.com/noticias/judiciales/manuel-adorni-suma-otra-polemica-ahora-le-adjudican-una-casa-en-un-country-de-exaltacion-de-la-cruz.phtml' },
      { id: 3, text: 'MinutoUno - gastos vs sueldo', url: 'https://www.minutouno.com/politica/no-cierra-manuel-adorni-cobra-3500000-y-su-familia-tiene-gastos-17000000-solo-tarjetas-credito-n6255724' },
    ],
  },
  {
    id: 'libra',
    title: { es: 'VIII. LIBRA', en: 'VIII. LIBRA' },
    paragraphs: {
      es: [
        '19 de octubre de 2024: reunion en el Hotel Libertador. Presentes: Milei, Karina Milei, Adorni, Mauricio Novelli (trader cripto) y Julian Peh (CEO de KIP Protocol, Singapur). Cuatro meses despues, Milei promociono $LIBRA en redes sociales. El token colapso. Perdidas estimadas: USD $251 millones. [1]',
        'El analisis forense del telefono de Novelli revelo flyers con Adorni como orador confirmado del "Tech Forum 2", un evento cancelado tras el escandalo. Adorni nego haber aceptado. [2]',
        'El FBI y el DOJ abrieron investigacion. Un juez argentino congelo activos por USD $100 millones en la causa CFP 574/2025. [1]',
        'Adorni estuvo en la reunion donde se presento la empresa cuyo token el presidente promociono cuatro meses despues. La justicia argentina y el DOJ investigan el mismo hecho.',
      ],
      en: [
        'October 19, 2024: meeting at Hotel Libertador. Present: Milei, Karina Milei, Adorni, Mauricio Novelli (crypto trader), and Julian Peh (CEO of KIP Protocol, Singapore). Four months later, Milei promoted $LIBRA on social media. The token collapsed. Estimated losses: USD $251 million. [1]',
        'Forensic analysis of Novelli\'s phone revealed flyers listing Adorni as confirmed speaker at "Tech Forum 2", an event cancelled after the scandal. Adorni denied having accepted. [2]',
        'The FBI and DOJ opened an investigation. An Argentine judge froze USD $100 million in assets in case CFP 574/2025. [1]',
        'Adorni was at the meeting where the company was presented whose token the president promoted four months later. Argentine courts and the DOJ are investigating the same event.',
      ],
    },
    citations: [
      { id: 1, text: 'Perfil - Adorni tambien es parte del caso Libra', url: 'https://noticias.perfil.com/noticias/politica/lo-que-le-faltaba-a-adorni-despues-de-nueva-york-tambien-es-parte-del-caso-libra.phtml' },
      { id: 2, text: 'DataClave - Tech Forum 2', url: 'https://www.dataclave.com.ar/poder/escandalo-cripto--tech-forum-2--el-evento-que-planificaba-novelli-pero-se-frustro-por--libra_a69befe9f2e65bf0bc8f518f0' },
    ],
  },
  {
    id: 'las-productoras',
    title: { es: 'IX. Las Dos Productoras', en: 'IX. The Two Producers' },
    paragraphs: {
      es: [
        'El registro de ENACOM contiene dos productoras audiovisuales vinculadas al caso: Imhouse S.A. (PR0ACC15A0000, inscripta abril 2018) y Foggia Group S.A. (PR0ACB60A0000, inscripta febrero 2018). Ambas registradas como "Independientes." Ninguna otra empresa de la red tiene registro ENACOM. [1]',
        'Imhouse produce para TV Publica y pago el vuelo de Adorni. Foggia licita por Tecnopolis y es cliente de la consultora de Angeletti.',
      ],
      en: [
        'The ENACOM registry contains two audiovisual producers linked to the case: Imhouse S.A. (PR0ACC15A0000, registered April 2018) and Foggia Group S.A. (PR0ACB60A0000, registered February 2018). Both registered as "Independent." No other network company has ENACOM registration. [1]',
        'Imhouse produces for TV Publica and paid for Adorni\'s flight. Foggia bids on Tecnopolis and is a client of Angeletti\'s consulting firm.',
      ],
    },
    citations: [
      { id: 1, text: 'ENACOM - Registro Publico de Senales y Productoras', url: 'https://registros-sca.enacom.gob.ar/productoras/' },
    ],
  },
  {
    id: 'las-direcciones',
    title: { es: 'X. Las Direcciones', en: 'X. The Addresses' },
    paragraphs: {
      es: [
        'San Martin 551, CABA: ATX + Lugalu + Impakto. Tres empresas de Ward comparten domicilio fiscal. [1]',
        'Pedro Chutro 3135, CABA: Area Tech + Neutronica. La oferente eliminada y otra empresa de Ward donde Paez Canosa es directivo. [1]',
        'Esmeralda 288, CABA: Alphacentauri + Omega Centauri S.A. (CUIT 33719168359, creada septiembre 2025). Augusto Bunge es unico directivo de ambas. Alphacentauri es propietaria del Honda Jet LV-HWA. [1]',
      ],
      en: [
        'San Martin 551, CABA: ATX + Lugalu + Impakto. Three Ward companies share fiscal address. [1]',
        'Pedro Chutro 3135, CABA: Area Tech + Neutronica. The eliminated bidder and another Ward company where Paez Canosa is a director. [1]',
        'Esmeralda 288, CABA: Alphacentauri + Omega Centauri S.A. (CUIT 33719168359, created September 2025). Augusto Bunge is sole director of both. Alphacentauri owns Honda Jet LV-HWA. [1]',
      ],
    },
    citations: [
      { id: 1, text: 'Registro Nacional de Sociedades - datos abiertos', url: 'https://datos.jus.gob.ar/dataset/registro-nacional-de-sociedades' },
    ],
  },
  {
    id: 'el-mapa',
    title: { es: 'XI. El Mapa', en: 'XI. The Map' },
    paragraphs: {
      es: [
        '102 entidades. 133 relaciones. 6 causas judiciales: CFP 1003/2026 (Lijo), causa Rafecas por avion presidencial, investigacion Lijo por vuelo privado, denuncia ATX/Tecnopolis, ANDIS CFP 3402/2025, LIBRA CFP 574/2025.',
        '11 entidades aparecen en otras investigaciones de esta plataforma. En la investigacion LIBRA: Karina Milei, Santiago Caputo, Julian Peh, Mauricio Novelli. En la base de contratistas de obras publicas: ATX, Datco, Foggia, Movilgate, Lugalu.',
        '20 CUITs verificados. 14 fuentes de datos publicos consultadas: IGJ, Registro Nacional de Sociedades, ICIJ Offshore Leaks, ENACOM, ANAC, AFIP, FinCEN Files, OpenSanctions, Compr.ar, Boletin Oficial, AABE, RTA, SIGEN, CNE. Verificaciones ICIJ y de sanciones estadounidenses: negativas.',
        'Preguntas pendientes. (1) Si los registros bancarios de Imhouse muestran pagos a Adorni. (2) Quien compro el paquete de 10 vuelos facturado a Agustin Issin Hansen en Uruguay [1]. (3) Los montos de +Be canalizados a traves de Datco. (4) El proposito de Omega Centauri S.A.',
      ],
      en: [
        '102 entities. 133 relationships. 6 judicial cases: CFP 1003/2026 (Lijo), Rafecas presidential aircraft case, Lijo private flight investigation, ATX/Tecnopolis complaint, ANDIS CFP 3402/2025, LIBRA CFP 574/2025.',
        '11 entities appear in other investigations on this platform. In the LIBRA investigation: Karina Milei, Santiago Caputo, Julian Peh, Mauricio Novelli. In the public works contractor database: ATX, Datco, Foggia, Movilgate, Lugalu.',
        '20 CUITs verified. 14 public data sources queried: IGJ, National Registry of Companies, ICIJ Offshore Leaks, ENACOM, ANAC, AFIP, FinCEN Files, OpenSanctions, Compr.ar, Boletin Oficial, AABE, RTA, SIGEN, CNE. ICIJ and US sanctions checks: negative.',
        'Pending questions. (1) Whether Imhouse bank records show payments to Adorni. (2) Who purchased the 10-flight package billed to Agustin Issin Hansen in Uruguay [1]. (3) The amounts of +Be contracts channeled through Datco. (4) The purpose of Omega Centauri S.A.',
      ],
    },
    citations: [
      { id: 1, text: 'La Nacion - facturas del vuelo privado', url: 'https://www.lanacion.com.ar/politica/ordenan-medidas-para-investigar-quien-pago-el-vuelo-privado-de-manuel-adorni-a-punta-del-este-nid19032026/' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Citation rendering
// ---------------------------------------------------------------------------

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

      <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-950/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-amber-200/70">
          {lang === 'es'
            ? 'Todas las personas mencionadas gozan de la presuncion de inocencia. Los hechos descritos se basan en fuentes publicas, registros gubernamentales y denuncias judiciales. Ninguna conclusion de culpabilidad ha sido establecida por tribunal alguno.'
            : 'All persons mentioned enjoy the presumption of innocence. Facts described are based on public sources, government records, and judicial complaints. No finding of guilt has been established by any court.'}
        </p>
      </div>

      <hr className="border-zinc-800" />

      {chapters.map((chapter) => (
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
      ))}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Investigacion asistida por inteligencia artificial con verificacion humana. Cada hallazgo verificado contra fuentes primarias. Errores del analisis automatizado fueron corregidos y documentados.'
            : 'AI-assisted investigation with human verification. Every finding verified against primary sources. Automated analysis errors were corrected and documented.'}
        </p>
      </section>
    </article>
  )
}
