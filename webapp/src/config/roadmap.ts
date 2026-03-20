export interface RoadmapPhase {
  id: string
  title: string
  goal: string
  status: 'completed' | 'in-progress' | 'next' | 'future'
  statusLabel: string
  features: string[]
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Fase 1 — Grafo de conocimiento + Investigaciones',
    goal: 'Base de datos en grafo con datos publicos verificados, explorador visual y primeras investigaciones publicadas.',
    status: 'in-progress',
    statusLabel: 'En progreso',
    features: [
      'Explorador de grafo interactivo (Neo4j)',
      'Ingestion automatizada de datos legislativos',
      'Perfiles de politicos con historial de votos',
      'Tres investigaciones publicadas (Libra, Epstein, Finanzas)',
    ],
  },
  {
    id: 'phase-2',
    title: 'Fase 2 — Motor de investigacion autonomo',
    goal: 'Pipeline automatizado: el motor busca, valida, consolida y reporta hallazgos con revision humana en cada paso.',
    status: 'next',
    statusLabel: 'Proximo',
    features: [
      'Pipeline de ingestion → verificacion → enriquecimiento → reporte',
      'LLM asistido con revision humana en cada etapa (human-at-the-gates)',
      'Templates reutilizables para nuevos dominios',
      'Conectores de datos: APIs, scrapers, documentos judiciales',
    ],
  },
  {
    id: 'phase-3',
    title: 'Fase 3 — IA avanzada + API publica',
    goal: 'Consultas avanzadas sobre el grafo, sugerencias automaticas y API para periodistas e investigadores.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Consultas multi-hop y extraccion de sub-grafos',
      'IA para sugerir nodos relacionados y resumir documentos',
      'API publica para periodistas e investigadores',
      'Exportacion de investigaciones (PDF, datos abiertos)',
    ],
  },
  {
    id: 'phase-4',
    title: 'Fase 4 — Comunidad + Gobernanza',
    goal: 'Investigaciones comunitarias, coaliciones, endorsements y mecanismos de consenso.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Editor colaborativo de investigaciones con embeds de grafo',
      'Coaliciones de investigacion con roles y reputacion',
      'Sistema de endorsement para claims y evidencia',
      'Verificacion de identidad (DNI/CUIL)',
    ],
  },
  {
    id: 'phase-5',
    title: 'Fase 5 — Rendicion de cuentas',
    goal: 'Scoring algoritmico, mandatos ciudadanos y cobertura provincial.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Scoring de rendicion de cuentas (A/B/C/D por politico)',
      'Mandatos ciudadanos vinculados al grafo',
      'Democracia liquida y votacion cuadratica',
      'Cobertura legislativa provincial',
    ],
  },
]
