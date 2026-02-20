// src/components/dashboard/NextQuizRecommendation.tsx
// DASH-06: next quiz recommendation based on weak areas and recent performance.
import { Link } from 'react-router-dom'
import { useTopicAccuracy } from '../../hooks/useTopicAccuracy'
import { usePerformanceTrends } from '../../hooks/usePerformanceTrends'
import { computeRecommendation } from '../../lib/dashboard/aggregations'

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  normal: 'Intermediate',
  advanced: 'Advanced'
}

export function NextQuizRecommendation() {
  const { data: topics = [], isLoading: topicsLoading } = useTopicAccuracy()
  const { data: trends = [], isLoading: trendsLoading } = usePerformanceTrends()

  if (topicsLoading || trendsLoading) {
    return <div className="h-36 bg-subtle rounded-lg animate-pulse" />
  }

  if (topics.length === 0) {
    return null  // No data yet — don't show recommendation
  }

  // Compute overall recent avg from trends (last 5 sessions)
  const recentTrends = trends.slice(-5)
  const recentAvg =
    recentTrends.length > 0
      ? Math.round(recentTrends.reduce((sum, t) => sum + t.avgScore, 0) / recentTrends.length)
      : 0

  // Determine current difficulty from most recent session's trend data
  // (We don't have difficulty in trend data — default to 'normal' for recommendation)
  const recommendation = computeRecommendation(topics, recentAvg, 'normal')

  const hasWeakAreas = recommendation.weakTopics.length > 0

  return (
    <div className="bg-primary-muted border border-primary rounded-lg p-5">
      <h2 className="text-base font-semibold text-foreground mb-1">Recommended Next Quiz</h2>

      <div className="mt-3 space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggested Difficulty</p>
          <p className="text-foreground font-semibold">
            {DIFFICULTY_LABELS[recommendation.suggestedDifficulty]}
          </p>
        </div>

        {hasWeakAreas ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Focus Areas</p>
            <p className="text-foreground">
              {recommendation.weakTopics.join(', ')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              These topics scored below 70 in recent sessions.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            You&apos;re doing great across all topics! Keep it up.
          </p>
        )}
      </div>

      <Link
        to="/quiz/setup"
        className="mt-4 inline-block w-full text-center bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        Start a Quiz
      </Link>
    </div>
  )
}
