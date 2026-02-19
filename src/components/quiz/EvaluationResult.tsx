// src/components/quiz/EvaluationResult.tsx
// Displays LLM evaluation: score (0-100), feedback (markdown), model answer (markdown).
// Uses markdown-it with html:false — same pattern as QuestionDisplay to prevent XSS.
import MarkdownIt from 'markdown-it'
import type { EvaluationResult as EvaluationResultType } from '../../lib/llm/types'

const md = new MarkdownIt({ html: false })

interface EvaluationResultProps {
  evaluation: EvaluationResultType
  onNext: () => void
  isLastQuestion: boolean
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent!'
  if (score >= 70) return 'Good work'
  if (score >= 50) return 'Needs improvement'
  return 'Keep practicing'
}

export function EvaluationResult({ evaluation, onNext, isLastQuestion }: EvaluationResultProps) {
  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="text-center py-4">
        <div className={`text-6xl font-bold tabular-nums ${getScoreColor(evaluation.score)}`}>
          {evaluation.score}
        </div>
        <div className="text-sm text-gray-500 mt-1">out of 100</div>
        <div className={`text-base font-medium mt-2 ${getScoreColor(evaluation.score)}`}>
          {getScoreLabel(evaluation.score)}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Feedback</h3>
        <div
          className="prose prose-sm max-w-none text-blue-800 prose-code:bg-blue-100 prose-pre:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: md.render(evaluation.feedback) }}
        />
      </div>

      {/* Model Answer */}
      <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-2">Model Answer</h3>
        <div
          className="prose prose-sm max-w-none text-green-800 prose-code:bg-green-100 prose-pre:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: md.render(evaluation.modelAnswer) }}
        />
      </div>

      {/* Navigation */}
      <button
        onClick={onNext}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
      </button>
    </div>
  )
}
