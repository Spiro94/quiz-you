// src/lib/llm/evaluation.ts
// G-Eval evaluation service with timeout, exponential backoff, and Zod output validation.
// STATELESS: every call gets a fresh prompt — no context from previous answers (STATE.md requirement).
// Retry logic: 3 attempts, delays 1s -> 2s -> 4s with 10% jitter. Covers transient API failures.
import { z } from 'zod'
import { getLLMProvider } from './index'
import { buildEvaluationPrompt } from './prompts'
import type { EvaluationParams, EvaluationResult } from './types'

// Zod schema for validating LLM evaluation output
export const EvaluationSchema = z.object({
  reasoning: z.string().min(10, 'Reasoning too short'),
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(10, 'Feedback too short'),
  modelAnswer: z.string().min(10, 'Model answer too short')
})

const EVALUATION_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1_000

// Top-level evaluation entry point used by useAnswerEvaluation hook (Plan 03-03).
// Wraps evaluateWithRetry; exported for direct use.
export async function evaluateWithRetry(params: EvaluationParams): Promise<EvaluationResult> {
  let lastError: Error = new Error('Evaluation failed')

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await evaluateWithTimeout(params)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        const jitter = Math.random() * delay * 0.1
        await new Promise(resolve => setTimeout(resolve, delay + jitter))
      }
    }
  }

  throw new Error(`Evaluation failed after ${MAX_RETRIES} attempts: ${lastError.message}`)
}

async function evaluateWithTimeout(params: EvaluationParams): Promise<EvaluationResult> {
  return Promise.race([
    runEvaluation(params),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Evaluation timed out after ${EVALUATION_TIMEOUT_MS / 1000}s`)),
        EVALUATION_TIMEOUT_MS
      )
    )
  ])
}

async function runEvaluation(params: EvaluationParams): Promise<EvaluationResult> {
  const provider = getLLMProvider()
  // STATELESS: each call uses buildEvaluationPrompt with only the current question/answer.
  // Never pass previous evaluation results as context.
  const result = await provider.evaluateAnswer(params)

  // Zod validates the structured output — catches "score": "seventy-five" style failures
  const parsed = EvaluationSchema.parse(result)
  return parsed
}

// Re-export buildEvaluationPrompt so consumers can inspect the prompt without importing prompts.ts
export { buildEvaluationPrompt }
