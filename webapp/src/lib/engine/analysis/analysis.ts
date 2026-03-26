/**
 * MiroFish / Qwen 3.5 analysis module.
 *
 * Calls the llama.cpp OpenAI-compatible endpoint directly (port 8080)
 * for cross-referenced procurement, ownership, and political analysis.
 *
 * NOT the MiroFish swarm API (port 5000) — this talks to the LLM server
 * itself for structured analysis tasks.
 */

import {
  PROCUREMENT_ANOMALY_PROMPT,
  OWNERSHIP_CHAIN_PROMPT,
  POLITICAL_CONNECTION_PROMPT,
  INVESTIGATION_SUMMARY_PROMPT,
} from './prompts'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LLM_API_URL = process.env.MIROFISH_API_URL ?? 'http://localhost:8080'
const REQUEST_TIMEOUT_MS = 600_000 // 10 minutes for analysis tasks
const MODEL_ID = 'Qwen3.5-9B-Q5_K_M.gguf'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalysisResult {
  success: boolean
  /** Parsed JSON payload from Qwen's `content` field. */
  findings: unknown
  /** Chain-of-thought reasoning from `reasoning_content`. */
  reasoning: string
  /** Raw `content` string before JSON parsing. */
  rawContent: string
  error?: string
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyze procurement data for anomalies (split contracts, repeat winners,
 * shell companies, suspicious timing).
 */
export async function analyzeProcurementAnomalies(
  subgraphJson: string,
): Promise<AnalysisResult> {
  return runAnalysis(PROCUREMENT_ANOMALY_PROMPT, subgraphJson)
}

/**
 * Trace beneficial-ownership chains through IGJ corporate registry data.
 */
export async function analyzeOwnershipChains(
  subgraphJson: string,
): Promise<AnalysisResult> {
  return runAnalysis(OWNERSHIP_CHAIN_PROMPT, subgraphJson)
}

/**
 * Map connections between government contractors, corporate officers,
 * and political figures.
 */
export async function analyzePoliticalConnections(
  subgraphJson: string,
): Promise<AnalysisResult> {
  return runAnalysis(POLITICAL_CONNECTION_PROMPT, subgraphJson)
}

/**
 * Combine all findings into a bilingual executive summary.
 */
export async function generateInvestigationSummary(
  allFindings: AnalysisResult[],
): Promise<string> {
  const combined = allFindings
    .filter((r) => r.success)
    .map((r) => JSON.stringify(r.findings, null, 2))
    .join('\n---\n')

  if (!combined) {
    return 'No successful findings to summarize.'
  }

  const result = await runAnalysis(INVESTIGATION_SUMMARY_PROMPT, combined)
  return result.success ? result.rawContent : (result.error ?? 'Summary generation failed.')
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function runAnalysis(
  systemPrompt: string,
  userContent: string,
): Promise<AnalysisResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${LLM_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      return {
        success: false,
        findings: null,
        reasoning: '',
        rawContent: '',
        error: `LLM error: ${response.status} - ${errText.slice(0, 300)}`,
      }
    }

    const completion = await response.json()
    const msg = completion.choices?.[0]?.message

    if (!msg) {
      return {
        success: false,
        findings: null,
        reasoning: '',
        rawContent: '',
        error: 'No message in LLM response',
      }
    }

    // Qwen 3.5 mandatory thinking: reasoning lives in reasoning_content,
    // structured output lives in content.
    const reasoning: string = msg.reasoning_content ?? ''
    const rawContent: string =
      msg.content && msg.content.trim() !== ''
        ? msg.content
        : reasoning // fallback if content is empty

    // Attempt to parse the structured JSON from content
    const findings = parseJsonResponse(rawContent)

    return {
      success: true,
      findings,
      reasoning,
      rawContent,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        findings: null,
        reasoning: '',
        rawContent: '',
        error: 'Analysis request timed out (10 min limit)',
      }
    }

    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return {
        success: false,
        findings: null,
        reasoning: '',
        rawContent: '',
        error: 'LLM server not reachable. Is llama-server running on port 8080?',
      }
    }

    return {
      success: false,
      findings: null,
      reasoning: '',
      rawContent: '',
      error: message,
    }
  }
}

/**
 * Extract JSON from the model's content field. Handles cases where the model
 * wraps JSON in markdown code fences or adds surrounding prose.
 */
function parseJsonResponse(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // no-op
  }

  // Try extracting from markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1])
    } catch {
      // no-op
    }
  }

  // Try finding the outermost { ... } block
  const braceStart = text.indexOf('{')
  const braceEnd = text.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) {
    try {
      return JSON.parse(text.slice(braceStart, braceEnd + 1))
    } catch {
      // no-op
    }
  }

  // Give up — return the raw text so the caller still has something
  return text
}
