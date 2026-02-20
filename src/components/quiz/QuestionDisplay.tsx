// src/components/quiz/QuestionDisplay.tsx
// Renders a generated question with title and markdown-rendered body.
// Used in qLeft panel of the 2-column quiz layout matching quiz-you.pen Screen/Question.
// feedbackMode=true: question text renders in muted-foreground (16px 500) matching .pen fbQ style.
// feedbackMode=false: question text renders in foreground (20px 600 letterSpacing -0.3) matching .pen qQuestionText.
// Code blocks use code-bg + code-border matching .pen qCodeBlock.
// Badges in qMeta order: Topic (Chip/Active bg-primary) → Difficulty (Badge/Success bg-success-muted) → Type (Badge/Primary bg-primary-muted).
// IMPORTANT: html: false is required — escapes all raw HTML from LLM output, preventing XSS.
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
  feedbackMode?: boolean
}

export function QuestionDisplay({ question, feedbackMode = false }: QuestionDisplayProps) {
  const renderedBody = useMemo(
    () => md.render(question.body),
    [question.body]
  )

  const typeLabel = question.type === 'coding' ? 'Coding Problem' : 'Theoretical'

  return (
    <div className="flex flex-col gap-6">
      {/* qMeta — .pen: gap 8, alignItems center */}
      {/* Badge order: Topic (Chip/Active) → Difficulty (Badge/Success) → Type (Badge/Primary) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Topic — matches .pen qTopicBadge: Chip/Active (bg-primary solid, text-foreground) */}
        <span className="inline-flex items-center rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-foreground">
          {question.topic}
        </span>
        {/* Difficulty — matches .pen qDiffBadge: Badge/Success (bg-success-muted, text-success) */}
        <span className="inline-flex items-center rounded-full bg-success-muted px-2.5 py-1 text-xs font-medium text-success capitalize">
          {question.difficulty}
        </span>
        {/* Type — matches .pen qTypeBadge: Badge/Primary (bg-primary-muted, text-primary) */}
        <span className="inline-flex items-center rounded-full bg-primary-muted px-2.5 py-1 text-xs font-medium text-primary">
          {typeLabel}
        </span>
      </div>

      {/* Question title — .pen qQuestionText: 20px 600 foreground lineHeight 1.55 letterSpacing -0.3 */}
      {/* feedbackMode: .pen fbQ: 16px 500 muted-foreground lineHeight 1.55 */}
      <p
        className={feedbackMode ? 'text-muted-foreground leading-relaxed' : 'text-foreground font-semibold leading-snug'}
        style={feedbackMode
          ? { fontSize: 16, fontWeight: 500, lineHeight: 1.55 }
          : { fontSize: 20, fontWeight: 600, lineHeight: 1.55, letterSpacing: -0.3 }
        }
      >
        {question.title}
      </p>

      {/* Question body — markdown rendered */}
      {/* Safe: markdown-it with html: false escapes all raw HTML from LLM before rendering */}
      {!feedbackMode && (
        <div
          className="prose prose-sm max-w-none text-muted-foreground prose-code:bg-code-bg prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary prose-code:font-mono prose-pre:bg-code-bg prose-pre:text-foreground prose-pre:border prose-pre:border-code-border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-sm [&_pre]:whitespace-pre-wrap [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: renderedBody }}
        />
      )}

      {/* Expected format hint */}
      {question.expectedFormat && !feedbackMode && (
        <p className="text-xs text-muted-foreground italic">
          Expected format: {question.expectedFormat}
        </p>
      )}
    </div>
  )
}
