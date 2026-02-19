// src/lib/quiz/answers.ts
// Atomic answer persistence service.
// Pattern: insert answer with status='pending_evaluation' (DATA-01),
// then evaluate, then updateAnswerEvaluation() with score/feedback.
// If evaluation fails, the pending_evaluation row survives — no orphaned data (DATA-03).
import { supabase } from '../supabase'
import type { QuizAnswerRow } from '../../types/database'

export interface InsertAnswerParams {
  sessionId: string
  questionId: string | null   // null if question not yet saved to quiz_questions
  questionIndex: number
  userAnswer: string
}

export interface EvaluationUpdateParams {
  score: number
  reasoning: string
  feedback: string
  modelAnswer: string
}

// Step 1 of atomic pattern: save answer before evaluation begins.
// Returns the full row including generated id, used by updateAnswerEvaluation.
export async function insertAnswer(params: InsertAnswerParams): Promise<QuizAnswerRow> {
  const { data, error } = await supabase
    .from('quiz_answers')
    .insert({
      session_id: params.sessionId,
      question_id: params.questionId,
      question_index: params.questionIndex,
      user_answer: params.userAnswer,
      status: 'pending_evaluation' as const
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to save answer: ${error.message}`)
  if (!data) throw new Error('No data returned from answer insert')

  return data as QuizAnswerRow
}

// Step 2 of atomic pattern: update with LLM evaluation result.
// Called only when evaluation succeeds. Sets status='completed'.
export async function updateAnswerEvaluation(
  answerId: string,
  evaluation: EvaluationUpdateParams
): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .update({
      score: evaluation.score,
      reasoning: evaluation.reasoning,
      feedback: evaluation.feedback,
      model_answer: evaluation.modelAnswer,
      status: 'completed' as const
    })
    .eq('id', answerId)

  if (error) throw new Error(`Failed to save evaluation: ${error.message}`)
}

// Mark an answer as evaluation_failed (called when all retries exhausted).
export async function markAnswerEvaluationFailed(answerId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .update({ status: 'evaluation_failed' as const })
    .eq('id', answerId)

  if (error) throw new Error(`Failed to mark answer evaluation failed: ${error.message}`)
}

// Mark session completion in quiz_sessions table (COMP-01).
export async function completeQuizSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_sessions')
    .update({ status: 'completed' as const })
    .eq('id', sessionId)

  if (error) throw new Error(`Failed to complete quiz session: ${error.message}`)
}
