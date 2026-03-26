/**
 * Manuel Adorni investigation structured data.
 *
 * Bilingual (ES primary, EN secondary) factcheck items, timeline events,
 * actors, money flows, and impact stats - built through a 13-wave
 * investigation loop with local AI verification at each stage.
 *
 * Investigation covers: crypto/LIBRA connections, pauta oficial,
 * asset declarations, corporate ties, revolving door, media ecosystem,
 * and cross-reference with existing investigations (finanzas-politicas,
 * obras-publicas, monopolios, libra).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FactcheckStatus =
  | 'confirmed'
  | 'alleged'
  | 'confirmed_cleared'
  | 'unconfirmed'

export type InvestigationCategory =
  | 'political'
  | 'financial'
  | 'legal'
  | 'corporate'
  | 'media'

export interface FactcheckItem {
  id: string
  claim_es: string
  claim_en: string
  status: FactcheckStatus
  tier: number
  source: string
  source_url: string
  detail_es?: string
  detail_en?: string
}

export interface TimelineEvent {
  id: string
  date: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  category: InvestigationCategory
  sources: string[]
}

export interface Actor {
  id: string
  name: string
  role_es: string
  role_en: string
  description_es: string
  description_en: string
  party: string
  datasets: number
  status_es?: string
  status_en?: string
  source_url?: string
}

export interface MoneyFlow {
  id: string
  from_label: string
  to_label: string
  amount_ars: number
  description_es: string
  description_en: string
  date: string
  source: string
  source_url: string
}

export interface ImpactStat {
  value: string
  label_es: string
  label_en: string
  source: string
}

export interface Statement {
  id: string
  date: string
  claim_es: string
  claim_en: string
  context_es: string
  context_en: string
  verified: boolean
  verification_es?: string
  verification_en?: string
  source_url: string
  video_url?: string
}

// ---------------------------------------------------------------------------
// Impact Stats (populated during Wave 13)
// ---------------------------------------------------------------------------

export const IMPACT_STATS: readonly ImpactStat[] = [
  { value: '102', label_es: 'Nodos de investigacion', label_en: 'Investigation nodes', source: 'Neo4j graph (13 waves + enrichment)' },
  { value: '133', label_es: 'Relaciones mapeadas', label_en: 'Relationships mapped', source: 'Neo4j graph' },
  { value: '11', label_es: 'Cruces con otras investigaciones', label_en: 'Cross-investigation links', source: 'SAME_ENTITY relationships (caso-libra + obras-publicas)' },
  { value: '~500%', label_es: 'Aumento patrimonial 2023 (nominal)', label_en: 'Patrimony increase 2023 (nominal)', source: 'DDJJ Oficina Anticorrupcion ($11.6M→$61M, inflacion 211%)' },
  { value: '$15B', label_es: 'Licitaciones de mensajeria (presunta competencia simulada)', label_en: 'Messaging tenders (alleged simulated competition)', source: 'Compr.ar / Boletin Oficial (ATX $3.65B + Bidone $857K + otros)' },
  { value: '6', label_es: 'Causas judiciales activas', label_en: 'Active judicial cases', source: 'CFP 1003/2026, Rafecas, Lijo, ATX/Tecnopolis, ANDIS CFP 3402/2025, LIBRA CFP 574/2025' },
  { value: '17', label_es: 'Declaraciones disputadas', label_en: 'Disputed statements', source: 'Chequeado / AFP Factual (incl. Decreto 712 contradiccion)' },
  { value: '11', label_es: 'Empresas de Ward (IGJ)', label_en: 'Ward companies (IGJ)', source: 'IGJ CompanyOfficer DNI 24676344' },
]

// ---------------------------------------------------------------------------
// Factcheck Items (populated progressively across waves)
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: readonly FactcheckItem[] = [
  { id: 'fc-simulated-competition', claim_es: 'Segun denuncias penales y registros de IGJ, Rodrigo Paez Canosa es directivo de ATX y fue empleado de Area Tech y Movilgate - las tres empresas licitantes del servicio de SMS', claim_en: 'According to criminal complaints and IGJ records, Rodrigo Paez Canosa is a director at ATX and was employed at Area Tech and Movilgate - all three SMS tender bidders', status: 'alleged', tier: 1, source: 'Canal de las Noticias / Sumario / IGJ', source_url: 'https://www.canaldelasnoticias.com/adorni-licitacion-sms-atx-sa-ward-millones-dolares/', detail_es: 'Ward (ATX) y Casal (Area Tech) eran ex-socios en Lugalu S.A. Area Tech no presento garantia de oferta, un patron que segun especialistas puede ser indicativo de competencia simulada. ATX cobro 69% mas en el Contrato 2 por servicio identico.', detail_en: 'Ward (ATX) and Casal (Area Tech) were ex-partners in Lugalu S.A. Area Tech failed to present bid guarantee, a pattern that according to procurement experts may indicate simulated competition. ATX charged 69% more in Contract 2 for identical service.' },
  { id: 'fc-datco-triangulation', claim_es: 'Segun la denuncia de la diputada Pagano, contratos de +Be (consultora de Angeletti) con entidades estatales habrian sido canalizados a traves de Datco Group', claim_en: 'According to Deputy Pagano\'s complaint, +Be (Angeletti consulting) contracts with state entities were allegedly channeled through Datco Group', status: 'alleged', tier: 1, source: 'La Politica Online', source_url: 'https://www.lapoliticaonline.com/politica/denuncian-que-ypf-y-arca-contrataron-a-la-esposa-de-adorni/', detail_es: 'Datco tiene contratos con ARCA, AySA, Banco Nacion, Aerolineas, Trenes Argentinos. Segun la denuncia, Datco habria subcontratado a +Be. National Shipping pago $6.37M ARS por capacitacion.', detail_en: 'Datco holds contracts with ARCA, AySA, Banco Nacion, Aerolineas, Trenes Argentinos. According to the complaint, Datco allegedly subcontracted +Be. National Shipping paid $6.37M ARS for training.' },
  { id: 'fc-imhouse-flights', claim_es: 'Imhouse S.A. (productora de TV Publica) pago vuelo privado de la familia Adorni a Punta del Este ($6.98M ARS)', claim_en: 'Imhouse S.A. (TV Publica production company) paid for Adorni family private jet to Punta del Este ($6.98M ARS)', status: 'confirmed', tier: 1, source: 'La Nacion / Ambito', source_url: 'https://www.lanacion.com.ar/politica/revelan-los-detalles-del-vuelo-privado-que-tomo-manuel-adorni-con-su-familia-en-el-feriado-de-nid11032026/' },
  { id: 'fc-patrimony-growth', claim_es: 'Patrimonio aumento ~500% ($11.6M a $61M ARS en 2023, luego a $107.9M en 2024). Inflacion 211% en 2023 explica parte del aumento nominal.', claim_en: 'Patrimony increased ~500% ($11.6M to $61M ARS in 2023, then $107.9M in 2024). 211% inflation in 2023 explains part of the nominal increase.', status: 'confirmed', tier: 1, source: 'Chequeado / El Destape', source_url: 'https://chequeado.com/el-explicador/polemica-por-los-viajes-de-manuel-adorni-que-bienes-declaro-el-jefe-de-gabinete/' },
  { id: 'fc-undeclared-properties', claim_es: 'Casa en country Indio Cua Golf Club (comprada nov 2024 por Angeletti) y departamento en Caballito no declarados en DDJJ', claim_en: 'Country house at Indio Cua Golf Club (purchased Nov 2024 by Angeletti) and Caballito apartment not declared in DDJJ', status: 'confirmed', tier: 1, source: 'Perfil / elDiarioAR', source_url: 'https://www.perfil.com/noticias/judiciales/manuel-adorni-suma-otra-polemica-ahora-le-adjudican-una-casa-en-un-country-de-exaltacion-de-la-cruz.phtml' },
  { id: 'fc-ypf-conflict', claim_es: 'Adorni es miembro del directorio de YPF mientras la consultora de su esposa tiene contratos con un contratista de YPF (National Shipping), lo que plantea un presunto conflicto de interes', claim_en: 'Adorni is a YPF board member while his wife\'s consulting firm holds contracts with a YPF contractor (National Shipping), raising an alleged conflict of interest', status: 'alleged', tier: 1, source: 'iProfesional / LPO', source_url: 'https://www.iprofesional.com/politica/450390-bettina-angeletti-bajo-lupa-contratos-millonarios-impacta-gobierno' },
  { id: 'fc-tecnopolis-conflict', claim_es: 'Adorni controla AABE que supervisa concesion de Tecnopolis mientras su esposa es contratada por licitante pre-seleccionado (Grupo Foggia)', claim_en: 'Adorni controls AABE overseeing Tecnopolis concession while his wife is contracted by pre-selected bidder (Grupo Foggia)', status: 'confirmed', tier: 1, source: 'Perfil / Los Andes', source_url: 'https://www.perfil.com/noticias/politica/denuncian-a-manuel-adorni-por-presuntas-irregularidades-en-contrataciones-y-la-concesion-de-tecnopolis.phtml' },
  { id: 'fc-income-gap', claim_es: 'Sueldo $3.5M/mes vs gastos familiares en tarjeta $17-20M/mes', claim_en: 'Salary $3.5M/month vs family credit card spending $17-20M/month', status: 'confirmed', tier: 1, source: 'MinutoUno', source_url: 'https://www.minutouno.com/politica/no-cierra-manuel-adorni-cobra-3500000-y-su-familia-tiene-gastos-17000000-solo-tarjetas-credito-n6255724' },
  { id: 'fc-libra-meeting', claim_es: 'Adorni asistio a reunion en Hotel Libertador (oct 2024) con Milei, Karina, Novelli y Julian Peh de KIP Protocol', claim_en: 'Adorni attended Hotel Libertador meeting (Oct 2024) with Milei, Karina, Novelli, and Julian Peh of KIP Protocol', status: 'confirmed', tier: 1, source: 'Perfil / Letra P', source_url: 'https://noticias.perfil.com/noticias/politica/lo-que-le-faltaba-a-adorni-despues-de-nueva-york-tambien-es-parte-del-caso-libra.phtml' },
  { id: 'fc-gorini-link', claim_es: 'Mara Gorini es asesora de Karina Milei Y ex-directora de Grupo Foggia - vincula Presidencia con licitante de Tecnopolis y con esposa de Adorni', claim_en: 'Mara Gorini is Karina Milei advisor AND former Grupo Foggia director - links Presidency to Tecnopolis bidder and Adorni wife', status: 'confirmed', tier: 1, source: 'Noticias Argentinas / LPO', source_url: 'https://noticiasargentinas.com/politica/bettina-angeletti--contratos-de-la-consultora-de-la-esposa-de-adorni-con-empresas-vinculadas-al-estado-_a69b88e9bc331fb25186d9e54' },
  { id: 'fc-icij-clear', claim_es: 'Adorni y todos sus asociados verificados en ICIJ (Panama Papers, Pandora Papers) - sin entidades offshore encontradas', claim_en: 'Adorni and all associates checked in ICIJ (Panama Papers, Pandora Papers) - no offshore entities found', status: 'confirmed_cleared', tier: 2, source: 'ICIJ Offshore Leaks', source_url: 'https://offshoreleaks.icij.org/' },
  { id: 'fc-ward-11-companies', claim_es: 'Ward (presidente de ATX) es directivo de 11 empresas segun IGJ. ATX, Lugalu e Impakto comparten direccion fiscal (San Martin 551). Neutronica y Area Tech comparten Pedro Chutro 3135. Hallazgo exclusivo.', claim_en: 'Ward (ATX president) is director of 11 companies per IGJ. ATX, Lugalu, and Impakto share fiscal address (San Martin 551). Neutronica and Area Tech share Pedro Chutro 3135. Exclusive finding.', status: 'confirmed', tier: 1, source: 'IGJ + Registro Nacional de Sociedades', source_url: 'https://datos.jus.gob.ar/dataset/registro-nacional-de-sociedades' },
  { id: 'fc-omega-centauri', claim_es: 'Omega Centauri S.A. (CUIT 33719168359) fue registrada en septiembre 2025 en la misma direccion que Alphacentauri S.A. (Esmeralda 288, CABA), con Augusto Bunge como unico directivo en ambas sociedades, segun IGJ y el Registro Nacional de Sociedades.', claim_en: 'Omega Centauri S.A. (CUIT 33719168359) was registered September 2025 at the same address as Alphacentauri S.A. (Esmeralda 288, CABA), with Augusto Bunge as sole director of both companies, per IGJ and the National Registry of Companies.', status: 'unconfirmed', tier: 2, source: 'RNS CSV + IGJ', source_url: 'https://datos.jus.gob.ar/dataset/registro-nacional-de-sociedades' },
  { id: 'fc-decreto-712', claim_es: 'Adorni anuncio Decreto 712/2024 prohibiendo uso de aviones estatales para familiares. Meses despues, su esposa viajo en ARG-01 a Nueva York. Sus propias palabras: "Cuando utilizas para beneficio personal cuestiones del Estado, estas abusando de tu posicion de poder."', claim_en: 'Adorni announced Decree 712/2024 prohibiting state aircraft for family members. Months later, his wife traveled on ARG-01 to New York. His own words: "When you use State resources for personal benefit, you are abusing your position of power."', status: 'confirmed', tier: 1, source: 'Chequeado', source_url: 'https://chequeado.com/el-explicador/del-no-se-usara-para-familiares-al-viaje-con-su-esposa-la-polemica-por-el-uso-del-avion-presidencial-de-adorni-y-que-dice-la-ley-de-etica-publica/' },
  { id: 'fc-enacom', claim_es: 'Imhouse S.A. esta registrada en ENACOM como productora independiente (codigo PR0ACC15A0000, inscripta 09/04/2018, vigencia hasta 19/07/2026). Domicilio: Deheza 2921, Saavedra, CABA. CUIT 30715339788.', claim_en: 'Imhouse S.A. is registered with ENACOM as independent producer (code PR0ACC15A0000, registered 04/09/2018, valid until 07/19/2026). Address: Deheza 2921, Saavedra, CABA. CUIT 30715339788.', status: 'confirmed_cleared', tier: 1, source: 'ENACOM Registro de Productoras', source_url: 'https://registros-sca.enacom.gob.ar/productoras/' },
]

// ---------------------------------------------------------------------------
// Timeline Events (populated progressively across waves)
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  { id: 'te-appointment', date: '2023-12-10', title_es: 'Adorni designado Vocero Presidencial', title_en: 'Adorni appointed Presidential Spokesperson', description_es: 'Decreto 86/2023. Rango de Secretario de Estado, reporte directo a Milei.', description_en: 'Decree 86/2023. Rank of Secretary of State, reporting directly to Milei.', category: 'political', sources: ['https://www.boletinoficial.gob.ar/detalleAviso/primera/300370/20231212'] },
  { id: 'te-sec-comunicacion', date: '2024-09', title_es: 'Promovido a Secretario de Comunicacion y Medios', title_en: 'Promoted to Secretary of Communication and Media', description_es: 'Decreto 834/2024. Control sobre pauta oficial y medios estatales.', description_en: 'Decree 834/2024. Control over official advertising and state media.', category: 'political', sources: [] },
  { id: 'te-kip-meeting', date: '2024-10-19', title_es: 'Reunion Hotel Libertador: Milei, Karina, Novelli, Peh (KIP Protocol)', title_en: 'Hotel Libertador meeting: Milei, Karina, Novelli, Peh (KIP Protocol)', description_es: 'Adorni asiste a reunion clave previo al lanzamiento de $LIBRA. Forensica del telefono de Novelli revela flyers con Adorni como orador del Tech Forum 2.', description_en: 'Adorni attends key meeting before $LIBRA launch. Novelli phone forensics reveal flyers with Adorni as Tech Forum 2 speaker.', category: 'financial', sources: ['https://www.letrap.com.ar/politica/escandalo-cripto-javier-milei-se-reunio-el-ceo-la-empresa-el-hotel-libertador-n5414117'] },
  { id: 'te-indio-cua', date: '2024-11-15', title_es: 'Angeletti compra casa en Country Indio Cua Golf Club', title_en: 'Angeletti purchases house at Indio Cua Golf Club', description_es: 'Unidad Funcional 380. Dos pisos cerca del hoyo 17. No declarada en DDJJ.', description_en: 'Functional Unit 380. Two-story near hole 17. Not declared in DDJJ.', category: 'financial', sources: ['https://www.lanacion.com.ar/politica/la-esposa-de-adorni-compro-en-2024-la-casa-en-el-country-de-exaltacion-de-la-cruz-senalada-por-la-nid19032026/'] },
  { id: 'te-ddjj-late', date: '2024-11-07', title_es: 'DDJJ 2024 presentada fuera de termino', title_en: '2024 DDJJ filed late', description_es: '$107.9M activos, $95.4M deudas. $42.5K USD justificados como prestamos familiares. Patrimonio +400%.', description_en: '$107.9M assets, $95.4M debts. $42.5K USD justified as family loans. Patrimony +400%.', category: 'financial', sources: ['https://www.eldestapeweb.com/politica/manuel-adorni/adorni-presento-su-ddjj-vencida-y-con-prestamos-familiares-para-justificar-miles-de-usd-202412150548'] },
  { id: 'te-sms-tender', date: '2025-05-14', title_es: 'Adorni lanza licitacion SMS/email/llamadas', title_en: 'Adorni launches SMS/email/calls tender', description_es: '36M SMS + 600M emails + 12M llamadas para 2026. Adjudicada a ATX S.A. el 30/12/2025 por $3.65B ARS.', description_en: '36M SMS + 600M emails + 12M calls for 2026. Awarded to ATX S.A. on 12/30/2025 for $3.65B ARS.', category: 'corporate', sources: ['https://www.ambito.com/politica/denuncian-manuel-adorni-irregularidades-sospechas-conflicto-intereses-y-licitaciones-la-lupa-n6257361'] },
  { id: 'te-jefe-gabinete', date: '2025-10-31', title_es: 'Adorni nombrado Jefe de Gabinete de Ministros', title_en: 'Adorni named Chief of Cabinet', description_es: 'Decreto 784/2025. Reemplaza a Guillermo Francos. Maximo cargo del gabinete.', description_en: 'Decree 784/2025. Replaces Guillermo Francos. Top cabinet position.', category: 'political', sources: [] },
  { id: 'te-flight-pde', date: '2026-02-12', title_es: 'Vuelo privado a Punta del Este pagado por Imhouse S.A.', title_en: 'Private flight to Punta del Este paid by Imhouse S.A.', description_es: 'Honda Jet LVHWA83, operado por Alphacentauri S.A. Costo ida: $6.98M ARS. Familia completa. Carnival.', description_en: 'Honda Jet LVHWA83, operated by Alphacentauri S.A. Outbound cost: $6.98M ARS. Full family. Carnival.', category: 'financial', sources: ['https://www.lanacion.com.ar/politica/revelan-los-detalles-del-vuelo-privado-que-tomo-manuel-adorni-con-su-familia-en-el-feriado-de-nid11032026/'] },
  { id: 'te-ny-plane', date: '2026-03', title_es: 'Angeletti viaja en avion presidencial a Nueva York', title_en: 'Angeletti travels on presidential aircraft to New York', description_es: 'Argentina Week. Sin cargo oficial. Adorni dice que compro pasaje comercial de $5K USD pero fue "invitada" al avion oficial.', description_en: 'Argentina Week. No official position. Adorni claims she bought $5K USD commercial ticket but was "invited" onto official plane.', category: 'legal', sources: ['https://www.pagina12.com.ar/2026/03/12/adorni-no-puede-explicar-como-se-pago-el-viaje-de-su-esposa-e-nueva-york-y-le-llueven-denuncias-penales/'] },
  { id: 'te-lijo-secrecy', date: '2026-03-21', title_es: 'Lijo ordena levantamiento de secreto fiscal/bancario de Imhouse', title_en: 'Lijo orders lifting of fiscal/banking secrecy for Imhouse', description_es: 'Juez Ariel Lijo tambien pide contratos entre TV Publica y la productora de Grandio.', description_en: 'Judge Ariel Lijo also requests contracts between TV Publica and Grandio production company.', category: 'legal', sources: ['https://www.canal26.com/politica/2026/03/21/investigacion-a-manuel-adorni-el-juez-federal-ariel-lijo-ordeno-abrir-las-cuentas-de-la-empresa-que-pago-su-viaje/'] },
  { id: 'te-walkout', date: '2026-03-25', title_es: 'Adorni se va de conferencia de prensa sin responder', title_en: 'Adorni walks out of press conference without answering', description_es: '19 minutos de presentacion + 30 min de preguntas. "Con mi dinero hago lo que quiero." Se fue sin responder sobre propiedades no declaradas.', description_en: '19 min presentation + 30 min Q&A. "I do whatever I want with my money." Left without answering about undeclared properties.', category: 'media', sources: ['https://www.minutouno.com/politica/video-manuel-adorni-perdio-los-estribos-y-se-fue-la-conferencia-prensa-un-pregunta-n6259603'] },
]

// ---------------------------------------------------------------------------
// Actors (populated progressively across waves)
// ---------------------------------------------------------------------------

export const ACTORS: readonly Actor[] = [
  { id: 'a-adorni', name: 'Manuel Adorni', role_es: 'Jefe de Gabinete de Ministros', role_en: 'Chief of Cabinet', description_es: 'CUIT 20-28052206-7. Vocero (2023), Sec. Comunicacion (2024), Jefe de Gabinete (2025). 3 causas judiciales. Patrimonio +400%.', description_en: 'CUIT 20-28052206-7. Spokesperson (2023), Communications Sec. (2024), Chief of Cabinet (2025). 3 judicial cases. Patrimony +400%.', party: 'La Libertad Avanza', datasets: 5, source_url: 'https://chequeado.com/personajes/quien-es-manuel-adorni/' },
  { id: 'a-angeletti', name: 'Bettina Julieta Angeletti', role_es: 'Esposa, fundadora +Be Consulting', role_en: 'Wife, founder +Be Consulting', description_es: 'Compro casa en Indio Cua no declarada. Contratos triangulados con YPF, AySA, ARCA via Datco. Viajo en avion presidencial.', description_en: 'Purchased undeclared Indio Cua house. Triangulated contracts with YPF, AySA, ARCA via Datco. Traveled on presidential aircraft.', party: '', datasets: 3, source_url: 'https://www.lapoliticaonline.com/politica/denuncian-que-ypf-y-arca-contrataron-a-la-esposa-de-adorni/' },
  { id: 'a-grandio', name: 'Marcelo Grandio', role_es: 'Periodista, fundador Imhouse S.A.', role_en: 'Journalist, Imhouse S.A. founder', description_es: 'Amigo personal de Adorni. Pago vuelo privado via Imhouse. Conductor de TV Publica (bajo control de Adorni). Bajo investigacion judicial.', description_en: 'Personal friend of Adorni. Paid private flight via Imhouse. TV Publica host (under Adorni control). Under judicial investigation.', party: '', datasets: 2, source_url: 'https://www.lanacion.com.ar/politica/quien-es-marcelo-grandio-el-amigo-de-adorni-y-conductor-de-tv-publica-que-tambien-figura-en-el-vuelo-nid12032026/' },
  { id: 'a-ward', name: 'Ruben Santiago Ward', role_es: 'Director de 11 empresas incluyendo ATX S.A.', role_en: 'Director of 11 companies including ATX S.A.', description_es: 'Red empresarial de 11 sociedades: ATX, 5OL, Exi Group, Lugalu, Doru Inversiones, Neutronica, PW Producciones, Impakto, Wazzup, Unicall, WC. Hijo Juan Ignacio Ward tambien directivo. Miles de denuncias de consumidores (Exi Group/5OL).', description_en: '11-company network: ATX, 5OL, Exi Group, Lugalu, Doru Inversiones, Neutronica, PW Producciones, Impakto, Wazzup, Unicall, WC. Son Juan Ignacio Ward also a director. Thousands of consumer complaints (Exi Group/5OL).', party: '', datasets: 5, source_url: 'https://www.canaldelasnoticias.com/adorni-licitacion-sms-atx-sa-ward-millones-dolares/' },
  { id: 'a-paez', name: 'Rodrigo Paez Canosa', role_es: 'Director en ATX + Lugalu + Neutronica + Media Cel', role_en: 'Director at ATX + Lugalu + Neutronica + Media Cel', description_es: 'Prueba clave de competencia simulada: directivo en ATX (ganadora), Area Tech (eliminada), y Movilgate (2da). Comparte 3 empresas con Ward. Diego Paez (asociado) en 5 empresas de Ward.', description_en: 'Key evidence of simulated competition: director at ATX (winner), Area Tech (eliminated), and Movilgate (2nd). Shares 3 companies with Ward. Diego Paez (associate) at 5 Ward companies.', party: '', datasets: 4, source_url: 'https://www.sumario.com.ar/adorni-sms-millones-licitacion-atx-ward-fraude/' },
  { id: 'a-gorini', name: 'Mara Natalia Gorini', role_es: 'Asesora de Karina Milei, ex-directora Grupo Foggia', role_en: 'Karina Milei advisor, ex-Grupo Foggia director', description_es: 'Nexo entre Presidencia, Tecnopolis y esposa de Adorni. Vincula Karina Milei → Foggia → +Be.', description_en: 'Link between Presidency, Tecnopolis, and Adorni wife. Links Karina Milei → Foggia → +Be.', party: '', datasets: 2 },
  { id: 'a-karina', name: 'Karina Milei', role_es: 'Secretaria General de la Presidencia', role_en: 'Secretary General of the Presidency', description_es: 'Secretaria General de la Presidencia. Respaldo publico a Adorni el 25 de marzo de 2026. Presente en reunion Hotel Libertador oct 2024 segun reportes periodisticos.', description_en: 'Secretary General of the Presidency. Public support for Adorni on March 25, 2026. Present at Hotel Libertador meeting Oct 2024 per press reporting.', party: 'La Libertad Avanza', datasets: 3, source_url: 'https://www.infobae.com/politica/2026/03/25/mi-apoyo-intacto-el-mensaje-de-karina-milei-con-el-que-respaldo-a-manuel-adorni/' },
  { id: 'a-lijo', name: 'Ariel Lijo', role_es: 'Juez Federal', role_en: 'Federal Judge', description_es: 'Lidera investigacion sobre vuelos privados y enriquecimiento. Ordeno levantamiento de secreto fiscal/bancario de Imhouse.', description_en: 'Leads investigation on private flights and enrichment. Ordered lifting of Imhouse fiscal/banking secrecy.', party: '', datasets: 2, source_url: 'https://www.lanacion.com.ar/politica/lijo-pidio-los-contratos-entre-la-tv-publica-y-la-productora-del-amigo-de-adorni-nid25032026/' },
  { id: 'a-pagano', name: 'Marcela Pagano', role_es: 'Diputada nacional (ex-LLA)', role_en: 'National Deputy (ex-LLA)', description_es: 'Presento denuncias penales principales. Ex-La Libertad Avanza, ahora bloque Coherencia.', description_en: 'Filed main criminal complaints. Former La Libertad Avanza, now Coherencia bloc.', party: 'Coherencia', datasets: 1, source_url: 'https://www.eldiarioar.com/politica/marcela-pagano-acuso-manuel-adorni-no-declarar-casa-lujo-country-premium-amplio-denuncia_1_13081612.html' },
  { id: 'a-caputo', name: 'Santiago Caputo', role_es: 'Asesor presidencial, estratega', role_en: 'Presidential advisor, strategist', description_es: 'Asesor estrategico presidencial. Segun reportes de La Politica Online e Infobae, disputa con Adorni por el control del area de comunicacion.', description_en: 'Presidential strategic advisor. According to La Politica Online and Infobae, dispute with Adorni over communication area control.', party: 'La Libertad Avanza', datasets: 2 },
]

// ---------------------------------------------------------------------------
// Money Flows (populated during Waves 8-12)
// ---------------------------------------------------------------------------

export const MONEY_FLOWS: readonly MoneyFlow[] = [
  { id: 'mf-atx-sms', from_label: 'Estado Nacional', to_label: 'ATX S.A.', amount_ars: 3650226300, description_es: 'Licitacion SMS/email/llamadas 2026. Competencia simulada: Paez Canosa empleado de los 3 oferentes. Ward y Casal ex-socios.', description_en: 'SMS/email/calls 2026 tender. Simulated competition: Paez Canosa employee of all 3 bidders. Ward and Casal ex-partners.', date: '2025-12-30', source: 'Compr.ar / Boletin Oficial', source_url: 'https://www.canaldelasnoticias.com/adorni-licitacion-sms-atx-sa-ward-millones-dolares/' },
  { id: 'mf-flight', from_label: 'Imhouse S.A.', to_label: 'Alphacentauri S.A. (vuelo Adorni)', amount_ars: 6984180, description_es: 'Vuelo privado Honda Jet a Punta del Este. Imhouse = productora de TV Publica (bajo Adorni).', description_en: 'Private Honda Jet flight to Punta del Este. Imhouse = TV Publica producer (under Adorni).', date: '2026-02-12', source: 'La Nacion', source_url: 'https://www.lanacion.com.ar/politica/revelan-los-detalles-del-vuelo-privado-que-tomo-manuel-adorni-con-su-familia-en-el-feriado-de-nid11032026/' },
  { id: 'mf-masbe', from_label: 'National Shipping S.A.', to_label: '+Be Consulting (Angeletti)', amount_ars: 6370000, description_es: 'Capacitacion de ejecutivos. National Shipping es contratista de YPF por 28 anos ($140M USD/ano). Adorni es director de YPF.', description_en: 'Executive training. National Shipping is YPF contractor for 28 years ($140M USD/yr). Adorni is YPF director.', date: '2024-11', source: 'LPO / NA', source_url: 'https://www.lapoliticaonline.com/politica/denuncian-que-ypf-y-arca-contrataron-a-la-esposa-de-adorni/' },
  { id: 'mf-tecnopolis', from_label: 'Concesionario (Foggia/DirecTV)', to_label: 'AABE (controlado por Adorni)', amount_ars: 183300000000, description_es: 'Canon proyectado concesion Tecnopolis 25 anos (aun no adjudicada a marzo 2026). $611M/mes segun pliegos AABE. Foggia es cliente de +Be y conectado a Karina Milei via Gorini segun IGJ.', description_en: 'Projected Tecnopolis 25yr concession canon (not yet awarded as of March 2026). $611M/month per AABE tender docs. Foggia is +Be client and connected to Karina Milei via Gorini per IGJ.', date: '2026-07', source: 'AABE / Ambito', source_url: 'https://www.ambito.com/politica/el-gobierno-javier-milei-lanzo-la-licitacion-concesionar-tecnopolis-un-esquema-publico-privado-n6224130' },
  { id: 'mf-datco', from_label: 'Entidades estatales (ARCA, AySA, BNA)', to_label: 'Datco → +Be (Angeletti)', amount_ars: 0, description_es: 'Presunta triangulacion segun denuncia Pagano: Datco tiene contratos con ARCA, AySA, Banco Nacion, Aerolineas. Habria subcontratado a +Be. Montos no divulgados publicamente.', description_en: 'Alleged triangulation per Pagano complaint: Datco holds contracts with ARCA, AySA, Banco Nacion, Aerolineas. Allegedly subcontracted +Be. Amounts not publicly disclosed.', date: '2024–2025', source: 'LPO', source_url: 'https://www.lapoliticaonline.com/politica/denuncian-que-ypf-y-arca-contrataron-a-la-esposa-de-adorni/' },
]

// ---------------------------------------------------------------------------
// Public Statements (populated during Waves 3-4)
// ---------------------------------------------------------------------------

export const STATEMENTS: readonly Statement[] = [
  // Will be populated by investigation waves
]
