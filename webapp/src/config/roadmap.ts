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
    status: 'completed',
    statusLabel: 'Completada',
    features: [
      'Explorador de grafo interactivo (Neo4j)',
      'Ingestion automatizada de datos legislativos',
      'Perfiles de politicos con historial de votos',
      'Siete investigaciones publicadas',
    ],
  },
  {
    id: 'phase-2',
    title: 'Fase 2 — Motor de investigacion autonomo',
    goal: 'Pipeline automatizado: el motor busca, valida, consolida y reporta hallazgos con revision humana en cada paso.',
    status: 'in-progress',
    statusLabel: 'Beta',
    features: [
      'Pipeline de ingestion → verificacion → enriquecimiento → reporte',
      'LLM asistido con revision humana en cada etapa (human-at-the-gates)',
      'Templates reutilizables para nuevos dominios',
      'Conectores de datos: APIs, scrapers, documentos judiciales',
    ],
  },
  {
    id: 'phase-3',
    title: 'Fase 3 — MCP + Investigaciones manuales',
    goal: 'Crear investigaciones a través de MCP. Cualquier cliente compatible (Claude, Cursor, agentes) puede consultar el grafo, cruzar datos y generar reportes.',
    status: 'next',
    statusLabel: 'Alpha cerrada',
    features: [
      'Servidor MCP para crear y ejecutar investigaciones',
      'Consultas sobre el grafo, cruces y verificación vía MCP',
      'Integración con clientes MCP (Claude, Cursor, agentes custom)',
      'Exportación de investigaciones (PDF, datos abiertos)',
    ],
  },
  {
    id: 'phase-4',
    title: 'Fase 4 — Gobernanza',
    goal: 'Mecanismos de consenso, endorsements y validacion comunitaria de hallazgos.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Sistema de endorsement para claims y evidencia',
      'Coaliciones de investigacion con roles y reputacion',
      'Verificacion de identidad (DNI/CUIL)',
      'Mecanismos de consenso para validar hallazgos',
    ],
  },
  {
    id: 'phase-5',
    title: 'Fase 5 — Rendicion de cuentas',
    goal: 'Scoring algoritmico y mandatos ciudadanos.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Scoring de rendicion de cuentas (A/B/C/D por politico)',
      'Mandatos ciudadanos vinculados al grafo',
      'Democracia liquida y votacion cuadratica',
    ],
  },
]
