// src/pages/SessionSummary.tsx
// Post-quiz session summary screen. Displays final score, topic breakdown, difficulty recommendation.
// COMP-02: final score | COMP-03: topic breakdown | COMP-04: difficulty recommendation | COMP-05: back to dashboard
// Route: /session/:sessionId/summary
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { computeSessionSummary, getScoreColor } from '../lib/dashboard/recommendations'
import type { QuizSessionRow, QuizAnswerRow, QuizQuestionRow } from '../types/database'
import type { SessionSummaryResult } from '../lib/dashboard/recommendations'

export default function SessionSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [summary, setSummary] = useState<SessionSummaryResult | null>(null)
  const [session, setSession] = useState<QuizSessionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Capture as a non-undefined string — guard above ensures sessionId is defined here
    const id: string = sessionId

    async function load() {
      try {
        // Single join query: session + questions + answers
        const { data, error: fetchError } = await supabase
          .from('quiz_sessions')
          .select(`
            *,
            quiz_questions ( id, question_index, topic ),
            quiz_answers ( id, question_index, score, status )
          `)
          .eq('id', id)
          .single()

        if (fetchError || !data) {
          setError(fetchError?.message ?? 'Session not found')
          return
        }

        const sessionRow = data as QuizSessionRow & {
          quiz_questions: Pick<QuizQuestionRow, 'id' | 'question_index' | 'topic'>[]
          quiz_answers: Pick<QuizAnswerRow, 'id' | 'question_index' | 'score' | 'status'>[]
        }

        // Build lookup: question_index → topic
        const indexToTopic = new Map<number, string>()
        sessionRow.quiz_questions.forEach(q => {
          indexToTopic.set(q.question_index, q.topic)
        })

        // Enrich answers with topic (quiz_answers has no topic column — join via question_index)
        const enrichedAnswers = sessionRow.quiz_answers.map(a => ({
          ...a,
          _topic: indexToTopic.get(a.question_index) ?? 'Unknown'
        })) as (QuizAnswerRow & { _topic: string })[]

        setSession(sessionRow as unknown as QuizSessionRow)
        setSummary(computeSessionSummary(enrichedAnswers as unknown as QuizAnswerRow[], sessionRow as unknown as QuizSessionRow))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session summary')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading summary...</p>
      </div>
    )
  }

  if (error || !summary || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-3">{error ?? 'Failed to load summary'}</p>
          <Link to="/dashboard" className="text-accent underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const difficultyLabel: Record<string, string> = {
    beginner: 'Beginner',
    normal: 'Intermediate',
    advanced: 'Advanced'
  }

  const isDifferentDifficulty = summary.recommendedDifficulty !== session.difficulty
  const recommendationText = isDifferentDifficulty
    ? `Try ${difficultyLabel[summary.recommendedDifficulty]} next — you're ready!`
    : `Stay at ${difficultyLabel[summary.recommendedDifficulty]} — keep practicing.`

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-surface rounded-lg border border-border p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Quiz Complete!</h1>
          <p className="text-muted-foreground mt-1">{session.topics.join(', ')} &middot; {difficultyLabel[session.difficulty]}</p>
        </div>

        {/* Final Score (COMP-02) */}
        <div className="bg-surface rounded-lg border border-border p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Final Score</p>
          <p className={`text-6xl font-bold mt-2 ${getScoreColor(summary.finalScore)}`}>
            {summary.finalScore}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {summary.numCompleted} answered &middot; {summary.numSkipped} skipped
          </p>
        </div>

        {/* Topic Breakdown (COMP-03) */}
        {summary.topicBreakdown.length > 0 && (
          <div className="bg-surface rounded-lg border border-border p-6">
            <h2 className="text-foreground font-semibold uppercase tracking-wide text-sm mb-3">
              Score by Topic
            </h2>
            <div className="space-y-2">
              {summary.topicBreakdown.map(({ topic, avgScore, count }) => (
                <div key={topic} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-foreground text-sm">{topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count}q</span>
                    <span className={`font-semibold w-10 text-right ${getScoreColor(avgScore)}`}>
                      {avgScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Recommendation (COMP-04) */}
        <div className="bg-primary-muted border border-primary rounded-lg p-5">
          <p className="text-foreground font-semibold mb-1">Next Session Recommendation</p>
          <p className="text-muted-foreground">{recommendationText}</p>
        </div>

        {/* Back to Dashboard (COMP-05) */}
        <Link
          to="/dashboard"
          className="block w-full text-center bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
