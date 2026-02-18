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
        <div className="rounded-md overflow-hidden border border-gray-300">
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
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
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
        />
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
        <button
          onClick={onSkip}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Keyboard hint for theoretical questions */}
      {question.type === 'theoretical' && (
        <p className="text-xs text-gray-400 text-right">Ctrl+Enter to submit</p>
      )}
    </div>
  )
}
