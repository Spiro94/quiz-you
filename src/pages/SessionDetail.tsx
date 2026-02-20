// src/pages/SessionDetail.tsx
// Past session detail view — all questions with user answers, scores, feedback, model answers.
// DASH-03: user can view all Q/A/feedback for any past session.
// Layout matches quiz-you.pen pattern — top bar + centered content card
import { useParams, Link } from 'react-router-dom'
import MarkdownIt from 'markdown-it'
import { format } from 'date-fns'
import { useSessionDetail } from '../hooks/useSessionDetail'
import { getScoreColor } from '../lib/dashboard/recommendations'

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSessionDetail(sessionId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-3">Failed to load session.</p>
          <Link to="/dashboard" className="text-accent underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const { session, questionsWithAnswers } = data
  const difficultyLabel: Record<string, string> = {
    beginner: 'Beginner', normal: 'Intermediate', advanced: 'Advanced'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar — matches Screen/Summary top bar pattern */}
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-4 py-10 flex flex-col gap-5">

          {/* Page heading */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-foreground">
              {session.topics.join(', ')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {difficultyLabel[session.difficulty]}
              {' \u00b7 '}
              {format(new Date(session.created_at), 'MMM d, yyyy \u00b7 h:mm a')}
              {' \u00b7 '}
              {questionsWithAnswers.length} questions
            </p>
          </div>

          {/* Back to summary link */}
          <Link to={`/session/${sessionId}/summary`} className="text-sm text-accent hover:underline w-fit">
            &larr; Back to Summary
          </Link>

          {/* Q&A cards */}
          {questionsWithAnswers.map(({ question, answer }, idx) => {
            const isSkipped = answer?.status === 'skipped'
            const isCompleted = answer?.status === 'completed'
            const score = answer?.score ?? null

            return (
              <div
                key={question.id}
                className="bg-surface rounded-xl border border-border overflow-hidden"
              >
                {/* Question header */}
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-muted-foreground">Q{idx + 1}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      question.type === 'coding'
                        ? 'bg-primary-muted text-primary'
                        : 'bg-success-muted text-success'
                    }`}>
                      {question.topic}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      question.type === 'coding'
                        ? 'bg-primary-muted text-primary'
                        : 'bg-success-muted text-success'
                    }`}>
                      {question.type}
                    </span>
                    {isSkipped && (
                      <span className="bg-warning-muted text-warning text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Skipped
                      </span>
                    )}
                    {isCompleted && score !== null && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getScoreColor(score)} ${
                        score >= 85 ? 'bg-success-muted' : score >= 70 ? 'bg-primary-muted' : score >= 50 ? 'bg-warning-muted' : 'bg-error-muted'
                      }`}>
                        {score}/100
                      </span>
                    )}
                  </div>
                  <h3 className="text-foreground font-semibold">{question.title}</h3>
                </div>

                {/* Question body */}
                <div className="px-6 py-4 border-b border-border">
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: md.render(question.body) }}
                  />
                </div>

                {/* Answer section */}
                {!isSkipped && answer && (
                  <div className="divide-y divide-border">
                    {answer.user_answer && (
                      <div className="px-6 py-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Your Answer
                        </p>
                        <pre className="bg-code-bg border border-code-border rounded-lg p-4 text-foreground font-mono text-sm whitespace-pre-wrap">
                          {answer.user_answer}
                        </pre>
                      </div>
                    )}

                    {answer.feedback && (
                      <div className="px-6 py-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Feedback
                        </p>
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: md.render(answer.feedback) }}
                        />
                      </div>
                    )}

                    {answer.model_answer && (
                      <div className="px-6 py-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Model Answer
                        </p>
                        <div
                          className="prose prose-sm max-w-none text-foreground"
                          dangerouslySetInnerHTML={{ __html: md.render(answer.model_answer) }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {isSkipped && (
                  <div className="px-6 py-4 text-sm text-muted-foreground italic">
                    This question was skipped.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
