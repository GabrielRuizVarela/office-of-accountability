/**
 * LLM client for nuclear risk signal analysis via Qwen 3.5 (llama.cpp).
 *
 * For structured JSON output tasks, we disable thinking mode via
 * chat_template_kwargs.enable_thinking=false so Qwen produces JSON
 * directly without spending thousands of tokens on reasoning first.
 *
 * For analytical tasks (pattern detection, briefing), thinking mode
 * can be enabled for deeper analysis.
 */

const MIROFISH_URL = process.env.MIROFISH_API_URL || 'http://localhost:8080'
const MODEL = 'Qwen3.5-9B-Q5_K_M.gguf'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LlmResponse {
  reasoning: string
  content: string
}

/**
 * Send a chat completion request to Qwen 3.5 via llama.cpp.
 *
 * @param enableThinking - If false (default), disables Qwen's thinking mode
 *   for faster, token-efficient structured output. Set to true for
 *   analytical tasks where reasoning quality matters.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; timeoutMs?: number; enableThinking?: boolean } = {},
): Promise<LlmResponse> {
  const { temperature = 0.3, maxTokens = 1024, timeoutMs = 120_000, enableThinking = false } = options

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${MIROFISH_URL}/v1/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        chat_template_kwargs: { enable_thinking: enableThinking },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`LLM request failed: ${response.status} ${text.slice(0, 200)}`)
    }

    const data = await response.json()
    const choice = data.choices?.[0]?.message

    return {
      reasoning: choice?.reasoning_content ?? '',
      content: choice?.content ?? '',
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Parse JSON from LLM response content.
 * Handles markdown code blocks and extracts JSON.
 */
export function parseJsonResponse<T>(content: string): T {
  // Strip markdown code blocks if present
  let cleaned = content.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }
  return JSON.parse(cleaned) as T
}

/**
 * Check if the LLM server is available.
 */
export async function isLlmAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${MIROFISH_URL}/health`, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}
