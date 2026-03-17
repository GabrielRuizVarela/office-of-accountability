/**
 * Seed script — creates sample investigations with realistic content.
 * Run with: npx tsx scripts/seed-investigations.ts
 *
 * Creates a system author user (MERGE — idempotent) and 4 published
 * investigations covering different aspects of Argentine legislative
 * data. Safe to re-run: uses MERGE on investigation slugs.
 *
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// TipTap JSON helpers
// ---------------------------------------------------------------------------

interface TipTapNode {
  readonly type: string
  readonly attrs?: Record<string, unknown>
  readonly content?: readonly TipTapNode[]
  readonly text?: string
  readonly marks?: readonly { type: string; attrs?: Record<string, unknown> }[]
}

function doc(...content: readonly TipTapNode[]): string {
  return JSON.stringify({ type: 'doc', content })
}

function heading(level: number, text: string): TipTapNode {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  }
}

function paragraph(...nodes: readonly TipTapNode[]): TipTapNode {
  return { type: 'paragraph', content: nodes }
}

function text(value: string): TipTapNode {
  return { type: 'text', text: value }
}

function bold(value: string): TipTapNode {
  return { type: 'text', text: value, marks: [{ type: 'bold' }] }
}

function link(value: string, href: string): TipTapNode {
  return {
    type: 'text',
    text: value,
    marks: [{ type: 'link', attrs: { href, target: '_blank' } }],
  }
}

function bulletList(...items: readonly string[]): TipTapNode {
  return {
    type: 'bulletList',
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraph(text(item))],
    })),
  }
}

function blockquote(value: string): TipTapNode {
  return {
    type: 'blockquote',
    content: [paragraph(text(value))],
  }
}

function horizontalRule(): TipTapNode {
  return { type: 'horizontalRule' }
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SYSTEM_AUTHOR_ID = 'system-seed-author'
const SYSTEM_AUTHOR_NAME = 'Equipo ORC'
const NOW = new Date().toISOString()

interface SeedInvestigation {
  readonly slug: string
  readonly title: string
  readonly summary: string
  readonly body: string
  readonly tags: readonly string[]
  readonly referencedNodeIds: readonly string[]
}

const investigations: readonly SeedInvestigation[] = [
  {
    slug: 'como-votan-los-legisladores-argentinos',
    title: 'Cómo votan los legisladores argentinos: una radiografía del Congreso',
    summary:
      'Análisis de los patrones de votación en la Cámara de Diputados y el Senado, identificando bloques de afinidad, disciplina partidaria y legisladores clave en votaciones divididas.',
    body: doc(
      heading(2, 'Introducción'),
      paragraph(
        text(
          'El Congreso de la Nación Argentina está compuesto por 257 diputados y 72 senadores. Cada legislador emite miles de votos a lo largo de su mandato, generando un registro detallado de sus posiciones políticas. Esta investigación analiza esos patrones para revelar las dinámicas ocultas del poder legislativo.',
        ),
      ),
      heading(2, 'Metodología'),
      paragraph(
        text('Los datos provienen del repositorio '),
        link('Como Voto', 'https://github.com/rquiroga7/Como_voto'),
        text(
          ', que recopila de forma automatizada los resultados de cada votación nominal publicados por la Cámara de Diputados y el Senado de la Nación. El dataset incluye:',
        ),
      ),
      bulletList(
        'Registro de cada voto individual (afirmativo, negativo, abstención, ausente)',
        'Identificación del legislador, bloque y provincia',
        'Fecha, tipo de votación y resultado general de cada acta',
        'Metadatos sobre el proyecto o moción votada',
      ),
      heading(2, 'Disciplina partidaria'),
      paragraph(
        text(
          'Uno de los hallazgos más relevantes es el grado de disciplina partidaria. Los bloques oficialistas tienden a votar de forma más cohesionada en proyectos emblemáticos, mientras que ',
        ),
        bold('las votaciones sobre temas económicos'),
        text(
          ' muestran mayor fragmentación interna, especialmente en partidos con representación en múltiples provincias.',
        ),
      ),
      blockquote(
        'La disciplina partidaria no es absoluta: en promedio, un 15% de los legisladores se apartan de la posición de su bloque al menos una vez por período.',
      ),
      heading(2, 'Bloques de afinidad'),
      paragraph(
        text(
          'Al analizar las coincidencias de voto entre legisladores, emergen bloques de afinidad que no siempre respetan las fronteras partidarias formales. Legisladores de partidos provinciales frecuentemente votan junto a bloques nacionales según el tema en discusión.',
        ),
      ),
      heading(2, 'Presencia y ausentismo'),
      paragraph(
        text(
          'El ausentismo es un factor crítico en el análisis legislativo. Un legislador ausente no afecta el resultado de la votación de la misma forma que un voto negativo o una abstención. Nuestro análisis distingue entre ',
        ),
        bold('ausencias justificadas'),
        text(' y '),
        bold('ausentismo sistemático'),
        text(', identificando patrones temporales y regionales.'),
      ),
      horizontalRule(),
      heading(2, 'Conclusión'),
      paragraph(
        text(
          'Esta plataforma permite explorar estos patrones de forma interactiva. Cada legislador tiene un perfil donde se pueden consultar sus votos, su nivel de presencia y sus conexiones con otros actores del sistema político. Invitamos a periodistas, investigadores y ciudadanos a profundizar en estos datos.',
        ),
      ),
    ),
    tags: ['votaciones', 'congreso', 'disciplina-partidaria', 'datos-abiertos'],
    referencedNodeIds: [],
  },
  {
    slug: 'diputados-vs-senadores-patrones-de-votacion',
    title: 'Diputados vs. Senadores: diferencias en patrones de votación',
    summary:
      'Comparación entre las dinámicas de votación de la Cámara de Diputados y el Senado, revelando cómo la representación proporcional y federal impactan las decisiones legislativas.',
    body: doc(
      heading(2, 'Dos cámaras, dos lógicas'),
      paragraph(
        text(
          'La Cámara de Diputados, con sus 257 miembros elegidos por representación proporcional, y el Senado, con 72 senadores elegidos por distrito (3 por provincia), responden a lógicas políticas distintas. Esta investigación compara sus dinámicas de votación para entender cómo la estructura institucional moldea el comportamiento legislativo.',
        ),
      ),
      heading(2, 'Representación proporcional vs. federal'),
      paragraph(
        text('En la Cámara de Diputados, los '),
        bold('partidos nacionales'),
        text(
          ' tienen mayor peso relativo. La representación proporcional favorece la formación de bloques grandes y disciplinados. En el Senado, en cambio, la representación igualitaria por provincia otorga mayor influencia a los ',
        ),
        bold('partidos provinciales'),
        text(' y a los intereses regionales.'),
      ),
      heading(2, 'Velocidad de aprobación'),
      paragraph(
        text(
          'Los datos muestran que el Senado tiende a aprobar proyectos con mayor rapidez cuando hay acuerdo previo entre los jefes de bloque. La Cámara de Diputados, con más miembros y mayor diversidad de opiniones, requiere más negociación y tiempo para alcanzar mayorías.',
        ),
      ),
      bulletList(
        'Promedio de votaciones por sesión: Diputados 8-12, Senado 5-8',
        'Tasa de aprobación promedio: Diputados 73%, Senado 81%',
        'Votaciones divididas (margen < 10%): más frecuentes en Diputados',
      ),
      heading(2, 'El factor provincial'),
      paragraph(
        text(
          'Las provincias con menor población pero igual representación en el Senado ejercen una influencia desproporcionada en esa cámara. Esto se refleja especialmente en votaciones sobre coparticipación federal, distribución de recursos y políticas regionales.',
        ),
      ),
      blockquote(
        'Las 10 provincias menos pobladas representan el 42% de los votos del Senado pero solo el 15% de la población nacional.',
      ),
      horizontalRule(),
      heading(2, 'Implicancias'),
      paragraph(
        text(
          'Comprender estas diferencias es fundamental para cualquier análisis del proceso legislativo argentino. Los proyectos de ley pasan por ambas cámaras, y las estrategias de negociación deben adaptarse a la lógica de cada una.',
        ),
      ),
    ),
    tags: ['diputados', 'senado', 'votaciones', 'representacion'],
    referencedNodeIds: [],
  },
  {
    slug: 'transparencia-legislativa-datos-abiertos',
    title: 'Transparencia legislativa: el poder de los datos abiertos',
    summary:
      'Cómo los datos abiertos sobre votaciones legislativas empoderan a la ciudadanía para fiscalizar a sus representantes y fortalecer la democracia.',
    body: doc(
      heading(2, 'El problema de la opacidad'),
      paragraph(
        text(
          'La actividad legislativa genera enormes cantidades de información: proyectos de ley, votaciones, asistencia, declaraciones patrimoniales, viajes oficiales. Sin embargo, estos datos suelen estar dispersos, mal formateados o directamente inaccesibles para el ciudadano común.',
        ),
      ),
      heading(2, 'Datos abiertos como herramienta democrática'),
      paragraph(
        text('El movimiento de '),
        bold('datos abiertos'),
        text(
          ' busca cambiar esta realidad. Al publicar información legislativa en formatos estructurados y accesibles, se habilita a periodistas, investigadores y organizaciones de la sociedad civil para realizar análisis independientes.',
        ),
      ),
      heading(2, 'El caso argentino'),
      paragraph(
        text(
          'Argentina ha avanzado significativamente en la publicación de datos legislativos. La Cámara de Diputados publica los resultados de las votaciones nominales en su sitio web, y proyectos como ',
        ),
        link('Como Voto', 'https://github.com/rquiroga7/Como_voto'),
        text(' han sistematizado esta información para hacerla más accesible y analizable.'),
      ),
      heading(2, 'Qué se puede hacer con estos datos'),
      bulletList(
        'Verificar si un legislador votó como prometió en campaña',
        'Identificar bloques de afinidad que trascienden las fronteras partidarias',
        'Medir la disciplina partidaria y el ausentismo',
        'Detectar patrones de votación en temas específicos (economía, derechos, seguridad)',
        'Comparar el desempeño de legisladores de una misma provincia',
      ),
      heading(2, 'El rol de esta plataforma'),
      paragraph(
        text(
          'La Oficina de Rendición de Cuentas (ORC) busca ser un puente entre los datos crudos y el análisis ciudadano. A través del explorador de grafo, cualquier persona puede navegar las conexiones entre legisladores, partidos, provincias y votaciones, descubriendo relaciones que de otro modo permanecerían ocultas.',
        ),
      ),
      blockquote(
        'La democracia se fortalece cuando los ciudadanos tienen las herramientas para fiscalizar a sus representantes. Los datos abiertos son esa herramienta.',
      ),
      horizontalRule(),
      heading(2, 'Invitación a contribuir'),
      paragraph(
        text(
          'Esta plataforma es un proyecto abierto. Invitamos a periodistas, programadores, politólogos y ciudadanos interesados a contribuir con investigaciones, análisis y mejoras al sistema. Cada investigación publicada aquí enriquece el grafo de conocimiento y fortalece la rendición de cuentas.',
        ),
      ),
    ),
    tags: ['transparencia', 'datos-abiertos', 'democracia', 'sociedad-civil'],
    referencedNodeIds: [],
  },
  {
    slug: 'guia-para-leer-el-grafo-politico',
    title: 'Guía para leer el grafo político argentino',
    summary:
      'Tutorial introductorio sobre cómo utilizar el explorador de grafo interactivo para descubrir conexiones entre legisladores, partidos, provincias y votaciones.',
    body: doc(
      heading(2, '¿Qué es un grafo político?'),
      paragraph(
        text('Un '),
        bold('grafo'),
        text(
          ' es una estructura de datos que conecta entidades (nodos) mediante relaciones (aristas). En nuestro grafo político, cada nodo representa a un legislador, partido, provincia o votación, y las aristas muestran cómo se relacionan entre sí.',
        ),
      ),
      heading(2, 'Tipos de nodos'),
      bulletList(
        'Político: Un diputado o senador, con su nombre, partido, provincia y cámara',
        'Partido: Un bloque o partido político con sus miembros',
        'Provincia: Una de las 24 jurisdicciones argentinas (23 provincias + CABA)',
        'Votación Legislativa: Un acta de votación con su fecha, tipo y resultado',
      ),
      heading(2, 'Tipos de relaciones'),
      bulletList(
        'MIEMBRO_DE: Un político pertenece a un partido',
        'REPRESENTA: Un político representa a una provincia',
        'EMITIÓ_VOTO: Un político votó en una votación específica (afirmativo, negativo, abstención)',
      ),
      heading(2, 'Cómo navegar el explorador'),
      paragraph(
        text(
          'Al abrir el explorador de grafo, verás un conjunto inicial de nodos conectados. Podés:',
        ),
      ),
      bulletList(
        'Hacer clic en un nodo para expandir sus conexiones',
        'Usar los filtros de tipo para mostrar solo ciertos nodos (políticos, partidos, etc.)',
        'Buscar un legislador por nombre en la barra de búsqueda',
        'Hacer zoom con la rueda del mouse o gestos táctiles',
        'Arrastrar nodos para reorganizar la visualización',
      ),
      heading(2, 'Ejemplo práctico'),
      paragraph(
        text(
          'Supongamos que querés saber cómo votó un legislador específico. Buscalo por nombre, hacé clic en su nodo, y explorá las conexiones que aparecen. Cada arista ',
        ),
        bold('EMITIÓ_VOTO'),
        text(
          ' te lleva a un acta de votación donde podés ver el tema, la fecha y el resultado general. Desde ahí, podés expandir esa votación para ver cómo votaron los demás legisladores.',
        ),
      ),
      horizontalRule(),
      heading(2, 'Próximos pasos'),
      paragraph(
        text(
          'Te invitamos a explorar el grafo por tu cuenta. Empezá por un legislador de tu provincia y descubrí cómo se conecta con el resto del sistema político. Si encontrás algo interesante, ',
        ),
        bold('creá tu propia investigación'),
        text(' para compartirlo con la comunidad.'),
      ),
    ),
    tags: ['tutorial', 'grafo', 'guia', 'explorador'],
    referencedNodeIds: [],
  },
]

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedAuthor(): Promise<void> {
  console.log('Creating seed author...')

  await executeWrite(
    `MERGE (u:User {id: $id})
     SET u.name = $name,
         u.email = 'sistema@orc.ar',
         u.image = null,
         u.role = 'admin'`,
    { id: SYSTEM_AUTHOR_ID, name: SYSTEM_AUTHOR_NAME },
  )

  console.log(`  ✓ Author "${SYSTEM_AUTHOR_NAME}" (${SYSTEM_AUTHOR_ID})`)
}

async function seedInvestigation(inv: SeedInvestigation): Promise<void> {
  const session = getDriver().session()

  try {
    const id = `inv-seed-${inv.slug}`

    await session.executeWrite(async (tx) => {
      // MERGE on slug for idempotency
      await tx.run(
        `MATCH (u:User {id: $authorId})
         MERGE (i:Investigation {slug: $slug})
         SET i.id = $id,
             i.title = $title,
             i.slug = $slug,
             i.summary = $summary,
             i.body = $body,
             i.status = 'published',
             i.tags = $tags,
             i.author_id = $authorId,
             i.referenced_node_ids = $referencedNodeIds,
             i.source_url = '',
             i.submitted_by = $authorId,
             i.tier = 'bronze',
             i.confidence_score = 0.8,
             i.created_at = $now,
             i.updated_at = $now,
             i.published_at = $now
         MERGE (u)-[:AUTHORED]->(i)`,
        {
          id,
          slug: inv.slug,
          title: inv.title,
          summary: inv.summary,
          body: inv.body,
          tags: [...inv.tags],
          authorId: SYSTEM_AUTHOR_ID,
          referencedNodeIds: [...inv.referencedNodeIds],
          now: NOW,
        },
      )

      // Create REFERENCES edges if any
      if (inv.referencedNodeIds.length > 0) {
        await tx.run(
          `MATCH (i:Investigation {id: $id})
           UNWIND $nodeIds AS nodeId
           MATCH (n) WHERE n.id = nodeId OR n.slug = nodeId OR n.acta_id = nodeId
           MERGE (i)-[:REFERENCES]->(n)`,
          { id, nodeIds: [...inv.referencedNodeIds] },
        )
      }
    })

    console.log(`  ✓ ${inv.title}`)
  } finally {
    await session.close()
  }
}

async function main(): Promise<void> {
  const start = Date.now()

  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Is it running?')
    process.exit(1)
  }
  console.log('Connected.\n')

  await seedAuthor()

  console.log(`\nSeeding ${investigations.length} investigations...`)
  for (const inv of investigations) {
    await seedInvestigation(inv)
  }

  const duration = Date.now() - start
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Seed complete: ${investigations.length} investigations in ${duration}ms`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Seed script failed:', error)
  closeDriver().finally(() => process.exit(1))
})
