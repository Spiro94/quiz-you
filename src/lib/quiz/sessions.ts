// src/lib/quiz/sessions.ts
// Service functions for quiz session lifecycle management.
// createQuizSession() is called by QuizSetupPage on form submission.
// Returns the created session row so the caller can navigate to /quiz/:sessionId.
import { supabase } from '../supabase'
import type { QuizSetupFormData } from '../../types/quiz'
import type { QuizSessionRow } from '../../types/database'

export async function createQuizSession(
  userId: string,
  config: QuizSetupFormData
): Promise<QuizSessionRow> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: userId,
      topics: config.topics,
      difficulty: config.difficulty,
      question_types: config.questionTypes,
      question_count: parseInt(config.questionCount, 10) as 5 | 10 | 20,
      status: 'in_progress' as const
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create quiz session: ${error.message}`)
  if (!data) throw new Error('No data returned from quiz session creation')

  return data as QuizSessionRow
}

export async function getQuizSession(sessionId: string): Promise<QuizSessionRow | null> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch quiz session: ${error.message}`)
  }

  return data as QuizSessionRow | null
}
