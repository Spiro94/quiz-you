// src/lib/dashboard/recommendations.ts
// Pure functions for computing session summary and difficulty recommendations.
// No Supabase dependency — takes data already loaded and returns computed values.
// Phase 4 Plan 01: computeSessionSummary(), getScoreColor(), getScoreBgColor()
import type { QuizAnswerRow, QuizSessionRow } from '../../types/database'

export interface TopicBreakdown {
  topic: string
  avgScore: number
  count: number
}

export interface SessionSummaryResult {
  finalScore: number
  numCompleted: number
  numSkipped: number
  topicBreakdown: TopicBreakdown[]
  recommendedDifficulty: 'beginner' | 'normal' | 'advanced'
}

// computeSessionSummary: derive final score, per-topic breakdown, and recommended difficulty.
// Scoring rules: avg >= 85 → upgrade difficulty; < 50 → downgrade; 50-84 → stay.
// Topic enrichment: caller must inject _topic via enriched answers (quiz_answers has no topic column).
export function computeSessionSummary(
  answers: QuizAnswerRow[],
  session: QuizSessionRow
): SessionSummaryResult {
  const completed = answers.filter(a => a.status === 'completed')
  const skipped = answers.filter(a => a.status === 'skipped')

  // Final score includes ALL answers: completed (with their scores) + skipped (counted as 0)
  // This ensures skipping questions doesn't artificially boost the average.
  // E.g., 1 answer at 80 + 4 skipped = (80 + 0 + 0 + 0 + 0) / 5 = 16
  const finalScore =
    answers.length > 0
      ? Math.round(answers.reduce((sum, a) => sum + (a.score ?? 0), 0) / answers.length)
      : 0

  // Group completed answers by topic.
  // quiz_answers has no topic column — caller enriches answers with _topic via question_index join.
  const scoreByTopic: Record<string, { sum: number; count: number }> = {}
  completed.forEach(answer => {
    const topic = (answer as QuizAnswerRow & { _topic?: string })._topic ?? 'Unknown'
    if (!scoreByTopic[topic]) scoreByTopic[topic] = { sum: 0, count: 0 }
    scoreByTopic[topic].sum += answer.score ?? 0
    scoreByTopic[topic].count += 1
  })

  const topicBreakdown: TopicBreakdown[] = Object.entries(scoreByTopic)
    .map(([topic, { sum, count }]) => ({
      topic,
      avgScore: Math.round(sum / count),
      count
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  // Difficulty recommendation thresholds: >=85 upgrade, <50 downgrade, 50-84 stay
  const currentDifficulty = session.difficulty
  let recommendedDifficulty: 'beginner' | 'normal' | 'advanced' = currentDifficulty
  if (finalScore >= 85) {
    if (currentDifficulty === 'beginner') recommendedDifficulty = 'normal'
    else if (currentDifficulty === 'normal') recommendedDifficulty = 'advanced'
    // already 'advanced' — stay
  } else if (finalScore < 50) {
    if (currentDifficulty === 'advanced') recommendedDifficulty = 'normal'
    else if (currentDifficulty === 'normal') recommendedDifficulty = 'beginner'
    // already 'beginner' — stay
  }

  return {
    finalScore,
    numCompleted: completed.length,
    numSkipped: skipped.length,
    topicBreakdown,
    recommendedDifficulty
  }
}

// getScoreColor: consistent color tiers using design tokens (>=85 success, >=70 accent, >=50 warning, <50 error).
// Updated Phase 5 Plan 03 to use quiz-you.pen design system tokens.
export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-success'
  if (score >= 70) return 'text-accent'
  if (score >= 50) return 'text-warning'
  return 'text-error'
}

export function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-success-muted'
  if (score >= 70) return 'bg-primary-muted'
  if (score >= 50) return 'bg-warning-muted'
  return 'bg-error-muted'
}
