/**
 * Seed script for Caso Libra investigation data.
 *
 * Run with: npx tsx scripts/seed-caso-libra.ts
 *
 * Uses generic labels (Person, Organization, Token, Event, Document, Wallet)
 * with caso_slug: "caso-libra" for namespace isolation, and prefixed IDs
 * (caso-libra:{local_id}) per the investigation standardization convention.
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
const CASO_SLUG = 'caso-libra'

/** Prefix a local ID with the caso slug */
function pid(localId: string): string {
  return `${CASO_SLUG}:${localId}`
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PERSONS = [
  {
    id: pid('cl-person-milei'),
    name: 'Javier Milei',
    slug: 'javier-milei',
    role: 'Presidente de la Nacion Argentina',
    description:
      'Publico un enlace al token $LIBRA en su cuenta de X (Twitter) el 14 de febrero de 2025, eliminandolo horas despues.',
    nationality: 'argentina',
  },
  {
    id: pid('cl-person-karina-milei'),
    name: 'Karina Milei',
    slug: 'karina-milei',
    role: 'Secretaria General de la Presidencia',
    description:
      'Hermana del presidente. Registros de visitas a Casa Rosada la vinculan a reuniones previas al lanzamiento del token.',
    nationality: 'argentina',
  },
  {
    id: pid('cl-person-hayden-davis'),
    name: 'Hayden Mark Davis',
    slug: 'hayden-davis',
    role: 'CEO de Kelsier Ventures',
    description:
      'Organizador principal del lanzamiento de $LIBRA. Vinculado a la creacion del contrato inteligente y la liquidez inicial.',
    nationality: 'estadounidense',
  },
  {
    id: pid('cl-person-julian-peh'),
    name: 'Julian Peh',
    slug: 'julian-peh',
    role: 'Empresario tech',
    description:
      'Intermediario entre Kelsier Ventures y el entorno presidencial. Presente en reuniones previas al lanzamiento.',
    nationality: 'argentina',
  },
  {
    id: pid('cl-person-santiago-caputo'),
    name: 'Santiago Caputo',
    slug: 'santiago-caputo',
    role: 'Asesor presidencial',
    description:
      'Asesor estrategico de Milei. Registros telefonicos lo vinculan a comunicaciones con participantes del esquema.',
    nationality: 'argentina',
  },
  {
    id: pid('cl-person-novelli'),
    name: 'Mauricio Novelli',
    slug: 'mauricio-novelli',
    role: 'Operador financiero',
    description: 'Vinculado a la operatoria financiera del lanzamiento de $LIBRA.',
    nationality: 'argentina',
  },
  {
    id: pid('cl-person-terrones-godoy'),
    name: 'Monica Terrones Godoy',
    slug: 'monica-terrones-godoy',
    role: 'Familiar de funcionario',
    description:
      'Vinculada a billeteras que recibieron fondos del lanzamiento de $LIBRA segun analisis on-chain.',
    nationality: 'argentina',
  },
  {
    id: pid('cl-person-sergio-morales'),
    name: 'Sergio Morales',
    slug: 'sergio-morales',
    role: 'Operador cripto',
    description: 'Vinculado a operaciones de consolidacion de fondos post-lanzamiento.',
    nationality: 'argentina',
  },
]

const ORGANIZATIONS = [
  {
    id: pid('cl-org-kelsier'),
    name: 'Kelsier Ventures',
    slug: 'kelsier-ventures',
    org_type: 'empresa',
    description:
      'Empresa de Hayden Davis responsable del lanzamiento tecnico y financiero de $LIBRA.',
    country: 'estados-unidos',
  },
  {
    id: pid('cl-org-casa-rosada'),
    name: 'Casa Rosada',
    slug: 'casa-rosada',
    org_type: 'gobierno',
    description: 'Sede del Poder Ejecutivo Nacional argentino.',
    country: 'argentina',
  },
  {
    id: pid('cl-org-congreso'),
    name: 'Congreso de la Nacion',
    slug: 'congreso-nacion',
    org_type: 'gobierno',
    description: 'Poder Legislativo argentino. Realizo investigacion parlamentaria sobre el caso.',
    country: 'argentina',
  },
  {
    id: pid('cl-org-trm-labs'),
    name: 'TRM Labs',
    slug: 'trm-labs',
    org_type: 'empresa',
    description: 'Firma de analisis blockchain que publico el rastreo de fondos del caso $LIBRA.',
    country: 'estados-unidos',
  },
]

const TOKEN = {
  id: pid('cl-token-libra'),
  symbol: 'LIBRA',
  name: '$LIBRA',
  contract_address: 'Bo9jh3wsmcC2AjakLWzNmKJ3SgtZmXEcSaW7L2FAvUsU',
  chain: 'solana',
  launch_date: '2025-02-14',
  peak_market_cap: 4_500_000_000,
}

const EVENTS = [
  {
    id: pid('cl-event-milei-post'),
    title: 'Milei publica enlace a $LIBRA en X',
    slug: 'milei-publica-libra',
    description:
      'Milei publica el contrato del token $LIBRA en su cuenta de X con 19M de seguidores, provocando un aumento masivo de precio.',
    date: '2025-02-14T22:01:00Z',
    event_type: 'political',
  },
  {
    id: pid('cl-event-token-launch'),
    title: 'Lanzamiento del token $LIBRA en Solana',
    slug: 'lanzamiento-token-libra',
    description:
      'El token $LIBRA se lanza en la blockchain de Solana. La liquidez inicial fue provista por Kelsier Ventures.',
    date: '2025-02-14T21:58:00Z',
    event_type: 'financial',
  },
  {
    id: pid('cl-event-price-peak'),
    title: 'Token alcanza capitalizacion de $4.5B',
    slug: 'precio-maximo-libra',
    description:
      '$LIBRA alcanza una capitalizacion de mercado de aproximadamente $4.500 millones en su pico.',
    date: '2025-02-14T22:00:00Z',
    event_type: 'financial',
  },
  {
    id: pid('cl-event-price-crash'),
    title: 'Colapso del 94% en el precio de $LIBRA',
    slug: 'colapso-precio-libra',
    description:
      'El precio de $LIBRA cae un 94% en horas. Aproximadamente 114,000 billeteras pierden entre $251M y $286M.',
    date: '2025-02-15T04:00:00Z',
    event_type: 'financial',
  },
  {
    id: pid('cl-event-milei-deletes-post'),
    title: 'Milei elimina la publicacion sobre $LIBRA',
    slug: 'milei-elimina-post',
    description:
      'Milei borra el post de X promoviendo $LIBRA y declara que "no tenia conocimiento" de los detalles del proyecto.',
    date: '2025-02-15T06:00:00Z',
    event_type: 'political',
  },
  {
    id: pid('cl-event-58m-liquidation'),
    title: 'Extraccion de $107M de liquidez por insiders',
    slug: 'extraccion-107m-liquidez',
    description:
      'Billeteras vinculadas a los organizadores extraen aproximadamente $107M ($57.6M USDC + SOL) de liquidez del pool del token.',
    date: '2025-02-14T23:30:00Z',
    event_type: 'financial',
  },
  {
    id: pid('cl-event-casa-rosada-visits'),
    title: 'Reuniones previas en Casa Rosada',
    slug: 'reuniones-casa-rosada',
    description:
      'Registros de visitas revelan reuniones de Julian Peh y asociados de Kelsier en Casa Rosada previas al lanzamiento.',
    date: '2025-02-10T15:00:00Z',
    event_type: 'political',
  },
  {
    id: pid('cl-event-phone-forensics'),
    title: 'Filtracion de pericias telefonicas',
    slug: 'filtracion-pericias-telefonicas',
    description:
      'Se filtran registros de comunicaciones telefonicas que vinculan al entorno presidencial con los organizadores del token.',
    date: '2025-03-15T12:00:00Z',
    event_type: 'legal',
  },
  {
    id: pid('cl-event-congressional-hearing-1'),
    title: 'Primera audiencia en comision del Congreso',
    slug: 'audiencia-congreso-1',
    description:
      'La comision investigadora del Congreso realiza su primera audiencia sobre el caso $LIBRA.',
    date: '2025-02-25T14:00:00Z',
    event_type: 'legal',
  },
  {
    id: pid('cl-event-congressional-hearing-2'),
    title: 'Segunda audiencia — Hayden Davis citado',
    slug: 'audiencia-congreso-2',
    description: 'El Congreso cita a Hayden Davis a declarar. Davis no comparece.',
    date: '2025-03-10T14:00:00Z',
    event_type: 'legal',
  },
  {
    id: pid('cl-event-congressional-report'),
    title: 'Publicacion del informe parlamentario',
    slug: 'informe-parlamentario',
    description:
      'El Congreso publica su informe sobre el caso $LIBRA detallando las conexiones entre el gobierno y los organizadores.',
    date: '2025-04-01T12:00:00Z',
    event_type: 'legal',
  },
  {
    id: pid('cl-event-trm-analysis'),
    title: 'TRM Labs publica rastreo de fondos',
    slug: 'trm-labs-analisis',
    description:
      'TRM Labs publica un analisis detallado del flujo de fondos on-chain, identificando billeteras de consolidacion.',
    date: '2025-02-20T18:00:00Z',
    event_type: 'media',
  },
  {
    id: pid('cl-event-infobae-investigation'),
    title: 'Infobae publica investigacion sobre $LIBRA',
    slug: 'infobae-investigacion',
    description:
      'Infobae publica una investigacion periodistica conectando a personas del entorno presidencial con el esquema.',
    date: '2025-02-18T10:00:00Z',
    event_type: 'media',
  },
  {
    id: pid('cl-event-court-filing'),
    title: 'Presentacion de denuncia penal',
    slug: 'denuncia-penal',
    description:
      'Se presenta denuncia penal contra los organizadores del token $LIBRA por presunta estafa y lavado de activos.',
    date: '2025-02-19T09:00:00Z',
    event_type: 'legal',
  },
  {
    id: pid('cl-event-milei-defense'),
    title: 'Milei defiende su participacion',
    slug: 'milei-defensa',
    description:
      'Milei declara que su publicacion fue para "impulsar el sector privado" y niega haber tenido participacion economica.',
    date: '2025-02-16T20:00:00Z',
    event_type: 'political',
  },
  {
    id: pid('cl-event-caputo-calls'),
    title: 'Registros de llamadas de Santiago Caputo',
    slug: 'registros-llamadas-caputo',
    description:
      'Se revelan registros de llamadas entre Santiago Caputo y Julian Peh en las horas previas y posteriores al lanzamiento.',
    date: '2025-03-18T10:00:00Z',
    event_type: 'legal',
  },
  {
    id: pid('cl-event-international-media'),
    title: 'Cobertura internacional del caso',
    slug: 'cobertura-internacional',
    description:
      'FT, Reuters y Bloomberg publican cobertura del caso. La imagen internacional de Argentina se ve afectada.',
    date: '2025-02-17T08:00:00Z',
    event_type: 'media',
  },
  {
    id: pid('cl-event-wallet-consolidation'),
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
    id: pid('cl-doc-congressional-report'),
    title: 'Informe de la Comision Investigadora del Congreso sobre $LIBRA',
    slug: 'informe-comision-libra',
    doc_type: 'informe-parlamentario',
    summary:
      'Informe oficial del Congreso detallando cronologia, actores involucrados, flujo de fondos y recomendaciones sobre el caso $LIBRA.',
    date_published: '2025-04-01',
  },
  {
    id: pid('cl-doc-trm-analysis'),
    title: 'TRM Labs: Rastreo On-Chain del Token $LIBRA',
    slug: 'trm-labs-rastreo-libra',
    doc_type: 'analisis-blockchain',
    summary:
      'Analisis detallado de TRM Labs sobre el flujo de fondos on-chain, identificando billeteras de insiders, montos extraidos y patrones de consolidacion.',
    date_published: '2025-02-20',
  },
  {
    id: pid('cl-doc-infobae-investigation'),
    title: 'Infobae: La trama detras de $LIBRA',
    slug: 'infobae-trama-libra',
    doc_type: 'articulo-periodistico',
    summary:
      'Investigacion de Infobae revelando las reuniones previas en Casa Rosada y las conexiones entre el entorno presidencial y Kelsier Ventures.',
    date_published: '2025-02-18',
  },
  {
    id: pid('cl-doc-herald-timeline'),
    title: 'Buenos Aires Herald: Timeline of the $LIBRA Scandal',
    slug: 'herald-timeline-libra',
    doc_type: 'articulo-periodistico',
    summary:
      'Cronologia completa del escandalo publicada por el Buenos Aires Herald, incluyendo fuentes internacionales.',
    date_published: '2025-02-19',
  },
  {
    id: pid('cl-doc-court-filing'),
    title: 'Denuncia Penal — Caso $LIBRA',
    slug: 'denuncia-penal-libra',
    doc_type: 'documento-judicial',
    summary:
      'Denuncia penal presentada contra los organizadores del token por presunta estafa masiva y lavado de activos.',
    date_published: '2025-02-19',
  },
  {
    id: pid('cl-doc-phone-forensics'),
    title: 'Pericias Telefonicas — Comunicaciones Pre-Lanzamiento',
    slug: 'pericias-telefonicas-libra',
    doc_type: 'documento-judicial',
    summary:
      'Registros de comunicaciones telefonicas que vinculan al entorno presidencial con los organizadores del lanzamiento.',
    date_published: '2025-03-15',
  },
  {
    id: pid('cl-doc-visitor-logs'),
    title: 'Registros de Visitas a Casa Rosada — Enero/Febrero 2025',
    slug: 'registros-visitas-casa-rosada',
    doc_type: 'registro-publico',
    summary:
      'Registros oficiales de visitas mostrando ingresos de Julian Peh y asociados de Kelsier a Casa Rosada.',
    date_published: '2025-02-22',
  },
  {
    id: pid('cl-doc-ft-article'),
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
    id: pid('DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z'),
    address: 'DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z',
    label: 'Billetera del equipo #1',
    owner_id: pid('cl-org-kelsier'),
  },
  {
    id: pid('TEAM_WALLET_2_PLACEHOLDER'),
    address: 'TEAM_WALLET_2_PLACEHOLDER',
    label: 'Billetera del equipo #2',
    owner_id: pid('cl-person-hayden-davis'),
  },
  {
    id: pid('CONSOLIDATION_WALLET_1'),
    address: 'CONSOLIDATION_WALLET_1',
    label: 'Billetera de consolidacion #1',
  },
  {
    id: pid('CONSOLIDATION_WALLET_2'),
    address: 'CONSOLIDATION_WALLET_2',
    label: 'Billetera de consolidacion #2',
  },
  {
    id: pid('BzzMNvfm7T6zSGFeLXzERmRxfKaNLdo4fSzvsisxcSzz'),
    address: 'BzzMNvfm7T6zSGFeLXzERmRxfKaNLdo4fSzvsisxcSzz',
    label: 'Pool de liquidez $LIBRA',
  },
  {
    id: pid('INSIDER_WALLET_1'),
    address: 'INSIDER_WALLET_1',
    label: 'Billetera insider #1',
  },
  {
    id: pid('INSIDER_WALLET_2'),
    address: 'INSIDER_WALLET_2',
    label: 'Billetera insider #2',
  },
  {
    id: pid('EXIT_WALLET_1'),
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
        `MERGE (p:Person { id: $id })
         SET p.name = $name,
             p.slug = $slug,
             p.role = $role,
             p.description = $description,
             p.nationality = $nationality,
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
             o.org_type = $org_type,
             o.description = $description,
             o.country = $country,
             o.caso_slug = $casoSlug`,
        { ...org, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${ORGANIZATIONS.length} organizations seeded`)

    console.log('Seeding token...')
    await session.run(
      `MERGE (t:Token { id: $id })
       SET t.symbol = $symbol,
           t.name = $name,
           t.contract_address = $contract_address,
           t.chain = $chain,
           t.launch_date = $launch_date,
           t.peak_market_cap = $peak_market_cap,
           t.caso_slug = $casoSlug`,
      { ...TOKEN, casoSlug: CASO_SLUG },
      TX_CONFIG,
    )
    console.log('  1 token seeded')

    console.log('Seeding events...')
    for (const event of EVENTS) {
      await session.run(
        `MERGE (e:Event { id: $id })
         SET e.title = $title,
             e.slug = $slug,
             e.description = $description,
             e.date = $date,
             e.event_type = $event_type,
             e.caso_slug = $casoSlug`,
        { ...event, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${EVENTS.length} events seeded`)

    console.log('Seeding documents...')
    for (const doc of DOCUMENTS) {
      await session.run(
        `MERGE (d:Document { id: $id })
         SET d.title = $title,
             d.slug = $slug,
             d.doc_type = $doc_type,
             d.summary = $summary,
             d.date_published = $date_published,
             d.caso_slug = $casoSlug`,
        { ...doc, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }
    console.log(`  ${DOCUMENTS.length} documents seeded`)

    console.log('Seeding wallets...')
    for (const wallet of WALLETS) {
      await session.run(
        `MERGE (w:Wallet { id: $id })
         SET w.address = $address,
             w.label = $label,
             w.chain = 'solana',
             w.caso_slug = $casoSlug
             ${wallet.owner_id ? ', w.owner_id = $owner_id' : ''}`,
        { ...wallet, casoSlug: CASO_SLUG },
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
      `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
       MATCH (t:Token { id: $tokenId, caso_slug: $casoSlug })
       MERGE (p)-[:PROMOTED]->(t)`,
      { personId: pid('cl-person-milei'), tokenId: pid('cl-token-libra'), casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    // CREATED_BY: Token → Kelsier
    await session.run(
      `MATCH (t:Token { id: $tokenId, caso_slug: $casoSlug })
       MATCH (o:Organization { id: $orgId, caso_slug: $casoSlug })
       MERGE (t)-[:CREATED_BY]->(o)`,
      { tokenId: pid('cl-token-libra'), orgId: pid('cl-org-kelsier'), casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    // AFFILIATED_WITH: People → Organizations
    const affiliations = [
      [pid('cl-person-milei'), pid('cl-org-casa-rosada')],
      [pid('cl-person-karina-milei'), pid('cl-org-casa-rosada')],
      [pid('cl-person-santiago-caputo'), pid('cl-org-casa-rosada')],
      [pid('cl-person-hayden-davis'), pid('cl-org-kelsier')],
    ]
    for (const [personId, orgId] of affiliations) {
      await session.run(
        `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
         MATCH (o:Organization { id: $orgId, caso_slug: $casoSlug })
         MERGE (p)-[:AFFILIATED_WITH]->(o)`,
        { personId, orgId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // COMMUNICATED_WITH relationships
    const communications = [
      {
        from: pid('cl-person-santiago-caputo'),
        to: pid('cl-person-julian-peh'),
        date: '2025-02-14',
        medium: 'telefono',
      },
      {
        from: pid('cl-person-julian-peh'),
        to: pid('cl-person-hayden-davis'),
        date: '2025-02-13',
        medium: 'telefono',
      },
      {
        from: pid('cl-person-santiago-caputo'),
        to: pid('cl-person-julian-peh'),
        date: '2025-02-15',
        medium: 'telefono',
      },
    ]
    for (const comm of communications) {
      await session.run(
        `MATCH (a:Person { id: $from, caso_slug: $casoSlug })
         MATCH (b:Person { id: $to, caso_slug: $casoSlug })
         MERGE (a)-[:COMMUNICATED_WITH { date: $date, medium: $medium }]->(b)`,
        { ...comm, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // MET_WITH relationships
    const meetings = [
      {
        from: pid('cl-person-julian-peh'),
        to: pid('cl-person-karina-milei'),
        date: '2025-02-10',
        location: 'Casa Rosada',
      },
      {
        from: pid('cl-person-julian-peh'),
        to: pid('cl-person-santiago-caputo'),
        date: '2025-02-10',
        location: 'Casa Rosada',
      },
    ]
    for (const meeting of meetings) {
      await session.run(
        `MATCH (a:Person { id: $from, caso_slug: $casoSlug })
         MATCH (b:Person { id: $to, caso_slug: $casoSlug })
         MERGE (a)-[:MET_WITH { date: $date, location: $location }]->(b)`,
        { ...meeting, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // PARTICIPATED_IN: People → Events
    const participations = [
      [pid('cl-person-milei'), pid('cl-event-milei-post')],
      [pid('cl-person-milei'), pid('cl-event-milei-deletes-post')],
      [pid('cl-person-milei'), pid('cl-event-milei-defense')],
      [pid('cl-person-hayden-davis'), pid('cl-event-token-launch')],
      [pid('cl-person-hayden-davis'), pid('cl-event-58m-liquidation')],
      [pid('cl-person-julian-peh'), pid('cl-event-casa-rosada-visits')],
      [pid('cl-person-karina-milei'), pid('cl-event-casa-rosada-visits')],
      [pid('cl-person-santiago-caputo'), pid('cl-event-caputo-calls')],
      [pid('cl-person-julian-peh'), pid('cl-event-caputo-calls')],
    ]
    for (const [personId, eventId] of participations) {
      await session.run(
        `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
         MATCH (e:Event { id: $eventId, caso_slug: $casoSlug })
         MERGE (p)-[:PARTICIPATED_IN]->(e)`,
        { personId, eventId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // DOCUMENTED_BY: Events → Documents
    const documentations = [
      [pid('cl-event-congressional-report'), pid('cl-doc-congressional-report')],
      [pid('cl-event-trm-analysis'), pid('cl-doc-trm-analysis')],
      [pid('cl-event-infobae-investigation'), pid('cl-doc-infobae-investigation')],
      [pid('cl-event-court-filing'), pid('cl-doc-court-filing')],
      [pid('cl-event-phone-forensics'), pid('cl-doc-phone-forensics')],
      [pid('cl-event-casa-rosada-visits'), pid('cl-doc-visitor-logs')],
      [pid('cl-event-international-media'), pid('cl-doc-ft-article')],
    ]
    for (const [eventId, docId] of documentations) {
      await session.run(
        `MATCH (e:Event { id: $eventId, caso_slug: $casoSlug })
         MATCH (d:Document { id: $docId, caso_slug: $casoSlug })
         MERGE (e)-[:DOCUMENTED_BY]->(d)`,
        { eventId, docId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // MENTIONS: Documents → People/Orgs (all use generic labels now)
    const mentions: Array<{ docId: string; targetId: string; targetLabel: 'Person' | 'Organization' }> = [
      { docId: pid('cl-doc-congressional-report'), targetId: pid('cl-person-milei'), targetLabel: 'Person' },
      { docId: pid('cl-doc-congressional-report'), targetId: pid('cl-person-hayden-davis'), targetLabel: 'Person' },
      { docId: pid('cl-doc-congressional-report'), targetId: pid('cl-person-karina-milei'), targetLabel: 'Person' },
      { docId: pid('cl-doc-congressional-report'), targetId: pid('cl-org-kelsier'), targetLabel: 'Organization' },
      { docId: pid('cl-doc-trm-analysis'), targetId: pid('cl-person-hayden-davis'), targetLabel: 'Person' },
      { docId: pid('cl-doc-trm-analysis'), targetId: pid('cl-org-kelsier'), targetLabel: 'Organization' },
      { docId: pid('cl-doc-infobae-investigation'), targetId: pid('cl-person-milei'), targetLabel: 'Person' },
      { docId: pid('cl-doc-infobae-investigation'), targetId: pid('cl-person-julian-peh'), targetLabel: 'Person' },
      { docId: pid('cl-doc-infobae-investigation'), targetId: pid('cl-person-karina-milei'), targetLabel: 'Person' },
      { docId: pid('cl-doc-phone-forensics'), targetId: pid('cl-person-santiago-caputo'), targetLabel: 'Person' },
      { docId: pid('cl-doc-phone-forensics'), targetId: pid('cl-person-julian-peh'), targetLabel: 'Person' },
      { docId: pid('cl-doc-visitor-logs'), targetId: pid('cl-person-julian-peh'), targetLabel: 'Person' },
      { docId: pid('cl-doc-visitor-logs'), targetId: pid('cl-org-casa-rosada'), targetLabel: 'Organization' },
    ]
    for (const mention of mentions) {
      await session.run(
        `MATCH (d:Document { id: $docId, caso_slug: $casoSlug })
         MATCH (t:${mention.targetLabel} { id: $targetId, caso_slug: $casoSlug })
         MERGE (d)-[:MENTIONS]->(t)`,
        { docId: mention.docId, targetId: mention.targetId, casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
    }

    // CONTROLS: People → Wallets
    await session.run(
      `MATCH (p:Person { id: $personId, caso_slug: $casoSlug })
       MATCH (w:Wallet { id: $walletId, caso_slug: $casoSlug })
       MERGE (p)-[:CONTROLS]->(w)`,
      {
        personId: pid('cl-person-hayden-davis'),
        walletId: pid('TEAM_WALLET_2_PLACEHOLDER'),
        casoSlug: CASO_SLUG,
      },
      TX_CONFIG,
    )

    // SENT: Wallet → Wallet (key transactions)
    const transactions = [
      {
        from: pid('BzzMNvfm7T6zSGFeLXzERmRxfKaNLdo4fSzvsisxcSzz'),
        to: pid('DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z'),
        amount_usd: 58_000_000,
        timestamp: '2025-02-14T23:30:00Z',
        hash: 'TX_58M_EXTRACTION',
      },
      {
        from: pid('DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z'),
        to: pid('CONSOLIDATION_WALLET_1'),
        amount_usd: 25_000_000,
        timestamp: '2025-02-15T02:00:00Z',
        hash: 'TX_CONSOLIDATION_1',
      },
      {
        from: pid('DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z'),
        to: pid('CONSOLIDATION_WALLET_2'),
        amount_usd: 18_000_000,
        timestamp: '2025-02-15T03:00:00Z',
        hash: 'TX_CONSOLIDATION_2',
      },
      {
        from: pid('TEAM_WALLET_2_PLACEHOLDER'),
        to: pid('INSIDER_WALLET_1'),
        amount_usd: 8_000_000,
        timestamp: '2025-02-15T01:00:00Z',
        hash: 'TX_INSIDER_1',
      },
      {
        from: pid('CONSOLIDATION_WALLET_1'),
        to: pid('EXIT_WALLET_1'),
        amount_usd: 12_000_000,
        timestamp: '2025-02-16T10:00:00Z',
        hash: 'TX_EXIT_1',
      },
      {
        from: pid('INSIDER_WALLET_1'),
        to: pid('INSIDER_WALLET_2'),
        amount_usd: 5_000_000,
        timestamp: '2025-02-15T06:00:00Z',
        hash: 'TX_INSIDER_MOVE',
      },
    ]
    for (const tx of transactions) {
      await session.run(
        `MATCH (w1:Wallet { id: $from, caso_slug: $casoSlug })
         MATCH (w2:Wallet { id: $to, caso_slug: $casoSlug })
         MERGE (w1)-[:SENT { hash: $hash, amount_usd: $amount_usd, timestamp: $timestamp }]->(w2)`,
        { ...tx, casoSlug: CASO_SLUG },
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
