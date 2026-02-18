// src/components/quiz/QuestionDisplay.tsx
// Renders a generated question with title and markdown-rendered body.
// Uses markdown-it for secure rendering. IMPORTANT: html: false is required —
// it escapes all raw HTML from LLM output before rendering, preventing XSS attacks.
// Shows topic badge and question type indicator alongside the content (QUIZ-06 partial).
import { useMemo } from 'react'
import MarkdownIt from 'markdown-it'
import type { GeneratedQuestion } from '../../types/quiz'

const md = new MarkdownIt({
  html: false,        // Never allow raw HTML from LLM output — XSS prevention
  linkify: true,
  typographer: true
})

interface QuestionDisplayProps {
  question: GeneratedQuestion
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const renderedBody = useMemo(
    () => md.render(question.body),
    [question.body]
  )

  const typeLabel = question.type === 'coding' ? 'Coding Problem' : 'Theoretical'
  const typeBadgeClass = question.type === 'coding'
    ? 'bg-purple-50 border-purple-200 text-purple-700'
    : 'bg-green-50 border-green-200 text-green-700'

  return (
    <div className="space-y-4">
      {/* Question metadata row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass}`}>
          {typeLabel}
        </span>
        <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {question.topic}
        </span>
        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700 capitalize">
          {question.difficulty}
        </span>
      </div>

      {/* Question title */}
      <h2 className="text-lg font-semibold text-gray-900 leading-snug">
        {question.title}
      </h2>

      {/* Question body — markdown rendered */}
      {/* Safe: markdown-it with html: false escapes all raw HTML from LLM before rendering */}
      <div
        className="prose prose-sm max-w-none text-gray-700 prose-code:bg-gray-100 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-purple-700 prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-sm [&_pre]:whitespace-pre-wrap [&_code]:break-words"
        dangerouslySetInnerHTML={{ __html: renderedBody }}
      />

      {/* Expected format hint */}
      {question.expectedFormat && (
        <p className="text-xs text-gray-500 italic">
          Expected format: {question.expectedFormat}
        </p>
      )}
    </div>
  )
}
