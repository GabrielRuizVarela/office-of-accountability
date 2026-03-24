/**
 * Seed script — creates the Caso Dictadura investigation graph.
 * Run with: npx tsx scripts/seed-caso-dictadura.ts
 *
 * Creates DictaduraPersona, DictaduraCCD, DictaduraUnidadMilitar, DictaduraLugar,
 * DictaduraOrganizacion, DictaduraEvento, DictaduraCausa, and DictaduraOperacion
 * nodes along with their relationships. All nodes are scoped with
 * caso_slug: 'caso-dictadura'. Uses MERGE for idempotency — safe to re-run.
 *
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_SLUG = 'caso-dictadura'

// ---------------------------------------------------------------------------
// Seed data — Personas
// ---------------------------------------------------------------------------

const personas = [
  // ─── Junta I ──────────────────────────────────────────────────────────
  { id: 'dict-jorge-rafael-videla', name: 'Jorge Rafael Videla', slug: 'jorge-rafael-videla', category: 'represor', description: 'Teniente General. Presidente de facto 1976-1981. Junta I. Condenado a reclusión perpetua.' },
  { id: 'dict-emilio-eduardo-massera', name: 'Emilio Eduardo Massera', slug: 'emilio-eduardo-massera', category: 'represor', description: 'Almirante. Armada Argentina. Junta I. Responsable directo de la ESMA. Condenado a prisión perpetua.' },
  { id: 'dict-orlando-ramon-agosti', name: 'Orlando Ramón Agosti', slug: 'orlando-ramon-agosti', category: 'represor', description: 'Brigadier General. Fuerza Aérea Argentina. Junta I. Condenado a 4 años y 6 meses.' },

  // ─── Junta II ─────────────────────────────────────────────────────────
  { id: 'dict-roberto-eduardo-viola', name: 'Roberto Eduardo Viola', slug: 'roberto-eduardo-viola', category: 'represor', description: 'Teniente General. Presidente de facto 1981. Junta II. Condenado a 17 años de prisión.' },
  { id: 'dict-armando-lambruschini', name: 'Armando Lambruschini', slug: 'armando-lambruschini', category: 'represor', description: 'Almirante. Armada Argentina. Junta II. Condenado a 8 años de prisión.' },
  { id: 'dict-omar-domingo-rubens-graffigna', name: 'Omar Domingo Rubens Graffigna', slug: 'omar-domingo-rubens-graffigna', category: 'represor', description: 'Brigadier General. Fuerza Aérea Argentina. Junta II. Absuelto en el Juicio a las Juntas.' },

  // ─── Junta III ────────────────────────────────────────────────────────
  { id: 'dict-leopoldo-fortunato-galtieri', name: 'Leopoldo Fortunato Galtieri', slug: 'leopoldo-fortunato-galtieri', category: 'represor', description: 'Teniente General. Presidente de facto 1981-1982. Junta III. Responsable de la Guerra de Malvinas.' },
  { id: 'dict-jorge-isaac-anaya', name: 'Jorge Isaac Anaya', slug: 'jorge-isaac-anaya', category: 'represor', description: 'Almirante. Armada Argentina. Junta III.' },
  { id: 'dict-basilio-arturo-ignacio-lami-dozo', name: 'Basilio Arturo Ignacio Lami Dozo', slug: 'basilio-arturo-ignacio-lami-dozo', category: 'represor', description: 'Brigadier General. Fuerza Aérea Argentina. Junta III.' },

  // ─── Junta IV ─────────────────────────────────────────────────────────
  { id: 'dict-cristino-nicolaides', name: 'Cristino Nicolaides', slug: 'cristino-nicolaides', category: 'represor', description: 'Teniente General. Ejército Argentino. Junta IV. Último comandante en jefe del Ejército durante la dictadura.' },
  { id: 'dict-ruben-oscar-franco', name: 'Rubén Oscar Franco', slug: 'ruben-oscar-franco', category: 'represor', description: 'Almirante. Armada Argentina. Junta IV.' },
  { id: 'dict-augusto-jorge-hughes', name: 'Augusto Jorge Hughes', slug: 'augusto-jorge-hughes', category: 'represor', description: 'Brigadier General. Fuerza Aérea Argentina. Junta IV.' },

  // ─── Key perpetrators ─────────────────────────────────────────────────
  { id: 'dict-alfredo-astiz', name: 'Alfredo Astiz', slug: 'alfredo-astiz', category: 'represor', description: 'ESMA. "Ángel de la Muerte". Infiltró las Madres de Plaza de Mayo. Condenado a prisión perpetua por crímenes de lesa humanidad.' },
  { id: 'dict-miguel-osvaldo-etchecolatz', name: 'Miguel Osvaldo Etchecolatz', slug: 'miguel-osvaldo-etchecolatz', category: 'represor', description: 'Comisario de la Policía Bonaerense. Mano derecha de Camps. Condenado a prisión perpetua.' },
  { id: 'dict-luciano-benjamin-menendez', name: 'Luciano Benjamín Menéndez', slug: 'luciano-benjamin-menendez', category: 'represor', description: 'Comandante del III Cuerpo de Ejército. Zona 3 (Córdoba). Múltiples condenas a prisión perpetua.' },
  { id: 'dict-antonio-domingo-bussi', name: 'Antonio Domingo Bussi', slug: 'antonio-domingo-bussi', category: 'represor', description: 'Operativo Independencia. Tucumán. Comandante de la zona de operaciones contrainsurgencia.' },
  { id: 'dict-ramon-juan-alberto-camps', name: 'Ramón Juan Alberto Camps', slug: 'ramon-juan-alberto-camps', category: 'represor', description: 'Jefe de la Policía de la Provincia de Buenos Aires. Responsable de múltiples CCD.' },
  { id: 'dict-guillermo-suarez-mason', name: 'Guillermo Suárez Mason', slug: 'guillermo-suarez-mason', category: 'represor', description: 'Comandante del I Cuerpo de Ejército. Zona 1 (Buenos Aires). Condenado a prisión perpetua.' },
  { id: 'dict-jorge-eduardo-acosta', name: 'Jorge Eduardo Acosta', slug: 'jorge-eduardo-acosta', category: 'represor', description: '"El Tigre". ESMA, Grupo de Tareas 3.3.2. Condenado a prisión perpetua.' },
  { id: 'dict-hector-antonio-febres', name: 'Héctor Antonio Febres', slug: 'hector-antonio-febres', category: 'represor', description: 'Prefecto. ESMA. Murió en prisión antes de la sentencia en 2007.' },
  { id: 'dict-alberto-pedro-bignone', name: 'Alberto Pedro Bignone', slug: 'alberto-pedro-bignone', category: 'represor', description: 'Último presidente de facto (1982-1983). Campo de Mayo. Condenado a prisión perpetua.' },
  { id: 'dict-carlos-guillermo-suarez-mason', name: 'Carlos Guillermo Suárez Mason', slug: 'carlos-guillermo-suarez-mason', category: 'represor', description: 'Comandante del I Cuerpo de Ejército. Prófugo en EE.UU. hasta 1988.' },
  { id: 'dict-mario-eduardo-firmenich', name: 'Mario Eduardo Firmenich', slug: 'mario-eduardo-firmenich', category: 'complice_civil', description: 'Líder de Montoneros. Figura controversial. Acusado de colaboración con la dictadura.' },
  { id: 'dict-jose-alfredo-martinez-de-hoz', name: 'José Alfredo Martínez de Hoz', slug: 'jose-alfredo-martinez-de-hoz', category: 'complice_civil', description: 'Ministro de Economía durante la dictadura (1976-1981). Artífice del plan económico neoliberal.' },

  // ─── DDHH leaders (testigo) ───────────────────────────────────────────
  { id: 'dict-estela-de-carlotto', name: 'Estela de Carlotto', slug: 'estela-de-carlotto', category: 'testigo', description: 'Presidenta de Abuelas de Plaza de Mayo. Su hija Laura fue desaparecida. Encontró a su nieto en 2014.' },
  { id: 'dict-hebe-de-bonafini', name: 'Hebe de Bonafini', slug: 'hebe-de-bonafini', category: 'testigo', description: 'Presidenta de Madres de Plaza de Mayo. Dos hijos desaparecidos. Ícono de la lucha por los DDHH.' },
  { id: 'dict-adolfo-perez-esquivel', name: 'Adolfo Pérez Esquivel', slug: 'adolfo-perez-esquivel', category: 'testigo', description: 'Premio Nobel de la Paz 1980. Defensor de los derechos humanos. Detenido y torturado por la dictadura.' },
  { id: 'dict-emilio-fermin-mignone', name: 'Emilio Fermín Mignone', slug: 'emilio-fermin-mignone', category: 'testigo', description: 'Fundador del CELS (Centro de Estudios Legales y Sociales). Su hija Mónica fue desaparecida.' },

  // ─── Key victims ──────────────────────────────────────────────────────
  { id: 'dict-rodolfo-walsh', name: 'Rodolfo Walsh', slug: 'rodolfo-walsh', category: 'victima', description: 'Escritor, periodista y militante. Autor de "Carta Abierta a la Junta Militar". Asesinado el 25 de marzo de 1977.' },
  { id: 'dict-azucena-villaflor', name: 'Azucena Villaflor', slug: 'azucena-villaflor', category: 'victima', description: 'Fundadora de Madres de Plaza de Mayo. Desaparecida el 10 de diciembre de 1977. Restos identificados en 2005.' },
  { id: 'dict-hector-german-oesterheld', name: 'Héctor Germán Oesterheld', slug: 'hector-german-oesterheld', category: 'victima', description: 'Historietista, creador de El Eternauta. Desaparecido en 1977. Sus cuatro hijas también fueron desaparecidas.' },
  { id: 'dict-carlos-mugica', name: 'Carlos Mugica', slug: 'carlos-mugica', category: 'victima', description: 'Sacerdote del Movimiento de Sacerdotes para el Tercer Mundo. Asesinado el 11 de mayo de 1974.' },
  { id: 'dict-haroldo-conti', name: 'Haroldo Conti', slug: 'haroldo-conti', category: 'victima', description: 'Escritor y novelista argentino. Desaparecido el 4 de mayo de 1976.' },
  { id: 'dict-dagmar-hagelin', name: 'Dagmar Hagelin', slug: 'dagmar-hagelin', category: 'victima', description: 'Joven sueco-argentina de 17 años. Baleada por Alfredo Astiz. Desaparecida.' },
  { id: 'dict-alice-domon', name: 'Alice Domon', slug: 'alice-domon', category: 'victima', description: 'Monja francesa. Desaparecida desde la ESMA en diciembre de 1977.' },
  { id: 'dict-leonie-duquet', name: 'Léonie Duquet', slug: 'leonie-duquet', category: 'victima', description: 'Monja francesa. Desaparecida desde la ESMA en diciembre de 1977. Restos identificados en 2005.' },
  { id: 'dict-raymundo-gleyzer', name: 'Raymundo Gleyzer', slug: 'raymundo-gleyzer', category: 'victima', description: 'Cineasta y documentalista. Desaparecido el 27 de mayo de 1976.' },
  { id: 'dict-julio-lopez', name: 'Julio López', slug: 'julio-lopez', category: 'victima', description: 'Testigo clave en el juicio contra Etchecolatz. Desaparecido el 18 de septiembre de 2006, en democracia.' },

  // ─── Judges ───────────────────────────────────────────────────────────
  { id: 'dict-julio-cesar-strassera', name: 'Julio César Strassera', slug: 'julio-cesar-strassera', category: 'juez', description: 'Fiscal del Juicio a las Juntas (1985). "Señores jueces, nunca más".' },
  { id: 'dict-luis-gabriel-moreno-ocampo', name: 'Luis Gabriel Moreno Ocampo', slug: 'luis-gabriel-moreno-ocampo', category: 'juez', description: 'Fiscal adjunto del Juicio a las Juntas. Primer fiscal jefe de la Corte Penal Internacional (CPI).' },
  { id: 'dict-carlos-santiago-fayt', name: 'Carlos Santiago Fayt', slug: 'carlos-santiago-fayt', category: 'juez', description: 'Ministro de la Corte Suprema de Justicia. Participó en decisiones clave sobre los juicios.' },
]

// ---------------------------------------------------------------------------
// Seed data — CCDs (Centros Clandestinos de Detención)
// ---------------------------------------------------------------------------

const ccds = [
  { id: 'dict-ccd-esma', name: 'ESMA', slug: 'esma', province: 'Buenos Aires', lat: -34.5428, lon: -58.4637, fuerza: 'Armada', description: 'Escuela de Mecánica de la Armada. Principal centro clandestino de detención. Se estima que pasaron 5.000 detenidos.' },
  { id: 'dict-ccd-la-perla', name: 'La Perla', slug: 'la-perla', province: 'Córdoba', lat: -31.4833, lon: -64.3167, fuerza: 'Ejército', description: 'Centro clandestino del III Cuerpo de Ejército en Córdoba. Uno de los más grandes del interior.' },
  { id: 'dict-ccd-campo-de-mayo', name: 'Campo de Mayo', slug: 'campo-de-mayo', province: 'Buenos Aires', lat: -34.5333, lon: -58.6833, fuerza: 'Ejército', description: 'Guarnición militar con múltiples centros de detención. Incluía maternidad clandestina.' },
  { id: 'dict-ccd-el-olimpo', name: 'El Olimpo', slug: 'el-olimpo', province: 'Buenos Aires', lat: -34.6567, lon: -58.4633, fuerza: 'Ejército/PFA', description: 'Centro clandestino en el barrio de Floresta, Buenos Aires. Operó entre agosto de 1978 y enero de 1979.' },
  { id: 'dict-ccd-pozo-de-banfield', name: 'Pozo de Banfield', slug: 'pozo-de-banfield', province: 'Buenos Aires', lat: -34.7500, lon: -58.3833, fuerza: 'Policía', description: 'Centro clandestino de la Policía Bonaerense en Banfield.' },
  { id: 'dict-ccd-pozo-de-quilmes', name: 'Pozo de Quilmes', slug: 'pozo-de-quilmes', province: 'Buenos Aires', lat: null, lon: null, fuerza: 'Policía', description: 'Centro clandestino de la Policía Bonaerense en Quilmes.' },
  { id: 'dict-ccd-club-atletico', name: 'Club Atlético', slug: 'club-atletico', province: 'Buenos Aires', lat: -34.6267, lon: -58.3700, fuerza: 'PFA', description: 'Centro clandestino de la PFA. Demolido durante la construcción de la Autopista 25 de Mayo.' },
  { id: 'dict-ccd-automotores-orletti', name: 'Automotores Orletti', slug: 'automotores-orletti', province: 'Buenos Aires', lat: -34.6150, lon: -58.4567, fuerza: 'SIDE', description: 'Hub del Plan Cóndor. Operado por la SIDE. Centro de coordinación represiva transnacional.' },
  { id: 'dict-ccd-la-cacha', name: 'La Cacha', slug: 'la-cacha', province: 'Buenos Aires', lat: null, lon: null, fuerza: 'Policía', description: 'Centro clandestino en La Plata, Buenos Aires.' },
  { id: 'dict-ccd-garage-azopardo', name: 'Garage Azopardo', slug: 'garage-azopardo', province: 'Buenos Aires', lat: null, lon: null, fuerza: 'PFA', description: 'Centro clandestino de la PFA en Buenos Aires.' },
  { id: 'dict-ccd-el-vesubio', name: 'El Vesubio', slug: 'el-vesubio', province: 'Buenos Aires', lat: -34.7033, lon: -58.5250, fuerza: 'Ejército', description: 'Centro clandestino del Ejército en la zona sur del Gran Buenos Aires.' },
  { id: 'dict-ccd-mansion-sere', name: 'Mansión Seré', slug: 'mansion-sere', province: 'Buenos Aires', lat: -34.5917, lon: -58.6700, fuerza: 'Fuerza Aérea', description: 'Centro clandestino de la Fuerza Aérea. Escenario de una fuga histórica de detenidos en 1978.' },
  { id: 'dict-ccd-la-escuelita-neuquen', name: 'La Escuelita (Neuquén)', slug: 'la-escuelita-neuquen', province: 'Neuquén', lat: null, lon: null, fuerza: 'Ejército', description: 'Centro clandestino del Ejército en Neuquén.' },
  { id: 'dict-ccd-la-escuelita-bahia-blanca', name: 'La Escuelita (Bahía Blanca)', slug: 'la-escuelita-bahia-blanca', province: 'Buenos Aires', lat: null, lon: null, fuerza: 'Ejército', description: 'Centro clandestino del Ejército en Bahía Blanca, Buenos Aires.' },
  { id: 'dict-ccd-el-campito', name: 'El Campito', slug: 'el-campito', province: 'Buenos Aires', lat: -34.5333, lon: -58.6833, fuerza: 'Ejército', description: 'Centro clandestino dentro del predio de Campo de Mayo.' },
  { id: 'dict-ccd-comisaria-5ta-la-plata', name: 'Comisaría 5ta La Plata', slug: 'comisaria-5ta-la-plata', province: 'Buenos Aires', lat: null, lon: null, fuerza: 'Policía', description: 'Comisaría utilizada como centro clandestino de detención en La Plata.' },
  { id: 'dict-ccd-destacamento-121', name: 'Destacamento de Inteligencia 121', slug: 'destacamento-121', province: 'Santa Fe', lat: null, lon: null, fuerza: 'Ejército', description: 'Destacamento de Inteligencia del Ejército en Rosario, Santa Fe.' },
  { id: 'dict-ccd-jefatura-policia-tucuman', name: 'Jefatura de Policía de Tucumán', slug: 'jefatura-policia-tucuman', province: 'Tucumán', lat: null, lon: null, fuerza: 'Policía', description: 'Jefatura de Policía utilizada como centro clandestino de detención en Tucumán.' },
  { id: 'dict-ccd-la-ribera', name: 'La Ribera', slug: 'la-ribera', province: 'Córdoba', lat: null, lon: null, fuerza: 'Ejército', description: 'Centro clandestino del Ejército en Córdoba, vinculado al III Cuerpo.' },
]

// ---------------------------------------------------------------------------
// Seed data — Unidades Militares
// ---------------------------------------------------------------------------

const unidades = [
  { id: 'dict-unidad-i-cuerpo', name: 'I Cuerpo de Ejército', slug: 'i-cuerpo-de-ejercito', fuerza: 'Ejército', zona: 'zona 1', sede: 'Buenos Aires', description: 'Zona 1. Responsable de la represión en Capital Federal y Gran Buenos Aires.' },
  { id: 'dict-unidad-ii-cuerpo', name: 'II Cuerpo de Ejército', slug: 'ii-cuerpo-de-ejercito', fuerza: 'Ejército', zona: 'zona 2', sede: 'Rosario', description: 'Zona 2. Responsable de la represión en el Litoral y Noreste.' },
  { id: 'dict-unidad-iii-cuerpo', name: 'III Cuerpo de Ejército', slug: 'iii-cuerpo-de-ejercito', fuerza: 'Ejército', zona: 'zona 3', sede: 'Córdoba', description: 'Zona 3. Responsable de la represión en Córdoba y el centro del país.' },
  { id: 'dict-unidad-v-cuerpo', name: 'V Cuerpo de Ejército', slug: 'v-cuerpo-de-ejercito', fuerza: 'Ejército', zona: 'zona 5', sede: 'Bahía Blanca', description: 'Zona 5. Responsable de la represión en la Patagonia y sur bonaerense.' },
  { id: 'dict-unidad-esma', name: 'Escuela de Mecánica de la Armada (ESMA)', slug: 'esma-unidad', fuerza: 'Armada', zona: null, sede: 'Buenos Aires', description: 'Principal centro de formación de la Armada. Funcionó como CCD y centro de operaciones del GT 3.3.2.' },
  { id: 'dict-unidad-bat-inteligencia-601', name: 'Batallón de Inteligencia 601', slug: 'batallon-inteligencia-601', fuerza: 'Ejército', zona: null, sede: 'Buenos Aires', description: 'Principal órgano de inteligencia del Ejército Argentino durante la dictadura.' },
  { id: 'dict-unidad-side', name: 'SIDE', slug: 'side', fuerza: 'Estado', zona: null, sede: 'Buenos Aires', description: 'Secretaría de Inteligencia de Estado. Coordinación de inteligencia a nivel nacional.' },
  { id: 'dict-unidad-pfa', name: 'Policía Federal Argentina (PFA)', slug: 'policia-federal-argentina', fuerza: 'Policía', zona: null, sede: 'Buenos Aires', description: 'Policía Federal Argentina. Operó múltiples centros clandestinos de detención.' },
  { id: 'dict-unidad-policia-bonaerense', name: 'Policía de la Provincia de Buenos Aires', slug: 'policia-provincia-buenos-aires', fuerza: 'Policía', zona: null, sede: 'La Plata', description: 'Policía Bonaerense. Bajo el mando de Camps, operó el circuito represivo de la zona sur.' },
  { id: 'dict-unidad-gt-332', name: 'Grupo de Tareas 3.3.2', slug: 'grupo-tareas-332', fuerza: 'Armada', zona: null, sede: 'Buenos Aires', description: 'Grupo de tareas de la ESMA. Responsable de secuestros, torturas y vuelos de la muerte.' },
  { id: 'dict-unidad-sie', name: 'Servicio de Inteligencia del Ejército (SIE)', slug: 'servicio-inteligencia-ejercito', fuerza: 'Ejército', zona: null, sede: 'Buenos Aires', description: 'Servicio de inteligencia del Ejército Argentino.' },
  { id: 'dict-unidad-ri-1-patricios', name: 'Regimiento de Infantería 1 Patricios', slug: 'regimiento-infanteria-1-patricios', fuerza: 'Ejército', zona: null, sede: 'Buenos Aires', description: 'Regimiento histórico del Ejército Argentino con sede en Palermo.' },
  { id: 'dict-unidad-esma-escuela', name: 'Escuela Superior de Mecánica de la Armada', slug: 'escuela-superior-mecanica-armada', fuerza: 'Armada', zona: null, sede: 'Buenos Aires', description: 'Escuela de formación técnica de la Armada. Funcionó en el mismo predio que el CCD.' },
  { id: 'dict-unidad-prefectura', name: 'Prefectura Naval Argentina', slug: 'prefectura-naval-argentina', fuerza: 'Armada', zona: null, sede: 'Buenos Aires', description: 'Fuerza de seguridad con jurisdicción sobre aguas navegables. Participó en operaciones represivas.' },
]

// ---------------------------------------------------------------------------
// Seed data — Lugares (provinces for CCD locations)
// ---------------------------------------------------------------------------

const lugares = [
  { id: 'dict-lugar-buenos-aires', name: 'Buenos Aires', slug: 'buenos-aires', lugar_type: 'provincia', description: 'Provincia de Buenos Aires y Ciudad Autónoma. Principal zona de operaciones represivas.' },
  { id: 'dict-lugar-cordoba', name: 'Córdoba', slug: 'cordoba', lugar_type: 'provincia', description: 'Provincia de Córdoba. Zona 3 bajo el mando de Menéndez.' },
  { id: 'dict-lugar-tucuman', name: 'Tucumán', slug: 'tucuman', lugar_type: 'provincia', description: 'Provincia de Tucumán. Escenario del Operativo Independencia.' },
  { id: 'dict-lugar-santa-fe', name: 'Santa Fe', slug: 'santa-fe', lugar_type: 'provincia', description: 'Provincia de Santa Fe. Zona 2 con sede en Rosario.' },
  { id: 'dict-lugar-neuquen', name: 'Neuquén', slug: 'neuquen', lugar_type: 'provincia', description: 'Provincia de Neuquén. Zona de operaciones del V Cuerpo.' },
]

// ---------------------------------------------------------------------------
// Seed data — Organizaciones
// ---------------------------------------------------------------------------

const organizaciones = [
  { id: 'dict-org-conadep', name: 'CONADEP', slug: 'conadep', org_type: 'ddhh', description: 'Comisión Nacional sobre la Desaparición de Personas. Creada en 1983 por Alfonsín. Produjo el informe Nunca Más.' },
  { id: 'dict-org-abuelas', name: 'Abuelas de Plaza de Mayo', slug: 'abuelas-plaza-mayo', org_type: 'ddhh', description: 'Organización dedicada a encontrar a los nietos apropiados durante la dictadura.' },
  { id: 'dict-org-madres', name: 'Madres de Plaza de Mayo', slug: 'madres-plaza-mayo', org_type: 'ddhh', description: 'Organización de madres de desaparecidos. Comenzaron a marchar en la Plaza de Mayo en 1977.' },
  { id: 'dict-org-cels', name: 'CELS', slug: 'cels', org_type: 'ddhh', description: 'Centro de Estudios Legales y Sociales. Fundado por Emilio Mignone en 1979.' },
  { id: 'dict-org-memoria-abierta', name: 'Memoria Abierta', slug: 'memoria-abierta', org_type: 'ddhh', description: 'Alianza de organizaciones de derechos humanos dedicada a preservar la memoria del terrorismo de Estado.' },
  { id: 'dict-org-junta-militar', name: 'Junta Militar', slug: 'junta-militar', org_type: 'militar', description: 'Órgano supremo del gobierno de facto. Integrada por los comandantes de las tres fuerzas armadas.' },
  { id: 'dict-org-ejercito', name: 'Ejército Argentino', slug: 'ejercito-argentino', org_type: 'militar', description: 'Ejército Argentino. Principal fuerza responsable de la represión.' },
  { id: 'dict-org-armada', name: 'Armada Argentina', slug: 'armada-argentina', org_type: 'militar', description: 'Armada Argentina. Responsable de la ESMA y los vuelos de la muerte.' },
  { id: 'dict-org-faa', name: 'Fuerza Aérea Argentina', slug: 'fuerza-aerea-argentina', org_type: 'militar', description: 'Fuerza Aérea Argentina. Operó centros clandestinos como Mansión Seré.' },
  { id: 'dict-org-cia', name: 'CIA', slug: 'cia', org_type: 'inteligencia', description: 'Central Intelligence Agency. Apoyo y coordinación con las dictaduras del Cono Sur.' },
  { id: 'dict-org-fbi', name: 'FBI', slug: 'fbi', org_type: 'inteligencia', description: 'Federal Bureau of Investigation. Cooperación con servicios de inteligencia argentinos.' },
  { id: 'dict-org-state-dept', name: 'U.S. Department of State', slug: 'us-department-of-state', org_type: 'gobierno', description: 'Departamento de Estado de EE.UU. Documentación desclasificada revela conocimiento de la represión.' },
  { id: 'dict-org-dina', name: 'DINA', slug: 'dina', org_type: 'inteligencia', description: 'Dirección de Inteligencia Nacional, Chile. Policía secreta de Pinochet. Pilar del Plan Cóndor.' },
  { id: 'dict-org-sie-bolivia', name: 'SIE (Bolivia)', slug: 'sie-bolivia', org_type: 'inteligencia', description: 'Servicio de Inteligencia del Estado, Bolivia. Participante del Plan Cóndor.' },
  { id: 'dict-org-ocoa', name: 'OCOA', slug: 'ocoa', org_type: 'inteligencia', description: 'Organismo Coordinador de Operaciones Antisubversivas, Uruguay. Participante del Plan Cóndor.' },
  { id: 'dict-org-ford', name: 'Ford Motor Argentina', slug: 'ford-motor-argentina', org_type: 'empresa', description: 'Empresa automotriz. Acusada de colaborar con la dictadura en la represión de trabajadores sindicalizados.' },
  { id: 'dict-org-mercedes', name: 'Mercedes-Benz Argentina', slug: 'mercedes-benz-argentina', org_type: 'empresa', description: 'Empresa automotriz. Acusada de entregar listas de trabajadores sindicalizados a las fuerzas de seguridad.' },
  { id: 'dict-org-acindar', name: 'Acindar', slug: 'acindar', org_type: 'empresa', description: 'Empresa siderúrgica. Martínez de Hoz fue su presidente. Vinculada a represión de obreros.' },
  { id: 'dict-org-sociedad-rural', name: 'Sociedad Rural Argentina', slug: 'sociedad-rural-argentina', org_type: 'empresa', description: 'Asociación de grandes terratenientes. Apoyó el golpe y el plan económico de la dictadura.' },
  { id: 'dict-org-conferencia-episcopal', name: 'Conferencia Episcopal Argentina', slug: 'conferencia-episcopal-argentina', org_type: 'gobierno', description: 'Jerarquía de la Iglesia Católica Argentina. Complicidad parcial documentada con el régimen.' },
]

// ---------------------------------------------------------------------------
// Seed data — Eventos
// ---------------------------------------------------------------------------

const eventos = [
  { id: 'dict-evt-golpe', title: 'Golpe de Estado', slug: 'golpe-de-estado-1976', date: '1976-03-24', event_type: 'politico', description: 'Las Fuerzas Armadas derrocan al gobierno de Isabel Perón e instauran el Proceso de Reorganización Nacional.' },
  { id: 'dict-evt-noche-lapices', title: 'Noche de los Lápices', slug: 'noche-de-los-lapices', date: '1976-09-16', event_type: 'secuestro', description: 'Secuestro de estudiantes secundarios en La Plata que reclamaban el boleto estudiantil. Emblema de la represión a jóvenes.' },
  { id: 'dict-evt-masacre-trelew', title: 'Masacre de Trelew', slug: 'masacre-de-trelew', date: '1972-08-22', event_type: 'masacre', description: 'Fusilamiento de 16 presos políticos en la Base Aeronaval Almirante Zar. Precursora de la represión sistemática.' },
  { id: 'dict-evt-operativo-independencia', title: 'Operativo Independencia', slug: 'operativo-independencia', date: '1975-02-09', event_type: 'operativo', description: 'Operación militar en Tucumán autorizada por decreto. Primera experiencia de represión sistemática a gran escala.' },
  { id: 'dict-evt-juicio-juntas', title: 'Juicio a las Juntas', slug: 'juicio-a-las-juntas', date: '1985-04-22', event_type: 'juicio', description: 'Juicio oral y público a los comandantes de las tres primeras juntas militares. Hito en la justicia transicional mundial.' },
  { id: 'dict-evt-ley-punto-final', title: 'Ley de Punto Final', slug: 'ley-de-punto-final', date: '1986-12-24', event_type: 'legislativo', description: 'Ley 23.492. Estableció un plazo de 60 días para iniciar nuevas causas por crímenes de la dictadura.' },
  { id: 'dict-evt-ley-obediencia-debida', title: 'Ley de Obediencia Debida', slug: 'ley-de-obediencia-debida', date: '1987-06-04', event_type: 'legislativo', description: 'Ley 23.521. Eximió de responsabilidad penal a militares de rango inferior por cumplir órdenes.' },
  { id: 'dict-evt-visita-cidh', title: 'Visita CIDH', slug: 'visita-cidh', date: '1979-09-06', event_type: 'diplomatico', description: 'La Comisión Interamericana de Derechos Humanos visita Argentina. Recibió miles de denuncias.' },
  { id: 'dict-evt-mundial-78', title: 'Mundial 78', slug: 'mundial-78', date: '1978-06-01', event_type: 'politico', description: 'Copa Mundial de Fútbol celebrada en Argentina. Utilizada por la dictadura como herramienta de propaganda.' },
  { id: 'dict-evt-guerra-malvinas', title: 'Guerra de Malvinas', slug: 'guerra-de-malvinas', date: '1982-04-02', event_type: 'politico', description: 'Conflicto bélico contra el Reino Unido por las Islas Malvinas. Aceleró la caída de la dictadura.' },
  { id: 'dict-evt-anulacion-leyes', title: 'Anulación leyes de impunidad', slug: 'anulacion-leyes-impunidad', date: '2005-06-14', event_type: 'legislativo', description: 'La Corte Suprema declara inconstitucionales las leyes de Punto Final y Obediencia Debida. Reabre los juicios.' },
  { id: 'dict-evt-nunca-mas', title: 'Informe Nunca Más presentado', slug: 'informe-nunca-mas', date: '1984-09-20', event_type: 'juicio', description: 'La CONADEP entrega al presidente Alfonsín el informe Nunca Más con la documentación de la represión.' },
  { id: 'dict-evt-indultos-menem', title: 'Indultos de Menem', slug: 'indultos-de-menem', date: '1989-10-07', event_type: 'legislativo', description: 'El presidente Menem indulta a los condenados del Juicio a las Juntas y a jefes militares.' },
  { id: 'dict-evt-primer-escrache', title: 'Primer escrache H.I.J.O.S.', slug: 'primer-escrache-hijos', date: '1996-12-08', event_type: 'politico', description: 'H.I.J.O.S. realiza el primer escrache a un represor impune. Nueva forma de justicia social.' },
  { id: 'dict-evt-sentencia-esma', title: 'Sentencia ESMA', slug: 'sentencia-esma', date: '2011-10-26', event_type: 'juicio', description: 'Sentencia del megajuicio ESMA. Condenas a Astiz, Acosta y otros represores a prisión perpetua.' },
]

// ---------------------------------------------------------------------------
// Seed data — Causas
// ---------------------------------------------------------------------------

const causas = [
  { id: 'dict-causa-13', name: 'Causa 13 (Juicio a las Juntas)', slug: 'causa-13', status: 'con_sentencia', description: 'Juicio a los nueve comandantes de las tres primeras juntas militares. Sentencia del 9 de diciembre de 1985.' },
  { id: 'dict-causa-esma', name: 'Causa ESMA', slug: 'causa-esma', status: 'con_sentencia', description: 'Megajuicio por los crímenes cometidos en la ESMA. Múltiples condenas a prisión perpetua.' },
  { id: 'dict-causa-la-perla', name: 'Causa La Perla', slug: 'causa-la-perla', status: 'con_sentencia', description: 'Juicio por los crímenes cometidos en el CCD La Perla, Córdoba.' },
  { id: 'dict-causa-plan-condor', name: 'Causa Plan Cóndor', slug: 'causa-plan-condor', status: 'con_sentencia', description: 'Juicio por la coordinación represiva transnacional entre dictaduras del Cono Sur.' },
  { id: 'dict-causa-automotores-orletti', name: 'Causa Automotores Orletti', slug: 'causa-automotores-orletti', status: 'con_sentencia', description: 'Juicio por los crímenes en Automotores Orletti, centro del Plan Cóndor.' },
  { id: 'dict-causa-camps', name: 'Causa Camps', slug: 'causa-camps', status: 'con_sentencia', description: 'Juicio al circuito represivo de la Policía Bonaerense bajo el mando de Camps.' },
  { id: 'dict-causa-abo', name: 'Causa ABO (Atlético-Banco-Olimpo)', slug: 'causa-abo', status: 'con_sentencia', description: 'Juicio por el circuito represivo Atlético-Banco-Olimpo operado por el Ejército y la PFA.' },
  { id: 'dict-causa-operativo-independencia', name: 'Causa Operativo Independencia', slug: 'causa-operativo-independencia', status: 'en_juicio', description: 'Juicio por los crímenes cometidos durante el Operativo Independencia en Tucumán.' },
  { id: 'dict-causa-campo-de-mayo', name: 'Causa Campo de Mayo', slug: 'causa-campo-de-mayo', status: 'con_sentencia', description: 'Juicio por los crímenes cometidos en la guarnición militar de Campo de Mayo.' },
  { id: 'dict-causa-suarez-mason', name: 'Causa Suárez Mason', slug: 'causa-suarez-mason', status: 'con_sentencia', description: 'Juicio al comandante del I Cuerpo de Ejército por crímenes de lesa humanidad.' },
]

// ---------------------------------------------------------------------------
// Seed data — Operaciones
// ---------------------------------------------------------------------------

const operaciones = [
  { id: 'dict-op-plan-condor', name: 'Plan Cóndor', slug: 'plan-condor', date_start: '1975', date_end: '1989', description: 'Coordinación represiva transnacional entre las dictaduras de Argentina, Chile, Uruguay, Paraguay, Brasil y Bolivia.' },
  { id: 'dict-op-operativo-independencia', name: 'Operativo Independencia', slug: 'operativo-independencia', date_start: '1975', date_end: '1977', description: 'Operación contrainsurgente en Tucumán. Primera experiencia de represión sistemática y desapariciones forzadas.' },
  { id: 'dict-op-proceso', name: 'Proceso de Reorganización Nacional', slug: 'proceso-reorganizacion-nacional', date_start: '1976', date_end: '1983', description: 'Nombre oficial de la dictadura militar argentina. 30.000 desaparecidos.' },
  { id: 'dict-op-murcielago', name: 'Operación Murciélago', slug: 'operacion-murcielago', date_start: '1976', date_end: '1983', description: 'Operaciones de inteligencia de la ESMA. Incluía infiltración, secuestros y vuelos de la muerte.' },
  { id: 'dict-op-claridad', name: 'Operativo Claridad', slug: 'operativo-claridad', date_start: '1976', date_end: '1983', description: 'Purga cultural y educativa. Censura, quema de libros y persecución de docentes e intelectuales.' },
]

// ---------------------------------------------------------------------------
// Relationship data
// ---------------------------------------------------------------------------

// Junta members → PERTENECE_A → military branch
const perteneceAOrg = [
  // Junta I
  { personId: 'dict-jorge-rafael-videla', orgId: 'dict-org-ejercito' },
  { personId: 'dict-emilio-eduardo-massera', orgId: 'dict-org-armada' },
  { personId: 'dict-orlando-ramon-agosti', orgId: 'dict-org-faa' },
  // Junta II
  { personId: 'dict-roberto-eduardo-viola', orgId: 'dict-org-ejercito' },
  { personId: 'dict-armando-lambruschini', orgId: 'dict-org-armada' },
  { personId: 'dict-omar-domingo-rubens-graffigna', orgId: 'dict-org-faa' },
  // Junta III
  { personId: 'dict-leopoldo-fortunato-galtieri', orgId: 'dict-org-ejercito' },
  { personId: 'dict-jorge-isaac-anaya', orgId: 'dict-org-armada' },
  { personId: 'dict-basilio-arturo-ignacio-lami-dozo', orgId: 'dict-org-faa' },
  // Junta IV
  { personId: 'dict-cristino-nicolaides', orgId: 'dict-org-ejercito' },
  { personId: 'dict-ruben-oscar-franco', orgId: 'dict-org-armada' },
  { personId: 'dict-augusto-jorge-hughes', orgId: 'dict-org-faa' },
  // All Junta members → Junta Militar
  { personId: 'dict-jorge-rafael-videla', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-emilio-eduardo-massera', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-orlando-ramon-agosti', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-roberto-eduardo-viola', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-armando-lambruschini', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-omar-domingo-rubens-graffigna', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-leopoldo-fortunato-galtieri', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-jorge-isaac-anaya', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-basilio-arturo-ignacio-lami-dozo', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-cristino-nicolaides', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-ruben-oscar-franco', orgId: 'dict-org-junta-militar' },
  { personId: 'dict-augusto-jorge-hughes', orgId: 'dict-org-junta-militar' },
]

// Key perpetrators → PERTENECE_A → their units
const perteneceAUnidad = [
  // ESMA group
  { personId: 'dict-alfredo-astiz', unidadId: 'dict-unidad-esma' },
  { personId: 'dict-alfredo-astiz', unidadId: 'dict-unidad-gt-332' },
  { personId: 'dict-jorge-eduardo-acosta', unidadId: 'dict-unidad-esma' },
  { personId: 'dict-jorge-eduardo-acosta', unidadId: 'dict-unidad-gt-332' },
  { personId: 'dict-hector-antonio-febres', unidadId: 'dict-unidad-esma' },
  { personId: 'dict-hector-antonio-febres', unidadId: 'dict-unidad-gt-332' },
  { personId: 'dict-emilio-eduardo-massera', unidadId: 'dict-unidad-esma' },
  // Policía Bonaerense
  { personId: 'dict-miguel-osvaldo-etchecolatz', unidadId: 'dict-unidad-policia-bonaerense' },
  { personId: 'dict-ramon-juan-alberto-camps', unidadId: 'dict-unidad-policia-bonaerense' },
  // III Cuerpo
  { personId: 'dict-luciano-benjamin-menendez', unidadId: 'dict-unidad-iii-cuerpo' },
  // V Cuerpo / Tucumán
  { personId: 'dict-antonio-domingo-bussi', unidadId: 'dict-unidad-v-cuerpo' },
  // I Cuerpo
  { personId: 'dict-guillermo-suarez-mason', unidadId: 'dict-unidad-i-cuerpo' },
  { personId: 'dict-carlos-guillermo-suarez-mason', unidadId: 'dict-unidad-i-cuerpo' },
  // Bignone - Campo de Mayo
  { personId: 'dict-alberto-pedro-bignone', unidadId: 'dict-unidad-i-cuerpo' },
]

// Junta members → COMANDO → their units
const comando = [
  { personId: 'dict-guillermo-suarez-mason', unidadId: 'dict-unidad-i-cuerpo' },
  { personId: 'dict-carlos-guillermo-suarez-mason', unidadId: 'dict-unidad-i-cuerpo' },
  { personId: 'dict-luciano-benjamin-menendez', unidadId: 'dict-unidad-iii-cuerpo' },
  { personId: 'dict-ramon-juan-alberto-camps', unidadId: 'dict-unidad-policia-bonaerense' },
  { personId: 'dict-jorge-eduardo-acosta', unidadId: 'dict-unidad-gt-332' },
]

// CCDs → OPERADO_POR → military units
const operadoPor = [
  { ccdId: 'dict-ccd-esma', unidadId: 'dict-unidad-esma' },
  { ccdId: 'dict-ccd-la-perla', unidadId: 'dict-unidad-iii-cuerpo' },
  { ccdId: 'dict-ccd-campo-de-mayo', unidadId: 'dict-unidad-i-cuerpo' },
  { ccdId: 'dict-ccd-el-olimpo', unidadId: 'dict-unidad-i-cuerpo' },
  { ccdId: 'dict-ccd-pozo-de-banfield', unidadId: 'dict-unidad-policia-bonaerense' },
  { ccdId: 'dict-ccd-pozo-de-quilmes', unidadId: 'dict-unidad-policia-bonaerense' },
  { ccdId: 'dict-ccd-club-atletico', unidadId: 'dict-unidad-pfa' },
  { ccdId: 'dict-ccd-automotores-orletti', unidadId: 'dict-unidad-side' },
  { ccdId: 'dict-ccd-la-cacha', unidadId: 'dict-unidad-policia-bonaerense' },
  { ccdId: 'dict-ccd-garage-azopardo', unidadId: 'dict-unidad-pfa' },
  { ccdId: 'dict-ccd-el-vesubio', unidadId: 'dict-unidad-i-cuerpo' },
  { ccdId: 'dict-ccd-mansion-sere', unidadId: 'dict-unidad-esma' }, // Fuerza Aérea — closest match
  { ccdId: 'dict-ccd-la-escuelita-neuquen', unidadId: 'dict-unidad-v-cuerpo' },
  { ccdId: 'dict-ccd-la-escuelita-bahia-blanca', unidadId: 'dict-unidad-v-cuerpo' },
  { ccdId: 'dict-ccd-el-campito', unidadId: 'dict-unidad-i-cuerpo' },
  { ccdId: 'dict-ccd-comisaria-5ta-la-plata', unidadId: 'dict-unidad-policia-bonaerense' },
  { ccdId: 'dict-ccd-destacamento-121', unidadId: 'dict-unidad-ii-cuerpo' },
  { ccdId: 'dict-ccd-jefatura-policia-tucuman', unidadId: 'dict-unidad-v-cuerpo' },
  { ccdId: 'dict-ccd-la-ribera', unidadId: 'dict-unidad-iii-cuerpo' },
]

// CCDs → UBICADO_EN → DictaduraLugar
const ubicadoEn = [
  { ccdId: 'dict-ccd-esma', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-la-perla', lugarId: 'dict-lugar-cordoba' },
  { ccdId: 'dict-ccd-campo-de-mayo', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-el-olimpo', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-pozo-de-banfield', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-pozo-de-quilmes', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-club-atletico', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-automotores-orletti', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-la-cacha', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-garage-azopardo', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-el-vesubio', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-mansion-sere', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-la-escuelita-neuquen', lugarId: 'dict-lugar-neuquen' },
  { ccdId: 'dict-ccd-la-escuelita-bahia-blanca', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-el-campito', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-comisaria-5ta-la-plata', lugarId: 'dict-lugar-buenos-aires' },
  { ccdId: 'dict-ccd-destacamento-121', lugarId: 'dict-lugar-santa-fe' },
  { ccdId: 'dict-ccd-jefatura-policia-tucuman', lugarId: 'dict-lugar-tucuman' },
  { ccdId: 'dict-ccd-la-ribera', lugarId: 'dict-lugar-cordoba' },
]

// Key victims → DETENIDO_EN → CCDs
const detenidoEn = [
  { personId: 'dict-azucena-villaflor', ccdId: 'dict-ccd-esma' },
  { personId: 'dict-alice-domon', ccdId: 'dict-ccd-esma' },
  { personId: 'dict-leonie-duquet', ccdId: 'dict-ccd-esma' },
  { personId: 'dict-dagmar-hagelin', ccdId: 'dict-ccd-esma' },
  { personId: 'dict-hector-german-oesterheld', ccdId: 'dict-ccd-esma' },
  { personId: 'dict-haroldo-conti', ccdId: 'dict-ccd-campo-de-mayo' },
  { personId: 'dict-julio-lopez', ccdId: 'dict-ccd-pozo-de-banfield' },
  { personId: 'dict-adolfo-perez-esquivel', ccdId: 'dict-ccd-club-atletico' },
]

// Personas → ACUSADO_EN → Causas
const acusadoEn = [
  // Causa 13 — Juicio a las Juntas (Juntas I-III)
  { personId: 'dict-jorge-rafael-videla', causaId: 'dict-causa-13' },
  { personId: 'dict-emilio-eduardo-massera', causaId: 'dict-causa-13' },
  { personId: 'dict-orlando-ramon-agosti', causaId: 'dict-causa-13' },
  { personId: 'dict-roberto-eduardo-viola', causaId: 'dict-causa-13' },
  { personId: 'dict-armando-lambruschini', causaId: 'dict-causa-13' },
  { personId: 'dict-omar-domingo-rubens-graffigna', causaId: 'dict-causa-13' },
  { personId: 'dict-leopoldo-fortunato-galtieri', causaId: 'dict-causa-13' },
  { personId: 'dict-jorge-isaac-anaya', causaId: 'dict-causa-13' },
  { personId: 'dict-basilio-arturo-ignacio-lami-dozo', causaId: 'dict-causa-13' },
  // Causa ESMA
  { personId: 'dict-alfredo-astiz', causaId: 'dict-causa-esma' },
  { personId: 'dict-jorge-eduardo-acosta', causaId: 'dict-causa-esma' },
  { personId: 'dict-hector-antonio-febres', causaId: 'dict-causa-esma' },
  { personId: 'dict-emilio-eduardo-massera', causaId: 'dict-causa-esma' },
  // Causa La Perla
  { personId: 'dict-luciano-benjamin-menendez', causaId: 'dict-causa-la-perla' },
  // Causa Plan Cóndor
  { personId: 'dict-jorge-rafael-videla', causaId: 'dict-causa-plan-condor' },
  { personId: 'dict-emilio-eduardo-massera', causaId: 'dict-causa-plan-condor' },
  // Causa Automotores Orletti
  { personId: 'dict-guillermo-suarez-mason', causaId: 'dict-causa-automotores-orletti' },
  // Causa Camps
  { personId: 'dict-ramon-juan-alberto-camps', causaId: 'dict-causa-camps' },
  { personId: 'dict-miguel-osvaldo-etchecolatz', causaId: 'dict-causa-camps' },
  // Causa ABO
  { personId: 'dict-guillermo-suarez-mason', causaId: 'dict-causa-abo' },
  // Causa Operativo Independencia
  { personId: 'dict-antonio-domingo-bussi', causaId: 'dict-causa-operativo-independencia' },
  // Causa Campo de Mayo
  { personId: 'dict-alberto-pedro-bignone', causaId: 'dict-causa-campo-de-mayo' },
  // Causa Suárez Mason
  { personId: 'dict-guillermo-suarez-mason', causaId: 'dict-causa-suarez-mason' },
  { personId: 'dict-carlos-guillermo-suarez-mason', causaId: 'dict-causa-suarez-mason' },
]

// DDHH leaders → MIEMBRO_DE → DDHH organizations
const miembroDe = [
  { personId: 'dict-estela-de-carlotto', orgId: 'dict-org-abuelas' },
  { personId: 'dict-hebe-de-bonafini', orgId: 'dict-org-madres' },
  { personId: 'dict-emilio-fermin-mignone', orgId: 'dict-org-cels' },
  { personId: 'dict-azucena-villaflor', orgId: 'dict-org-madres' },
]

// Foreign agencies → COORDINO_CON → SIDE (Plan Cóndor)
const coordinoCon = [
  { agenciaId: 'dict-org-cia', sideId: 'dict-unidad-side' },
  { agenciaId: 'dict-org-dina', sideId: 'dict-unidad-side' },
  { agenciaId: 'dict-org-sie-bolivia', sideId: 'dict-unidad-side' },
  { agenciaId: 'dict-org-ocoa', sideId: 'dict-unidad-side' },
]

// Walsh → ASESINADO_EN → Buenos Aires
const asesinadoEn = [
  { personId: 'dict-rodolfo-walsh', lugarId: 'dict-lugar-buenos-aires' },
  { personId: 'dict-carlos-mugica', lugarId: 'dict-lugar-buenos-aires' },
]

// Personas → PARTICIPO_EN → Eventos
const participoEn = [
  // Juicio a las Juntas
  { personId: 'dict-julio-cesar-strassera', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-luis-gabriel-moreno-ocampo', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-jorge-rafael-videla', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-emilio-eduardo-massera', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-orlando-ramon-agosti', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-roberto-eduardo-viola', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-armando-lambruschini', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-omar-domingo-rubens-graffigna', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-leopoldo-fortunato-galtieri', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-jorge-isaac-anaya', eventoId: 'dict-evt-juicio-juntas' },
  { personId: 'dict-basilio-arturo-ignacio-lami-dozo', eventoId: 'dict-evt-juicio-juntas' },
  // Golpe de Estado
  { personId: 'dict-jorge-rafael-videla', eventoId: 'dict-evt-golpe' },
  { personId: 'dict-emilio-eduardo-massera', eventoId: 'dict-evt-golpe' },
  { personId: 'dict-orlando-ramon-agosti', eventoId: 'dict-evt-golpe' },
  // Operativo Independencia
  { personId: 'dict-antonio-domingo-bussi', eventoId: 'dict-evt-operativo-independencia' },
  // Guerra de Malvinas
  { personId: 'dict-leopoldo-fortunato-galtieri', eventoId: 'dict-evt-guerra-malvinas' },
  { personId: 'dict-jorge-isaac-anaya', eventoId: 'dict-evt-guerra-malvinas' },
  { personId: 'dict-basilio-arturo-ignacio-lami-dozo', eventoId: 'dict-evt-guerra-malvinas' },
  // Sentencia ESMA
  { personId: 'dict-alfredo-astiz', eventoId: 'dict-evt-sentencia-esma' },
  { personId: 'dict-jorge-eduardo-acosta', eventoId: 'dict-evt-sentencia-esma' },
  // Noche de los Lápices — Etchecolatz/Camps oversaw
  { personId: 'dict-miguel-osvaldo-etchecolatz', eventoId: 'dict-evt-noche-lapices' },
  { personId: 'dict-ramon-juan-alberto-camps', eventoId: 'dict-evt-noche-lapices' },
  // Julio López as testigo in Camps trial, then disappeared
  { personId: 'dict-julio-lopez', eventoId: 'dict-evt-sentencia-esma' },
  // Visita CIDH
  { personId: 'dict-adolfo-perez-esquivel', eventoId: 'dict-evt-visita-cidh' },
  { personId: 'dict-estela-de-carlotto', eventoId: 'dict-evt-visita-cidh' },
  { personId: 'dict-hebe-de-bonafini', eventoId: 'dict-evt-visita-cidh' },
  // Nunca Más
  { personId: 'dict-emilio-fermin-mignone', eventoId: 'dict-evt-nunca-mas' },
]

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedPersonas(): Promise<void> {
  console.log(`\nSeeding ${personas.length} personas...`)
  for (const p of personas) {
    await executeWrite(
      `MERGE (p:DictaduraPersona {id: $id})
       SET p.name = $name, p.slug = $slug, p.category = $category, p.description = $description,
           p.caso_slug = $casoSlug, p.confidence_tier = 'gold', p.ingestion_wave = 0, p.source = 'seed',
           p.created_at = datetime(), p.updated_at = datetime()`,
      { ...p, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${p.name}`)
  }
}

async function seedCCDs(): Promise<void> {
  console.log(`\nSeeding ${ccds.length} CCDs...`)
  for (const c of ccds) {
    await executeWrite(
      `MERGE (c:DictaduraCCD {id: $id})
       SET c.name = $name, c.slug = $slug, c.province = $province, c.lat = $lat, c.lon = $lon,
           c.fuerza = $fuerza, c.description = $description,
           c.caso_slug = $casoSlug, c.confidence_tier = 'gold', c.ingestion_wave = 0, c.source = 'seed',
           c.created_at = datetime(), c.updated_at = datetime()`,
      { ...c, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${c.name}`)
  }
}

async function seedUnidades(): Promise<void> {
  console.log(`\nSeeding ${unidades.length} unidades...`)
  for (const u of unidades) {
    await executeWrite(
      `MERGE (u:DictaduraUnidadMilitar {id: $id})
       SET u.name = $name, u.slug = $slug, u.fuerza = $fuerza, u.zona = $zona, u.sede = $sede,
           u.description = $description,
           u.caso_slug = $casoSlug, u.confidence_tier = 'gold', u.ingestion_wave = 0, u.source = 'seed',
           u.created_at = datetime(), u.updated_at = datetime()`,
      { ...u, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${u.name}`)
  }
}

async function seedLugares(): Promise<void> {
  console.log(`\nSeeding ${lugares.length} lugares...`)
  for (const l of lugares) {
    await executeWrite(
      `MERGE (l:DictaduraLugar {id: $id})
       SET l.name = $name, l.slug = $slug, l.lugar_type = $lugar_type, l.description = $description,
           l.caso_slug = $casoSlug, l.confidence_tier = 'gold', l.ingestion_wave = 0, l.source = 'seed',
           l.created_at = datetime(), l.updated_at = datetime()`,
      { ...l, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${l.name}`)
  }
}

async function seedOrganizaciones(): Promise<void> {
  console.log(`\nSeeding ${organizaciones.length} organizaciones...`)
  for (const o of organizaciones) {
    await executeWrite(
      `MERGE (o:DictaduraOrganizacion {id: $id})
       SET o.name = $name, o.slug = $slug, o.org_type = $org_type, o.description = $description,
           o.caso_slug = $casoSlug, o.confidence_tier = 'gold', o.ingestion_wave = 0, o.source = 'seed',
           o.created_at = datetime(), o.updated_at = datetime()`,
      { ...o, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${o.name}`)
  }
}

async function seedEventos(): Promise<void> {
  console.log(`\nSeeding ${eventos.length} eventos...`)
  for (const e of eventos) {
    await executeWrite(
      `MERGE (e:DictaduraEvento {id: $id})
       SET e.title = $title, e.slug = $slug, e.date = $date, e.event_type = $event_type,
           e.description = $description,
           e.caso_slug = $casoSlug, e.confidence_tier = 'gold', e.ingestion_wave = 0, e.source = 'seed',
           e.created_at = datetime(), e.updated_at = datetime()`,
      { ...e, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${e.title}`)
  }
}

async function seedCausas(): Promise<void> {
  console.log(`\nSeeding ${causas.length} causas...`)
  for (const c of causas) {
    await executeWrite(
      `MERGE (c:DictaduraCausa {id: $id})
       SET c.name = $name, c.slug = $slug, c.status = $status, c.description = $description,
           c.caso_slug = $casoSlug, c.confidence_tier = 'gold', c.ingestion_wave = 0, c.source = 'seed',
           c.created_at = datetime(), c.updated_at = datetime()`,
      { ...c, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${c.name}`)
  }
}

async function seedOperaciones(): Promise<void> {
  console.log(`\nSeeding ${operaciones.length} operaciones...`)
  for (const o of operaciones) {
    await executeWrite(
      `MERGE (o:DictaduraOperacion {id: $id})
       SET o.name = $name, o.slug = $slug, o.date_start = $date_start, o.date_end = $date_end,
           o.description = $description,
           o.caso_slug = $casoSlug, o.confidence_tier = 'gold', o.ingestion_wave = 0, o.source = 'seed',
           o.created_at = datetime(), o.updated_at = datetime()`,
      { ...o, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${o.name}`)
  }
}

async function seedRelationships(): Promise<void> {
  console.log('\nSeeding relationships...')

  // PERTENECE_A (Persona → Organizacion)
  console.log('  PERTENECE_A (persona → org)...')
  for (const rel of perteneceAOrg) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraOrganizacion {id: $orgId})
       MERGE (a)-[r:PERTENECE_A]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${perteneceAOrg.length} relationships`)

  // PERTENECE_A (Persona → Unidad)
  console.log('  PERTENECE_A (persona → unidad)...')
  for (const rel of perteneceAUnidad) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraUnidadMilitar {id: $unidadId})
       MERGE (a)-[r:PERTENECE_A]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${perteneceAUnidad.length} relationships`)

  // COMANDO (Persona → Unidad)
  console.log('  COMANDO...')
  for (const rel of comando) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraUnidadMilitar {id: $unidadId})
       MERGE (a)-[r:COMANDO]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${comando.length} relationships`)

  // OPERADO_POR (CCD → Unidad)
  console.log('  OPERADO_POR...')
  for (const rel of operadoPor) {
    await executeWrite(
      `MATCH (a:DictaduraCCD {id: $ccdId}), (b:DictaduraUnidadMilitar {id: $unidadId})
       MERGE (a)-[r:OPERADO_POR]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${operadoPor.length} relationships`)

  // UBICADO_EN (CCD → Lugar)
  console.log('  UBICADO_EN...')
  for (const rel of ubicadoEn) {
    await executeWrite(
      `MATCH (a:DictaduraCCD {id: $ccdId}), (b:DictaduraLugar {id: $lugarId})
       MERGE (a)-[r:UBICADO_EN]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${ubicadoEn.length} relationships`)

  // DETENIDO_EN (Persona → CCD)
  console.log('  DETENIDO_EN...')
  for (const rel of detenidoEn) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraCCD {id: $ccdId})
       MERGE (a)-[r:DETENIDO_EN]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${detenidoEn.length} relationships`)

  // ACUSADO_EN (Persona → Causa)
  console.log('  ACUSADO_EN...')
  for (const rel of acusadoEn) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraCausa {id: $causaId})
       MERGE (a)-[r:ACUSADO_EN]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${acusadoEn.length} relationships`)

  // MIEMBRO_DE (Persona → Organizacion)
  console.log('  MIEMBRO_DE...')
  for (const rel of miembroDe) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraOrganizacion {id: $orgId})
       MERGE (a)-[r:MIEMBRO_DE]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${miembroDe.length} relationships`)

  // COORDINO_CON (Organizacion → Unidad SIDE)
  console.log('  COORDINO_CON...')
  for (const rel of coordinoCon) {
    await executeWrite(
      `MATCH (a:DictaduraOrganizacion {id: $agenciaId}), (b:DictaduraUnidadMilitar {id: $sideId})
       MERGE (a)-[r:COORDINO_CON]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${coordinoCon.length} relationships`)

  // ASESINADO_EN (Persona → Lugar)
  console.log('  ASESINADO_EN...')
  for (const rel of asesinadoEn) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraLugar {id: $lugarId})
       MERGE (a)-[r:ASESINADO_EN]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${asesinadoEn.length} relationships`)

  // PARTICIPO_EN (Persona → Evento)
  console.log('  PARTICIPO_EN...')
  for (const rel of participoEn) {
    await executeWrite(
      `MATCH (a:DictaduraPersona {id: $personId}), (b:DictaduraEvento {id: $eventoId})
       MERGE (a)-[r:PARTICIPO_EN]->(b)
       SET r.source = 'seed'`,
      rel,
    )
  }
  console.log(`    ✓ ${participoEn.length} relationships`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const start = Date.now()

  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Is it running?')
    process.exit(1)
  }
  console.log('Connected.')

  await seedPersonas()
  await seedCCDs()
  await seedUnidades()
  await seedLugares()
  await seedOrganizaciones()
  await seedEventos()
  await seedCausas()
  await seedOperaciones()
  await seedRelationships()

  const totalRelationships =
    perteneceAOrg.length +
    perteneceAUnidad.length +
    comando.length +
    operadoPor.length +
    ubicadoEn.length +
    detenidoEn.length +
    acusadoEn.length +
    miembroDe.length +
    coordinoCon.length +
    asesinadoEn.length +
    participoEn.length

  const duration = Date.now() - start
  console.log(`\n${'─'.repeat(50)}`)
  console.log('Seed summary:')
  console.log(`  Personas:       ${personas.length}`)
  console.log(`  CCDs:           ${ccds.length}`)
  console.log(`  Unidades:       ${unidades.length}`)
  console.log(`  Lugares:        ${lugares.length}`)
  console.log(`  Organizaciones: ${organizaciones.length}`)
  console.log(`  Eventos:        ${eventos.length}`)
  console.log(`  Causas:         ${causas.length}`)
  console.log(`  Operaciones:    ${operaciones.length}`)
  console.log(`  Relationships:  ${totalRelationships}`)
  console.log(`\nCompleted in ${duration}ms`)

  await closeDriver()
  process.exit(0)
}

main().catch((error) => {
  console.error('Seed script failed:', error)
  closeDriver().finally(() => process.exit(1))
})
