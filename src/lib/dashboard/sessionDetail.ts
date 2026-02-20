// src/lib/dashboard/sessionDetail.ts
// Fetches a full session with all questions and answers for the detail view (DASH-03).
// Single join query: quiz_sessions + quiz_questions + quiz_answers — no N+1.
import { supabase } from '../supabase'
import type { QuizSessionRow, QuizQuestionRow, QuizAnswerRow } from '../../types/database'

export interface QuestionWithAnswer {
  question: QuizQuestionRow
  answer: QuizAnswerRow | null  // null if no answer row exists for this question_index
}

export interface SessionDetailData {
  session: QuizSessionRow
  questionsWithAnswers: QuestionWithAnswer[]
}

export async function getSessionWithAnswers(sessionId: string): Promise<SessionDetailData | null> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select(`
      *,
      quiz_questions (
        id,
        session_id,
        question_index,
        title,
        body,
        type,
        difficulty,
        topic,
        expected_format,
        created_at
      ),
      quiz_answers (
        id,
        session_id,
        question_id,
        question_index,
        user_answer,
        status,
        score,
        reasoning,
        feedback,
        model_answer,
        created_at,
        updated_at
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    if (error?.code === 'PGRST116') return null  // Not found
    throw new Error(`Failed to fetch session detail: ${error?.message}`)
  }

  const session = data as QuizSessionRow & {
    quiz_questions: QuizQuestionRow[]
    quiz_answers: QuizAnswerRow[]
  }

  // Build lookup: question_index → answer row
  const answerByIndex = new Map<number, QuizAnswerRow>()
  session.quiz_answers.forEach(a => answerByIndex.set(a.question_index, a))

  // Sort questions by question_index for display order
  const sortedQuestions = [...session.quiz_questions].sort(
    (a, b) => a.question_index - b.question_index
  )

  const questionsWithAnswers: QuestionWithAnswer[] = sortedQuestions.map(q => ({
    question: q,
    answer: answerByIndex.get(q.question_index) ?? null
  }))

  return {
    session: {
      id: session.id,
      user_id: session.user_id,
      topics: session.topics,
      difficulty: session.difficulty,
      question_types: session.question_types,
      question_count: session.question_count,
      status: session.status,
      created_at: session.created_at,
      updated_at: session.updated_at
    } as QuizSessionRow,
    questionsWithAnswers
  }
}
