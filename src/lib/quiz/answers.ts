// src/lib/quiz/answers.ts
// Atomic answer persistence service.
// Pattern: insert answer with status='pending_evaluation' (DATA-01),
// then evaluate, then updateAnswerEvaluation() with score/feedback.
// If evaluation fails, the pending_evaluation row survives — no orphaned data (DATA-03).
import { supabase } from '../supabase'
import type { QuizAnswerRow, QuizSessionRow } from '../../types/database'

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

// Mark session complete AND insert denormalized session_summaries row for fast dashboard reads.
// Explicit insert (not trigger) per Phase 4 research recommendation — safer for v1.
export async function completeQuizSession(sessionId: string): Promise<void> {
  // 1. Fetch the session row (for user_id, topics, difficulty, question_count, created_at)
  const { data: sessionRowData, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !sessionRowData) {
    throw new Error(`Failed to fetch session for completion: ${sessionError?.message}`)
  }

  const sessionRow = sessionRowData as unknown as QuizSessionRow

  // 2. Mark session as completed
  const { error: updateError } = await supabase
    .from('quiz_sessions')
    .update({ status: 'completed' as const })
    .eq('id', sessionId)

  if (updateError) throw new Error(`Failed to complete quiz session: ${updateError.message}`)

  // 3. Fetch all answers for the session to compute aggregates
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('score, status')
    .eq('session_id', sessionId)

  if (answersError) throw new Error(`Failed to fetch answers for summary: ${answersError.message}`)

  const answerRows = answers ?? []
  const completed = answerRows.filter(a => a.status === 'completed')
  const skipped = answerRows.filter(a => a.status === 'skipped')
  // Final score includes ALL answers: completed (with their scores) + skipped (counted as 0).
  // Ensures skipping doesn't artificially boost the average.
  const finalScore =
    answerRows.length > 0
      ? Math.round(answerRows.reduce((sum, a) => sum + (a.score ?? 0), 0) / answerRows.length)
      : 0

  const durationSeconds = Math.floor(
    (Date.now() - new Date(sessionRow.created_at).getTime()) / 1000
  )

  // 4. Insert session_summaries row (upsert to avoid duplicate on double-fire)
  const { error: summaryError } = await supabase
    .from('session_summaries')
    .upsert({
      session_id: sessionId,
      user_id: sessionRow.user_id,
      topics: sessionRow.topics,
      difficulty: sessionRow.difficulty,
      question_count: sessionRow.question_count,
      final_score: finalScore,
      num_completed: completed.length,
      num_skipped: skipped.length,
      duration_seconds: durationSeconds,
      created_at: sessionRow.created_at
    }, { onConflict: 'session_id' })

  if (summaryError) {
    // Non-fatal: session is marked complete even if summary insert fails
    console.error(`Failed to insert session_summaries: ${summaryError.message}`)
  }
}

// Insert a skipped answer row with status='skipped' and score=0 (DATA-03 — no gaps in session history).
// 23505 = unique_violation: double-click protection for same question_index.
export async function insertSkippedAnswer(params: {
  sessionId: string
  questionIndex: number
  questionTitle?: string
}): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .insert({
      session_id: params.sessionId,
      question_id: null,
      question_index: params.questionIndex,
      user_answer: '',
      status: 'skipped' as const,
      score: 0,
      reasoning: 'Question skipped by user.',
      feedback: 'This question was skipped.',
      model_answer: params.questionTitle ?? null
    })

  if (error && error.code !== '23505') {
    // 23505 = unique_violation: already skipped (double-click protection)
    throw new Error(`Failed to save skipped answer: ${error.message}`)
  }
}
