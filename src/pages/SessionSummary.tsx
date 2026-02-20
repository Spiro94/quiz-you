// src/pages/SessionSummary.tsx
// Post-quiz session summary screen. Displays final score, topic breakdown, difficulty recommendation.
// COMP-02: final score | COMP-03: topic breakdown | COMP-04: difficulty recommendation | COMP-05: back to dashboard
// Route: /session/:sessionId/summary
// Layout matches quiz-you.pen Screen/Summary
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { computeSessionSummary } from '../lib/dashboard/recommendations'
import type { QuizSessionRow, QuizAnswerRow, QuizQuestionRow } from '../types/database'
import type { SessionSummaryResult } from '../lib/dashboard/recommendations'

// Grade label based on score
function gradeLabel(score: number): string {
  if (score >= 85) return 'Excellent Work!'
  if (score >= 70) return 'Good Work!'
  if (score >= 50) return 'Keep Practicing!'
  return 'Keep Going!'
}

export default function SessionSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [summary, setSummary] = useState<SessionSummaryResult | null>(null)
  const [session, setSession] = useState<QuizSessionRow | null>(null)
  const [questions, setQuestions] = useState<Pick<QuizQuestionRow, 'id' | 'question_index' | 'topic' | 'title'>[]>([])
  const [answers, setAnswers] = useState<Pick<QuizAnswerRow, 'id' | 'question_index' | 'score' | 'status'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const id: string = sessionId

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from('quiz_sessions')
          .select(`
            *,
            quiz_questions ( id, question_index, topic, title ),
            quiz_answers ( id, question_index, score, status )
          `)
          .eq('id', id)
          .single()

        if (fetchError || !data) {
          setError(fetchError?.message ?? 'Session not found')
          return
        }

        const sessionRow = data as QuizSessionRow & {
          quiz_questions: Pick<QuizQuestionRow, 'id' | 'question_index' | 'topic' | 'title'>[]
          quiz_answers: Pick<QuizAnswerRow, 'id' | 'question_index' | 'score' | 'status'>[]
        }

        const indexToTopic = new Map<number, string>()
        sessionRow.quiz_questions.forEach(q => indexToTopic.set(q.question_index, q.topic))

        const enrichedAnswers = sessionRow.quiz_answers.map(a => ({
          ...a,
          _topic: indexToTopic.get(a.question_index) ?? 'Unknown'
        })) as (QuizAnswerRow & { _topic: string })[]

        setSession(sessionRow as unknown as QuizSessionRow)
        setQuestions(sessionRow.quiz_questions)
        setAnswers(sessionRow.quiz_answers)
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
    ? `Based on your score, try ${difficultyLabel[summary.recommendedDifficulty]} difficulty next time`
    : `Based on your score, stay at ${difficultyLabel[summary.recommendedDifficulty]} and keep practicing`

  // Build answer lookup by question_index
  const answerByIndex = new Map(answers.map(a => [a.question_index, a]))
  // Sort questions by question_index
  const sortedQuestions = [...questions].sort((a, b) => a.question_index - b.question_index)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 h-[60px] bg-surface border-b border-border flex items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-foreground font-bold text-[15px]">QuizYou</span>
        </div>

        {/* Session meta chips */}
        <div className="flex items-center gap-2">
          {session.topics.slice(0, 2).map(topic => (
            <span key={topic} className="bg-primary text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-lg">
              {topic}
            </span>
          ))}
          {session.topics.length > 2 && (
            <span className="text-muted-foreground text-sm">+{session.topics.length - 2}</span>
          )}
          <span className="bg-elevated border border-border text-muted-foreground text-[13px] font-medium px-3.5 py-1.5 rounded-lg">
            {difficultyLabel[session.difficulty]}
          </span>
        </div>

        {/* Dashboard ghost button */}
        <Link
          to="/dashboard"
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-4 h-10 flex items-center border border-border rounded-lg bg-elevated hover:bg-subtle transition-colors"
        >
          Dashboard
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center gap-8 pt-12 pb-16 px-4 overflow-y-auto">

        {/* Hero: score ring + grade + session info */}
        <div className="flex flex-col items-center gap-4">
          {/* Score ring */}
          <div
            className="w-[120px] h-[120px] rounded-full bg-primary-muted flex items-center justify-center"
            style={{ boxShadow: '0 0 0 6px #7C3AED' }}
          >
            <span className="text-primary font-extrabold text-[28px] leading-none">
              {summary.finalScore}%
            </span>
          </div>
          <h1 className="text-[32px] font-extrabold text-foreground tracking-tight leading-none">
            {gradeLabel(summary.finalScore)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.topics.join(', ')} &middot; {difficultyLabel[session.difficulty]} &middot; {session.question_count} questions
          </p>
        </div>

        {/* Breakdown cards */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1.5 bg-success-muted border border-success rounded-xl px-7 py-5">
            <span className="text-[28px] font-extrabold text-success leading-none">{summary.numCompleted}</span>
            <span className="text-[13px] font-medium text-success">Answered</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 bg-warning-muted border border-warning rounded-xl px-7 py-5">
            <span className="text-[28px] font-extrabold text-warning leading-none">
              {summary.topicBreakdown.filter(t => t.avgScore < 70).length}
            </span>
            <span className="text-[13px] font-medium text-warning">Below 70</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 bg-subtle border border-border rounded-xl px-7 py-5">
            <span className="text-[28px] font-extrabold text-muted-foreground leading-none">{summary.numSkipped}</span>
            <span className="text-[13px] font-medium text-muted-foreground">Skipped</span>
          </div>
        </div>

        {/* Suggestion banner */}
        <div className="flex items-center gap-3 bg-primary-muted border border-primary rounded-xl px-6 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          <span className="text-foreground text-sm font-medium">{recommendationText}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-foreground font-medium text-sm px-4 h-10 flex items-center bg-elevated border border-border rounded-lg hover:bg-subtle transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/quiz/setup"
            className="text-white font-semibold text-sm px-4 h-10 flex items-center bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          >
            Start New Quiz
          </Link>
        </div>

        {/* Question review table */}
        <div className="w-[760px] max-w-full bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="text-foreground text-[15px] font-semibold">Question Review</span>
            <span className="text-muted-foreground text-[13px]">{sortedQuestions.length} questions</span>
          </div>
          {sortedQuestions.map((q, idx) => {
            const ans = answerByIndex.get(q.question_index)
            const isSkipped = ans?.status === 'skipped'
            const score = ans?.score ?? null
            const isCompleted = ans?.status === 'completed'
            return (
              <div key={q.id} className="flex items-center justify-between px-6 py-3.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-[12px] font-bold text-muted-foreground flex-shrink-0">Q{idx + 1}</span>
                  <span className="text-foreground text-sm truncate">{q.title}</span>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {isSkipped ? (
                    <span className="bg-primary-muted text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                      Skipped
                    </span>
                  ) : isCompleted && score !== null ? (
                    score >= 85 ? (
                      <span className="bg-success-muted text-success text-xs font-medium px-2.5 py-1 rounded-full">
                        {score}%
                      </span>
                    ) : score >= 50 ? (
                      <span className="bg-warning-muted text-warning text-xs font-medium px-2.5 py-1 rounded-full">
                        {score}%
                      </span>
                    ) : (
                      <span className="bg-error-muted text-error text-xs font-medium px-2.5 py-1 rounded-full">
                        {score}%
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Link to full detail */}
        <Link
          to={`/session/${sessionId}/detail`}
          className="text-accent hover:underline text-sm"
        >
          View full answers and feedback &rarr;
        </Link>

      </div>
    </div>
  )
}
