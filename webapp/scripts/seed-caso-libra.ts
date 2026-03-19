/**
 * Seed script for Caso Libra investigation data.
 *
 * Run with: npx tsx scripts/seed-caso-libra.ts
 *
 * Idempotent — uses MERGE for all operations. Safe to run multiple times.
 * All data is manually curated from public sources:
 * - Congressional reports
 * - TRM Labs blockchain analysis
 * - Argentine media (Infobae, Buenos Aires Herald)
 * - Court filings
 */

import { getDriver, closeDriver } from '../src/lib/neo4j/client'

const QUERY_TIMEOUT_MS = 30_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PERSONS = [
  {
    id: 'cl-person-milei',
    name: 'Javier Milei',
    slug: 'javier-milei',
    role: 'Presidente de la Nacion Argentina',
    description:
      'Publico un enlace al token $LIBRA en su cuenta de X (Twitter) el 14 de febrero de 2025, eliminandolo horas despues.',
    nationality: 'argentina',
  },
  {
    id: 'cl-person-karina-milei',
    name: 'Karina Milei',
    slug: 'karina-milei',
    role: 'Secretaria General de la Presidencia',
    description:
      'Hermana del presidente. Registros de visitas a Casa Rosada la vinculan a reuniones previas al lanzamiento del token.',
    nationality: 'argentina',
  },
  {
    id: 'cl-person-hayden-davis',
    name: 'Hayden Mark Davis',
    slug: 'hayden-davis',
    role: 'CEO de Kelsier Ventures',
    description:
      'Organizador principal del lanzamiento de $LIBRA. Vinculado a la creacion del contrato inteligente y la liquidez inicial.',
    nationality: 'estadounidense',
  },
  {
    id: 'cl-person-julian-peh',
    name: 'Julian Peh',
    slug: 'julian-peh',
    role: 'Empresario tech',
    description:
      'Intermediario entre Kelsier Ventures y el entorno presidencial. Presente en reuniones previas al lanzamiento.',
    nationality: 'argentina',
  },
  {
    id: 'cl-person-santiago-caputo',
    name: 'Santiago Caputo',
    slug: 'santiago-caputo',
    role: 'Asesor presidencial',
    description:
      'Asesor estrategico de Milei. Registros telefonicos lo vinculan a comunicaciones con participantes del esquema.',
    nationality: 'argentina',
  },
  {
    id: 'cl-person-novelli',
    name: 'Mauricio Novelli',
    slug: 'mauricio-novelli',
    role: 'Operador financiero',
    description: 'Vinculado a la operatoria financiera del lanzamiento de $LIBRA.',
    nationality: 'argentina',
  },
  {
    id: 'cl-person-terrones-godoy',
    name: 'Monica Terrones Godoy',
    slug: 'monica-terrones-godoy',
    role: 'Familiar de funcionario',
    description:
      'Vinculada a billeteras que recibieron fondos del lanzamiento de $LIBRA segun analisis on-chain.',
    nationality: 'argentina',
  },
  {
    id: 'cl-person-sergio-morales',
    name: 'Sergio Morales',
    slug: 'sergio-morales',
    role: 'Operador cripto',
    description: 'Vinculado a operaciones de consolidacion de fondos post-lanzamiento.',
    nationality: 'argentina',
  },
]

const ORGANIZATIONS = [
  {
    id: 'cl-org-kelsier',
    name: 'Kelsier Ventures',
    slug: 'kelsier-ventures',
    org_type: 'empresa',
    description:
      'Empresa de Hayden Davis responsable del lanzamiento tecnico y financiero de $LIBRA.',
    country: 'estados-unidos',
  },
  {
    id: 'cl-org-casa-rosada',
    name: 'Casa Rosada',
    slug: 'casa-rosada',
    org_type: 'gobierno',
    description: 'Sede del Poder Ejecutivo Nacional argentino.',
    country: 'argentina',
  },
  {
    id: 'cl-org-congreso',
    name: 'Congreso de la Nacion',
    slug: 'congreso-nacion',
    org_type: 'gobierno',
    description: 'Poder Legislativo argentino. Realizo investigacion parlamentaria sobre el caso.',
    country: 'argentina',
  },
  {
    id: 'cl-org-trm-labs',
    name: 'TRM Labs',
    slug: 'trm-labs',
    org_type: 'empresa',
    description: 'Firma de analisis blockchain que publico el rastreo de fondos del caso $LIBRA.',
    country: 'estados-unidos',
  },
]

const TOKEN = {
  id: 'cl-token-libra',
  symbol: 'LIBRA',
  name: '$LIBRA',
  contract_address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
  chain: 'solana',
  launch_date: '2025-02-14',
  peak_market_cap: 4_000_000_000,
}

const EVENTS = [
  {
    id: 'cl-event-milei-post',
    title: 'Milei publica enlace a $LIBRA en X',
    slug: 'milei-publica-libra',
    description:
      'Milei publica el contrato del token $LIBRA en su cuenta de X con 19M de seguidores, provocando un aumento masivo de precio.',
    date: '2025-02-14T21:00:00Z',
    event_type: 'political',
  },
  {
    id: 'cl-event-token-launch',
    title: 'Lanzamiento del token $LIBRA en Solana',
    slug: 'lanzamiento-token-libra',
    description:
      'El token $LIBRA se lanza en la blockchain de Solana. La liquidez inicial fue provista por Kelsier Ventures.',
    date: '2025-02-14T20:00:00Z',
    event_type: 'financial',
  },
  {
    id: 'cl-event-price-peak',
    title: 'Token alcanza capitalizacion de $4B',
    slug: 'precio-maximo-libra',
    description:
      '$LIBRA alcanza una capitalizacion de mercado de aproximadamente $4 mil millones en su pico.',
    date: '2025-02-14T22:00:00Z',
    event_type: 'financial',
  },
  {
    id: 'cl-event-price-crash',
    title: 'Colapso del 94% en el precio de $LIBRA',
    slug: 'colapso-precio-libra',
    description:
      'El precio de $LIBRA cae un 94% en horas. Aproximadamente 114,000 billeteras pierden entre $251M y $286M.',
    date: '2025-02-15T04:00:00Z',
    event_type: 'financial',
  },
  {
    id: 'cl-event-milei-deletes-post',
    title: 'Milei elimina la publicacion sobre $LIBRA',
    slug: 'milei-elimina-post',
    description:
      'Milei borra el post de X promoviendo $LIBRA y declara que "no tenia conocimiento" de los detalles del proyecto.',
    date: '2025-02-15T06:00:00Z',
    event_type: 'political',
  },
  {
    id: 'cl-event-58m-liquidation',
    title: 'Extraccion de $58M de liquidez por insiders',
    slug: 'extraccion-58m-liquidez',
    description:
      'Billeteras vinculadas a los organizadores extraen aproximadamente $58M de liquidez del pool del token.',
    date: '2025-02-14T23:30:00Z',
    event_type: 'financial',
  },
  {
    id: 'cl-event-casa-rosada-visits',
    title: 'Reuniones previas en Casa Rosada',
    slug: 'reuniones-casa-rosada',
    description:
      'Registros de visitas revelan reuniones de Julian Peh y asociados de Kelsier en Casa Rosada previas al lanzamiento.',
    date: '2025-02-10T15:00:00Z',
    event_type: 'political',
  },
  {
    id: 'cl-event-phone-forensics',
    title: 'Filtracion de pericias telefonicas',
    slug: 'filtracion-pericias-telefonicas',
    description:
      'Se filtran registros de comunicaciones telefonicas que vinculan al entorno presidencial con los organizadores del token.',
    date: '2025-03-15T12:00:00Z',
    event_type: 'legal',
  },
  {
    id: 'cl-event-congressional-hearing-1',
    title: 'Primera audiencia en comision del Congreso',
    slug: 'audiencia-congreso-1',
    description:
      'La comision investigadora del Congreso realiza su primera audiencia sobre el caso $LIBRA.',
    date: '2025-02-25T14:00:00Z',
    event_type: 'legal',
  },
  {
    id: 'cl-event-congressional-hearing-2',
    title: 'Segunda audiencia — Hayden Davis citado',
    slug: 'audiencia-congreso-2',
    description: 'El Congreso cita a Hayden Davis a declarar. Davis no comparece.',
    date: '2025-03-10T14:00:00Z',
    event_type: 'legal',
  },
  {
    id: 'cl-event-congressional-report',
    title: 'Publicacion del informe parlamentario',
    slug: 'informe-parlamentario',
    description:
      'El Congreso publica su informe sobre el caso $LIBRA detallando las conexiones entre el gobierno y los organizadores.',
    date: '2025-04-01T12:00:00Z',
    event_type: 'legal',
  },
  {
    id: 'cl-event-trm-analysis',
    title: 'TRM Labs publica rastreo de fondos',
    slug: 'trm-labs-analisis',
    description:
      'TRM Labs publica un analisis detallado del flujo de fondos on-chain, identificando billeteras de consolidacion.',
    date: '2025-02-20T18:00:00Z',
    event_type: 'media',
  },
  {
    id: 'cl-event-infobae-investigation',
    title: 'Infobae publica investigacion sobre $LIBRA',
    slug: 'infobae-investigacion',
    description:
      'Infobae publica una investigacion periodistica conectando a personas del entorno presidencial con el esquema.',
    date: '2025-02-18T10:00:00Z',
    event_type: 'media',
  },
  {
    id: 'cl-event-court-filing',
    title: 'Presentacion de denuncia penal',
    slug: 'denuncia-penal',
    description:
      'Se presenta denuncia penal contra los organizadores del token $LIBRA por presunta estafa y lavado de activos.',
    date: '2025-02-19T09:00:00Z',
    event_type: 'legal',
  },
  {
    id: 'cl-event-milei-defense',
    title: 'Milei defiende su participacion',
    slug: 'milei-defensa',
    description:
      'Milei declara que su publicacion fue para "impulsar el sector privado" y niega haber tenido participacion economica.',
    date: '2025-02-16T20:00:00Z',
    event_type: 'political',
  },
  {
    id: 'cl-event-caputo-calls',
    title: 'Registros de llamadas de Santiago Caputo',
    slug: 'registros-llamadas-caputo',
    description:
      'Se revelan registros de llamadas entre Santiago Caputo y Julian Peh en las horas previas y posteriores al lanzamiento.',
    date: '2025-03-18T10:00:00Z',
    event_type: 'legal',
  },
  {
    id: 'cl-event-international-media',
    title: 'Cobertura internacional del caso',
    slug: 'cobertura-internacional',
    description:
      'FT, Reuters y Bloomberg publican cobertura del caso. La imagen internacional de Argentina se ve afectada.',
    date: '2025-02-17T08:00:00Z',
    event_type: 'media',
  },
  {
    id: 'cl-event-wallet-consolidation',
    title: 'Consolidacion de fondos en billeteras intermedias',
    slug: 'consolidacion-billeteras',
    description:
      'Analisis on-chain muestra movimientos de consolidacion de fondos extraidos hacia billeteras intermedias.',
    date: '2025-02-16T12:00:00Z',
    event_type: 'financial',
  },
]

const DOCUMENTS = [
  {
    id: 'cl-doc-congressional-report',
    title: 'Informe de la Comision Investigadora del Congreso sobre $LIBRA',
    slug: 'informe-comision-libra',
    doc_type: 'informe-parlamentario',
    summary:
      'Informe oficial del Congreso detallando cronologia, actores involucrados, flujo de fondos y recomendaciones sobre el caso $LIBRA.',
    date_published: '2025-04-01',
  },
  {
    id: 'cl-doc-trm-analysis',
    title: 'TRM Labs: Rastreo On-Chain del Token $LIBRA',
    slug: 'trm-labs-rastreo-libra',
    doc_type: 'analisis-blockchain',
    summary:
      'Analisis detallado de TRM Labs sobre el flujo de fondos on-chain, identificando billeteras de insiders, montos extraidos y patrones de consolidacion.',
    date_published: '2025-02-20',
  },
  {
    id: 'cl-doc-infobae-investigation',
    title: 'Infobae: La trama detras de $LIBRA',
    slug: 'infobae-trama-libra',
    doc_type: 'articulo-periodistico',
    summary:
      'Investigacion de Infobae revelando las reuniones previas en Casa Rosada y las conexiones entre el entorno presidencial y Kelsier Ventures.',
    date_published: '2025-02-18',
  },
  {
    id: 'cl-doc-herald-timeline',
    title: 'Buenos Aires Herald: Timeline of the $LIBRA Scandal',
    slug: 'herald-timeline-libra',
    doc_type: 'articulo-periodistico',
    summary:
      'Cronologia completa del escandalo publicada por el Buenos Aires Herald, incluyendo fuentes internacionales.',
    date_published: '2025-02-19',
  },
  {
    id: 'cl-doc-court-filing',
    title: 'Denuncia Penal — Caso $LIBRA',
    slug: 'denuncia-penal-libra',
    doc_type: 'documento-judicial',
    summary:
      'Denuncia penal presentada contra los organizadores del token por presunta estafa masiva y lavado de activos.',
    date_published: '2025-02-19',
  },
  {
    id: 'cl-doc-phone-forensics',
    title: 'Pericias Telefonicas — Comunicaciones Pre-Lanzamiento',
    slug: 'pericias-telefonicas-libra',
    doc_type: 'documento-judicial',
    summary:
      'Registros de comunicaciones telefonicas que vinculan al entorno presidencial con los organizadores del lanzamiento.',
    date_published: '2025-03-15',
  },
  {
    id: 'cl-doc-visitor-logs',
    title: 'Registros de Visitas a Casa Rosada — Enero/Febrero 2025',
    slug: 'registros-visitas-casa-rosada',
    doc_type: 'registro-publico',
    summary:
      'Registros oficiales de visitas mostrando ingresos de Julian Peh y asociados de Kelsier a Casa Rosada.',
    date_published: '2025-02-22',
  },
  {
    id: 'cl-doc-ft-article',
    title: 'Financial Times: Argentine President Milei embroiled in crypto scandal',
    slug: 'ft-crypto-scandal',
    doc_type: 'articulo-periodistico',
    summary:
      'Cobertura del Financial Times sobre el impacto internacional del escandalo y sus implicancias para la credibilidad economica de Argentina.',
    date_published: '2025-02-17',
  },
]

const WALLETS = [
  {
    address: 'TEAM_WALLET_1_PLACEHOLDER',
    label: 'Billetera del equipo #1',
    owner_id: 'cl-org-kelsier',
  },
  {
    address: 'TEAM_WALLET_2_PLACEHOLDER',
    label: 'Billetera del equipo #2',
    owner_id: 'cl-person-hayden-davis',
  },
  {
    address: 'CONSOLIDATION_WALLET_1',
    label: 'Billetera de consolidacion #1',
  },
  {
    address: 'CONSOLIDATION_WALLET_2',
    label: 'Billetera de consolidacion #2',
  },
  {
    address: 'LIQUIDITY_POOL_WALLET',
    label: 'Pool de liquidez $LIBRA',
  },
  {
    address: 'INSIDER_WALLET_1',
    label: 'Billetera insider #1',
  },
  {
    address: 'INSIDER_WALLET_2',
    label: 'Billetera insider #2',
  },
  {
    address: 'EXIT_WALLET_1',
    label: 'Billetera de salida #1',
  },
]

// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------

async function seed(): Promise<void> {
  const session = getDriver().session()

  try {
    console.log('Seeding Caso Libra persons...')
    for (const person of PERSONS) {
      await session.run(
        `MERGE (p:CasoLibraPerson { id: $id })
         SET p.name = $name,
             p.slug = $slug,
             p.role = $role,
             p.description = $description,
             p.nationality = $nationality`,
        person,
        TX_CONFIG,
      )
    }
    console.log(`  ${PERSONS.length} persons seeded`)

    console.log('Seeding organizations...')
    for (const org of ORGANIZATIONS) {
      await session.run(
        `MERGE (o:CasoLibraOrganization { id: $id })
         SET o.name = $name,
             o.slug = $slug,
             o.org_type = $org_type,
             o.description = $description,
             o.country = $country`,
        org,
        TX_CONFIG,
      )
    }
    console.log(`  ${ORGANIZATIONS.length} organizations seeded`)

    console.log('Seeding token...')
    await session.run(
      `MERGE (t:CasoLibraToken { id: $id })
       SET t.symbol = $symbol,
           t.name = $name,
           t.contract_address = $contract_address,
           t.chain = $chain,
           t.launch_date = $launch_date,
           t.peak_market_cap = $peak_market_cap`,
      TOKEN,
      TX_CONFIG,
    )
    console.log('  1 token seeded')

    console.log('Seeding events...')
    for (const event of EVENTS) {
      await session.run(
        `MERGE (e:CasoLibraEvent { id: $id })
         SET e.title = $title,
             e.slug = $slug,
             e.description = $description,
             e.date = $date,
             e.event_type = $event_type`,
        event,
        TX_CONFIG,
      )
    }
    console.log(`  ${EVENTS.length} events seeded`)

    console.log('Seeding documents...')
    for (const doc of DOCUMENTS) {
      await session.run(
        `MERGE (d:CasoLibraDocument { id: $id })
         SET d.title = $title,
             d.slug = $slug,
             d.doc_type = $doc_type,
             d.summary = $summary,
             d.date_published = $date_published`,
        doc,
        TX_CONFIG,
      )
    }
    console.log(`  ${DOCUMENTS.length} documents seeded`)

    console.log('Seeding wallets...')
    for (const wallet of WALLETS) {
      await session.run(
        `MERGE (w:CasoLibraWallet { address: $address })
         SET w.label = $label,
             w.chain = 'solana'
         ${wallet.owner_id ? 'SET w.owner_id = $owner_id' : ''}`,
        wallet,
        TX_CONFIG,
      )
    }
    console.log(`  ${WALLETS.length} wallets seeded`)

    // -----------------------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------------------

    console.log('Seeding relationships...')

    // PROMOTED: Milei → Token
    await session.run(
      `MATCH (p:CasoLibraPerson { id: 'cl-person-milei' })
       MATCH (t:CasoLibraToken { id: 'cl-token-libra' })
       MERGE (p)-[:PROMOTED]->(t)`,
      {},
      TX_CONFIG,
    )

    // CREATED_BY: Token → Kelsier
    await session.run(
      `MATCH (t:CasoLibraToken { id: 'cl-token-libra' })
       MATCH (o:CasoLibraOrganization { id: 'cl-org-kelsier' })
       MERGE (t)-[:CREATED_BY]->(o)`,
      {},
      TX_CONFIG,
    )

    // AFFILIATED_WITH: People → Organizations
    const affiliations = [
      ['cl-person-milei', 'cl-org-casa-rosada'],
      ['cl-person-karina-milei', 'cl-org-casa-rosada'],
      ['cl-person-santiago-caputo', 'cl-org-casa-rosada'],
      ['cl-person-hayden-davis', 'cl-org-kelsier'],
    ]
    for (const [personId, orgId] of affiliations) {
      await session.run(
        `MATCH (p:CasoLibraPerson { id: $personId })
         MATCH (o:CasoLibraOrganization { id: $orgId })
         MERGE (p)-[:AFFILIATED_WITH]->(o)`,
        { personId, orgId },
        TX_CONFIG,
      )
    }

    // COMMUNICATED_WITH relationships
    const communications = [
      {
        from: 'cl-person-santiago-caputo',
        to: 'cl-person-julian-peh',
        date: '2025-02-14',
        medium: 'telefono',
      },
      {
        from: 'cl-person-julian-peh',
        to: 'cl-person-hayden-davis',
        date: '2025-02-13',
        medium: 'telefono',
      },
      {
        from: 'cl-person-santiago-caputo',
        to: 'cl-person-julian-peh',
        date: '2025-02-15',
        medium: 'telefono',
      },
    ]
    for (const comm of communications) {
      await session.run(
        `MATCH (a:CasoLibraPerson { id: $from })
         MATCH (b:CasoLibraPerson { id: $to })
         MERGE (a)-[:COMMUNICATED_WITH { date: $date, medium: $medium }]->(b)`,
        comm,
        TX_CONFIG,
      )
    }

    // MET_WITH relationships
    const meetings = [
      {
        from: 'cl-person-julian-peh',
        to: 'cl-person-karina-milei',
        date: '2025-02-10',
        location: 'Casa Rosada',
      },
      {
        from: 'cl-person-julian-peh',
        to: 'cl-person-santiago-caputo',
        date: '2025-02-10',
        location: 'Casa Rosada',
      },
    ]
    for (const meeting of meetings) {
      await session.run(
        `MATCH (a:CasoLibraPerson { id: $from })
         MATCH (b:CasoLibraPerson { id: $to })
         MERGE (a)-[:MET_WITH { date: $date, location: $location }]->(b)`,
        meeting,
        TX_CONFIG,
      )
    }

    // PARTICIPATED_IN: People → Events
    const participations = [
      ['cl-person-milei', 'cl-event-milei-post'],
      ['cl-person-milei', 'cl-event-milei-deletes-post'],
      ['cl-person-milei', 'cl-event-milei-defense'],
      ['cl-person-hayden-davis', 'cl-event-token-launch'],
      ['cl-person-hayden-davis', 'cl-event-58m-liquidation'],
      ['cl-person-julian-peh', 'cl-event-casa-rosada-visits'],
      ['cl-person-karina-milei', 'cl-event-casa-rosada-visits'],
      ['cl-person-santiago-caputo', 'cl-event-caputo-calls'],
      ['cl-person-julian-peh', 'cl-event-caputo-calls'],
    ]
    for (const [personId, eventId] of participations) {
      await session.run(
        `MATCH (p:CasoLibraPerson { id: $personId })
         MATCH (e:CasoLibraEvent { id: $eventId })
         MERGE (p)-[:PARTICIPATED_IN]->(e)`,
        { personId, eventId },
        TX_CONFIG,
      )
    }

    // DOCUMENTED_BY: Events → Documents
    const documentations = [
      ['cl-event-congressional-report', 'cl-doc-congressional-report'],
      ['cl-event-trm-analysis', 'cl-doc-trm-analysis'],
      ['cl-event-infobae-investigation', 'cl-doc-infobae-investigation'],
      ['cl-event-court-filing', 'cl-doc-court-filing'],
      ['cl-event-phone-forensics', 'cl-doc-phone-forensics'],
      ['cl-event-casa-rosada-visits', 'cl-doc-visitor-logs'],
      ['cl-event-international-media', 'cl-doc-ft-article'],
    ]
    for (const [eventId, docId] of documentations) {
      await session.run(
        `MATCH (e:CasoLibraEvent { id: $eventId })
         MATCH (d:CasoLibraDocument { id: $docId })
         MERGE (e)-[:DOCUMENTED_BY]->(d)`,
        { eventId, docId },
        TX_CONFIG,
      )
    }

    // MENTIONS: Documents → People/Orgs
    const mentions: Array<{ docId: string; targetId: string; targetLabel: string }> = [
      {
        docId: 'cl-doc-congressional-report',
        targetId: 'cl-person-milei',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-congressional-report',
        targetId: 'cl-person-hayden-davis',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-congressional-report',
        targetId: 'cl-person-karina-milei',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-congressional-report',
        targetId: 'cl-org-kelsier',
        targetLabel: 'CasoLibraOrganization',
      },
      {
        docId: 'cl-doc-trm-analysis',
        targetId: 'cl-person-hayden-davis',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-trm-analysis',
        targetId: 'cl-org-kelsier',
        targetLabel: 'CasoLibraOrganization',
      },
      {
        docId: 'cl-doc-infobae-investigation',
        targetId: 'cl-person-milei',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-infobae-investigation',
        targetId: 'cl-person-julian-peh',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-infobae-investigation',
        targetId: 'cl-person-karina-milei',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-phone-forensics',
        targetId: 'cl-person-santiago-caputo',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-phone-forensics',
        targetId: 'cl-person-julian-peh',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-visitor-logs',
        targetId: 'cl-person-julian-peh',
        targetLabel: 'CasoLibraPerson',
      },
      {
        docId: 'cl-doc-visitor-logs',
        targetId: 'cl-org-casa-rosada',
        targetLabel: 'CasoLibraOrganization',
      },
    ]
    for (const mention of mentions) {
      await session.run(
        `MATCH (d:CasoLibraDocument { id: $docId })
         MATCH (t:${mention.targetLabel} { id: $targetId })
         MERGE (d)-[:MENTIONS]->(t)`,
        { docId: mention.docId, targetId: mention.targetId },
        TX_CONFIG,
      )
    }

    // CONTROLS: People → Wallets
    await session.run(
      `MATCH (p:CasoLibraPerson { id: 'cl-person-hayden-davis' })
       MATCH (w:CasoLibraWallet { address: 'TEAM_WALLET_2_PLACEHOLDER' })
       MERGE (p)-[:CONTROLS]->(w)`,
      {},
      TX_CONFIG,
    )

    // SENT: Wallet → Wallet (key transactions)
    const transactions = [
      {
        from: 'LIQUIDITY_POOL_WALLET',
        to: 'TEAM_WALLET_1_PLACEHOLDER',
        amount_usd: 58_000_000,
        timestamp: '2025-02-14T23:30:00Z',
        hash: 'TX_58M_EXTRACTION',
      },
      {
        from: 'TEAM_WALLET_1_PLACEHOLDER',
        to: 'CONSOLIDATION_WALLET_1',
        amount_usd: 25_000_000,
        timestamp: '2025-02-15T02:00:00Z',
        hash: 'TX_CONSOLIDATION_1',
      },
      {
        from: 'TEAM_WALLET_1_PLACEHOLDER',
        to: 'CONSOLIDATION_WALLET_2',
        amount_usd: 18_000_000,
        timestamp: '2025-02-15T03:00:00Z',
        hash: 'TX_CONSOLIDATION_2',
      },
      {
        from: 'TEAM_WALLET_2_PLACEHOLDER',
        to: 'INSIDER_WALLET_1',
        amount_usd: 8_000_000,
        timestamp: '2025-02-15T01:00:00Z',
        hash: 'TX_INSIDER_1',
      },
      {
        from: 'CONSOLIDATION_WALLET_1',
        to: 'EXIT_WALLET_1',
        amount_usd: 12_000_000,
        timestamp: '2025-02-16T10:00:00Z',
        hash: 'TX_EXIT_1',
      },
      {
        from: 'INSIDER_WALLET_1',
        to: 'INSIDER_WALLET_2',
        amount_usd: 5_000_000,
        timestamp: '2025-02-15T06:00:00Z',
        hash: 'TX_INSIDER_MOVE',
      },
    ]
    for (const tx of transactions) {
      await session.run(
        `MATCH (w1:CasoLibraWallet { address: $from })
         MATCH (w2:CasoLibraWallet { address: $to })
         MERGE (w1)-[:SENT { hash: $hash, amount_usd: $amount_usd, timestamp: $timestamp }]->(w2)`,
        tx,
        TX_CONFIG,
      )
    }

    console.log('  Relationships seeded')
    console.log('\nCaso Libra seed complete.')
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Starting Caso Libra data seed...\n')
  await seed()
  await closeDriver()
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
