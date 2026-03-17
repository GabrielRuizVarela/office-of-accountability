import { z } from 'zod/v4'

const envSchema = z.object({
  NEO4J_URI: z.string().min(1),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default(''),
})

export type Neo4jConfig = z.infer<typeof envSchema>

export function loadNeo4jConfig(): Neo4jConfig {
  const result = envSchema.safeParse({
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USER: process.env.NEO4J_USER,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  })

  if (!result.success) {
    throw new Error(
      `Neo4j configuration error: ${result.error.issues.map((i) => i.message).join(', ')}`,
    )
  }

  return result.data
}
