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
    ? 'bg-primary-muted border-primary text-primary'
    : 'bg-success-muted border-success text-success'

  return (
    <div className="space-y-4">
      {/* Question metadata row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass}`}>
          {typeLabel}
        </span>
        <span className="inline-flex items-center rounded-full bg-subtle border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {question.topic}
        </span>
        <span className="inline-flex items-center rounded-full bg-warning-muted border border-warning px-2.5 py-0.5 text-xs font-medium text-warning capitalize">
          {question.difficulty}
        </span>
      </div>

      {/* Question title */}
      <h2 className="text-lg font-semibold text-foreground leading-snug">
        {question.title}
      </h2>

      {/* Question body — markdown rendered */}
      {/* Safe: markdown-it with html: false escapes all raw HTML from LLM before rendering */}
      <div
        className="prose prose-sm max-w-none text-muted-foreground prose-code:bg-code-bg prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary prose-code:font-mono prose-pre:bg-code-bg prose-pre:text-foreground prose-pre:border prose-pre:border-code-border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-sm [&_pre]:whitespace-pre-wrap [&_code]:break-words"
        dangerouslySetInnerHTML={{ __html: renderedBody }}
      />

      {/* Expected format hint */}
      {question.expectedFormat && (
        <p className="text-xs text-muted-foreground italic">
          Expected format: {question.expectedFormat}
        </p>
      )}
    </div>
  )
}
