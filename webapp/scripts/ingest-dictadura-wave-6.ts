/**
 * Wave 6: Nunca Más + Wikidata
 *
 * Creates DictaduraDocumento nodes for key Nunca Más testimonies,
 * DictaduraArchivo nodes for major archival collections, and
 * cross-references Wikidata SPARQL results for enforced disappearance
 * victims against the existing graph.
 *
 * Relationships created:
 *   - PRESERVADO_POR (documento → archivo)
 *   - TESTIFICA_SOBRE (testigo → evento/lugar)
 *   - DECLARA_EN (testigo → documento)
 *
 * Confidence tier: bronze (raw archival/Wikidata metadata)
 * Ingestion wave: 6
 * Source: nunca-mas / wikidata
 *
 * Run with: npx tsx scripts/ingest-dictadura-wave-6.ts
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 6
const SOURCE_NM = 'nunca-mas'
const SOURCE_WD = 'wikidata'

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

// ---------------------------------------------------------------------------
// DictaduraArchivo seed data — major archival collections
// ---------------------------------------------------------------------------

interface ArchivoSeed {
  id: string
  name: string
  slug: string
  institution: string
  location: string
  description: string
  url?: string
}

const ARCHIVOS: ArchivoSeed[] = [
  {
    id: 'dict-archivo-memoria-abierta',
    name: 'Archivo Oral de Memoria Abierta',
    slug: 'archivo-oral-memoria-abierta',
    institution: 'Memoria Abierta',
    location: 'Buenos Aires',
    description: 'Archivo de testimonios orales en video de sobrevivientes, familiares y testigos del terrorismo de Estado. Más de 900 testimonios filmados.',
    url: 'https://memoriaabierta.org.ar',
  },
  {
    id: 'dict-archivo-anm',
    name: 'Archivo Nacional de la Memoria',
    slug: 'archivo-nacional-memoria',
    institution: 'Archivo Nacional de la Memoria (ANM)',
    location: 'Ex-ESMA, Buenos Aires',
    description: 'Archivo estatal creado por decreto 1259/2003 con sede en el ex-centro clandestino ESMA. Resguarda documentación sobre terrorismo de Estado, incluyendo el acervo CONADEP original.',
    url: 'https://www.argentina.gob.ar/derechoshumanos/anm',
  },
  {
    id: 'dict-archivo-ruvte',
    name: 'Registro Unificado de Víctimas del Terrorismo de Estado',
    slug: 'registro-unificado-victimas-terrorismo-estado',
    institution: 'Secretaría de Derechos Humanos de la Nación',
    location: 'Buenos Aires',
    description: 'Registro oficial que unifica listados de víctimas de desaparición forzada, asesinatos y detenciones ilegales durante el terrorismo de Estado 1974-1983. Contiene ~8.753 casos documentados.',
    url: 'https://www.argentina.gob.ar/derechoshumanos/ruvte',
  },
  {
    id: 'dict-archivo-conadep',
    name: 'Archivo CONADEP',
    slug: 'archivo-conadep',
    institution: 'Comisión Nacional sobre la Desaparición de Personas',
    location: 'Buenos Aires',
    description: 'Documentación reunida por la CONADEP (1983-1984) bajo la presidencia de Ernesto Sábato. Incluye ~7.380 legajos de denuncias, testimonios y pruebas que conformaron la base del informe Nunca Más.',
  },
  {
    id: 'dict-archivo-abuelas',
    name: 'Archivo Biográfico Familiar de Abuelas',
    slug: 'archivo-biografico-abuelas',
    institution: 'Abuelas de Plaza de Mayo',
    location: 'Buenos Aires',
    description: 'Archivo con datos biográficos, fotografías y testimonios de las familias de nietos/as apropiados/as durante la dictadura. Base documental para la búsqueda e identificación genética.',
    url: 'https://abuelas.org.ar',
  },
  {
    id: 'dict-archivo-cels',
    name: 'Archivo del Centro de Estudios Legales y Sociales',
    slug: 'archivo-cels',
    institution: 'Centro de Estudios Legales y Sociales (CELS)',
    location: 'Buenos Aires',
    description: 'Documentación jurídica, habeas corpus, denuncias ante organismos internacionales y seguimiento de causas judiciales por crímenes de lesa humanidad desde 1979.',
    url: 'https://www.cels.org.ar',
  },
  {
    id: 'dict-archivo-dipba',
    name: 'Archivo de la DIPBA',
    slug: 'archivo-dipba',
    institution: 'Comisión Provincial por la Memoria',
    location: 'La Plata, Buenos Aires',
    description: 'Archivo de la ex-Dirección de Inteligencia de la Policía de la Provincia de Buenos Aires. Contiene ~4 millones de folios de inteligencia sobre personas, organizaciones y actividades político-sociales.',
    url: 'https://www.comisionporlamemoria.org',
  },
  {
    id: 'dict-archivo-madres',
    name: 'Archivo Histórico Madres de Plaza de Mayo',
    slug: 'archivo-historico-madres',
    institution: 'Madres de Plaza de Mayo — Línea Fundadora',
    location: 'Buenos Aires',
    description: 'Documentación histórica del movimiento de Madres: actas, solicitadas, correspondencia internacional, y registro de las rondas de los jueves desde 1977.',
  },
  {
    id: 'dict-archivo-parque-memoria',
    name: 'Centro de Documentación del Parque de la Memoria',
    slug: 'centro-documentacion-parque-memoria',
    institution: 'Parque de la Memoria — Monumento a las Víctimas del Terrorismo de Estado',
    location: 'Costanera Norte, Buenos Aires',
    description: 'Centro de documentación del monumento memorial con ~8.753 nombres inscriptos. Resguarda material artístico, audiovisual y documental relacionado con memoria y DDHH.',
    url: 'https://parquedelamemoria.org.ar',
  },
  {
    id: 'dict-archivo-familiares',
    name: 'Archivo de Familiares de Desaparecidos y Detenidos por Razones Políticas',
    slug: 'archivo-familiares-desaparecidos',
    institution: 'Familiares de Desaparecidos y Detenidos por Razones Políticas',
    location: 'Buenos Aires',
    description: 'Documentación del organismo de DDHH fundado en 1976. Incluye denuncias tempranas, habeas corpus colectivos y registros de víctimas compilados durante la dictadura.',
  },
]

// ---------------------------------------------------------------------------
// DictaduraDocumento seed data — Nunca Más testimonies
// ---------------------------------------------------------------------------

interface TestimonioSeed {
  id: string
  title: string
  slug: string
  doc_type: string
  chapter: string
  date?: string
  survivor_name?: string
  ccd_or_location?: string
  description: string
  archivo_ids: string[]
}

const TESTIMONIOS: TestimonioSeed[] = [
  // --- Capítulo I: La acción represiva ---
  {
    id: 'nm-test-001',
    title: 'Testimonio de Víctor Basterra — ESMA',
    slug: 'testimonio-victor-basterra-esma',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Víctor Basterra',
    ccd_or_location: 'ESMA',
    description: 'Testimonio clave del sobreviviente detenido en la ESMA entre 1979-1983. Basterra logró sustraer fotografías de detenidos-desaparecidos que sirvieron como prueba fundamental en los juicios.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  {
    id: 'nm-test-002',
    title: 'Testimonio de Lila Pastoriza — ESMA',
    slug: 'testimonio-lila-pastoriza-esma',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Lila Pastoriza',
    ccd_or_location: 'ESMA',
    description: 'Testimonio de periodista secuestrada y detenida en la ESMA. Describe el funcionamiento del grupo de tareas 3.3.2, la estructura interna del CCD y los vuelos de la muerte.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-003',
    title: 'Testimonio de Graciela Daleo — ESMA',
    slug: 'testimonio-graciela-daleo-esma',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Graciela Daleo',
    ccd_or_location: 'ESMA',
    description: 'Testimonio de militante detenida en la ESMA. Describe el trabajo esclavo impuesto por el GT 3.3.2 y la apropiación de bienes de los detenidos.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-004',
    title: 'Testimonio de Ana María Careaga — Club Atlético',
    slug: 'testimonio-ana-maria-careaga-club-atletico',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Ana María Careaga',
    ccd_or_location: 'Club Atlético',
    description: 'Testimonio de detenida embarazada en el CCD Club Atlético. Su madre, Esther Ballestrino de Careaga, fue una de las fundadoras de Madres de Plaza de Mayo desaparecida en diciembre de 1977.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  {
    id: 'nm-test-005',
    title: 'Testimonio de Mario Villani — Circuito ABO',
    slug: 'testimonio-mario-villani-circuito-abo',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Mario Villani',
    ccd_or_location: 'Atlético-Banco-Olimpo',
    description: 'Testimonio del sobreviviente que pasó por los tres centros clandestinos del circuito ABO (Atlético, Banco y Olimpo). Su declaración fue clave para la reconstrucción del circuito represivo del I Cuerpo de Ejército.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-006',
    title: 'Testimonio de Adriana Calvo — CCD Pozo de Banfield',
    slug: 'testimonio-adriana-calvo-pozo-banfield',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Adriana Calvo',
    ccd_or_location: 'Pozo de Banfield',
    description: 'Testimonio de detenida en el Pozo de Banfield. Calvo parió en cautiverio y su hija fue apropiada. Su testimonio fue fundamental para documentar la maternidad clandestina.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-abuelas'],
  },
  {
    id: 'nm-test-007',
    title: 'Testimonio de Nilda Goretta — La Perla, Córdoba',
    slug: 'testimonio-nilda-goretta-la-perla',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Nilda Goretta',
    ccd_or_location: 'La Perla',
    description: 'Testimonio de sobreviviente del CCD La Perla en Córdoba, operado por el III Cuerpo de Ejército bajo el mando de Luciano Benjamín Menéndez. Describe torturas y condiciones de cautiverio.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-008',
    title: 'Testimonio de Julio López — Arana, La Plata',
    slug: 'testimonio-julio-lopez-arana',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Jorge Julio López',
    ccd_or_location: 'Arana',
    description: 'Testimonio del albañil secuestrado en 1976. López declaró en el juicio contra Etchecolatz en 2006 y desapareció el día antes de la sentencia. Su segunda desaparición sigue impune.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  // --- Capítulo II: Víctimas ---
  {
    id: 'nm-test-009',
    title: 'Testimonio de Pablo Díaz — La Noche de los Lápices',
    slug: 'testimonio-pablo-diaz-noche-lapices',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    survivor_name: 'Pablo Díaz',
    ccd_or_location: 'Pozo de Arana / Pozo de Banfield',
    description: 'Testimonio del único sobreviviente de La Noche de los Lápices (septiembre 1976), operación de la policía bonaerense que secuestró a estudiantes secundarios en La Plata.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-010',
    title: 'Testimonio sobre la desaparición de las monjas francesas',
    slug: 'testimonio-desaparicion-monjas-francesas',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    ccd_or_location: 'ESMA',
    description: 'Testimonios múltiples sobre la infiltración de Alfredo Astiz en el grupo de la Iglesia Santa Cruz y el secuestro de las monjas francesas Alice Domon y Léonie Duquet en diciembre de 1977.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-cels'],
  },
  {
    id: 'nm-test-011',
    title: 'Testimonio de Héctor Oesterheld — caso de desaparición',
    slug: 'testimonio-hector-oesterheld-desaparicion',
    doc_type: 'legajo_denuncia',
    chapter: 'Capítulo II — Víctimas',
    description: 'Legajo sobre la desaparición del historietista Héctor Germán Oesterheld, autor de El Eternauta. Secuestrado en 1977, sus cuatro hijas también fueron desaparecidas.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-012',
    title: 'Testimonio de Azucena Villaflor — fundadora Madres',
    slug: 'testimonio-azucena-villaflor-fundadora',
    doc_type: 'legajo_denuncia',
    chapter: 'Capítulo II — Víctimas',
    description: 'Legajo sobre la desaparición de Azucena Villaflor de De Vincenti, fundadora de Madres de Plaza de Mayo, secuestrada en diciembre de 1977 junto con otras madres y las monjas francesas.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-madres'],
  },
  // --- Capítulo III: El poder judicial durante la dictadura ---
  {
    id: 'nm-test-013',
    title: 'Denuncia ante el Poder Judicial: habeas corpus rechazados',
    slug: 'denuncia-habeas-corpus-rechazados',
    doc_type: 'documento_judicial',
    chapter: 'Capítulo III — El poder judicial durante la dictadura',
    description: 'Compilación de casos de habeas corpus rechazados sistemáticamente por jueces federales durante la dictadura. Documenta la complicidad del poder judicial con el aparato represivo.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-cels'],
  },
  // --- Capítulo IV: Creación e investigación de la CONADEP ---
  {
    id: 'nm-test-014',
    title: 'Actas de creación de la CONADEP — Decreto 187/83',
    slug: 'actas-creacion-conadep-decreto-187',
    doc_type: 'documento_oficial',
    chapter: 'Capítulo IV — Creación de la CONADEP',
    date: '1983-12-15',
    description: 'Decreto 187/83 firmado por el presidente Alfonsín creando la Comisión Nacional sobre la Desaparición de Personas. Define mandato, composición y plazo de la comisión.',
    archivo_ids: ['dict-archivo-anm'],
  },
  {
    id: 'nm-test-015',
    title: 'Prólogo de Ernesto Sábato al Nunca Más',
    slug: 'prologo-ernesto-sabato-nunca-mas',
    doc_type: 'documento_oficial',
    chapter: 'Prólogo',
    date: '1984-09-20',
    description: 'Prólogo escrito por Ernesto Sábato para el informe Nunca Más. Texto fundacional que establece el marco interpretativo de la investigación de la CONADEP.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  // --- Capítulo V: El marco legal de la represión ---
  {
    id: 'nm-test-016',
    title: 'Directivas secretas del Proceso de Reorganización Nacional',
    slug: 'directivas-secretas-proceso-reorganizacion',
    doc_type: 'documento_militar',
    chapter: 'Capítulo V — El marco legal de la represión',
    date: '1976-03-24',
    description: 'Documentación sobre las directivas secretas emitidas por la Junta Militar que establecieron el marco normativo del terrorismo de Estado, incluyendo la Directiva 404/75 y la Orden de Batalla 24 de marzo.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  // --- Testimonios sobre centros clandestinos específicos ---
  {
    id: 'nm-test-017',
    title: 'Testimonios del Vesubio — CCD Zona Sur',
    slug: 'testimonios-vesubio-zona-sur',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'El Vesubio',
    description: 'Conjunto de testimonios de sobrevivientes del CCD El Vesubio, operado por el Ejército en la zona sur del Gran Buenos Aires. Describen la estructura del campo y los métodos de tortura.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-018',
    title: 'Testimonios de Campo de Mayo — CCD El Campito',
    slug: 'testimonios-campo-mayo-el-campito',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'Campo de Mayo',
    description: 'Testimonios sobre el centro clandestino El Campito dentro de la guarnición militar Campo de Mayo. Incluye relatos sobre la maternidad clandestina donde nacieron hijos de detenidas.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-abuelas'],
  },
  {
    id: 'nm-test-019',
    title: 'Testimonios de Automotores Orletti — Operación Cóndor',
    slug: 'testimonios-automotores-orletti-condor',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'Automotores Orletti',
    description: 'Testimonios sobre el CCD Automotores Orletti, centro operativo del Plan Cóndor en Buenos Aires. Funcionó como base para la coordinación represiva con Uruguay, Chile, Bolivia y Paraguay.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-cels'],
  },
  {
    id: 'nm-test-020',
    title: 'Testimonios de La Cacha — CCD La Plata',
    slug: 'testimonios-la-cacha-la-plata',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'La Cacha',
    description: 'Testimonios sobre el CCD La Cacha en La Plata, dependiente del Servicio Penitenciario y el Batallón 601 de Inteligencia del Ejército.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-021',
    title: 'Testimonios del Garage Azopardo — CCD Policía Federal',
    slug: 'testimonios-garage-azopardo',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'Garage Azopardo',
    description: 'Testimonios sobre el CCD Garage Azopardo, operado por la Policía Federal Argentina en el centro de Buenos Aires.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-022',
    title: 'Testimonios de Mansión Seré — CCD Fuerza Aérea',
    slug: 'testimonios-mansion-sere',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'Mansión Seré',
    description: 'Testimonios sobre la Mansión Seré (Atila), CCD operado por la Fuerza Aérea en Morón. Un grupo de prisioneros logró escapar en 1978, lo que motivó la demolición del edificio.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  // --- Testimonios temáticos ---
  {
    id: 'nm-test-023',
    title: 'Testimonios sobre robo de bebés en cautiverio',
    slug: 'testimonios-robo-bebes-cautiverio',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    description: 'Compilación de testimonios sobre el plan sistemático de apropiación de menores nacidos en cautiverio. Documenta al menos 500 casos estimados, de los cuales Abuelas ha restituido más de 130 identidades.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-abuelas', 'dict-archivo-anm'],
  },
  {
    id: 'nm-test-024',
    title: 'Testimonios sobre los vuelos de la muerte',
    slug: 'testimonios-vuelos-muerte',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'ESMA',
    description: 'Testimonios y evidencia sobre los llamados "vuelos de la muerte": traslados de detenidos sedados que eran arrojados al Río de la Plata o al mar desde aviones militares.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm', 'dict-archivo-cels'],
  },
  {
    id: 'nm-test-025',
    title: 'Testimonios sobre la represión a trabajadores — Noche de las Corbatas',
    slug: 'testimonios-noche-corbatas-mar-del-plata',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    ccd_or_location: 'Base Aérea Mar del Plata',
    description: 'Testimonios sobre la Noche de las Corbatas (julio 1977): secuestro de abogados laboralistas en Mar del Plata que defendían presos políticos y gremialistas.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-026',
    title: 'Testimonios sobre represión en Tucumán — Operativo Independencia',
    slug: 'testimonios-represion-tucuman-operativo-independencia',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'Escuelita de Famaillá',
    description: 'Testimonios sobre la represión en Tucumán durante el Operativo Independencia (1975-1977), considerado el ensayo del terrorismo de Estado previo al golpe. Describe el CCD Escuelita de Famaillá.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-027',
    title: 'Testimonios sobre la Masacre de Trelew',
    slug: 'testimonios-masacre-trelew',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    date: '1972-08-22',
    ccd_or_location: 'Base Almirante Zar, Trelew',
    description: 'Testimonios de sobrevivientes de la masacre de 16 presos políticos en la Base Almirante Zar de Trelew el 22 de agosto de 1972. Precedente clave del terrorismo de Estado.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-028',
    title: 'Testimonio de Enrique Shore — CCD Quinta de Funes',
    slug: 'testimonio-enrique-shore-quinta-funes',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Enrique Shore',
    ccd_or_location: 'Quinta de Funes',
    description: 'Testimonio sobre el CCD Quinta de Funes en Santa Fe, operado por el II Cuerpo de Ejército. Describe el funcionamiento del centro y las ejecuciones clandestinas.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-029',
    title: 'Testimonio de Isabel Cerruti — CCD El Olimpo',
    slug: 'testimonio-isabel-cerruti-olimpo',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Isabel Cerruti',
    ccd_or_location: 'El Olimpo',
    description: 'Testimonio de sobreviviente del CCD El Olimpo, último eslabón del circuito represivo ABO (Atlético-Banco-Olimpo) en Buenos Aires, bajo el mando del Primer Cuerpo de Ejército.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-030',
    title: 'Testimonios sobre la Masacre de Margarita Belén',
    slug: 'testimonios-masacre-margarita-belen',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    date: '1976-12-13',
    ccd_or_location: 'Resistencia, Chaco',
    description: 'Testimonios sobre la masacre de al menos 22 presos políticos en la localidad de Margarita Belén, Chaco, el 13 de diciembre de 1976, presentada como un intento de fuga.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  {
    id: 'nm-test-031',
    title: 'Listado de centros clandestinos de detención — CONADEP',
    slug: 'listado-centros-clandestinos-detencion-conadep',
    doc_type: 'documento_oficial',
    chapter: 'Anexos — Listado de CCD',
    description: 'Listado de 340 centros clandestinos de detención identificados por la CONADEP en todo el territorio argentino. Incluye denominación, ubicación, fuerza responsable y período de funcionamiento.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  {
    id: 'nm-test-032',
    title: 'Listado de desaparecidos — Anexo del Nunca Más',
    slug: 'listado-desaparecidos-anexo-nunca-mas',
    doc_type: 'documento_oficial',
    chapter: 'Anexos — Listado de víctimas',
    description: 'Listado de 8.960 personas desaparecidas compilado por la CONADEP. Incluye nombre, fecha de desaparición, lugar y circunstancias. Cifra actualizada posteriormente por el RUVTE.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-ruvte'],
  },
  {
    id: 'nm-test-033',
    title: 'Testimonios sobre represión a comunidad judía — informe Jacobo Timerman',
    slug: 'testimonios-represion-comunidad-judia-timerman',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    survivor_name: 'Jacobo Timerman',
    ccd_or_location: 'Puesto Vasco',
    description: 'Testimonio de Jacobo Timerman, director del diario La Opinión, detenido ilegalmente. Documenta el antisemitismo dentro del aparato represivo y la persecución específica contra la comunidad judía.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-cels'],
  },
  {
    id: 'nm-test-034',
    title: 'Testimonios sobre el caso Dagmar Hagelin',
    slug: 'testimonios-caso-dagmar-hagelin',
    doc_type: 'legajo_denuncia',
    chapter: 'Capítulo II — Víctimas',
    ccd_or_location: 'ESMA',
    description: 'Legajo sobre la desaparición de Dagmar Hagelin, joven sueco-argentina baleada y secuestrada por Alfredo Astiz en enero de 1977. Caso emblemático de la dimensión internacional de la represión.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-cels'],
  },
  {
    id: 'nm-test-035',
    title: 'Testimonios del CCD La Escuelita — Bahía Blanca',
    slug: 'testimonios-la-escuelita-bahia-blanca',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'La Escuelita (Bahía Blanca)',
    description: 'Testimonios de sobrevivientes del CCD La Escuelita en Bahía Blanca, dependiente del V Cuerpo de Ejército. Describe la participación de oficiales del Batallón 181.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-036',
    title: 'Testimonios sobre desaparición de religiosos — caso Angelelli',
    slug: 'testimonios-desaparicion-religiosos-angelelli',
    doc_type: 'legajo_denuncia',
    chapter: 'Capítulo II — Víctimas',
    description: 'Legajo sobre el asesinato del obispo Enrique Angelelli de La Rioja (agosto 1976), presentado como accidente automovilístico. Incluye testimonios sobre la persecución a sacerdotes tercermundistas.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm'],
  },
  {
    id: 'nm-test-037',
    title: 'Testimonio de Carlos Muñoz — CCD La Perla',
    slug: 'testimonio-carlos-munoz-la-perla',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    survivor_name: 'Carlos Muñoz',
    ccd_or_location: 'La Perla',
    description: 'Testimonio de sobreviviente del CCD La Perla en Córdoba. Describe las sesiones de tortura dirigidas por el general Menéndez y la estructura jerárquica del centro.',
    archivo_ids: ['dict-archivo-conadep'],
  },
  {
    id: 'nm-test-038',
    title: 'Testimonios sobre el Pozo de Quilmes — CCD policial',
    slug: 'testimonios-pozo-quilmes',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo I — La acción represiva',
    ccd_or_location: 'Pozo de Quilmes',
    description: 'Testimonios sobre el CCD Pozo de Quilmes, dependiente de la policía bonaerense. Funcionó bajo la órbita del general Camps y el comisario Etchecolatz.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-dipba'],
  },
  {
    id: 'nm-test-039',
    title: 'Carta de Rodolfo Walsh a la Junta Militar',
    slug: 'carta-rodolfo-walsh-junta-militar',
    doc_type: 'documento_historico',
    chapter: 'Documentos anexos',
    date: '1977-03-24',
    description: 'Carta abierta del periodista y escritor Rodolfo Walsh a la Junta Militar en el primer aniversario del golpe. Walsh fue emboscado y asesinado al día siguiente por un grupo de tareas de la ESMA.',
    archivo_ids: ['dict-archivo-conadep', 'dict-archivo-anm', 'dict-archivo-memoria-abierta'],
  },
  {
    id: 'nm-test-040',
    title: 'Informe sobre la represión en la Universidad Nacional del Sur',
    slug: 'informe-represion-universidad-nacional-sur',
    doc_type: 'testimonio_sobreviviente',
    chapter: 'Capítulo II — Víctimas',
    ccd_or_location: 'La Escuelita (Bahía Blanca)',
    description: 'Testimonios sobre la represión contra docentes y estudiantes de la Universidad Nacional del Sur en Bahía Blanca. Documenta la intervención militar de la universidad y desapariciones.',
    archivo_ids: ['dict-archivo-conadep'],
  },
]

// ---------------------------------------------------------------------------
// Wikidata SPARQL query for Argentine enforced disappearance victims
// ---------------------------------------------------------------------------

const WIKIDATA_SPARQL = `
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?placeLabel ?occupationLabel WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P1196 wd:Q10737 .
  { ?person wdt:P27 wd:Q414 . }
  UNION
  { ?person wdt:P19/wdt:P17 wd:Q414 . }
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P20 ?place . }
  OPTIONAL { ?person wdt:P106 ?occupation . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en" . }
}
ORDER BY ?personLabel
LIMIT 500
`.trim()

// ---------------------------------------------------------------------------
// Ingestion functions
// ---------------------------------------------------------------------------

async function createConstraints(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()
  try {
    await session.run(
      `CREATE CONSTRAINT IF NOT EXISTS FOR (d:DictaduraDocumento) REQUIRE d.id IS UNIQUE`,
    )
    await session.run(
      `CREATE CONSTRAINT IF NOT EXISTS FOR (a:DictaduraArchivo) REQUIRE a.id IS UNIQUE`,
    )
    console.log('  Constraints ensured\n')
  } finally {
    await session.close()
  }
}

async function ingestArchivos(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const a of ARCHIVOS) {
      await tx.run(
        `MERGE (a:DictaduraArchivo {id: $id})
         ON CREATE SET
           a.name = $name,
           a.slug = $slug,
           a.institution = $institution,
           a.location = $location,
           a.description = $description,
           a.url = $url,
           a.caso_slug = $casoSlug,
           a.confidence_tier = 'bronze',
           a.ingestion_wave = $wave,
           a.source = $source,
           a.created_at = datetime(),
           a.updated_at = datetime()
         ON MATCH SET
           a.updated_at = datetime()`,
        {
          id: a.id,
          name: a.name,
          slug: a.slug,
          institution: a.institution,
          location: a.location,
          description: a.description,
          url: a.url ?? null,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE_NM,
        },
      )
      created++
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

async function ingestDocumentos(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const t of TESTIMONIOS) {
      await tx.run(
        `MERGE (d:DictaduraDocumento {id: $id})
         ON CREATE SET
           d.title = $title,
           d.slug = $slug,
           d.doc_type = $docType,
           d.chapter = $chapter,
           d.date = $date,
           d.survivor_name = $survivorName,
           d.ccd_or_location = $ccdOrLocation,
           d.description = $description,
           d.caso_slug = $casoSlug,
           d.confidence_tier = 'bronze',
           d.ingestion_wave = $wave,
           d.source = $source,
           d.source_url = 'https://www.argentina.gob.ar/derechoshumanos/nuncamas',
           d.provenance = 'Informe Nunca Más — CONADEP (1984)',
           d.created_at = datetime(),
           d.updated_at = datetime()
         ON MATCH SET
           d.updated_at = datetime()`,
        {
          id: t.id,
          title: t.title,
          slug: t.slug,
          docType: t.doc_type,
          chapter: t.chapter,
          date: t.date ?? null,
          survivorName: t.survivor_name ?? null,
          ccdOrLocation: t.ccd_or_location ?? null,
          description: t.description,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE_NM,
        },
      )
      created++
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

async function createPreservadoPorRelationships(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const t of TESTIMONIOS) {
      for (const archivoId of t.archivo_ids) {
        await tx.run(
          `MATCH (d:DictaduraDocumento {id: $docId})
           MATCH (a:DictaduraArchivo {id: $archivoId})
           MERGE (d)-[r:PRESERVADO_POR]->(a)
           ON CREATE SET
             r.source = $source,
             r.ingestion_wave = $wave,
             r.created_at = datetime()`,
          {
            docId: t.id,
            archivoId,
            source: SOURCE_NM,
            wave: WAVE,
          },
        )
        created++
      }
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

/**
 * For testimonies with a survivor_name, try to match against existing
 * DictaduraPersona nodes and create DECLARA_EN relationships.
 */
async function createDeclaraEnRelationships(): Promise<{ matched: number; unmatched: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  const unmatchedNames = new Set<string>()

  const testimoniesWithSurvivors = TESTIMONIOS.filter((t) => t.survivor_name)

  try {
    for (const t of testimoniesWithSurvivors) {
      const name = t.survivor_name!
      const slug = slugify(name)

      const result = await session.run(
        `MATCH (p:DictaduraPersona)
         WHERE p.caso_slug = $casoSlug
           AND (p.slug = $slug OR toLower(p.name) CONTAINS toLower($name))
         RETURN p.id AS id
         LIMIT 1`,
        { casoSlug: CASO_SLUG, slug, name },
      )

      if (result.records.length > 0) {
        const personId = result.records[0].get('id') as string
        await session.run(
          `MATCH (p:DictaduraPersona {id: $personId})
           MATCH (d:DictaduraDocumento {id: $docId})
           MERGE (p)-[r:DECLARA_EN]->(d)
           ON CREATE SET
             r.role = 'testigo_sobreviviente',
             r.source = $source,
             r.ingestion_wave = $wave,
             r.created_at = datetime()`,
          {
            personId,
            docId: t.id,
            source: SOURCE_NM,
            wave: WAVE,
          },
        )
        matched++
      } else {
        unmatchedNames.add(name)
      }
    }
  } finally {
    await session.close()
  }

  return { matched, unmatched: [...unmatchedNames] }
}

/**
 * For testimonies with a ccd_or_location, try to match against existing
 * DictaduraLugar nodes and create TESTIFICA_SOBRE relationships.
 */
async function createTestificaSobreRelationships(): Promise<{ matched: number; unmatched: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  const unmatchedLocations = new Set<string>()

  const testimoniesWithLocations = TESTIMONIOS.filter((t) => t.ccd_or_location)

  try {
    for (const t of testimoniesWithLocations) {
      const location = t.ccd_or_location!
      const slug = slugify(location)

      // Try matching against DictaduraLugar nodes (CCDs)
      const result = await session.run(
        `MATCH (l:DictaduraLugar)
         WHERE l.caso_slug = $casoSlug
           AND (l.slug CONTAINS $slug OR toLower(l.name) CONTAINS toLower($location))
         RETURN l.id AS id
         LIMIT 1`,
        { casoSlug: CASO_SLUG, slug, location },
      )

      if (result.records.length > 0) {
        const lugarId = result.records[0].get('id') as string

        // If the testimony has a survivor_name, create TESTIFICA_SOBRE from person to lugar
        if (t.survivor_name) {
          const personSlug = slugify(t.survivor_name)
          const personResult = await session.run(
            `MATCH (p:DictaduraPersona)
             WHERE p.caso_slug = $casoSlug
               AND (p.slug = $slug OR toLower(p.name) CONTAINS toLower($name))
             RETURN p.id AS id
             LIMIT 1`,
            { casoSlug: CASO_SLUG, slug: personSlug, name: t.survivor_name },
          )

          if (personResult.records.length > 0) {
            const personId = personResult.records[0].get('id') as string
            await session.run(
              `MATCH (p:DictaduraPersona {id: $personId})
               MATCH (l:DictaduraLugar {id: $lugarId})
               MERGE (p)-[r:TESTIFICA_SOBRE]->(l)
               ON CREATE SET
                 r.documento_id = $docId,
                 r.source = $source,
                 r.ingestion_wave = $wave,
                 r.created_at = datetime()`,
              {
                personId,
                lugarId,
                docId: t.id,
                source: SOURCE_NM,
                wave: WAVE,
              },
            )
            matched++
          }
        } else {
          // Link the document itself to the lugar
          await session.run(
            `MATCH (d:DictaduraDocumento {id: $docId})
             MATCH (l:DictaduraLugar {id: $lugarId})
             MERGE (d)-[r:TESTIFICA_SOBRE]->(l)
             ON CREATE SET
               r.source = $source,
               r.ingestion_wave = $wave,
               r.created_at = datetime()`,
            {
              docId: t.id,
              lugarId,
              source: SOURCE_NM,
              wave: WAVE,
            },
          )
          matched++
        }
      } else {
        unmatchedLocations.add(location)
      }
    }
  } finally {
    await session.close()
  }

  return { matched, unmatched: [...unmatchedLocations] }
}

/**
 * Query Wikidata SPARQL for Argentine enforced disappearance victims
 * and cross-reference against existing DictaduraPersona nodes.
 */
async function crossReferenceWikidata(): Promise<{
  fetched: number
  matched: number
  newInfo: number
}> {
  let fetched = 0
  let matched = 0
  let newInfo = 0

  const encodedQuery = encodeURIComponent(WIKIDATA_SPARQL)
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodedQuery}`

  console.log('  Fetching Wikidata SPARQL results...')

  let wikidataResults: Array<{
    personLabel: string
    birthDate?: string
    deathDate?: string
    placeLabel?: string
    occupationLabel?: string
    wikidataId: string
  }> = []

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'OfficeOfAccountability/1.0 (civic research; https://github.com/office-of-accountability)',
      },
    })

    if (!response.ok) {
      console.warn(`  Wikidata SPARQL returned ${response.status}, skipping cross-reference.`)
      return { fetched: 0, matched: 0, newInfo: 0 }
    }

    const data = await response.json() as {
      results: {
        bindings: Array<{
          person?: { value: string }
          personLabel?: { value: string }
          birthDate?: { value: string }
          deathDate?: { value: string }
          placeLabel?: { value: string }
          occupationLabel?: { value: string }
        }>
      }
    }

    for (const binding of data.results.bindings) {
      const label = binding.personLabel?.value
      const personUri = binding.person?.value
      if (!label || !personUri) continue

      // Extract Wikidata Q-ID from URI
      const qid = personUri.split('/').pop() ?? ''

      wikidataResults.push({
        personLabel: label,
        birthDate: binding.birthDate?.value?.slice(0, 10),
        deathDate: binding.deathDate?.value?.slice(0, 10),
        placeLabel: binding.placeLabel?.value,
        occupationLabel: binding.occupationLabel?.value,
        wikidataId: qid,
      })
    }

    // De-duplicate by Wikidata ID
    const seen = new Set<string>()
    wikidataResults = wikidataResults.filter((r) => {
      if (seen.has(r.wikidataId)) return false
      seen.add(r.wikidataId)
      return true
    })

    fetched = wikidataResults.length
    console.log(`  Fetched ${fetched} unique Wikidata results`)
  } catch (err) {
    console.warn(`  Wikidata fetch failed: ${err}. Skipping cross-reference.`)
    return { fetched: 0, matched: 0, newInfo: 0 }
  }

  // Cross-reference against existing graph
  const driver = getDriver()
  const session = driver.session()

  try {
    for (const wd of wikidataResults) {
      const slug = slugify(wd.personLabel)

      const result = await session.run(
        `MATCH (p:DictaduraPersona)
         WHERE p.caso_slug = $casoSlug
           AND (p.slug = $slug OR toLower(p.name) = toLower($name))
         RETURN p.id AS id, p.wikidata_id AS existingQid
         LIMIT 1`,
        { casoSlug: CASO_SLUG, slug, name: wd.personLabel },
      )

      if (result.records.length > 0) {
        matched++
        const existingQid = result.records[0].get('existingQid')
        const personId = result.records[0].get('id') as string

        // Enrich with Wikidata ID and additional metadata if not already set
        if (!existingQid) {
          await session.run(
            `MATCH (p:DictaduraPersona {id: $personId})
             SET p.wikidata_id = $qid,
                 p.wikidata_birth_date = $birthDate,
                 p.wikidata_death_date = $deathDate,
                 p.wikidata_death_place = $deathPlace,
                 p.wikidata_occupation = $occupation,
                 p.updated_at = datetime()`,
            {
              personId,
              qid: wd.wikidataId,
              birthDate: wd.birthDate ?? null,
              deathDate: wd.deathDate ?? null,
              deathPlace: wd.placeLabel ?? null,
              occupation: wd.occupationLabel ?? null,
            },
          )
          newInfo++
        }
      }
    }
  } finally {
    await session.close()
  }

  return { fetched, matched, newInfo }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Wave 6: Nunca Más + Wikidata ===')
  console.log('Sources: Informe Nunca Más (CONADEP, 1984), Wikidata SPARQL\n')

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Check NEO4J_URI and credentials.')
    process.exit(1)
  }
  console.log('Neo4j connected\n')

  // Ensure uniqueness constraints
  console.log('Ensuring constraints...')
  await createConstraints()

  // Step 1: Ingest DictaduraArchivo nodes
  console.log('Ingesting DictaduraArchivo nodes...')
  const archivosCreated = await ingestArchivos()
  console.log(`  ${archivosCreated} archivo nodes merged\n`)

  // Step 2: Ingest DictaduraDocumento nodes (Nunca Más testimonies)
  console.log('Ingesting DictaduraDocumento nodes (Nunca Más)...')
  const docsCreated = await ingestDocumentos()
  console.log(`  ${docsCreated} documento nodes merged\n`)

  // Step 3: Create PRESERVADO_POR relationships
  console.log('Creating PRESERVADO_POR relationships...')
  const preservadoRels = await createPreservadoPorRelationships()
  console.log(`  ${preservadoRels} PRESERVADO_POR relationships merged\n`)

  // Step 4: Create DECLARA_EN relationships
  console.log('Matching survivors for DECLARA_EN relationships...')
  const { matched: declaraMatched, unmatched: declaraUnmatched } = await createDeclaraEnRelationships()
  console.log(`  ${declaraMatched} DECLARA_EN relationships created`)
  if (declaraUnmatched.length > 0) {
    console.log(`  ${declaraUnmatched.length} survivors not found in graph:`)
    for (const name of declaraUnmatched) {
      console.log(`    - ${name}`)
    }
  }
  console.log()

  // Step 5: Create TESTIFICA_SOBRE relationships
  console.log('Matching locations for TESTIFICA_SOBRE relationships...')
  const { matched: testificaMatched, unmatched: testificaUnmatched } = await createTestificaSobreRelationships()
  console.log(`  ${testificaMatched} TESTIFICA_SOBRE relationships created`)
  if (testificaUnmatched.length > 0) {
    console.log(`  ${testificaUnmatched.length} locations not found in graph:`)
    for (const loc of testificaUnmatched) {
      console.log(`    - ${loc}`)
    }
  }
  console.log()

  // Step 6: Wikidata cross-reference
  console.log('Cross-referencing Wikidata...')
  const wdResults = await crossReferenceWikidata()
  console.log(`  ${wdResults.fetched} Wikidata victims fetched`)
  console.log(`  ${wdResults.matched} matched against existing graph`)
  console.log(`  ${wdResults.newInfo} enriched with Wikidata metadata\n`)

  // Final stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const nodeCount = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.ingestion_wave = $wave
       RETURN labels(n)[0] AS label, count(n) AS count
       ORDER BY label`,
      { casoSlug: CASO_SLUG, wave: WAVE },
    )
    console.log('=== Wave 6 Summary ===')
    let total = 0
    for (const r of nodeCount.records) {
      const c = typeof r.get('count') === 'object'
        ? (r.get('count') as { low: number }).low
        : r.get('count')
      total += c as number
      console.log(`  ${r.get('label')}: ${c}`)
    }
    console.log(`  Total wave 6 nodes: ${total}`)

    const edgeCount = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE r.ingestion_wave = $wave AND (r.source = $sourceNM OR r.source = $sourceWD)
       RETURN type(r) AS relType, count(r) AS count ORDER BY relType`,
      { wave: WAVE, sourceNM: SOURCE_NM, sourceWD: SOURCE_WD },
    )
    let totalEdges = 0
    for (const r of edgeCount.records) {
      const c = typeof r.get('count') === 'object'
        ? (r.get('count') as { low: number }).low
        : r.get('count')
      totalEdges += c as number
      console.log(`  ${r.get('relType')}: ${c}`)
    }
    console.log(`  Total wave 6 edges: ${totalEdges}`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 6 complete!')
}

main().catch((err) => {
  console.error('Wave 6 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
