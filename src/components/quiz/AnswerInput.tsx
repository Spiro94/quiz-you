// src/components/quiz/AnswerInput.tsx
// Right panel answer input — matches quiz-you.pen Screen/Question qRight layout.
// Structure: "Your Answer" header → tab row → textarea (fill height) → bottom bar (word count + actions).
// Tab row: Text Explanation (active: bg-surface border-border text-foreground) | Code (inactive: text-muted-foreground).
// Textarea: bg-elevated, cornerRadius 10, border-border, padding 16, Inter font, fill height.
// Bottom bar: word count left ("0 words" text-placeholder), Skip Question + Submit Answer right.
// Coding mode: Monaco editor (vs-dark theme) with border-code-border wrapper — replaces textarea.
// Monaco lazy-loaded (~1.5MB) to keep initial bundle small.
import { lazy, Suspense, useRef, useState } from 'react'
import type { GeneratedQuestion } from '../../types/quiz'

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then(m => ({ default: m.default }))
)

function inferLanguage(question: GeneratedQuestion): string {
  const topic = question.topic.toLowerCase()
  if (topic.includes('python')) return 'python'
  if (topic.includes('typescript')) return 'typescript'
  if (topic.includes('javascript') || topic.includes('react') || topic.includes('node')) return 'javascript'
  if (topic.includes('java')) return 'java'
  if (topic.includes('go')) return 'go'
  if (topic.includes('rust')) return 'rust'
  if (topic.includes('dart') || topic.includes('flutter')) return 'dart'
  if (topic.includes('sql')) return 'sql'
  return 'plaintext'
}

interface AnswerInputProps {
  question: GeneratedQuestion
  onSubmit: (answer: string) => void
  onSkip: () => void
  isSubmitting?: boolean
}

export function AnswerInput({ question, onSubmit, onSkip, isSubmitting = false }: AnswerInputProps) {
  const editorRef = useRef<{ getValue: () => string } | null>(null)
  const [textAnswer, setTextAnswer] = useState('')

  const wordCount = textAnswer.trim() === '' ? 0 : textAnswer.trim().split(/\s+/).length

  const handleSubmit = () => {
    if (question.type === 'coding') {
      onSubmit(editorRef.current?.getValue() ?? '')
    } else {
      onSubmit(textAnswer)
    }
  }

  return (
    // qRight inner: gap 20 between sections — flex column fill height
    <div className="flex flex-col gap-5 h-full">

      {/* "Your Answer" header — .pen qAnswerHeader: 18px 700 foreground */}
      <h2 className="text-[18px] font-bold text-foreground">Your Answer</h2>

      {/* Tab row — .pen qTabRow: bg-elevated, cornerRadius 8, gap 4, padding 4 */}
      <div className="flex rounded-lg bg-elevated p-1 gap-1">
        <div className="flex-1 flex items-center justify-center rounded-md bg-surface border border-border py-[7px] px-3.5">
          <span className="text-[13px] font-semibold text-foreground">
            {question.type === 'coding' ? 'Code' : 'Text Explanation'}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center py-[7px] px-3.5">
          <span className="text-[13px] font-medium text-muted-foreground">
            {question.type === 'coding' ? 'Explanation' : 'Code'}
          </span>
        </div>
      </div>

      {/* Input area — grows to fill available space */}
      <div className="flex-1 min-h-0">
        {question.type === 'coding' ? (
          // Monaco editor — .pen: has border, code-bg; use vs-dark theme matching code-bg token
          <div className="rounded-[10px] overflow-hidden border border-code-border h-full min-h-[280px]">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center bg-code-bg text-muted-foreground text-sm">
                Loading editor...
              </div>
            }>
              <MonacoEditor
                height="100%"
                language={inferLanguage(question)}
                defaultValue={`// Write your solution here\n`}
                onMount={(editor) => { editorRef.current = editor }}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </Suspense>
          </div>
        ) : (
          // Textarea — .pen qTextarea: bg-elevated, cornerRadius 10, border-border, padding 16, Inter, fill height
          <textarea
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            placeholder="Explain your understanding here. Be as detailed as possible — the AI evaluates based on accuracy, depth, and clarity of your explanation..."
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            className="w-full h-full min-h-[280px] rounded-[10px] border border-border bg-elevated text-foreground placeholder:text-placeholder p-4 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            style={{ fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)', lineHeight: 1.6 }}
          />
        )}
      </div>

      {/* Bottom bar — .pen qBottomBar: space-between, word count left, actions right */}
      <div className="flex items-center justify-between flex-shrink-0">
        {/* Word count — .pen qWordCount: text-placeholder, 12px */}
        <span className="text-xs text-placeholder">
          {question.type === 'theoretical' ? `${wordCount} word${wordCount !== 1 ? 's' : ''}` : ''}
        </span>

        {/* Actions — .pen qBottomActions: gap 12, Skip (Secondary) + Submit (Primary) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSkip}
            disabled={isSubmitting}
            className="rounded-lg bg-elevated border border-border h-10 px-4 text-sm font-medium text-foreground hover:bg-subtle transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip Question
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-primary h-10 px-4 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  )
}
