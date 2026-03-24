/**
 * Nuclear Risk Tracking — seed investigation data.
 *
 * Bilingual (EN primary, ES secondary) reference data covering
 * nuclear-armed and threshold states, major treaties, weapon systems,
 * and key nuclear facilities worldwide.
 *
 * This module is the single source of truth for the nuclear risk
 * tracking investigation page.
 */

import type {
  NuclearActor,
  WeaponSystem,
  Treaty,
  NuclearFacility,
} from './types'

// ---------------------------------------------------------------------------
// Nuclear-armed and threshold states
// ---------------------------------------------------------------------------

export const nuclearActors: NuclearActor[] = [
  // Armed states
  {
    id: 'us',
    name: 'United States',
    slug: 'us',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Largest nuclear arsenal alongside Russia; maintains a triad of ICBMs, SLBMs, and strategic bombers.',
    description_es:
      'Mayor arsenal nuclear junto con Rusia; mantiene una triada de ICBMs, SLBMs y bombarderos estrategicos.',
  },
  {
    id: 'russia',
    name: 'Russia',
    slug: 'russia',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Largest nuclear stockpile globally; inherited the Soviet arsenal and continues modernization across all delivery platforms.',
    description_es:
      'Mayor arsenal nuclear del mundo; heredo el arsenal sovietico y continua la modernizacion en todas las plataformas de lanzamiento.',
  },
  {
    id: 'china',
    name: 'China',
    slug: 'china',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Rapidly expanding nuclear arsenal with new silo fields, MIRVed ICBMs, and sea-based deterrent capabilities.',
    description_es:
      'Arsenal nuclear en rapida expansion con nuevos campos de silos, ICBMs con MIRV y capacidades de disuasion maritima.',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    slug: 'uk',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Maintains a continuous-at-sea deterrent (CASD) based on Trident II D5 submarine-launched ballistic missiles.',
    description_es:
      'Mantiene una disuasion continua en el mar (CASD) basada en misiles balisticos lanzados desde submarinos Trident II D5.',
  },
  {
    id: 'france',
    name: 'France',
    slug: 'france',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Independent nuclear deterrent with submarine-launched and air-launched components; does not participate in NATO nuclear sharing.',
    description_es:
      'Disuasion nuclear independiente con componentes submarinos y aereos; no participa en el reparto nuclear de la OTAN.',
  },
  {
    id: 'india',
    name: 'India',
    slug: 'india',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Declared nuclear state since 1998; maintains a no-first-use policy and is developing a triad capability.',
    description_es:
      'Estado nuclear declarado desde 1998; mantiene una politica de no primer uso y desarrolla capacidad de triada.',
  },
  {
    id: 'pakistan',
    name: 'Pakistan',
    slug: 'pakistan',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Fastest-growing nuclear arsenal; focuses on tactical and strategic weapons to counter Indian conventional superiority.',
    description_es:
      'Arsenal nuclear de mas rapido crecimiento; se centra en armas tacticas y estrategicas para contrarrestar la superioridad convencional india.',
  },
  {
    id: 'israel',
    name: 'Israel',
    slug: 'israel',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Maintains a policy of nuclear ambiguity; widely assessed to possess a significant undeclared arsenal.',
    description_es:
      'Mantiene una politica de ambiguedad nuclear; ampliamente evaluado como poseedor de un arsenal significativo no declarado.',
  },
  {
    id: 'north-korea',
    name: 'North Korea',
    slug: 'north-korea',
    actor_type: 'state',
    nuclear_status: 'armed',
    description_en:
      'Withdrew from the NPT in 2003; has conducted six nuclear tests and developed ICBMs capable of reaching the US mainland.',
    description_es:
      'Se retiro del TNP en 2003; ha realizado seis pruebas nucleares y desarrollado ICBMs capaces de alcanzar el territorio continental de EE.UU.',
  },

  // Threshold states
  {
    id: 'iran',
    name: 'Iran',
    slug: 'iran',
    actor_type: 'state',
    nuclear_status: 'threshold',
    description_en:
      'Advanced enrichment capability; JCPOA suspension has allowed stockpile growth near weapons-grade levels.',
    description_es:
      'Capacidad avanzada de enriquecimiento; la suspension del JCPOA ha permitido el crecimiento del inventario cerca de niveles de grado militar.',
  },
  {
    id: 'saudi-arabia',
    name: 'Saudi Arabia',
    slug: 'saudi-arabia',
    actor_type: 'state',
    nuclear_status: 'threshold',
    description_en:
      'No indigenous weapons program confirmed, but has expressed interest in matching any Iranian capability and invested in ballistic missiles.',
    description_es:
      'Sin programa de armas indigenas confirmado, pero ha expresado interes en igualar cualquier capacidad irani e invertido en misiles balisticos.',
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    slug: 'south-korea',
    actor_type: 'state',
    nuclear_status: 'threshold',
    description_en:
      'Advanced civilian nuclear infrastructure; growing domestic debate on independent nuclear deterrence amid North Korean threats.',
    description_es:
      'Infraestructura nuclear civil avanzada; creciente debate interno sobre disuasion nuclear independiente ante las amenazas norcoreanas.',
  },
  {
    id: 'japan',
    name: 'Japan',
    slug: 'japan',
    actor_type: 'state',
    nuclear_status: 'threshold',
    description_en:
      'Possesses reprocessing and enrichment technology; maintains a large plutonium stockpile under civilian oversight.',
    description_es:
      'Posee tecnologia de reprocesamiento y enriquecimiento; mantiene un gran inventario de plutonio bajo supervision civil.',
  },
  {
    id: 'turkey',
    name: 'Turkey',
    slug: 'turkey',
    actor_type: 'state',
    nuclear_status: 'threshold',
    description_en:
      'Hosts US B61 gravity bombs under NATO nuclear sharing; leadership has publicly discussed independent nuclear capability.',
    description_es:
      'Alberga bombas de gravedad B61 de EE.UU. bajo el reparto nuclear de la OTAN; el liderazgo ha discutido publicamente capacidad nuclear independiente.',
  },
]

// ---------------------------------------------------------------------------
// Major treaties and control regimes
// ---------------------------------------------------------------------------

export const treaties: Treaty[] = [
  {
    id: 'npt',
    name: 'Treaty on the Non-Proliferation of Nuclear Weapons (NPT)',
    status: 'active',
    signed_date: '1968-07-01',
    parties: ['190+ states parties'],
    description_en:
      'Cornerstone of global non-proliferation; recognizes five nuclear-weapon states and commits non-nuclear parties to forgo weapons development.',
    description_es:
      'Piedra angular de la no proliferacion global; reconoce cinco estados con armas nucleares y compromete a las partes no nucleares a renunciar al desarrollo de armas.',
  },
  {
    id: 'new-start',
    name: 'New START',
    status: 'active',
    signed_date: '2010-04-08',
    parties: ['us', 'russia'],
    description_en:
      'Limits deployed strategic warheads to 1,550 per side and deployed delivery vehicles to 700; extended to 2026.',
    description_es:
      'Limita las ojivas estrategicas desplegadas a 1.550 por lado y los vehiculos de lanzamiento desplegados a 700; extendido hasta 2026.',
  },
  {
    id: 'ctbt',
    name: 'Comprehensive Nuclear-Test-Ban Treaty (CTBT)',
    status: 'active',
    signed_date: '1996-09-24',
    parties: ['187 signatories, 178 ratifications — not yet in force'],
    description_en:
      'Bans all nuclear explosions; has not entered into force due to non-ratification by key Annex 2 states including the US, China, and others.',
    description_es:
      'Prohibe todas las explosiones nucleares; no ha entrado en vigor debido a la no ratificacion por estados clave del Anexo 2, incluyendo EE.UU., China y otros.',
  },
  {
    id: 'inf',
    name: 'Intermediate-Range Nuclear Forces Treaty (INF)',
    status: 'expired',
    signed_date: '1987-12-08',
    parties: ['us', 'russia'],
    description_en:
      'Eliminated ground-launched ballistic and cruise missiles with ranges of 500-5,500 km; US withdrew in August 2019 citing Russian violations.',
    description_es:
      'Elimino misiles balisticos y de crucero lanzados desde tierra con alcances de 500-5.500 km; EE.UU. se retiro en agosto de 2019 citando violaciones rusas.',
  },
  {
    id: 'jcpoa',
    name: 'Joint Comprehensive Plan of Action (JCPOA)',
    status: 'suspended',
    signed_date: '2015-07-14',
    parties: ['iran', 'us', 'uk', 'france', 'russia', 'china', 'germany'],
    description_en:
      'Limited Iran enrichment to 3.67% and capped stockpile; US withdrew in 2018, Iran subsequently exceeded key limits.',
    description_es:
      'Limito el enriquecimiento de Iran al 3,67% y limito el inventario; EE.UU. se retiro en 2018, Iran posteriormente excedio limites clave.',
  },
  {
    id: 'mtcr',
    name: 'Missile Technology Control Regime (MTCR)',
    status: 'active',
    signed_date: '1987-04-16',
    parties: ['35 member states'],
    description_en:
      'Informal partnership to limit proliferation of missiles and missile technology capable of delivering weapons of mass destruction.',
    description_es:
      'Asociacion informal para limitar la proliferacion de misiles y tecnologia misilistica capaz de entregar armas de destruccion masiva.',
  },
  {
    id: 'nsg',
    name: 'Nuclear Suppliers Group (NSG)',
    status: 'active',
    signed_date: '1975-01-01',
    parties: ['48 member states'],
    description_en:
      'Multilateral export control regime that seeks to prevent nuclear proliferation by controlling transfers of nuclear and nuclear-related materials.',
    description_es:
      'Regimen multilateral de control de exportaciones que busca prevenir la proliferacion nuclear controlando transferencias de materiales nucleares y relacionados.',
  },
  {
    id: 'tlatelolco',
    name: 'Treaty of Tlatelolco',
    status: 'active',
    signed_date: '1967-02-14',
    parties: ['33 Latin American and Caribbean states'],
    description_en:
      'Established Latin America and the Caribbean as a nuclear-weapon-free zone; first inhabited region to be denuclearized.',
    description_es:
      'Establecio America Latina y el Caribe como zona libre de armas nucleares; primera region habitada en ser desnuclearizada.',
  },
]

// ---------------------------------------------------------------------------
// Weapon systems
// ---------------------------------------------------------------------------

export const weaponSystems: WeaponSystem[] = [
  // United States
  {
    id: 'us-minuteman-iii',
    name: 'LGM-30G Minuteman III',
    category: 'icbm',
    operator_id: 'us',
    description_en: 'Land-based ICBM forming the ground leg of the US nuclear triad; 400 deployed across three missile wings.',
    range_km: 13000,
    warheads: 1,
  },
  {
    id: 'us-trident-ii-d5',
    name: 'UGM-133A Trident II D5',
    category: 'slbm',
    operator_id: 'us',
    description_en: 'Submarine-launched ballistic missile deployed on Ohio-class SSBNs; backbone of US sea-based deterrent.',
    range_km: 12000,
    warheads: 8,
  },
  {
    id: 'us-b2-spirit',
    name: 'B-2 Spirit',
    category: 'bomber',
    operator_id: 'us',
    description_en: 'Stealth strategic bomber capable of delivering both nuclear and conventional ordnance globally.',
  },
  {
    id: 'us-b52h',
    name: 'B-52H Stratofortress',
    category: 'bomber',
    operator_id: 'us',
    description_en: 'Long-range strategic bomber; primary standoff platform for air-launched cruise missiles.',
  },
  {
    id: 'us-agm86b',
    name: 'AGM-86B ALCM',
    category: 'cruise_missile',
    operator_id: 'us',
    description_en: 'Air-launched cruise missile with nuclear warhead; carried by B-52H bombers for standoff strike.',
    range_km: 2400,
    warheads: 1,
  },
  {
    id: 'us-gmd',
    name: 'Ground-Based Midcourse Defense (GMD)',
    category: 'missile_defense',
    operator_id: 'us',
    description_en: 'National missile defense system designed to intercept limited ICBM threats during midcourse flight phase.',
  },

  // Russia
  {
    id: 'ru-rs28-sarmat',
    name: 'RS-28 Sarmat',
    category: 'icbm',
    operator_id: 'russia',
    description_en: 'Heavy liquid-fueled ICBM replacing the SS-18 Satan; capable of carrying 10+ MIRVed warheads or hypersonic glide vehicles.',
    range_km: 18000,
    warheads: 10,
  },
  {
    id: 'ru-topol-m',
    name: 'RT-2PM2 Topol-M',
    category: 'icbm',
    operator_id: 'russia',
    description_en: 'Road-mobile and silo-based ICBM; single-warhead design with advanced countermeasures.',
    range_km: 11000,
    warheads: 1,
  },
  {
    id: 'ru-bulava',
    name: 'RSM-56 Bulava',
    category: 'slbm',
    operator_id: 'russia',
    description_en: 'SLBM deployed on Borei-class submarines; MIRVed with up to 6 warheads.',
    range_km: 9300,
    warheads: 6,
  },
  {
    id: 'ru-tu160',
    name: 'Tu-160 Blackjack',
    category: 'bomber',
    operator_id: 'russia',
    description_en: 'Supersonic strategic bomber; largest and heaviest combat aircraft ever built, carrier for nuclear cruise missiles.',
  },
  {
    id: 'ru-burevestnik',
    name: '9M730 Burevestnik (SSC-X-9 Skyfall)',
    category: 'cruise_missile',
    operator_id: 'russia',
    description_en: 'Nuclear-powered cruise missile with theoretically unlimited range; still in development and testing.',
  },
  {
    id: 'ru-s500',
    name: 'S-500 Prometey',
    category: 'missile_defense',
    operator_id: 'russia',
    description_en: 'Advanced anti-ballistic missile and anti-aircraft system designed to intercept ICBMs and hypersonic targets.',
  },

  // China
  {
    id: 'cn-df41',
    name: 'DF-41 (Dongfeng-41)',
    category: 'icbm',
    operator_id: 'china',
    description_en: 'Road-mobile and silo-based ICBM; MIRVed with up to 10 warheads, longest range in Chinese arsenal.',
    range_km: 15000,
    warheads: 10,
  },
  {
    id: 'cn-df5b',
    name: 'DF-5B',
    category: 'icbm',
    operator_id: 'china',
    description_en: 'Silo-based liquid-fueled ICBM; MIRVed variant of China longest-serving strategic missile.',
    range_km: 13000,
    warheads: 5,
  },
  {
    id: 'cn-jl3',
    name: 'JL-3 (Julang-3)',
    category: 'slbm',
    operator_id: 'china',
    description_en: 'Next-generation SLBM for Type 096 submarines; extends Chinese sea-based deterrent range significantly.',
    range_km: 12000,
    warheads: 6,
  },
  {
    id: 'cn-h6n',
    name: 'H-6N',
    category: 'bomber',
    operator_id: 'china',
    description_en: 'Modified bomber variant with aerial refueling capability and external hardpoint for air-launched ballistic missiles.',
  },
  {
    id: 'cn-df17',
    name: 'DF-17',
    category: 'hypersonic',
    operator_id: 'china',
    description_en: 'Medium-range ballistic missile equipped with the DF-ZF hypersonic glide vehicle; operational since 2020.',
    range_km: 2500,
    warheads: 1,
  },

  // United Kingdom
  {
    id: 'uk-trident-ii-d5',
    name: 'UGM-133A Trident II D5',
    category: 'slbm',
    operator_id: 'uk',
    description_en: 'US-built SLBM operated by the Royal Navy on Vanguard-class submarines; sole delivery system for UK nuclear deterrent.',
    range_km: 12000,
    warheads: 8,
  },

  // France
  {
    id: 'fr-m51',
    name: 'M51',
    category: 'slbm',
    operator_id: 'france',
    description_en: 'French-built SLBM deployed on Triomphant-class submarines; carries 6-10 MIRVed thermonuclear warheads.',
    range_km: 10000,
    warheads: 6,
  },
  {
    id: 'fr-asmpa',
    name: 'ASMP-A',
    category: 'cruise_missile',
    operator_id: 'france',
    description_en: 'Air-launched nuclear cruise missile carried by Rafale fighters; provides the airborne leg of French deterrent.',
    range_km: 500,
    warheads: 1,
  },

  // India
  {
    id: 'in-agni-v',
    name: 'Agni-V',
    category: 'icbm',
    operator_id: 'india',
    description_en: 'Road-mobile solid-fueled ICBM; brings all of China within range and is being MIRVed.',
    range_km: 5500,
    warheads: 1,
  },
  {
    id: 'in-k4',
    name: 'K-4',
    category: 'slbm',
    operator_id: 'india',
    description_en: 'Submarine-launched ballistic missile for Arihant-class SSBNs; key to establishing India sea-based deterrent.',
    range_km: 3500,
    warheads: 1,
  },
  {
    id: 'in-s400',
    name: 'S-400 Triumf',
    category: 'missile_defense',
    operator_id: 'india',
    description_en: 'Russian-supplied advanced air defense system; imported to strengthen India layered missile defense architecture.',
  },

  // Pakistan
  {
    id: 'pk-shaheen-iii',
    name: 'Shaheen-III',
    category: 'icbm',
    operator_id: 'pakistan',
    description_en: 'Longest-range Pakistani ballistic missile; solid-fueled with MIRVed warhead capability.',
    range_km: 2750,
    warheads: 1,
  },
  {
    id: 'pk-babur-3',
    name: 'Babur-3',
    category: 'cruise_missile',
    operator_id: 'pakistan',
    description_en: 'Submarine-launched cruise missile providing second-strike capability from Agosta-90B submarines.',
    range_km: 450,
    warheads: 1,
  },

  // North Korea
  {
    id: 'kp-hwasong-17',
    name: 'Hwasong-17',
    category: 'icbm',
    operator_id: 'north-korea',
    description_en: 'Largest road-mobile liquid-fueled ICBM; designed to carry multiple warheads to strike the US mainland.',
    range_km: 15000,
    warheads: 3,
  },
  {
    id: 'kp-hwasong-18',
    name: 'Hwasong-18',
    category: 'icbm',
    operator_id: 'north-korea',
    description_en: 'First North Korean solid-fueled ICBM; faster launch preparation increases survivability.',
    range_km: 15000,
    warheads: 1,
  },
  {
    id: 'kp-pukkuksong-5',
    name: 'Pukkuksong-5',
    category: 'slbm',
    operator_id: 'north-korea',
    description_en: 'Submarine-launched ballistic missile displayed at military parades; development status uncertain.',
    range_km: 2000,
    warheads: 1,
  },

  // Israel
  {
    id: 'il-jericho-iii',
    name: 'Jericho III',
    category: 'icbm',
    operator_id: 'israel',
    description_en: 'Road-mobile solid-fueled ICBM; believed to be capable of carrying a nuclear warhead with intercontinental range.',
    range_km: 6500,
    warheads: 1,
  },
]

// ---------------------------------------------------------------------------
// Key nuclear facilities
// ---------------------------------------------------------------------------

export const nuclearFacilities: NuclearFacility[] = [
  // United States
  {
    id: 'us-pantex',
    name: 'Pantex Plant',
    facility_type: 'assembly',
    location: 'Amarillo, Texas, USA',
    lat: 35.32,
    lng: -101.57,
    operator_id: 'us',
    description_en: 'Primary US nuclear weapons assembly and disassembly facility; all warheads in the stockpile pass through Pantex.',
  },
  {
    id: 'us-los-alamos',
    name: 'Los Alamos National Laboratory',
    facility_type: 'research',
    location: 'Los Alamos, New Mexico, USA',
    lat: 35.88,
    lng: -106.30,
    operator_id: 'us',
    description_en: 'Birthplace of the atomic bomb; primary design laboratory for US nuclear weapons and plutonium pit production.',
  },
  {
    id: 'us-llnl',
    name: 'Lawrence Livermore National Laboratory',
    facility_type: 'research',
    location: 'Livermore, California, USA',
    lat: 37.69,
    lng: -121.70,
    operator_id: 'us',
    description_en: 'Second US nuclear weapons design laboratory; leads research in stockpile stewardship and inertial confinement fusion.',
  },
  {
    id: 'us-y12',
    name: 'Y-12 National Security Complex',
    facility_type: 'enrichment',
    location: 'Oak Ridge, Tennessee, USA',
    lat: 35.98,
    lng: -84.25,
    operator_id: 'us',
    description_en: 'Processes and stores weapons-grade highly enriched uranium; manufactures thermonuclear secondaries.',
  },
  {
    id: 'us-kings-bay',
    name: 'Naval Submarine Base Kings Bay',
    facility_type: 'storage',
    location: 'Kings Bay, Georgia, USA',
    lat: 30.80,
    lng: -81.51,
    operator_id: 'us',
    description_en: 'Home port for US Atlantic Fleet Trident submarines; strategic weapons facility for SLBM loading and maintenance.',
  },

  // Russia
  {
    id: 'ru-sarov',
    name: 'Sarov (Arzamas-16)',
    facility_type: 'assembly',
    location: 'Sarov, Nizhny Novgorod Oblast, Russia',
    lat: 54.93,
    lng: 43.32,
    operator_id: 'russia',
    description_en: 'Russia primary nuclear weapons design and assembly center; equivalent to Los Alamos.',
  },
  {
    id: 'ru-novaya-zemlya',
    name: 'Novaya Zemlya Test Site',
    facility_type: 'test_site',
    location: 'Novaya Zemlya, Russia',
    lat: 73.37,
    lng: 54.78,
    operator_id: 'russia',
    description_en: 'Site of the largest nuclear explosion in history (Tsar Bomba, 1961); remains Russia designated nuclear test site.',
  },
  {
    id: 'ru-severodvinsk',
    name: 'Severodvinsk Shipyard (Sevmash)',
    facility_type: 'assembly',
    location: 'Severodvinsk, Arkhangelsk Oblast, Russia',
    lat: 64.56,
    lng: 39.83,
    operator_id: 'russia',
    description_en: 'Russia sole nuclear submarine construction yard; builds Borei- and Yasen-class submarines.',
  },
  {
    id: 'ru-ozersk',
    name: 'Ozersk (Mayak)',
    facility_type: 'reprocessing',
    location: 'Ozersk, Chelyabinsk Oblast, Russia',
    lat: 55.76,
    lng: 60.80,
    operator_id: 'russia',
    description_en: 'Major reprocessing and plutonium production facility; site of the 1957 Kyshtym disaster.',
  },

  // China
  {
    id: 'cn-lop-nur',
    name: 'Lop Nur Nuclear Test Site',
    facility_type: 'test_site',
    location: 'Lop Nur, Xinjiang, China',
    lat: 41.75,
    lng: 88.42,
    operator_id: 'china',
    description_en: 'Site of all 45 Chinese nuclear tests (1964-1996); now officially closed but monitored by CTBTO.',
  },
  {
    id: 'cn-jiuquan',
    name: 'Jiuquan Atomic Energy Complex',
    facility_type: 'research',
    location: 'Jiuquan, Gansu, China',
    lat: 40.96,
    lng: 100.29,
    operator_id: 'china',
    description_en: 'Early Chinese weapons-grade plutonium and highly enriched uranium production site; now focused on research.',
  },
  {
    id: 'cn-mianyang',
    name: 'China Academy of Engineering Physics (Mianyang)',
    facility_type: 'assembly',
    location: 'Mianyang, Sichuan, China',
    lat: 31.47,
    lng: 104.74,
    operator_id: 'china',
    description_en: 'China primary nuclear weapons research and design academy; equivalent to Los Alamos.',
  },

  // United Kingdom
  {
    id: 'uk-sellafield',
    name: 'Sellafield',
    facility_type: 'reprocessing',
    location: 'Sellafield, Cumbria, UK',
    lat: 54.42,
    lng: -3.50,
    operator_id: 'uk',
    description_en: 'Former plutonium production site and current spent fuel reprocessing complex; one of the most contaminated sites in Europe.',
  },
  {
    id: 'uk-awe-aldermaston',
    name: 'AWE Aldermaston',
    facility_type: 'assembly',
    location: 'Aldermaston, Berkshire, UK',
    lat: 51.37,
    lng: -1.15,
    operator_id: 'uk',
    description_en: 'Atomic Weapons Establishment; responsible for design, manufacture, and maintenance of UK nuclear warheads.',
  },

  // France
  {
    id: 'fr-la-hague',
    name: 'La Hague Reprocessing Plant',
    facility_type: 'reprocessing',
    location: 'La Hague, Normandy, France',
    lat: 49.68,
    lng: -1.88,
    operator_id: 'france',
    description_en: 'Largest commercial nuclear reprocessing plant in the world; extracts plutonium and uranium from spent fuel.',
  },
  {
    id: 'fr-valduc',
    name: 'CEA Valduc',
    facility_type: 'assembly',
    location: 'Is-sur-Tille, Burgundy, France',
    lat: 47.49,
    lng: 4.79,
    operator_id: 'france',
    description_en: 'CEA defense facility responsible for nuclear warhead design, assembly, and maintenance for French deterrent forces.',
  },

  // India
  {
    id: 'in-barc',
    name: 'Bhabha Atomic Research Centre (BARC)',
    facility_type: 'research',
    location: 'Mumbai, Maharashtra, India',
    lat: 19.01,
    lng: 72.92,
    operator_id: 'india',
    description_en: 'India premier nuclear research facility; houses the CIRUS and Dhruva reactors used for plutonium production.',
  },
  {
    id: 'in-tarapur',
    name: 'Tarapur Atomic Power Station',
    facility_type: 'reactor',
    location: 'Tarapur, Maharashtra, India',
    lat: 19.83,
    lng: 72.65,
    operator_id: 'india',
    description_en: 'India oldest nuclear power station; first commercial reactor complex in Asia.',
  },

  // Pakistan
  {
    id: 'pk-kahuta',
    name: 'Khan Research Laboratories (Kahuta)',
    facility_type: 'enrichment',
    location: 'Kahuta, Punjab, Pakistan',
    lat: 33.59,
    lng: 73.39,
    operator_id: 'pakistan',
    description_en: 'Pakistan primary uranium enrichment facility; founded by A.Q. Khan using centrifuge technology.',
  },
  {
    id: 'pk-khushab',
    name: 'Khushab Nuclear Complex',
    facility_type: 'reactor',
    location: 'Khushab, Punjab, Pakistan',
    lat: 32.02,
    lng: 72.17,
    operator_id: 'pakistan',
    description_en: 'Complex of four plutonium production reactors; key to Pakistan weapons-grade fissile material production.',
  },

  // North Korea
  {
    id: 'kp-yongbyon',
    name: 'Yongbyon Nuclear Scientific Research Center',
    facility_type: 'enrichment',
    location: 'Yongbyon, North Pyongan, North Korea',
    lat: 39.80,
    lng: 125.76,
    operator_id: 'north-korea',
    description_en: 'North Korea primary nuclear complex; includes a 5 MWe graphite-moderated reactor and uranium enrichment facilities.',
  },
  {
    id: 'kp-punggye-ri',
    name: 'Punggye-ri Nuclear Test Site',
    facility_type: 'test_site',
    location: 'Punggye-ri, North Hamgyong, North Korea',
    lat: 41.28,
    lng: 129.09,
    operator_id: 'north-korea',
    description_en: 'Site of all six North Korean nuclear tests (2006-2017); tunnels reportedly demolished in 2018 but could be restored.',
  },

  // Iran
  {
    id: 'ir-natanz',
    name: 'Natanz Fuel Enrichment Plant',
    facility_type: 'enrichment',
    location: 'Natanz, Isfahan Province, Iran',
    lat: 33.72,
    lng: 51.73,
    operator_id: 'iran',
    description_en: 'Iran primary uranium enrichment site; houses thousands of centrifuges in both above-ground and underground halls.',
  },
  {
    id: 'ir-fordow',
    name: 'Fordow Fuel Enrichment Plant',
    facility_type: 'enrichment',
    location: 'Fordow, Qom Province, Iran',
    lat: 34.88,
    lng: 50.99,
    operator_id: 'iran',
    description_en: 'Hardened underground enrichment facility built into a mountain; enrichment to 60% reported since 2021.',
  },
  {
    id: 'ir-isfahan',
    name: 'Isfahan Nuclear Technology Center',
    facility_type: 'research',
    location: 'Isfahan, Iran',
    lat: 32.65,
    lng: 51.68,
    operator_id: 'iran',
    description_en: 'Uranium conversion facility and nuclear research center; converts yellowcake to UF6 feedstock for enrichment.',
  },
  {
    id: 'ir-bushehr',
    name: 'Bushehr Nuclear Power Plant',
    facility_type: 'reactor',
    location: 'Bushehr, Iran',
    lat: 28.83,
    lng: 50.89,
    operator_id: 'iran',
    description_en: 'Iran first and only operational nuclear power plant; Russian-built VVER-1000 reactor under IAEA safeguards.',
  },

  // Israel
  {
    id: 'il-dimona',
    name: 'Negev Nuclear Research Center (Dimona)',
    facility_type: 'reactor',
    location: 'Dimona, Negev Desert, Israel',
    lat: 31.00,
    lng: 35.14,
    operator_id: 'israel',
    description_en: 'Believed to house a plutonium production reactor and reprocessing plant; central to Israel undeclared weapons program.',
  },
  {
    id: 'il-soreq',
    name: 'Soreq Nuclear Research Center',
    facility_type: 'research',
    location: 'Yavne, Israel',
    lat: 31.87,
    lng: 34.79,
    operator_id: 'israel',
    description_en: 'Civilian nuclear research center operating a 5 MW research reactor under IAEA safeguards.',
  },
]
