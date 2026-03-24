import { getCounters } from '@/lib/engine/metrics'

export async function GET() {
  return Response.json({ success: true, data: getCounters() })
}
