// src/lib/dashboard/aggregations.ts
// Aggregation queries for analytics: topic accuracy and performance trends.
// DASH-04: per-topic accuracy | DASH-05: performance trends | DASH-06: recommendation inputs
import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '../supabase'

export interface TopicAccuracy {
  topic: string
  avgScore: number
  count: number
}

export interface TrendPoint {
  date: string       // ISO date string, formatted for chart X-axis
  avgScore: number
  sessionCount: number
}

export interface RecommendationResult {
  weakTopics: string[]
  suggestedDifficulty: 'beginner' | 'normal' | 'advanced'
  overallAvg: number
}

// getTopicAccuracy: fetch last 20 sessions' answers, join with questions for topic.
// Groups in-memory: safe for v1 (< 500 rows).
export async function getTopicAccuracy(userId: string): Promise<TopicAccuracy[]> {
  // Step 1: get IDs of last 20 sessions for this user
  const { data: recentSessions, error: sessionsError } = await supabase
    .from('session_summaries')
    .select('session_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (sessionsError) throw new Error(`Failed to fetch recent sessions: ${sessionsError.message}`)
  if (!recentSessions || recentSessions.length === 0) return []

  const sessionIds = recentSessions.map(r => r.session_id)

  // Step 2: fetch answers + their question topics via join
  // Explicit type annotation needed: Supabase cannot infer join shape with Relationships: [] empty arrays
  type AnswerWithTopic = {
    score: number | null
    status: string
    question_index: number
    session_id: string
    quiz_questions: { topic: string } | null
  }

  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select(`
      score,
      status,
      question_index,
      session_id,
      quiz_questions!inner ( topic )
    `)
    .in('session_id', sessionIds)
    .eq('status', 'completed') as unknown as { data: AnswerWithTopic[] | null; error: PostgrestError | null }

  if (answersError) throw new Error(`Failed to fetch answers for accuracy: ${answersError.message}`)
  if (!answers || answers.length === 0) return []

  // Step 3: group by topic in memory
  const byTopic = new Map<string, { sum: number; count: number }>()

  answers.forEach(a => {
    const topic = a.quiz_questions?.topic ?? 'Unknown'
    const current = byTopic.get(topic) ?? { sum: 0, count: 0 }
    byTopic.set(topic, {
      sum: current.sum + (a.score ?? 0),
      count: current.count + 1
    })
  })

  return Array.from(byTopic.entries())
    .map(([topic, { sum, count }]) => ({
      topic,
      avgScore: Math.round(sum / count),
      count
    }))
    .sort((a, b) => a.avgScore - b.avgScore)  // Weakest first for easy scanning
}

// getPerformanceTrends: time-series of session avg scores for line chart.
// Returns up to 30 most recent sessions ordered by date ascending (oldest left -> newest right).
export async function getPerformanceTrends(userId: string): Promise<TrendPoint[]> {
  const { data, error } = await supabase
    .from('session_summaries')
    .select('created_at, final_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) throw new Error(`Failed to fetch performance trends: ${error.message}`)
  if (!data || data.length === 0) return []

  // Reverse to get chronological order (oldest first) for chart X-axis
  return [...data].reverse().map(row => ({
    date: row.created_at,
    avgScore: row.final_score,
    sessionCount: 1
  }))
}

// computeRecommendation: derive next-quiz suggestion from topic accuracy + recent trend.
// Uses simple thresholds: weak = avgScore < 70, difficulty from overall avg.
export function computeRecommendation(
  topicAccuracy: TopicAccuracy[],
  recentSessionAvg: number,
  currentDifficulty: 'beginner' | 'normal' | 'advanced' = 'normal'
): RecommendationResult {
  const weakTopics = topicAccuracy
    .filter(t => t.avgScore < 70)
    .slice(0, 3)
    .map(t => t.topic)

  let suggestedDifficulty: 'beginner' | 'normal' | 'advanced' = currentDifficulty
  if (recentSessionAvg >= 85) {
    if (currentDifficulty === 'beginner') suggestedDifficulty = 'normal'
    else if (currentDifficulty === 'normal') suggestedDifficulty = 'advanced'
  } else if (recentSessionAvg < 50) {
    if (currentDifficulty === 'advanced') suggestedDifficulty = 'normal'
    else if (currentDifficulty === 'normal') suggestedDifficulty = 'beginner'
  }

  return {
    weakTopics,
    suggestedDifficulty,
    overallAvg: recentSessionAvg
  }
}
