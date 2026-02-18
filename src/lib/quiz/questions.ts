// src/lib/quiz/questions.ts
// Question generation pipeline:
// 1. Call LLM with versioned prompt
// 2. Parse JSON response
// 3. Validate against GeneratedQuestionSchema (Zod)
// 4. Check difficulty match heuristic
// 5. Persist to quiz_questions table
// 6. Return GeneratedQuestion to caller
//
// Retries up to 3 times with exponential backoff on any step failure.
// Throws descriptive errors so callers can surface them to users.
import { supabase } from '../supabase'
import { getLLMProvider } from '../llm'
import { GeneratedQuestionSchema } from '../../types/quiz'
import type { GeneratedQuestion, Difficulty } from '../../types/quiz'
import type { QuestionGenerationParams } from '../llm/types'

// --- Validation helpers ---

export function validateQuestion(raw: unknown): GeneratedQuestion {
  const result = GeneratedQuestionSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Question schema validation failed: ${issues}`)
  }
  return result.data
}

/**
 * Heuristic difficulty matching.
 * Checks word count and complexity vocabulary against requested difficulty.
 * Returns false if mismatch detected — caller should retry or discard the question.
 *
 * NOTE: This is intentionally a lightweight heuristic, not an LLM-powered check.
 * It catches obvious mismatches (e.g., a 30-word beginner question marked as advanced)
 * without adding a second LLM call per question.
 */
export function checkDifficultyMatch(question: GeneratedQuestion, requested: Difficulty): boolean {
  const bodyLength = question.body.length
  const hasAdvancedVocab = /\b(abstract|generics|reflection|metaprogramming|concurren|parallelism|architecture|distributed|scalab|microservice|asynchronous|mutex|semaphore|garbage\s*collect)\b/i.test(question.body)

  switch (requested) {
    case 'beginner':
      // Beginner questions should be concise and avoid advanced vocabulary
      return bodyLength <= 800 && !hasAdvancedVocab
    case 'normal':
      // Normal questions have moderate length
      return bodyLength >= 80 && bodyLength <= 1500
    case 'advanced':
      // Advanced questions should be longer OR cover complex concepts
      return bodyLength >= 300 || hasAdvancedVocab
    default:
      return true
  }
}

// --- Core generation function ---

interface GenerateQuestionOptions {
  params: QuestionGenerationParams
  sessionId: string
  questionIndex: number
}

/**
 * Generates, validates, and persists one question.
 * Retries up to maxRetries times on any failure (JSON parse, schema validation, difficulty mismatch).
 * Throws if all retries exhausted.
 */
export async function generateQuestion(
  options: GenerateQuestionOptions,
  maxRetries = 3
): Promise<GeneratedQuestion> {
  const { params, sessionId, questionIndex } = options
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Step 1: Call LLM
      const llmProvider = getLLMProvider()
      const rawResponse = await llmProvider.generateQuestion(params)

      // Step 2: Parse JSON
      let parsed: unknown
      try {
        // Strip potential markdown code fences the LLM may add despite instructions
        const cleaned = rawResponse
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .trim()
        parsed = JSON.parse(cleaned)
      } catch {
        throw new Error(`LLM returned non-JSON response (attempt ${attempt + 1}): ${rawResponse.substring(0, 200)}`)
      }

      // Step 3: Zod schema validation
      const question = validateQuestion(parsed)

      // Step 4: Difficulty heuristic check
      if (!checkDifficultyMatch(question, params.difficulty)) {
        throw new Error(
          `Difficulty mismatch: requested '${params.difficulty}' but question body length ${question.body.length} chars does not match heuristic`
        )
      }

      // Step 5: Persist to Supabase
      const { error: insertError } = await supabase
        .from('quiz_questions')
        .insert({
          session_id: sessionId,
          question_index: questionIndex,
          title: question.title,
          body: question.body,
          type: question.type,
          difficulty: question.difficulty,
          topic: question.topic,
          expected_format: question.expectedFormat ?? null
        })

      if (insertError) {
        throw new Error(`Failed to persist question to database: ${insertError.message}`)
      }

      // Step 6: Return validated question
      return question

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Exponential backoff before retry: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw new Error(`Question generation failed after ${maxRetries} attempts. Last error: ${lastError.message}`)
}
