// src/components/quiz/EvaluationResult.tsx
// Right panel feedback matching quiz-you.pen Screen/Feedback fbRight layout.
// fbScoreRow: 72px score ring (colored border + bg + score %) + title/sub text (20px 700 colored).
// fbFeedbackBox: bg-elevated, border-border, cornerRadius 10, padding 20, "AI FEEDBACK" label + text.
// fbModelBox: bg-code-bg, border-code-border, cornerRadius 10, padding 20, "MODEL ANSWER" label + Reference badge + model text.
// fbActions: space-between — "← Review" ghost left, "Next Question →" primary right.
// getScoreColor returns token classes (text-success/text-accent/text-warning/text-error).
// Uses markdown-it with html:false — same XSS prevention as QuestionDisplay.
import MarkdownIt from 'markdown-it'
import type { EvaluationResult as EvaluationResultType } from '../../lib/llm/types'

const md = new MarkdownIt({ html: false })

interface EvaluationResultProps {
  evaluation: EvaluationResultType
  onNext: () => void
  isLastQuestion: boolean
}

// Token-based score color tiers matching .pen fbScoreRing stroke and text colors
function getScoreColor(score: number): { text: string; bg: string; border: string } {
  if (score >= 85) return { text: 'text-success', bg: 'bg-success-muted', border: 'border-success' }
  if (score >= 70) return { text: 'text-accent', bg: 'bg-primary-muted', border: 'border-primary' }
  if (score >= 50) return { text: 'text-warning', bg: 'bg-warning-muted', border: 'border-warning' }
  return { text: 'text-error', bg: 'bg-error-muted', border: 'border-error' }
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Great answer!'
  if (score >= 70) return 'Good work'
  if (score >= 50) return 'Needs improvement'
  return 'Keep practicing'
}

function getScoreSub(score: number): string {
  if (score >= 85) return 'You demonstrated solid understanding of the core concepts.'
  if (score >= 70) return 'You covered the main points — review the model answer for details.'
  if (score >= 50) return 'Some key concepts were touched on but more depth is needed.'
  return 'Review the model answer carefully and try again next time.'
}

export function EvaluationResult({ evaluation, onNext, isLastQuestion }: EvaluationResultProps) {
  const colors = getScoreColor(evaluation.score)

  return (
    // fbRight inner: gap 24 between sections
    <div className="flex flex-col gap-6">

      {/* fbScoreRow — .pen: gap 16, alignItems center */}
      {/* Score ring: 72px circle, colored bg + 4px colored border, score % text */}
      <div className="flex items-center gap-4">
        {/* fbScoreRing — .pen: w72 h72, colored fill + 4px stroke, rounded-full */}
        <div
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0 border-4 ${colors.bg} ${colors.border}`}
        >
          <span className={`text-[16px] font-extrabold ${colors.text}`}>
            {evaluation.score}%
          </span>
        </div>

        {/* fbScoreMeta — .pen: vertical, gap 4 */}
        <div className="flex flex-col gap-1">
          {/* fbScoreTitle — .pen: 20px 700, colored fill */}
          <span className={`text-[20px] font-bold ${colors.text}`}>
            {getScoreLabel(evaluation.score)}
          </span>
          {/* fbScoreSub — .pen: 14px normal muted-foreground */}
          <span className="text-sm text-muted-foreground">
            {getScoreSub(evaluation.score)}
          </span>
        </div>
      </div>

      {/* fbFeedbackBox — .pen: bg-elevated, cornerRadius 10, border-border, gap 12, padding 20 */}
      <div className="rounded-[10px] bg-elevated border border-border p-5 flex flex-col gap-3">
        {/* fbFeedbackLabel — .pen: 11px 600 placeholder, letterSpacing 0.5 */}
        <span className="text-[11px] font-semibold text-placeholder uppercase tracking-wide">
          AI Feedback
        </span>
        {/* fbFeedbackText — .pen: 14px normal foreground, lineHeight 1.65 */}
        <div
          className="prose prose-sm max-w-none text-foreground leading-relaxed prose-code:bg-code-bg prose-code:rounded prose-code:px-1 prose-code:text-sm prose-pre:overflow-x-auto prose-pre:bg-code-bg prose-pre:border prose-pre:border-code-border [&_pre]:whitespace-pre-wrap [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: md.render(evaluation.feedback) }}
          style={{ fontSize: 14, lineHeight: 1.65 }}
        />
      </div>

      {/* fbModelBox — .pen: bg-code-bg, cornerRadius 10, border-code-border, gap 12, padding 20 */}
      <div className="rounded-[10px] bg-code-bg border border-code-border p-5 flex flex-col gap-3">
        {/* fbModelHeader — .pen: space-between, "MODEL ANSWER" label + Reference badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-placeholder uppercase tracking-wide">
            Model Answer
          </span>
          {/* Reference badge — .pen: Badge/Success */}
          <span className="inline-flex items-center rounded-full bg-success-muted px-2.5 py-0.5 text-xs font-medium text-success">
            Reference
          </span>
        </div>
        {/* fbModelText — .pen: accent color, JetBrains Mono, 12px, lineHeight 1.7 */}
        <div
          className="prose prose-sm max-w-none text-accent prose-code:text-accent prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0 [&_pre]:whitespace-pre-wrap [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: md.render(evaluation.modelAnswer) }}
          style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)', fontSize: 12, lineHeight: 1.7 }}
        />
      </div>

      {/* fbActions — .pen: space-between, "← Review" ghost left, "Next Question →" primary right */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNext}
          className="rounded-lg bg-elevated border border-border h-10 px-4 text-sm font-medium text-foreground hover:bg-subtle transition"
        >
          ← Review
        </button>
        <button
          onClick={onNext}
          className="rounded-lg bg-primary h-10 px-4 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question →'}
        </button>
      </div>
    </div>
  )
}
