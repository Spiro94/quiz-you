// src/hooks/useQuestionGeneration.ts
// React hook for generating questions on demand.
// Wraps generateQuestion() with loading/error/data state management.
// Called by QuizSessionPage (Plan 02-04) when advancing to each question.
import { useState, useCallback } from 'react'
import { generateQuestion } from '../lib/quiz/questions'
import type { GeneratedQuestion } from '../types/quiz'
import type { QuestionGenerationParams } from '../lib/llm/types'

interface UseQuestionGenerationOptions {
  sessionId: string
}

interface UseQuestionGenerationReturn {
  question: GeneratedQuestion | null
  isLoading: boolean
  error: string | null
  generate: (params: QuestionGenerationParams, questionIndex: number) => Promise<GeneratedQuestion | null>
  reset: () => void
}

export function useQuestionGeneration(
  { sessionId }: UseQuestionGenerationOptions
): UseQuestionGenerationReturn {
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (
    params: QuestionGenerationParams,
    questionIndex: number
  ): Promise<GeneratedQuestion | null> => {
    setIsLoading(true)
    setError(null)
    setQuestion(null)

    try {
      const generated = await generateQuestion(
        { params, sessionId, questionIndex },
        3 // maxRetries
      )
      setQuestion(generated)
      return generated
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Failed to generate question. Please try again.'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const reset = useCallback(() => {
    setQuestion(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { question, isLoading, error, generate, reset }
}
