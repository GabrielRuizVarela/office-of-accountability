/**
 * Seed script for Caso Finanzas Politicas investigation data.
 *
 * Run with: npx tsx scripts/seed-caso-finanzas-politicas.ts
 *
 * Uses generic labels (Person, Organization, Event, MoneyFlow, Claim)
 * with caso_slug: "caso-finanzas-politicas" for namespace isolation,
 * and prefixed IDs (caso-finanzas-politicas:{local_id}) per the
 * investigation standardization convention.
 *
 * Idempotent - uses MERGE for all operations. Safe to run multiple times.
 * All data is curated from public sources documented in
 * docs/investigations/narrative-finanzas-politicas.md
 */

import { getDriver, closeDriver } from '../src/lib/neo4j/client'

const QUERY_TIMEOUT_MS = 30_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }
const CASO_SLUG = 'caso-finanzas-politicas'

/** Prefix a local ID with the caso slug */
function pid(localId: string): string {
  return `${CASO_SLUG}:${localId}`
}

// ---------------------------------------------------------------------------
// Data - Persons
// ---------------------------------------------------------------------------

const PERSONS = [
  {
    id: pid('person-macri-mauricio'),
    name: 'Mauricio Macri',
    slug: 'mauricio-macri',
    role: 'Expresidente de la Nacion',
    party: 'PRO',
    datasets: 5,
    description:
      'Presidente 2015-2019. Aparece en 5 datasets simultaneamente (Donante, Directivo, Oficial de empresa, DDJJ, Funcionario). Como diputado (2005-2007) tuvo presencia del 17,6%.',
  },
  {
    id: pid('person-kueider'),
    name: 'Edgardo Kueider',
    slug: 'edgardo-kueider',
    role: 'Exsenador Nacional por Entre Rios',
    party: 'Unidad Federal',
    datasets: 1,
    description:
      'Detenido en diciembre 2024 cruzando a Paraguay con USD 211.000 en efectivo no declarado. Voto afirmativo clave en la Ley de Bases. Expulsado del Senado.',
  },
  {
    id: pid('person-camano'),
    name: 'Graciela Camaño',
    slug: 'graciela-camano',
    role: 'Diputada Nacional',
    party: 'Consenso Federal',
    datasets: 4,
    description:
      'Aparece en datos offshore (TT 41 CORP, BVI, constituida durante su mandato 2014-2018), Directivo, Oficial de empresa y DDJJ. 30 años en politica, 6 partidos. 4to nodo mas conectado del grafo.',
  },
  {
    id: pid('person-ibanez'),
    name: 'Maria Cecilia Ibañez',
    slug: 'maria-cecilia-ibanez',
    role: 'Diputada Nacional por Cordoba',
    party: 'La Libertad Avanza',
    datasets: 4,
    description:
      'Titular de PELMOND COMPANY LTD (BVI, activa, confirmada en base ICIJ). Patrimonio duplicado en un año (ARS 15,5M → ARS 33,5M). Voto afirmativo en Presupuesto 2025.',
  },
  {
    id: pid('person-lousteau'),
    name: 'Martin Lousteau',
    slug: 'martin-lousteau',
    role: 'Senador Nacional',
    party: 'UCR',
    datasets: 2,
    description:
      'Su consultora LCG SA facturo $1.690.000 al Congreso (2020-2022) durante su mandato como senador. Voto afirmativo en Ley de Bases. Cargos penales por negociaciones incompatibles.',
  },
  {
    id: pid('person-michetti'),
    name: 'Gabriela Michetti',
    slug: 'gabriela-michetti',
    role: 'Exvicepresidenta de la Nacion',
    party: 'PRO',
    datasets: 2,
    description:
      'Miembro del directorio de PENSAR ARGENTINA confirmada por DNI. Cofundadora de SUMA PARA EL DISEÑO DE POLITICAS PUBLICAS.',
  },
  {
    id: pid('person-alonso'),
    name: 'Laura Alonso',
    slug: 'laura-alonso',
    role: 'Exsecretaria de Etica Publica',
    party: 'PRO',
    datasets: 2,
    description:
      'Paso de legisladora a Secretaria de Etica Publica - supervisando a sus correligionarios de PENSAR ARGENTINA. Presencia legislativa del 55,4%.',
  },
  {
    id: pid('person-bullrich'),
    name: 'Patricia Bullrich',
    slug: 'patricia-bullrich',
    role: 'Ministra de Seguridad',
    party: 'PRO',
    datasets: 2,
    description:
      'Miembro del directorio de PENSAR ARGENTINA. Presencia legislativa del 71,8%. Puerta giratoria Congreso ↔ Ejecutivo.',
  },
  {
    id: pid('person-grindetti'),
    name: 'Nestor Grindetti',
    slug: 'nestor-grindetti',
    role: 'Exintendente de Lanus',
    party: 'PRO',
    datasets: 3,
    description:
      'Cadete de SOCMA desde 1980, directivo de Sideco/IECSA/Geometales/Correo Argentino. Titular de Mercier International SA (Panama Papers). Imputado por enriquecimiento ilicito. Candidato a gobernador 2023.',
  },
  {
    id: pid('person-gianfranco-macri'),
    name: 'Gianfranco Macri',
    slug: 'gianfranco-macri',
    role: 'Empresario, cabeza operativa SOCMA',
    party: '',
    datasets: 2,
    description:
      'Blanqueo USD 4M de BF Corporation (offshore panamena). Total declarado: ARS 622M. Denunciado penalmente por su hermano Mariano en agosto 2024.',
  },
  {
    id: pid('person-de-narvaez'),
    name: 'Francisco De Narvaez Steuer',
    slug: 'francisco-de-narvaez',
    role: 'Exdiputado Nacional',
    party: 'PJ',
    datasets: 3,
    description:
      'Vinculado a 4 entidades offshore (Willowbrook Trading, Power Horse Properties, Titan Consulting, La Esperanza Associated Corp). Fortuna estimada USD 920M (2020).',
  },
  {
    id: pid('person-tagliaferri'),
    name: 'Marcelo Tagliaferri',
    slug: 'marcelo-tagliaferri',
    role: 'Senador Nacional',
    party: 'Frente PRO',
    datasets: 2,
    description:
      'Miembro del directorio de PENSAR ARGENTINA. Voto afirmativo en Ley de Bases - la misma fundacion que presumiblemente contribuyo al diseño de la ley.',
  },
  {
    id: pid('person-frigerio'),
    name: 'Rogelio Frigerio',
    slug: 'rogelio-frigerio',
    role: 'Gobernador de Entre Rios',
    party: 'PRO',
    datasets: 2,
    description:
      'Exministro del Interior (2015-2019). Propietario de Desarrollos Inmobiliarios Alto Delta SA. Denunciado por OA por incompatibilidad y cohecho en caso Fitz Roy 851.',
  },
  {
    id: pid('person-barrionuevo'),
    name: 'Luis Barrionuevo',
    slug: 'luis-barrionuevo',
    role: 'Secretario general UTHGRA',
    party: 'PJ',
    datasets: 2,
    description:
      'Exmarido de Camaño. Controlaron Bellota SA juntos. Socio de Sano y Bueno Catering SA, proveedora de alimentos al Estado. Senador y diputado por Catamarca.',
  },
  {
    id: pid('person-ferrari'),
    name: 'Ferrari Facundo',
    slug: 'ferrari-facundo',
    role: 'Agente de AFIP',
    party: '',
    datasets: 2,
    description:
      'Agente de la AFIP que aparece como oficial de una entidad offshore en los Panama Papers. Verificacion de identidad pendiente.',
  },
  {
    id: pid('person-sturzenegger'),
    name: 'Federico Sturzenegger',
    slug: 'federico-sturzenegger',
    role: 'Expresidente del Banco Central',
    party: 'PRO',
    datasets: 2,
    description:
      'Miembro del directorio de PENSAR ARGENTINA confirmado por DNI.',
  },
  {
    id: pid('person-marcos-pena'),
    name: 'Marcos Peña',
    slug: 'marcos-pena',
    role: 'Exjefe de Gabinete',
    party: 'PRO',
    datasets: 2,
    description:
      'Miembro del directorio de PENSAR ARGENTINA confirmado por DNI. Jefe de Gabinete durante la presidencia de Macri.',
  },
  {
    id: pid('person-rodriguez-larreta'),
    name: 'Horacio Rodriguez Larreta',
    slug: 'horacio-rodriguez-larreta',
    role: 'Exjefe de Gobierno de CABA',
    party: 'PRO',
    datasets: 2,
    description:
      'Miembro del directorio de PENSAR ARGENTINA confirmado por DNI.',
  },
  {
    id: pid('person-nicolas-caputo'),
    name: 'Nicolas Caputo',
    slug: 'nicolas-caputo',
    role: 'Empresario',
    party: '',
    datasets: 1,
    description:
      'Socio comercial mas cercano de Mauricio Macri. Miembro del directorio de PENSAR ARGENTINA - unico no-politico en el directorio.',
  },
  {
    id: pid('person-cordero'),
    name: 'Maria Eugenia Cordero',
    slug: 'maria-eugenia-cordero',
    role: 'Contratista del Estado',
    party: '',
    datasets: 2,
    description:
      'Aparece como contratista del Estado y como oficial de BETHAN INVESTMENTS LIMITED (offshore). Dinero publico → persona → entidad offshore.',
  },
  {
    id: pid('person-juan-pablo-rodriguez'),
    name: 'Juan Pablo Rodriguez',
    slug: 'juan-pablo-rodriguez',
    role: 'Contratista del Estado',
    party: '',
    datasets: 2,
    description:
      'Contratista del Estado (2018-2020, 4 contratos) y donante de campana. Presunta violacion de Ley 26.215 Art. 15 que prohibe a contratistas donar.',
  },
]

// ---------------------------------------------------------------------------
// Data - Organizations
// ---------------------------------------------------------------------------

const ORGANIZATIONS = [
  {
    id: pid('org-pensar-argentina'),
    name: 'PENSAR ARGENTINA',
    slug: 'pensar-argentina',
    type: 'asociacion-civil',
    jurisdiction: 'argentina',
    description:
      '19 politicos confirmados por DNI en su directorio. Entidad formalmente constituida ante la IGJ donde la elite gobernante del PRO diseñaba las politicas que luego implementaba desde el gobierno.',
  },
  {
    id: pid('org-socma'),
    name: 'SOCMA - Sociedad Macri SA',
    slug: 'socma',
    type: 'holding',
    jurisdiction: 'argentina',
    description:
      'Fundada por Franco Macri en enero 1976. Durante la dictadura crecio de 7 a 47 empresas. 153 personas del apellido Macri vinculadas a 211 empresas en la IGJ.',
  },
  {
    id: pid('org-correo-argentino'),
    name: 'Correo Argentino',
    slug: 'correo-argentino',
    type: 'empresa-estatal-privatizada',
    jurisdiction: 'argentina',
    description:
      'Privatizada en 1997, concesion a SOCMA. Deuda acumulada ARS 296M. En 2016 el gobierno de Macri acepto una reduccion del 98,82%. Imputacion a Macri y Aguad.',
  },
  {
    id: pid('org-ausol'),
    name: 'Autopistas del Sol (AUSOL)',
    slug: 'ausol',
    type: 'concesion',
    jurisdiction: 'argentina',
    description:
      'Concesion de autopista renegociada durante la presidencia de Macri. Acciones vendidas con prima del 400%. Impacto economico total ~USD 2.000M.',
  },
  {
    id: pid('org-iecsa'),
    name: 'IECSA',
    slug: 'iecsa',
    type: 'empresa',
    jurisdiction: 'argentina',
    description:
      'Brazo de ingenieria de SOCMA. Vendida al Grupo Emes (2017). Implicada en causa Cuadernos.',
  },
  {
    id: pid('org-geometales'),
    name: 'Minera Geometales',
    slug: 'minera-geometales',
    type: 'empresa-minera',
    jurisdiction: 'argentina',
    description:
      'Directorio con Mauricio Macri, Victor Composto y Jean Paul Luksic Fontbona. 70+ directivos en tres epocas. Opera 16 propiedades mineras en Malargue, Mendoza.',
  },
  {
    id: pid('org-tt41-corp'),
    name: 'TT 41 CORP',
    slug: 'tt-41-corp',
    type: 'offshore',
    jurisdiction: 'islas-virgenes-britanicas',
    description:
      'Constituida el 23 de junio de 2016, durante el mandato de Camaño como Diputada Nacional (2014-2018). Pandora Papers / Trident Trust.',
  },
  {
    id: pid('org-pelmond'),
    name: 'PELMOND COMPANY LTD',
    slug: 'pelmond-company',
    type: 'offshore',
    jurisdiction: 'islas-virgenes-britanicas',
    description:
      'Constituida 31-Oct-2014. ACTIVA - confirmada en base publica del ICIJ. Titular: Maria Cecilia Ibañez.',
  },
  {
    id: pid('org-bf-corporation'),
    name: 'BF Corporation SA',
    slug: 'bf-corporation',
    type: 'offshore',
    jurisdiction: 'panama',
    description:
      'Gianfranco (50%) + Mariano Macri (50%). Fondos movidos a Safra Bank, Suiza. Banco aleman recibio orden de destruir correspondencia.',
  },
  {
    id: pid('org-betail'),
    name: 'BETAIL SA',
    slug: 'betail-sa',
    type: 'empresa-fantasma',
    jurisdiction: 'argentina',
    description:
      'Empresa fantasma de Kueider registrada en la IGJ con domicilios legales falsos.',
  },
  {
    id: pid('org-edekom'),
    name: 'EDEKOM SA',
    slug: 'edekom-sa',
    type: 'empresa-fantasma',
    jurisdiction: 'argentina',
    description:
      'Segunda empresa fantasma de Kueider con domicilios legales falsos.',
  },
  {
    id: pid('org-lcg'),
    name: 'LCG SA',
    slug: 'lcg-sa',
    type: 'consultora',
    jurisdiction: 'argentina',
    description:
      'Consultora de Martin Lousteau. Facturo $1.690.000 a la Oficina de Presupuesto del Congreso (2020-2022) durante su mandato como senador.',
  },
  {
    id: pid('org-bellota'),
    name: 'Bellota SA',
    slug: 'bellota-sa',
    type: 'empresa',
    jurisdiction: 'argentina',
    description:
      'Controlada por Camaño y Barrionuevo. Dedicada a gestion de actividades deportivas. Declaro ganancias de ARS 249.000 pero no presento balance ante AFIP.',
  },
  {
    id: pid('org-bethan-investments'),
    name: 'BETHAN INVESTMENTS LIMITED',
    slug: 'bethan-investments',
    type: 'offshore',
    jurisdiction: 'desconocida',
    description:
      'Entidad offshore vinculada a Maria Eugenia Cordero (contratista del Estado).',
  },
  {
    id: pid('org-aluar'),
    name: 'Aluar Aluminio Argentino',
    slug: 'aluar',
    type: 'empresa',
    jurisdiction: 'argentina',
    description:
      'Mayor productor de aluminio de Argentina. Unico gran donante que aposto a ambas coaliciones: ARS 5.400.000 repartidos entre JxC y FdT.',
  },
  {
    id: pid('org-mercier'),
    name: 'Mercier International SA',
    slug: 'mercier-international',
    type: 'offshore',
    jurisdiction: 'panama',
    description:
      'Offshore panamena con acciones al portador revelada en Panama Papers. Grindetti tenia poder para operar la cuenta suiza (Clariden Leu) mientras era Secretario de Hacienda de CABA.',
  },
  {
    id: pid('org-congreso'),
    name: 'Congreso de la Nacion',
    slug: 'congreso-nacion',
    type: 'gobierno',
    jurisdiction: 'argentina',
    description:
      'Poder Legislativo argentino.',
  },
  {
    id: pid('org-afip'),
    name: 'AFIP',
    slug: 'afip',
    type: 'gobierno',
    jurisdiction: 'argentina',
    description:
      'Administracion Federal de Ingresos Publicos. Autoridad encargada de perseguir la evasion fiscal.',
  },
]

// ---------------------------------------------------------------------------
// Data - Events
// ---------------------------------------------------------------------------

const EVENTS = [
  {
    id: pid('event-ley-bases-vote'),
    date: '2024-06-12T00:00:00Z',
    title: 'Votacion de la Ley de Bases en el Senado',
    description:
      '36 votos afirmativos contra 36 negativos. Vicepresidenta Villarruel desempato. Senadores con cargos en directorios votaron 42 a favor y 7 en contra.',
    category: 'legislativo',
    sources: 'Como Voto, Senado de la Nacion',
  },
  {
    id: pid('event-kueider-arrest'),
    date: '2024-12-01T00:00:00Z',
    title: 'Detencion de Kueider en frontera con Paraguay',
    description:
      'Kueider detenido con USD 211.000 en efectivo no declarado intentando cruzar a Paraguay.',
    category: 'judicial',
    sources: 'Infobae, LA NACION',
  },
  {
    id: pid('event-kueider-expulsion'),
    date: '2025-03-01T00:00:00Z',
    title: 'Expulsion de Kueider del Senado',
    description:
      '7 testaferros arrestados. En allanamientos, videos de Kueider manipulando fajos de billetes.',
    category: 'judicial',
    sources: 'LA NACION, Infobae',
  },
  {
    id: pid('event-correo-debt-reduction'),
    date: '2016-06-01T00:00:00Z',
    title: 'Reduccion del 98,82% de deuda del Correo Argentino',
    description:
      'Gobierno de Macri acepta acuerdo con SOCMA reduciendo ARS 70.000 millones (ajustados por inflacion) de deuda. Fiscal Boquin dictamino "equivalente a condonacion."',
    category: 'judicial',
    sources: 'Chequeado, Wikipedia Causa Correo Argentino',
  },
  {
    id: pid('event-blanqueo-fiscal'),
    date: '2016-01-01T00:00:00Z',
    title: 'Ley de blanqueo fiscal impulsada por gobierno Macri',
    description:
      'Integrantes de SOCMA aprovecharon la ley. Total declarado por circulo SOCMA: mas de ARS 900 millones en activos previamente ocultos.',
    category: 'legislativo',
    sources: 'Perfil',
  },
  {
    id: pid('event-mariano-denuncia'),
    date: '2024-08-01T00:00:00Z',
    title: 'Mariano Macri denuncia a SOCMA',
    description:
      'Mariano Macri presenta denuncias penales contra SOCMA nombrando a Gianfranco, Florencia y al CEO Leonardo Maffioli. Cargos: administracion fraudulenta, falsificacion, evasion fiscal, lavado.',
    category: 'judicial',
    sources: 'Infobae',
  },
  {
    id: pid('event-ausol-sale'),
    date: '2018-01-01T00:00:00Z',
    title: 'Venta de acciones AUSOL con prima del 400%',
    description:
      'Renegociacion de concesion AUSOL durante presidencia de Macri. Macri vendio acciones a Natal Inversiones con prima del 400%. Fiscales imputaron a exfuncionarios.',
    category: 'judicial',
    sources: 'Pagina/12',
  },
  {
    id: pid('event-camano-tt41'),
    date: '2016-06-23T00:00:00Z',
    title: 'Constitucion de TT 41 CORP en BVI',
    description:
      'Entidad offshore constituida durante el mandato de Camaño como Diputada (2014-2018). Pandora Papers / Trident Trust.',
    category: 'offshore',
    sources: 'ICIJ Pandora Papers',
  },
  {
    id: pid('event-grindetti-imputacion'),
    date: '2016-06-29T00:00:00Z',
    title: 'Imputacion de Grindetti por enriquecimiento ilicito',
    description:
      'Fiscal federal Patricio Evers imputo a Grindetti por Mercier International SA (Panama Papers). Grindetti nunca declaro la offshore en sus declaraciones juradas.',
    category: 'judicial',
    sources: 'LA NACION, Pagina/12, ICIJ',
  },
]

// ---------------------------------------------------------------------------
// Data - MoneyFlows
// ---------------------------------------------------------------------------

const MONEY_FLOWS = [
  {
    id: pid('flow-jxc-campaign-2019'),
    from_label: 'Donantes corporativos',
    to_label: 'Juntos por el Cambio',
    amount_ars: 46_900_000,
    description: '75 donaciones de campana en elecciones 2019. Promedio casi 10x mayor que FdT.',
    date: '2019-10-01',
    source: 'CNE Aportantes',
    source_url: 'https://aportantes.electoral.gob.ar',
  },
  {
    id: pid('flow-fdt-campaign-2019'),
    from_label: 'Base fragmentada de donantes',
    to_label: 'Frente de Todos',
    amount_ars: 29_200_000,
    description: '459 donaciones de campana en elecciones 2019.',
    date: '2019-10-01',
    source: 'CNE Aportantes',
    source_url: 'https://aportantes.electoral.gob.ar',
  },
  {
    id: pid('flow-aluar-dual'),
    from_label: 'Aluar Aluminio Argentino',
    to_label: 'JxC + FdT',
    amount_ars: 5_400_000,
    description: 'Unico gran donante que aposto a ambas coaliciones. Depende de subsidios energeticos y protecciones arancelarias.',
    date: '2019-10-01',
    source: 'CNE Aportantes',
    source_url: 'https://aportantes.electoral.gob.ar',
  },
  {
    id: pid('flow-unicenter-jxc'),
    from_label: 'Unicenter SA',
    to_label: 'Juntos por el Cambio',
    amount_ars: 8_500_000,
    description: 'Mayor donacion individual en elecciones 2019.',
    date: '2019-10-01',
    source: 'CNE Aportantes',
    source_url: 'https://aportantes.electoral.gob.ar',
  },
  {
    id: pid('flow-socma-blanqueo'),
    from_label: 'Circulo SOCMA',
    to_label: 'Blanqueo fiscal',
    amount_ars: 900_000_000,
    description: 'Total declarado por Gianfranco Macri (ARS 622M), Maffioli (ARS 76M), Amasanti (ARS 93M), Composto (ARS 68M), Libedinsky (ARS 61,9M).',
    date: '2016-01-01',
    source: 'Perfil',
    source_url: 'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml',
  },
  {
    id: pid('flow-kueider-cash'),
    from_label: 'Origen desconocido',
    to_label: 'Edgardo Kueider',
    amount_ars: 0,
    description: 'USD 211.000 en efectivo no declarado interceptados en frontera con Paraguay. Departamentos de lujo adquiridos via empresas fantasma.',
    date: '2024-12-01',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2024/12/',
  },
  {
    id: pid('flow-lcg-congreso'),
    from_label: 'Oficina de Presupuesto del Congreso',
    to_label: 'LCG SA (Lousteau)',
    amount_ars: 1_690_000,
    description: 'Facturacion de la consultora de Lousteau al Congreso (2020-2022) durante su mandato como senador.',
    date: '2022-01-01',
    source: 'iProfesional',
    source_url: 'https://www.iprofesional.com/',
  },
]

// ---------------------------------------------------------------------------
// Data - Claims
// ---------------------------------------------------------------------------

const CLAIMS = [
  {
    id: pid('claim-camano-offshore'),
    claim: 'Camaño constituyo offshore TT 41 CORP (BVI) durante su mandato legislativo mientras votaba leyes financieras',
    status: 'probable',
    tier: 'silver',
    source: 'ICIJ Pandora Papers',
    source_url: 'https://offshoreleaks.icij.org',
    detail:
      'Coincidencia exacta de nombre, consistente con patron Trident Trust/Argentina. 35 ausencias en votaciones de Presupuesto, 19 en Impuesto a las Ganancias. Patrimonio crecio 14x en 10 años. Requiere verificacion contra DDJJ.',
  },
  {
    id: pid('claim-ibanez-offshore'),
    claim: 'Ibañez es titular de PELMOND COMPANY LTD (BVI, activa) mientras ejerce como diputada nacional',
    status: 'alta-confianza',
    tier: 'silver',
    source: 'ICIJ Offshore Leaks',
    source_url: 'https://offshoreleaks.icij.org/nodes/10158328',
    detail:
      'Confirmada en base publica del ICIJ. Si PELMOND no figura en sus DDJJ ante la Oficina Anticorrupcion, hay presunta omision dolosa bajo Ley 25.188.',
  },
  {
    id: pid('claim-correo-condonacion'),
    claim: 'Gobierno de Macri condono 98,82% de la deuda del Correo Argentino, propiedad de su familia (SOCMA)',
    status: 'confirmado',
    tier: 'gold',
    source: 'Causa judicial, Chequeado',
    source_url: 'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/',
    detail:
      'Documentado judicialmente. Fiscal Boquin: "equivalente a una condonacion" y "abusiva." Fiscal Zoni imputo a Macri y Aguad. En 2024, la familia aun no habia pagado.',
  },
  {
    id: pid('claim-socma-blanqueo'),
    claim: 'Integrantes de SOCMA blanquearon ARS 900M+ aprovechando ley impulsada por el gobierno de la misma familia',
    status: 'confirmado',
    tier: 'gold',
    source: 'Perfil',
    source_url: 'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml',
    detail:
      'Montos documentados en investigaciones de Perfil. Gianfranco tambien declaro fideicomiso de Alicia Blanco Villegas (madre de Mauricio), presuntamente violando prohibicion de la ley.',
  },
  {
    id: pid('claim-lousteau-incompatible'),
    claim: 'Lousteau cobro $1.690.000 del Congreso a traves de su consultora mientras ejercia como senador',
    status: 'confirmado',
    tier: 'gold',
    source: 'iProfesional',
    source_url: 'https://www.iprofesional.com/',
    detail:
      'Cargos penales presentados por negociaciones incompatibles con la funcion publica.',
  },
  {
    id: pid('claim-ferrari-afip-offshore'),
    claim: 'Agente de AFIP aparece como oficial de entidad offshore en Panama Papers',
    status: 'no-verificado',
    tier: 'bronze',
    source: 'Panama Papers / ICIJ',
    source_url: 'https://offshoreleaks.icij.org',
    detail:
      'Coincidencia de nombre. Requiere verificacion de identidad por CUIT o DNI. Tambien aparece Reale Jose Maria, Fiscalizador Principal.',
  },
  {
    id: pid('claim-grindetti-mercier'),
    claim: 'Grindetti tenia poder sobre cuenta suiza de Mercier International SA (offshore) mientras era Secretario de Hacienda de CABA',
    status: 'confirmado',
    tier: 'gold',
    source: 'ICIJ, LA NACION, Pagina/12',
    source_url: 'https://offshoreleaks.icij.org/stories/nestor-grindetti',
    detail:
      'Imputado por enriquecimiento ilicito en 2016. Mercier constituida por Mossack Fonseca, cuenta en Clariden Leu. Nunca declarada en DDJJ.',
  },
  {
    id: pid('claim-contratista-donante'),
    claim: 'Contratista del Estado (Rodriguez) realizo donaciones de campana en presunta violacion de Ley 26.215 Art. 15',
    status: 'probable',
    tier: 'silver',
    source: 'Cruce CNE + datos.gob.ar',
    source_url: 'https://datos.gob.ar',
    detail:
      '4 contratos (2018-2020) y donacion de campana. Si es la misma persona, viola la prohibicion expresa de la ley de financiamiento electoral.',
  },
]

// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------

async function seed(): Promise<void> {
  const session = getDriver().session()

  try {
    console.log('Seeding Caso Finanzas Politicas persons...')
    for (const person of PERSONS) {
      await session.run(
        `MERGE (p:Person { id: $id })
         SET p.name = $name,
             p.slug = $slug,
             p.role = $role,
             p.party = $party,
             p.datasets = $datasets,
             p.description = $description,
             p.caso_slug = $casoSlug`,
        { ...person, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${PERSONS.length} persons seeded`)

    console.log('Seeding organizations...')
    for (const org of ORGANIZATIONS) {
      await session.run(
        `MERGE (o:Organization { id: $id })
         SET o.name = $name,
             o.slug = $slug,
             o.type = $type,
             o.jurisdiction = $jurisdiction,
             o.description = $description,
             o.caso_slug = $casoSlug`,
        { ...org, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${ORGANIZATIONS.length} organizations seeded`)

    console.log('Seeding events...')
    for (const event of EVENTS) {
      await session.run(
        `MERGE (e:Event { id: $id })
         SET e.date = $date,
             e.title = $title,
             e.description = $description,
             e.category = $category,
             e.sources = $sources,
             e.caso_slug = $casoSlug`,
        { ...event, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${EVENTS.length} events seeded`)

    console.log('Seeding money flows...')
    for (const flow of MONEY_FLOWS) {
      await session.run(
        `MERGE (m:MoneyFlow { id: $id })
         SET m.from_label = $from_label,
             m.to_label = $to_label,
             m.amount_ars = $amount_ars,
             m.description = $description,
             m.date = $date,
             m.source = $source,
             m.source_url = $source_url,
             m.caso_slug = $casoSlug`,
        { ...flow, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${MONEY_FLOWS.length} money flows seeded`)

    console.log('Seeding claims...')
    for (const claim of CLAIMS) {
      await session.run(
        `MERGE (c:Claim { id: $id })
         SET c.claim = $claim,
             c.status = $status,
             c.tier = $tier,
             c.source = $source,
             c.source_url = $source_url,
             c.detail = $detail,
             c.caso_slug = $casoSlug`,
        { ...claim, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${CLAIMS.length} claims seeded`)

    // -----------------------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------------------

    console.log('Seeding relationships...')

    // OFFICER_OF: Person → Organization
    const officerships: Array<[string, string]> = [
      // PENSAR ARGENTINA members
      [pid('person-macri-mauricio'), pid('org-pensar-argentina')],
      [pid('person-michetti'), pid('org-pensar-argentina')],
      [pid('person-alonso'), pid('org-pensar-argentina')],
      [pid('person-bullrich'), pid('org-pensar-argentina')],
      [pid('person-sturzenegger'), pid('org-pensar-argentina')],
      [pid('person-marcos-pena'), pid('org-pensar-argentina')],
      [pid('person-rodriguez-larreta'), pid('org-pensar-argentina')],
      [pid('person-tagliaferri'), pid('org-pensar-argentina')],
      [pid('person-nicolas-caputo'), pid('org-pensar-argentina')],
      // SOCMA / corporate
      [pid('person-macri-mauricio'), pid('org-socma')],
      [pid('person-gianfranco-macri'), pid('org-socma')],
      [pid('person-grindetti'), pid('org-correo-argentino')],
      [pid('person-grindetti'), pid('org-geometales')],
      [pid('person-macri-mauricio'), pid('org-geometales')],
      [pid('person-macri-mauricio'), pid('org-ausol')],
      // Offshore
      [pid('person-camano'), pid('org-tt41-corp')],
      [pid('person-ibanez'), pid('org-pelmond')],
      [pid('person-gianfranco-macri'), pid('org-bf-corporation')],
      [pid('person-grindetti'), pid('org-mercier')],
      [pid('person-cordero'), pid('org-bethan-investments')],
      // Kueider shell companies
      [pid('person-kueider'), pid('org-betail')],
      [pid('person-kueider'), pid('org-edekom')],
      // Lousteau consultancy
      [pid('person-lousteau'), pid('org-lcg')],
      // Barrionuevo-Camaño
      [pid('person-barrionuevo'), pid('org-bellota')],
      [pid('person-camano'), pid('org-bellota')],
      // Ferrari → AFIP
      [pid('person-ferrari'), pid('org-afip')],
    ]
    for (const [personId, orgId] of officerships) {
      await session.run(
        `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
         MATCH (o:Organization { id: $orgId, caso_slug: $casoSlug })
         MERGE (p)-[:OFFICER_OF]->(o)`,
        { personId, orgId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // SUBJECT_OF: Person → Claim
    const subjects: Array<[string, string]> = [
      [pid('person-camano'), pid('claim-camano-offshore')],
      [pid('person-ibanez'), pid('claim-ibanez-offshore')],
      [pid('person-macri-mauricio'), pid('claim-correo-condonacion')],
      [pid('person-macri-mauricio'), pid('claim-socma-blanqueo')],
      [pid('person-gianfranco-macri'), pid('claim-socma-blanqueo')],
      [pid('person-lousteau'), pid('claim-lousteau-incompatible')],
      [pid('person-ferrari'), pid('claim-ferrari-afip-offshore')],
      [pid('person-grindetti'), pid('claim-grindetti-mercier')],
      [pid('person-juan-pablo-rodriguez'), pid('claim-contratista-donante')],
    ]
    for (const [personId, claimId] of subjects) {
      await session.run(
        `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
         MATCH (c:Claim { id: $claimId, caso_slug: $casoSlug })
         MERGE (p)-[:SUBJECT_OF]->(c)`,
        { personId, claimId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // INVOLVED_IN: Person → Event
    const involvements: Array<[string, string]> = [
      [pid('person-kueider'), pid('event-ley-bases-vote')],
      [pid('person-lousteau'), pid('event-ley-bases-vote')],
      [pid('person-tagliaferri'), pid('event-ley-bases-vote')],
      [pid('person-kueider'), pid('event-kueider-arrest')],
      [pid('person-kueider'), pid('event-kueider-expulsion')],
      [pid('person-macri-mauricio'), pid('event-correo-debt-reduction')],
      [pid('person-macri-mauricio'), pid('event-blanqueo-fiscal')],
      [pid('person-gianfranco-macri'), pid('event-blanqueo-fiscal')],
      [pid('person-macri-mauricio'), pid('event-ausol-sale')],
      [pid('person-camano'), pid('event-camano-tt41')],
      [pid('person-grindetti'), pid('event-grindetti-imputacion')],
    ]
    for (const [personId, eventId] of involvements) {
      await session.run(
        `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
         MATCH (e:Event { id: $eventId, caso_slug: $casoSlug })
         MERGE (p)-[:INVOLVED_IN]->(e)`,
        { personId, eventId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // SOURCE_OF: MoneyFlow → Person/Organization
    const sources: Array<{ flowId: string; targetId: string; targetLabel: string }> = [
      { flowId: pid('flow-kueider-cash'), targetId: pid('person-kueider'), targetLabel: 'Person' },
      { flowId: pid('flow-lcg-congreso'), targetId: pid('org-congreso'), targetLabel: 'Organization' },
      { flowId: pid('flow-socma-blanqueo'), targetId: pid('org-socma'), targetLabel: 'Organization' },
      { flowId: pid('flow-aluar-dual'), targetId: pid('org-aluar'), targetLabel: 'Organization' },
    ]
    for (const { flowId, targetId, targetLabel } of sources) {
      await session.run(
        `MATCH (m:MoneyFlow { id: $flowId, caso_slug: $casoSlug })
         MATCH (t:${targetLabel} { id: $targetId, caso_slug: $casoSlug })
         MERGE (m)-[:SOURCE_OF]->(t)`,
        { flowId, targetId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // DESTINATION_OF: MoneyFlow → Person/Organization
    const destinations: Array<{ flowId: string; targetId: string; targetLabel: string }> = [
      { flowId: pid('flow-lcg-congreso'), targetId: pid('org-lcg'), targetLabel: 'Organization' },
      { flowId: pid('flow-kueider-cash'), targetId: pid('person-kueider'), targetLabel: 'Person' },
    ]
    for (const { flowId, targetId, targetLabel } of destinations) {
      await session.run(
        `MATCH (m:MoneyFlow { id: $flowId, caso_slug: $casoSlug })
         MATCH (t:${targetLabel} { id: $targetId, caso_slug: $casoSlug })
         MERGE (m)-[:DESTINATION_OF]->(t)`,
        { flowId, targetId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    console.log('  Relationships seeded')
    console.log('\nCaso Finanzas Politicas seed complete.')
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Starting Caso Finanzas Politicas data seed...\n')
  await seed()
  await closeDriver()
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
