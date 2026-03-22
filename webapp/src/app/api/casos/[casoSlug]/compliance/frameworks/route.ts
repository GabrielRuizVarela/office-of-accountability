import { loadFrameworksFromNeo4j } from '@/lib/compliance/pipeline'

export async function GET() {
  try {
    const frameworks = await loadFrameworksFromNeo4j()

    return Response.json({
      success: true,
      data: frameworks.map((fw) => ({
        id: fw.id,
        name: fw.name,
        standard: fw.standard,
        version: fw.version,
        description: fw.description,
        rules_count: fw.rules.length,
        checklist_count: fw.checklist?.length ?? 0,
      })),
    })
  } catch (error) {
    console.error('[compliance/frameworks]', error)
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to list compliance frameworks' },
      { status: 500 },
    )
  }
}
