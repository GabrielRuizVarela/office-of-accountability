/**
 * LLM check handler — uses local Qwen 3.5 via llama.cpp to evaluate compliance.
 *
 * Fetches nodes of the specified label, sends them to the LLM with the
 * compliance prompt, and parses the structured JSON response.
 */

import { readQuery } from '../../neo4j/client'
import { createLlamaCppProvider } from '../../engine/llm/llamacpp'
import { llmComplianceResponseSchema, type CheckResult, type ComplianceRule } from '../types'
import type { LlmCheckConfig } from './config-types'
import type { CheckContext } from './handler'

const MAX_NODES_DEFAULT = 30

export async function llmCheck(
  rule: ComplianceRule,
  config: LlmCheckConfig,
  ctx: CheckContext,
): Promise<CheckResult> {
  const maxNodes = config.max_nodes ?? MAX_NODES_DEFAULT

  // 1. Fetch nodes to evaluate
  const cypher = config.scope
    ? `MATCH (n:\`${config.node_label}\`)
       WHERE n.caso_slug = $caso_slug
       WITH n LIMIT $limit
       OPTIONAL MATCH (n)-[r]->(m)
       RETURN n { .*, _labels: labels(n), _id: elementId(n) } AS node,
              collect(type(r) + ' -> ' + coalesce(m.name, elementId(m))) AS relationships`
    : `MATCH (n:\`${config.node_label}\`)
       WITH n LIMIT $limit
       OPTIONAL MATCH (n)-[r]->(m)
       RETURN n { .*, _labels: labels(n), _id: elementId(n) } AS node,
              collect(type(r) + ' -> ' + coalesce(m.name, elementId(m))) AS relationships`

  const queryResult = await readQuery(
    cypher,
    { caso_slug: ctx.caso_slug, limit: maxNodes },
    (record) => ({
      node: record.get('node'),
      relationships: record.get('relationships'),
    }),
  )

  if (queryResult.records.length === 0) {
    return {
      rule_code: rule.code,
      rule_title: rule.title,
      mode: rule.mode,
      severity: rule.severity,
      phase: rule.phase,
      check_type: 'llm',
      passed: true,
      violations: 0,
      details: `No ${config.node_label} nodes found to evaluate`,
    }
  }

  // 2. Build LLM prompt
  const nodesJson = JSON.stringify(queryResult.records, null, 2)
  const systemPrompt = `You are a compliance auditor. Evaluate the following graph data against the compliance rule.
Respond with ONLY valid JSON matching this schema:
{
  "findings": [{ "node_id": string, "assessment": "pass"|"fail"|"inconclusive", "issues": [string] }],
  "summary": string,
  "score": number (0-1)
}`

  const userPrompt = `Rule: ${rule.title}
${rule.description ?? ''}

Check prompt: ${config.prompt}

Nodes to evaluate (${queryResult.records.length} ${config.node_label} nodes):
${nodesJson}`

  // 3. Call LLM
  const llm = createLlamaCppProvider()
  let reasoning: string | undefined

  try {
    const response = await llm.complete({
      messages: [{ role: 'user', content: userPrompt }],
      system_prompt: systemPrompt,
      json_mode: true,
      temperature: 0.1,
      max_tokens: 4096,
    })

    reasoning = response.reasoning

    // 4. Parse and validate response
    const content = response.content.trim()
    const parsed = llmComplianceResponseSchema.parse(JSON.parse(content))

    const violations = parsed.findings.filter((f) => f.assessment === 'fail').length

    return {
      rule_code: rule.code,
      rule_title: rule.title,
      mode: rule.mode,
      severity: rule.severity,
      phase: rule.phase,
      check_type: 'llm',
      passed: violations === 0,
      violations,
      details: parsed.summary,
      reasoning,
    }
  } catch (error) {
    // LLM unavailable or bad response — fail open with details
    const message = error instanceof Error ? error.message : String(error)
    return {
      rule_code: rule.code,
      rule_title: rule.title,
      mode: rule.mode,
      severity: rule.severity,
      phase: rule.phase,
      check_type: 'llm',
      passed: false,
      violations: -1,
      details: `LLM check failed: ${message}`,
      reasoning,
    }
  }
}
