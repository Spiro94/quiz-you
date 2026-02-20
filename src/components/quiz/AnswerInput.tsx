// src/components/quiz/AnswerInput.tsx
// Conditional answer input: Monaco Editor for coding questions, textarea for theoretical.
// Monaco is lazy-loaded to avoid bloating the initial bundle (~1.5MB).
// Shows both Submit Answer and Skip buttons.
import { lazy, Suspense, useRef, useState } from 'react'
import type { GeneratedQuestion } from '../../types/quiz'

// Lazy load Monaco to keep initial bundle small
const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then(m => ({ default: m.default }))
)

// Map question topic to Monaco language identifier
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

  const handleSubmit = () => {
    if (question.type === 'coding') {
      const code = editorRef.current?.getValue() ?? ''
      onSubmit(code)
    } else {
      onSubmit(textAnswer)
    }
  }

  return (
    <div className="space-y-4">
      {/* Answer input area */}
      {question.type === 'coding' ? (
        <div className="rounded-md overflow-hidden border border-code-border">
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center bg-code-bg text-muted-foreground text-sm">
              Loading editor...
            </div>
          }>
            <MonacoEditor
              height="320px"
              language={inferLanguage(question)}
              defaultValue={`// Write your solution here\n`}
              onMount={(editor) => {
                editorRef.current = editor
              }}
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
        <textarea
          value={textAnswer}
          onChange={e => setTextAnswer(e.target.value)}
          placeholder="Type your answer here... (Ctrl+Enter to submit)"
          rows={8}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          className="w-full rounded-lg border border-border bg-elevated text-foreground placeholder:text-placeholder p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition min-h-[200px]"
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
        <button
          onClick={onSkip}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-subtle border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-elevated focus:outline-none focus:ring-2 focus:ring-border transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip
        </button>
      </div>

      {/* Keyboard hint for theoretical questions */}
      {question.type === 'theoretical' && (
        <p className="text-xs text-muted-foreground text-right">Ctrl+Enter to submit</p>
      )}
    </div>
  )
}
