// src/pages/SessionDetail.tsx
// Past session detail view — all questions with user answers, scores, feedback, model answers.
// DASH-03: user can view all Q/A/feedback for any past session.
import { useParams, Link } from 'react-router-dom'
import MarkdownIt from 'markdown-it'
import { format } from 'date-fns'
import { useSessionDetail } from '../hooks/useSessionDetail'
import { getScoreColor, getScoreBgColor } from '../lib/dashboard/recommendations'

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSessionDetail(sessionId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading session...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-3">Failed to load session.</p>
          <Link to="/dashboard" className="text-blue-600 underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const { session, questionsWithAnswers } = data
  const difficultyLabel: Record<string, string> = {
    beginner: 'Beginner', normal: 'Intermediate', advanced: 'Advanced'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">
            {session.topics.join(', ')}
          </h1>
          <p className="text-gray-500 text-sm">
            {difficultyLabel[session.difficulty]}
            {' \u00b7 '}
            {format(new Date(session.created_at), 'MMM d, yyyy \u00b7 h:mm a')}
            {' \u00b7 '}
            {questionsWithAnswers.length} questions
          </p>
        </div>

        {/* Questions */}
        {questionsWithAnswers.map(({ question, answer }, idx) => {
          const isSkipped = answer?.status === 'skipped'
          const isCompleted = answer?.status === 'completed'
          const score = answer?.score ?? null

          return (
            <div
              key={question.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Question header */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-400">Q{idx + 1}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {question.topic}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {question.type}
                  </span>
                  {isSkipped && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full">
                      Skipped
                    </span>
                  )}
                  {isCompleted && score !== null && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
                      {score}/100
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800">{question.title}</h3>
              </div>

              {/* Question body */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: md.render(question.body) }}
                />
              </div>

              {/* Answer section */}
              {!isSkipped && answer && (
                <div className="divide-y divide-gray-100">
                  {/* User answer */}
                  {answer.user_answer && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Your Answer
                      </p>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded p-3">
                        {answer.user_answer}
                      </pre>
                    </div>
                  )}

                  {/* Feedback */}
                  {answer.feedback && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Feedback
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: md.render(answer.feedback) }}
                      />
                    </div>
                  )}

                  {/* Model answer */}
                  {answer.model_answer && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Model Answer
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: md.render(answer.model_answer) }}
                      />
                    </div>
                  )}
                </div>
              )}

              {isSkipped && (
                <div className="px-5 py-4 text-sm text-gray-400 italic">
                  This question was skipped.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
