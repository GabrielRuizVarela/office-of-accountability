/**
 * Wave 7: Deep Document Intelligence
 *
 * Creates DictaduraDocumento nodes from PCCH (Procuraduría de Crímenes
 * contra la Humanidad) verdict documents and military archive documents
 * from the Archivos Abiertos de Defensa.
 *
 * Relationships created:
 *   - DESCRIBE_EVENTO (documento → evento)
 *   - REFERENTE_A (documento → persona)
 *
 * Confidence tier: bronze (raw document metadata from public sources)
 * Ingestion wave: 7
 * Source: pcch / archivos-defensa
 *
 * Run with: npx tsx scripts/ingest-dictadura-wave-7.ts
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 7
const SOURCE_PCCH = 'pcch'
const SOURCE_DEFENSA = 'archivos-defensa'

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
// PCCH Sentencia seed data
// ---------------------------------------------------------------------------

interface SentenciaSeed {
  id: string
  title: string
  slug: string
  doc_type: string
  tribunal: string
  causa_name: string
  date: string
  condemned_count: number
  absolved_count: number
  victims_count: number
  key_defendants: string[]
  events_described: string[]
  description: string
}

const SENTENCIAS: SentenciaSeed[] = [
  {
    id: 'pcch-sent-001',
    title: 'Sentencia Causa 13/84 — Juicio a las Juntas',
    slug: 'sentencia-causa-13-juicio-juntas-1985',
    doc_type: 'sentencia_judicial',
    tribunal: 'Cámara Nacional de Apelaciones en lo Criminal y Correccional Federal',
    causa_name: 'Causa 13/84 — Juicio a las Juntas Militares',
    date: '1985-12-09',
    condemned_count: 5,
    absolved_count: 4,
    victims_count: 709,
    key_defendants: ['Jorge Rafael Videla', 'Emilio Massera', 'Orlando Agosti', 'Roberto Viola', 'Armando Lambruschini'],
    events_described: ['Terrorismo de Estado 1976-1983', 'Plan sistemático de represión'],
    description: 'Sentencia histórica del Juicio a las Juntas. Condenó a Videla y Massera a reclusión perpetua, Agosti a 4 años y 6 meses, Viola a 17 años, y Lambruschini a 8 años. Primer juicio civil a una junta militar en América Latina.',
  },
  {
    id: 'pcch-sent-002',
    title: 'Sentencia ESMA Unificada (ESMA III)',
    slug: 'sentencia-esma-unificada-esma-iii',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 5 de Buenos Aires',
    causa_name: 'ESMA III — Megacausa ESMA',
    date: '2017-11-29',
    condemned_count: 54,
    absolved_count: 0,
    victims_count: 789,
    key_defendants: ['Alfredo Astiz', 'Jorge Acosta', 'Ricardo Cavallo', 'Antonio Pernías'],
    events_described: ['Operaciones GT 3.3.2', 'Vuelos de la muerte', 'Apropiación de menores ESMA'],
    description: 'Megacausa ESMA III: el mayor juicio por delitos de lesa humanidad en Argentina. 54 condenas, incluyendo a Astiz, Acosta y Cavallo. Abarcó crímenes cometidos en la ESMA entre 1976-1983.',
  },
  {
    id: 'pcch-sent-003',
    title: 'Sentencia Plan Cóndor',
    slug: 'sentencia-plan-condor',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de Buenos Aires',
    causa_name: 'Plan Cóndor — Coordinación represiva multinacional',
    date: '2016-05-27',
    condemned_count: 15,
    absolved_count: 1,
    victims_count: 105,
    key_defendants: ['Santiago Omar Riveros', 'Miguel Etchecolatz', 'Reynaldo Bignone'],
    events_described: ['Plan Cóndor', 'Coordinación represiva internacional', 'Desapariciones transfronterizas'],
    description: 'Primera sentencia en el mundo que calificó al Plan Cóndor como una asociación ilícita criminal transnacional. Condenó a 15 represores por la desaparición de ciudadanos uruguayos, chilenos, paraguayos y bolivianos en Argentina.',
  },
  {
    id: 'pcch-sent-004',
    title: 'Sentencia Circuito ABO (Atlético-Banco-Olimpo)',
    slug: 'sentencia-circuito-abo',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 4 de Buenos Aires',
    causa_name: 'Causa ABO — Circuito represivo Atlético-Banco-Olimpo',
    date: '2010-12-21',
    condemned_count: 16,
    absolved_count: 0,
    victims_count: 181,
    key_defendants: ['Julio Simón', 'Juan Carlos Rolón', 'Eduardo Kalinec'],
    events_described: ['Circuito represivo ABO', 'Torturas Club Atlético', 'Operaciones Olimpo'],
    description: 'Sentencia por crímenes cometidos en el circuito represivo Atlético-Banco-Olimpo, operado por el Primer Cuerpo de Ejército en la zona sur de Buenos Aires.',
  },
  {
    id: 'pcch-sent-005',
    title: 'Sentencia La Perla — III Cuerpo de Ejército',
    slug: 'sentencia-la-perla-iii-cuerpo',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de Córdoba',
    causa_name: 'Causa La Perla — Menéndez',
    date: '2016-08-25',
    condemned_count: 28,
    absolved_count: 0,
    victims_count: 716,
    key_defendants: ['Luciano Benjamín Menéndez', 'Héctor Pedro Vergez', 'Ernesto Barreiro'],
    events_described: ['CCD La Perla', 'Represión III Cuerpo de Ejército', 'Terrorismo de Estado en Córdoba'],
    description: 'Megacausa La Perla: condena a 28 militares y policías por crímenes en el CCD La Perla y La Ribera, Córdoba. Menéndez recibió su undécima condena a perpetua.',
  },
  {
    id: 'pcch-sent-006',
    title: 'Sentencia Causa Etchecolatz',
    slug: 'sentencia-causa-etchecolatz',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de La Plata',
    causa_name: 'Causa Etchecolatz',
    date: '2006-09-19',
    condemned_count: 1,
    absolved_count: 0,
    victims_count: 6,
    key_defendants: ['Miguel Etchecolatz'],
    events_described: ['Circuito Camps', 'Represión policial bonaerense', 'Desaparición de Jorge Julio López'],
    description: 'Primera condena por delitos de lesa humanidad tras la anulación de las leyes de impunidad. Etchecolatz condenado a reclusión perpetua. El testigo Jorge Julio López desapareció un día antes de la lectura de sentencia.',
  },
  {
    id: 'pcch-sent-007',
    title: 'Sentencia Causa Campo de Mayo',
    slug: 'sentencia-causa-campo-mayo',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de San Martín',
    causa_name: 'Causa Campo de Mayo — El Campito',
    date: '2019-11-01',
    condemned_count: 22,
    absolved_count: 0,
    victims_count: 323,
    key_defendants: ['Santiago Omar Riveros', 'Fernando Verplaetsen', 'Carlos del Señor Hidalgo Garzón'],
    events_described: ['CCD El Campito', 'Maternidad clandestina Campo de Mayo', 'Apropiación de menores'],
    description: 'Condena a 22 imputados por crímenes en Campo de Mayo, incluyendo la maternidad clandestina donde nacieron hijos de detenidas-desaparecidas que fueron apropiados.',
  },
  {
    id: 'pcch-sent-008',
    title: 'Sentencia Causa Automotores Orletti',
    slug: 'sentencia-causa-automotores-orletti',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de Buenos Aires',
    causa_name: 'Causa Automotores Orletti',
    date: '2011-03-31',
    condemned_count: 7,
    absolved_count: 2,
    victims_count: 73,
    key_defendants: ['Eduardo Ruffo', 'Honorio Martínez Ruíz', 'Guglielminetti'],
    events_described: ['CCD Automotores Orletti', 'Operaciones Plan Cóndor en Buenos Aires', 'Segundo vuelo de Orletti'],
    description: 'Condena por crímenes cometidos en Automotores Orletti, centro operativo del Plan Cóndor donde fueron detenidos ciudadanos uruguayos, chilenos, bolivianos y paraguayos.',
  },
  {
    id: 'pcch-sent-009',
    title: 'Sentencia Causa Noche de los Lápices',
    slug: 'sentencia-causa-noche-lapices',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de La Plata',
    causa_name: 'Causa La Noche de los Lápices',
    date: '2014-09-16',
    condemned_count: 5,
    absolved_count: 0,
    victims_count: 10,
    key_defendants: ['Miguel Etchecolatz', 'Jaime Lamont Smart'],
    events_described: ['Noche de los Lápices', 'Secuestro de estudiantes secundarios', 'Circuito Camps La Plata'],
    description: 'Sentencia sobre el secuestro y desaparición de estudiantes secundarios en La Plata en septiembre de 1976. Conocido como La Noche de los Lápices.',
  },
  {
    id: 'pcch-sent-010',
    title: 'Sentencia Causa Operativo Independencia — Tucumán',
    slug: 'sentencia-operativo-independencia-tucuman',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal de Tucumán',
    causa_name: 'Causa Operativo Independencia',
    date: '2017-09-15',
    condemned_count: 12,
    absolved_count: 3,
    victims_count: 270,
    key_defendants: ['Antonio Bussi', 'Luciano Benjamín Menéndez', 'Roberto Heriberto Albornoz'],
    events_described: ['Operativo Independencia', 'CCD Escuelita de Famaillá', 'Represión en Tucumán 1975-1977'],
    description: 'Sentencia sobre los crímenes del Operativo Independencia en Tucumán (1975-1977), considerado el ensayo del terrorismo de Estado previo al golpe del 24 de marzo de 1976.',
  },
  {
    id: 'pcch-sent-011',
    title: 'Sentencia Causa Margarita Belén',
    slug: 'sentencia-causa-margarita-belen',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal de Resistencia',
    causa_name: 'Causa Margarita Belén',
    date: '2011-06-06',
    condemned_count: 6,
    absolved_count: 0,
    victims_count: 22,
    key_defendants: ['Carlos Ramón Abraham', 'Aldo Martínez Segón'],
    events_described: ['Masacre de Margarita Belén', 'Simulacro de fuga Chaco'],
    description: 'Condena por la masacre de 22 presos políticos en Margarita Belén, Chaco, el 13 de diciembre de 1976, presentada por los militares como un intento de fuga.',
  },
  {
    id: 'pcch-sent-012',
    title: 'Sentencia Causa Masacre de Trelew',
    slug: 'sentencia-causa-masacre-trelew',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal de Comodoro Rivadavia',
    causa_name: 'Causa Masacre de Trelew',
    date: '2012-10-15',
    condemned_count: 3,
    absolved_count: 0,
    victims_count: 16,
    key_defendants: ['Emilio Del Real', 'Luis Sosa', 'Carlos Marandino'],
    events_described: ['Masacre de Trelew', 'Fusilamiento Base Almirante Zar'],
    description: 'Sentencia por el fusilamiento de 16 presos políticos en la Base Almirante Zar, Trelew, el 22 de agosto de 1972. Condenó a perpetua a los tres acusados.',
  },
  {
    id: 'pcch-sent-013',
    title: 'Sentencia Causa V Cuerpo — Bahía Blanca',
    slug: 'sentencia-causa-v-cuerpo-bahia-blanca',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal de Bahía Blanca',
    causa_name: 'Causa V Cuerpo de Ejército',
    date: '2012-10-05',
    condemned_count: 11,
    absolved_count: 0,
    victims_count: 63,
    key_defendants: ['Adel Vilas', 'Hugo Delmonte'],
    events_described: ['CCD La Escuelita Bahía Blanca', 'Represión V Cuerpo de Ejército'],
    description: 'Condena a militares del V Cuerpo de Ejército por crímenes en el CCD La Escuelita de Bahía Blanca y otros centros en la zona sur de la provincia de Buenos Aires.',
  },
  {
    id: 'pcch-sent-014',
    title: 'Sentencia Causa Pozo de Banfield, Quilmes y El Infierno',
    slug: 'sentencia-causa-pozo-banfield-quilmes',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de La Plata',
    causa_name: 'Causa Pozos de Banfield-Quilmes',
    date: '2023-12-18',
    condemned_count: 23,
    absolved_count: 0,
    victims_count: 432,
    key_defendants: ['Jaime Lamont Smart', 'Juan Miguel Wolk'],
    events_described: ['CCD Pozo de Banfield', 'CCD Pozo de Quilmes', 'Circuito Camps', 'Apropiación de menores'],
    description: 'Mega-sentencia por crímenes en los CCD Pozo de Banfield, Pozo de Quilmes e Infierno. Incluyó condenas por apropiación de menores nacidos en cautiverio.',
  },
  {
    id: 'pcch-sent-015',
    title: 'Sentencia Causa Angelelli — Obispo de La Rioja',
    slug: 'sentencia-causa-angelelli',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal de La Rioja',
    causa_name: 'Causa Angelelli',
    date: '2014-07-04',
    condemned_count: 2,
    absolved_count: 0,
    victims_count: 1,
    key_defendants: ['Luciano Benjamín Menéndez', 'Luis Fernando Estrella'],
    events_described: ['Asesinato del obispo Angelelli', 'Persecución a sacerdotes tercermundistas'],
    description: 'Sentencia que determinó que la muerte del obispo Enrique Angelelli en 1976 fue un homicidio perpetrado por agentes del Estado y no un accidente automovilístico.',
  },
  {
    id: 'pcch-sent-016',
    title: 'Sentencia Causa El Vesubio',
    slug: 'sentencia-causa-el-vesubio',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 4 de Buenos Aires',
    causa_name: 'Causa El Vesubio',
    date: '2010-07-14',
    condemned_count: 7,
    absolved_count: 0,
    victims_count: 155,
    key_defendants: ['Pedro Durán Sáenz', 'Diego Salvador Chemes'],
    events_described: ['CCD El Vesubio', 'Operaciones Primer Cuerpo zona sur'],
    description: 'Condena por crímenes en el CCD El Vesubio, operado en la zona sur del Gran Buenos Aires por fuerzas del Primer Cuerpo de Ejército.',
  },
  {
    id: 'pcch-sent-017',
    title: 'Sentencia Causa Mansión Seré — Fuerza Aérea',
    slug: 'sentencia-causa-mansion-sere',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 4 de San Martín',
    causa_name: 'Causa Mansión Seré',
    date: '2015-03-18',
    condemned_count: 4,
    absolved_count: 0,
    victims_count: 65,
    key_defendants: ['Hipólito Mariani', 'César Comes'],
    events_described: ['CCD Mansión Seré', 'Fuga de prisioneros 1978', 'Demolición del edificio'],
    description: 'Condena por crímenes en la Mansión Seré (Atila), CCD operado por la Fuerza Aérea en Morón. Incluye relatos de la fuga de cuatro prisioneros en 1978.',
  },
  {
    id: 'pcch-sent-018',
    title: 'Sentencia Causa Apropiación de Menores — Plan Sistemático',
    slug: 'sentencia-causa-apropiacion-menores-plan-sistematico',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 6 de Buenos Aires',
    causa_name: 'Causa Plan Sistemático de Apropiación de Menores',
    date: '2012-07-05',
    condemned_count: 9,
    absolved_count: 0,
    victims_count: 34,
    key_defendants: ['Jorge Rafael Videla', 'Reynaldo Bignone', 'Santiago Omar Riveros', 'Jorge Acosta'],
    events_described: ['Plan sistemático de robo de bebés', 'Maternidades clandestinas', 'Sustitución de identidad'],
    description: 'Sentencia que acreditó la existencia de un plan sistemático de apropiación de menores nacidos en cautiverio. Videla condenado a 50 años, Bignone a 15 años.',
  },
  {
    id: 'pcch-sent-019',
    title: 'Sentencia Causa Feced — Rosario',
    slug: 'sentencia-causa-feced-rosario',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de Rosario',
    causa_name: 'Causa Feced',
    date: '2018-10-30',
    condemned_count: 24,
    absolved_count: 2,
    victims_count: 174,
    key_defendants: ['Ramón Genaro Díaz Bessone', 'José Lofiego'],
    events_described: ['CCD Servicio de Informaciones Rosario', 'Represión en Rosario y zona sur Santa Fe'],
    description: 'Condena por crímenes cometidos en el Servicio de Informaciones de la Policía de Rosario (ex jefatura de Agustín Feced), el principal CCD de Rosario.',
  },
  {
    id: 'pcch-sent-020',
    title: 'Sentencia Causa Dupuy — Unidad 9 de La Plata',
    slug: 'sentencia-causa-dupuy-unidad-9',
    doc_type: 'sentencia_judicial',
    tribunal: 'Tribunal Oral Federal N.° 1 de La Plata',
    causa_name: 'Causa Dupuy — Unidad 9',
    date: '2016-05-12',
    condemned_count: 5,
    absolved_count: 0,
    victims_count: 280,
    key_defendants: ['Abel David Dupuy', 'Isabelino Vega'],
    events_described: ['Unidad Penal 9 de La Plata', 'Torturas en cárceles legales'],
    description: 'Condena por torturas y asesinatos en la Unidad Penal N.° 9 de La Plata, donde los presos políticos eran sometidos a un régimen de tortura sistemática.',
  },
]

// ---------------------------------------------------------------------------
// Military archive document seed data
// ---------------------------------------------------------------------------

interface ArchivoDefensaSeed {
  id: string
  title: string
  slug: string
  doc_type: string
  force: string
  date: string
  classification: string
  description: string
  persons_mentioned: string[]
  events_described: string[]
}

const ARCHIVOS_DEFENSA: ArchivoDefensaSeed[] = [
  {
    id: 'def-doc-001',
    title: 'Directiva del Comandante General del Ejército N.° 404/75',
    slug: 'directiva-comandante-ejercito-404-75',
    doc_type: 'directiva_militar',
    force: 'Ejército Argentino',
    date: '1975-10-28',
    classification: 'SECRETO',
    persons_mentioned: ['Jorge Rafael Videla'],
    events_described: ['Operativo Independencia', 'Plan de lucha contra la subversión'],
    description: 'Directiva secreta que extendió el alcance de las operaciones antisubversivas a todo el territorio nacional. Estableció la zonificación militar y las atribuciones de los comandantes de zona.',
  },
  {
    id: 'def-doc-002',
    title: 'Plan del Ejército — Contribuyente al Plan de Seguridad Nacional',
    slug: 'plan-ejercito-seguridad-nacional-1976',
    doc_type: 'plan_operativo',
    force: 'Ejército Argentino',
    date: '1976-02-01',
    classification: 'SECRETO',
    persons_mentioned: ['Jorge Rafael Videla', 'Roberto Viola'],
    events_described: ['Planificación del golpe de Estado', 'Zonificación militar represiva'],
    description: 'Plan operativo secreto del Ejército para la toma del poder y la organización del aparato represivo. Define zonas, subzonas y áreas de responsabilidad militar.',
  },
  {
    id: 'def-doc-003',
    title: 'Orden de Batalla del Ejército Argentino — 24 de marzo de 1976',
    slug: 'orden-batalla-ejercito-24-marzo-1976',
    doc_type: 'orden_batalla',
    force: 'Ejército Argentino',
    date: '1976-03-24',
    classification: 'SECRETO',
    persons_mentioned: ['Jorge Rafael Videla', 'Carlos Suarez Mason', 'Luciano Benjamín Menéndez', 'Santiago Omar Riveros'],
    events_described: ['Golpe de Estado 24 de marzo', 'Distribución de fuerzas represivas'],
    description: 'Orden de batalla del día del golpe de Estado. Detalla la distribución de unidades militares y sus comandantes para la ejecución del Plan del Proceso de Reorganización Nacional.',
  },
  {
    id: 'def-doc-004',
    title: 'Reglamento RC-9-1 — Operaciones contra elementos subversivos',
    slug: 'reglamento-rc-9-1-operaciones-subversivas',
    doc_type: 'reglamento_militar',
    force: 'Ejército Argentino',
    date: '1975-01-01',
    classification: 'RESERVADO',
    persons_mentioned: [],
    events_described: ['Doctrina antisubversiva', 'Interrogatorio bajo coacción'],
    description: 'Reglamento militar que normativizó los métodos de interrogatorio, detención clandestina y eliminación de personas consideradas subversivas. Base doctrinal del terrorismo de Estado.',
  },
  {
    id: 'def-doc-005',
    title: 'Informe de Inteligencia PLACINTARA — Armada Argentina',
    slug: 'informe-placintara-armada',
    doc_type: 'informe_inteligencia',
    force: 'Armada Argentina',
    date: '1976-04-15',
    classification: 'SECRETO',
    persons_mentioned: ['Emilio Massera', 'Ruben Chamorro', 'Jorge Acosta'],
    events_described: ['PLACINTARA', 'GT 3.3.2', 'Operaciones ESMA'],
    description: 'Plan de Capacidades de la Armada (PLACINTARA): documento que estableció la participación de la Armada en la represión. Define el rol del GT 3.3.2 y las operaciones en la ESMA.',
  },
  {
    id: 'def-doc-006',
    title: 'Actas de la Junta Militar — Tomo I',
    slug: 'actas-junta-militar-tomo-i',
    doc_type: 'acta_oficial',
    force: 'Junta Militar',
    date: '1976-03-24',
    classification: 'SECRETO',
    persons_mentioned: ['Jorge Rafael Videla', 'Emilio Massera', 'Orlando Agosti'],
    events_described: ['Golpe de Estado', 'Constitución del PRN', 'Acta para el Proceso de Reorganización Nacional'],
    description: 'Primer tomo de las actas secretas de la Junta Militar. Incluye el Acta fijando los propósitos y objetivos del Proceso de Reorganización Nacional y las primeras resoluciones de la Junta.',
  },
  {
    id: 'def-doc-007',
    title: 'Informe Final de la Junta Militar — Documento de autoamnistía',
    slug: 'informe-final-junta-autoamnistia-1983',
    doc_type: 'documento_oficial',
    force: 'Junta Militar',
    date: '1983-04-28',
    classification: 'PÚBLICO',
    persons_mentioned: ['Reynaldo Bignone', 'Cristino Nicolaides'],
    events_described: ['Autoamnistía', 'Documento Final sobre la lucha contra la subversión'],
    description: 'Documento Final de la Junta Militar emitido en abril de 1983. Declaró que los desaparecidos debían considerarse muertos y que las acciones represivas fueron actos de servicio. Rechazado por la sociedad civil.',
  },
  {
    id: 'def-doc-008',
    title: 'Reglamento de la Fuerza Aérea — Operaciones contra la subversión',
    slug: 'reglamento-fuerza-aerea-operaciones-subversion',
    doc_type: 'reglamento_militar',
    force: 'Fuerza Aérea Argentina',
    date: '1976-05-01',
    classification: 'SECRETO',
    persons_mentioned: ['Orlando Agosti', 'Basilio Lami Dozo'],
    events_described: ['Asignación de zona a la Fuerza Aérea', 'CCD de la Fuerza Aérea'],
    description: 'Reglamento que define la participación de la Fuerza Aérea en la represión, incluyendo la operación de centros clandestinos como Mansión Seré y la Base Aérea de Morón.',
  },
  {
    id: 'def-doc-009',
    title: 'Directiva SIDE N.° 1/76 — Comunidad Informativa',
    slug: 'directiva-side-1-76-comunidad-informativa',
    doc_type: 'directiva_inteligencia',
    force: 'SIDE',
    date: '1976-04-01',
    classification: 'SECRETO',
    persons_mentioned: ['Otto Paladino'],
    events_described: ['Comunidad Informativa', 'Coordinación de inteligencia represiva'],
    description: 'Directiva de la Secretaría de Inteligencia del Estado que organizó la Comunidad Informativa, red de coordinación entre los servicios de inteligencia de las tres fuerzas armadas y policías.',
  },
  {
    id: 'def-doc-010',
    title: 'Listados del Personal Militar Destinado a Centros Clandestinos',
    slug: 'listados-personal-militar-centros-clandestinos',
    doc_type: 'registro_personal',
    force: 'Ejército Argentino',
    date: '1976-06-01',
    classification: 'SECRETO',
    persons_mentioned: [],
    events_described: ['Asignación de personal a CCD', 'Estructura represiva'],
    description: 'Registros de destino del personal militar que revelan la asignación de oficiales y suboficiales a unidades que operaron centros clandestinos de detención. Evidencia desclasificada de los Archivos Abiertos de Defensa.',
  },
]

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
    console.log('  Constraints ensured\n')
  } finally {
    await session.close()
  }
}

async function ingestSentencias(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const s of SENTENCIAS) {
      await tx.run(
        `MERGE (d:DictaduraDocumento {id: $id})
         ON CREATE SET
           d.title = $title,
           d.slug = $slug,
           d.doc_type = $docType,
           d.tribunal = $tribunal,
           d.causa_name = $causaName,
           d.date = $date,
           d.condemned_count = $condemnedCount,
           d.absolved_count = $absolvedCount,
           d.victims_count = $victimsCount,
           d.key_defendants = $keyDefendants,
           d.events_described = $eventsDescribed,
           d.description = $description,
           d.caso_slug = $casoSlug,
           d.confidence_tier = 'bronze',
           d.ingestion_wave = $wave,
           d.source = $source,
           d.source_url = 'https://www.fiscales.gob.ar/lesa-humanidad/',
           d.provenance = 'Procuraduría de Crímenes contra la Humanidad (PCCH)',
           d.created_at = datetime(),
           d.updated_at = datetime()
         ON MATCH SET
           d.updated_at = datetime()`,
        {
          id: s.id,
          title: s.title,
          slug: s.slug,
          docType: s.doc_type,
          tribunal: s.tribunal,
          causaName: s.causa_name,
          date: s.date,
          condemnedCount: s.condemned_count,
          absolvedCount: s.absolved_count,
          victimsCount: s.victims_count,
          keyDefendants: s.key_defendants,
          eventsDescribed: s.events_described,
          description: s.description,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE_PCCH,
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

async function ingestArchivosDefensa(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const doc of ARCHIVOS_DEFENSA) {
      await tx.run(
        `MERGE (d:DictaduraDocumento {id: $id})
         ON CREATE SET
           d.title = $title,
           d.slug = $slug,
           d.doc_type = $docType,
           d.force = $force,
           d.date = $date,
           d.classification = $classification,
           d.persons_mentioned = $personsMentioned,
           d.events_described = $eventsDescribed,
           d.description = $description,
           d.caso_slug = $casoSlug,
           d.confidence_tier = 'bronze',
           d.ingestion_wave = $wave,
           d.source = $source,
           d.source_url = 'https://www.argentina.gob.ar/defensa/archivos-abiertos',
           d.provenance = 'Archivos Abiertos de Defensa — Ministerio de Defensa',
           d.created_at = datetime(),
           d.updated_at = datetime()
         ON MATCH SET
           d.updated_at = datetime()`,
        {
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          docType: doc.doc_type,
          force: doc.force,
          date: doc.date,
          classification: doc.classification,
          personsMentioned: doc.persons_mentioned,
          eventsDescribed: doc.events_described,
          description: doc.description,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE_DEFENSA,
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

/**
 * Create DESCRIBE_EVENTO relationships linking sentencia documents
 * to existing DictaduraEvento nodes in the graph.
 */
async function createDescribeEventoRelationships(): Promise<{ matched: number; unmatched: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  const unmatchedEvents = new Set<string>()

  // Collect all unique event names across sentencias and defense docs
  const allDocs = [
    ...SENTENCIAS.map((s) => ({ id: s.id, events: s.events_described, source: SOURCE_PCCH })),
    ...ARCHIVOS_DEFENSA.map((d) => ({ id: d.id, events: d.events_described, source: SOURCE_DEFENSA })),
  ]

  try {
    for (const doc of allDocs) {
      for (const event of doc.events) {
        const slug = slugify(event)

        const result = await session.run(
          `MATCH (e:DictaduraEvento)
           WHERE e.caso_slug = $casoSlug
             AND (e.slug CONTAINS $slug OR toLower(e.name) CONTAINS toLower($event))
           RETURN e.id AS id
           LIMIT 1`,
          { casoSlug: CASO_SLUG, slug, event },
        )

        if (result.records.length > 0) {
          const eventoId = result.records[0].get('id') as string
          await session.run(
            `MATCH (d:DictaduraDocumento {id: $docId})
             MATCH (e:DictaduraEvento {id: $eventoId})
             MERGE (d)-[r:DESCRIBE_EVENTO]->(e)
             ON CREATE SET
               r.event_name = $eventName,
               r.source = $source,
               r.ingestion_wave = $wave,
               r.created_at = datetime()`,
            {
              docId: doc.id,
              eventoId,
              eventName: event,
              source: doc.source,
              wave: WAVE,
            },
          )
          matched++
        } else {
          unmatchedEvents.add(event)
        }
      }
    }
  } finally {
    await session.close()
  }

  return { matched, unmatched: [...unmatchedEvents] }
}

/**
 * Match person names mentioned in PCCH sentencias and defense docs
 * against existing DictaduraPersona nodes and create REFERENTE_A relationships.
 */
async function createReferenteARelationships(): Promise<{ matched: number; unmatched: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  const unmatchedNames = new Set<string>()

  // Collect all unique person names
  const allNames = new Set<string>()
  const docPersons: Array<{ docId: string; names: string[]; source: string }> = []

  for (const s of SENTENCIAS) {
    docPersons.push({ docId: s.id, names: s.key_defendants, source: SOURCE_PCCH })
    for (const name of s.key_defendants) allNames.add(name)
  }
  for (const d of ARCHIVOS_DEFENSA) {
    docPersons.push({ docId: d.id, names: d.persons_mentioned, source: SOURCE_DEFENSA })
    for (const name of d.persons_mentioned) allNames.add(name)
  }

  // Resolve each unique name against existing graph
  const nameToPersonId = new Map<string, string>()

  try {
    for (const name of allNames) {
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
        nameToPersonId.set(name, result.records[0].get('id') as string)
      } else {
        unmatchedNames.add(name)
      }
    }

    // Create REFERENTE_A relationships
    const tx = session.beginTransaction()

    for (const doc of docPersons) {
      for (const name of doc.names) {
        const personId = nameToPersonId.get(name)
        if (personId) {
          await tx.run(
            `MATCH (d:DictaduraDocumento {id: $docId})
             MATCH (p:DictaduraPersona {id: $personId})
             MERGE (d)-[r:REFERENTE_A]->(p)
             ON CREATE SET
               r.name_in_document = $nameInDoc,
               r.source = $source,
               r.ingestion_wave = $wave,
               r.created_at = datetime()`,
            {
              docId: doc.docId,
              personId,
              nameInDoc: name,
              source: doc.source,
              wave: WAVE,
            },
          )
          matched++
        }
      }
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return { matched, unmatched: [...unmatchedNames] }
}

/**
 * Cross-reference document-extracted persons against existing graph.
 * For PCCH sentencias, link to existing DictaduraCausa if available.
 */
async function crossReferenceCausas(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0

  try {
    for (const s of SENTENCIAS) {
      const causaSlug = slugify(s.causa_name)

      const result = await session.run(
        `MATCH (c:DictaduraCausa)
         WHERE c.caso_slug = $casoSlug
           AND (c.slug CONTAINS $slug OR toLower(c.name) CONTAINS toLower($causaName))
         RETURN c.id AS id
         LIMIT 1`,
        { casoSlug: CASO_SLUG, slug: causaSlug, causaName: s.causa_name },
      )

      if (result.records.length > 0) {
        const causaId = result.records[0].get('id') as string
        await session.run(
          `MATCH (d:DictaduraDocumento {id: $docId})
           MATCH (c:DictaduraCausa {id: $causaId})
           MERGE (d)-[r:SENTENCIA_DE]->(c)
           ON CREATE SET
             r.source = $source,
             r.ingestion_wave = $wave,
             r.created_at = datetime()`,
          {
            docId: s.id,
            causaId,
            source: SOURCE_PCCH,
            wave: WAVE,
          },
        )
        linked++
      }
    }
  } finally {
    await session.close()
  }

  return linked
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Wave 7: Deep Document Intelligence ===')
  console.log('Sources: PCCH sentencias, Archivos Abiertos de Defensa\n')

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Check NEO4J_URI and credentials.')
    process.exit(1)
  }
  console.log('Neo4j connected\n')

  // Ensure uniqueness constraints
  console.log('Ensuring constraints...')
  await createConstraints()

  // Step 1: Ingest PCCH sentencias
  console.log('Ingesting PCCH sentencia documents...')
  const sentenciasCreated = await ingestSentencias()
  console.log(`  ${sentenciasCreated} sentencia nodes merged\n`)

  // Step 2: Ingest Archivos Defensa documents
  console.log('Ingesting Archivos Defensa documents...')
  const defensaCreated = await ingestArchivosDefensa()
  console.log(`  ${defensaCreated} military archive document nodes merged\n`)

  // Step 3: Create DESCRIBE_EVENTO relationships
  console.log('Matching events for DESCRIBE_EVENTO relationships...')
  const { matched: eventoMatched, unmatched: eventoUnmatched } = await createDescribeEventoRelationships()
  console.log(`  ${eventoMatched} DESCRIBE_EVENTO relationships created`)
  if (eventoUnmatched.length > 0) {
    console.log(`  ${eventoUnmatched.length} events not found in graph:`)
    for (const e of eventoUnmatched) {
      console.log(`    - ${e}`)
    }
  }
  console.log()

  // Step 4: Create REFERENTE_A relationships
  console.log('Matching persons for REFERENTE_A relationships...')
  const { matched: refMatched, unmatched: refUnmatched } = await createReferenteARelationships()
  console.log(`  ${refMatched} REFERENTE_A relationships created`)
  if (refUnmatched.length > 0) {
    console.log(`  ${refUnmatched.length} persons not found in graph:`)
    for (const name of refUnmatched) {
      console.log(`    - ${name}`)
    }
  }
  console.log()

  // Step 5: Cross-reference PCCH sentencias against existing DictaduraCausa
  console.log('Cross-referencing sentencias against existing causas...')
  const causasLinked = await crossReferenceCausas()
  console.log(`  ${causasLinked} SENTENCIA_DE relationships created\n`)

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
    console.log('=== Wave 7 Summary ===')
    let total = 0
    for (const r of nodeCount.records) {
      const c = typeof r.get('count') === 'object'
        ? (r.get('count') as { low: number }).low
        : r.get('count')
      total += c as number
      console.log(`  ${r.get('label')}: ${c}`)
    }
    console.log(`  Total wave 7 nodes: ${total}`)

    const edgeCount = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE r.ingestion_wave = $wave AND (r.source = $sourcePCCH OR r.source = $sourceDefensa)
       RETURN type(r) AS relType, count(r) AS count ORDER BY relType`,
      { wave: WAVE, sourcePCCH: SOURCE_PCCH, sourceDefensa: SOURCE_DEFENSA },
    )
    let totalEdges = 0
    for (const r of edgeCount.records) {
      const c = typeof r.get('count') === 'object'
        ? (r.get('count') as { low: number }).low
        : r.get('count')
      totalEdges += c as number
      console.log(`  ${r.get('relType')}: ${c}`)
    }
    console.log(`  Total wave 7 edges: ${totalEdges}`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 7 complete!')
}

main().catch((err) => {
  console.error('Wave 7 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
