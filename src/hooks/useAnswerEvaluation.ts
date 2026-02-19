// src/hooks/useAnswerEvaluation.ts
// Manages the full answer submission lifecycle:
//   1. insertAnswer() → pending_evaluation row (DATA-01)
//   2. evaluateWithRetry() → LLM result with G-Eval (EVAL-01/02/03/04)
//   3. updateAnswerEvaluation() → completed row (EVAL-05)
// Exposes evaluation state to QuizSession page.
import { useState, useCallback, useRef, useEffect } from 'react'
import { insertAnswer, updateAnswerEvaluation, markAnswerEvaluationFailed } from '../lib/quiz/answers'
import { evaluateWithRetry } from '../lib/llm/evaluation'
import type { EvaluationResult } from '../lib/llm/types'
import type { GeneratedQuestion } from '../types/quiz'

interface UseAnswerEvaluationParams {
  sessionId: string
  questionIndex: number
  question: GeneratedQuestion
  questionId?: string | null   // DB ID of the question row (if saved to quiz_questions)
}

interface UseAnswerEvaluationReturn {
  submitAnswer: (userAnswer: string) => Promise<void>
  evaluating: boolean
  evaluation: EvaluationResult | null
  error: string | null
  elapsedSeconds: number    // Drive "Still evaluating..." at 20s, retry UI at 30s
  reset: () => void         // Call before moving to next question
}

export function useAnswerEvaluation(params: UseAnswerEvaluationParams): UseAnswerEvaluationReturn {
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start/stop the elapsed seconds counter
  useEffect(() => {
    if (evaluating) {
      setElapsedSeconds(0)
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [evaluating])

  const submitAnswer = useCallback(async (userAnswer: string) => {
    setEvaluating(true)
    setError(null)
    setEvaluation(null)

    let answerId: string | null = null

    try {
      // Step 1: Save answer to DB before LLM call (DATA-01, DATA-03)
      const answerRow = await insertAnswer({
        sessionId: params.sessionId,
        questionId: params.questionId ?? null,
        questionIndex: params.questionIndex,
        userAnswer
      })
      answerId = answerRow.id

      // Step 2: Evaluate with G-Eval + retry + timeout (EVAL-01/02/03/04)
      // STATELESS: evaluateWithRetry builds fresh prompt from question/answer only
      const result = await evaluateWithRetry({
        question: `${params.question.title}\n\n${params.question.body}`,
        questionType: params.question.type,
        difficulty: params.question.difficulty,
        topic: params.question.topic,
        userAnswer,
        expectedFormat: params.question.expectedFormat
      })

      // Step 3: Persist evaluation result (EVAL-05)
      await updateAnswerEvaluation(answerId, {
        score: result.score,
        reasoning: result.reasoning,
        feedback: result.feedback,
        modelAnswer: result.modelAnswer
      })

      setEvaluation(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Evaluation failed'
      setError(message)

      // Mark the answer as evaluation_failed so Phase 4 can show it in history
      if (answerId) {
        markAnswerEvaluationFailed(answerId).catch(() => {
          // Best-effort — don't throw if status update also fails
        })
      }
    } finally {
      setEvaluating(false)
    }
  }, [params])

  const reset = useCallback(() => {
    setEvaluation(null)
    setError(null)
    setElapsedSeconds(0)
  }, [])

  return { submitAnswer, evaluating, evaluation, error, elapsedSeconds, reset }
}
