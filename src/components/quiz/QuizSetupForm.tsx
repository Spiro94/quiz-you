// src/components/quiz/QuizSetupForm.tsx
// Quiz configuration form. Uses React Hook Form + Zod for validation.
// Validates that at least one topic and one question type are selected before submit.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QuizSetupSchema, AVAILABLE_TOPICS } from '../../types/quiz'
import type { QuizSetupFormData } from '../../types/quiz'

interface QuizSetupFormProps {
  onSubmit: (data: QuizSetupFormData) => Promise<void>
  error?: string | null
}

export function QuizSetupForm({ onSubmit, error }: QuizSetupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<QuizSetupFormData>({
    resolver: zodResolver(QuizSetupSchema),
    defaultValues: {
      topics: [],
      difficulty: 'normal',
      questionTypes: [],
      questionCount: '10'
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Global error from parent (e.g. Supabase insert failure) */}
      {error && (
        <div className="rounded-md bg-error-muted border border-error p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* SETUP-01: Programming Topics (multi-select checkboxes) */}
      <fieldset>
        <legend className="text-sm font-semibold text-foreground mb-3">
          Programming Topics <span className="text-error">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AVAILABLE_TOPICS.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm cursor-pointer bg-elevated text-foreground hover:bg-subtle has-[:checked]:bg-primary-muted has-[:checked]:border-primary"
            >
              <input
                type="checkbox"
                value={topic}
                {...register('topics')}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {topic}
            </label>
          ))}
        </div>
        {errors.topics && (
          <p className="mt-2 text-sm text-error">{errors.topics.message}</p>
        )}
      </fieldset>

      {/* SETUP-02: Difficulty Level */}
      <div>
        <label htmlFor="difficulty" className="block text-sm font-semibold text-foreground mb-2">
          Difficulty <span className="text-error">*</span>
        </label>
        <select
          id="difficulty"
          {...register('difficulty')}
          className="w-full bg-elevated border border-border rounded-lg text-foreground px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
        >
          <option value="beginner">Beginner — fundamentals, basic syntax</option>
          <option value="normal">Normal — real-world scenarios, moderate complexity</option>
          <option value="advanced">Advanced — edge cases, architecture, performance</option>
        </select>
        {errors.difficulty && (
          <p className="mt-2 text-sm text-error">{errors.difficulty.message}</p>
        )}
      </div>

      {/* SETUP-03: Question Types */}
      <fieldset>
        <legend className="text-sm font-semibold text-foreground mb-3">
          Question Types <span className="text-error">*</span>
        </legend>
        <div className="space-y-2">
          {[
            { value: 'coding', label: 'Coding Problems', description: 'Write or review code to solve a problem' },
            { value: 'theoretical', label: 'Theoretical Questions', description: 'Explain concepts, tradeoffs, or best practices' }
          ].map(({ value, label, description }) => (
            <label
              key={value}
              className="flex items-start gap-3 rounded-md border border-border px-4 py-3 cursor-pointer bg-elevated text-foreground hover:bg-subtle has-[:checked]:bg-primary-muted has-[:checked]:border-primary"
            >
              <input
                type="checkbox"
                value={value}
                {...register('questionTypes')}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.questionTypes && (
          <p className="mt-2 text-sm text-error">{errors.questionTypes.message}</p>
        )}
      </fieldset>

      {/* SETUP-04: Number of Questions */}
      <fieldset>
        <legend className="text-sm font-semibold text-foreground mb-3">
          Number of Questions <span className="text-error">*</span>
        </legend>
        <div className="flex gap-3">
          {(['5', '10', '20'] as const).map((count) => (
            <label
              key={count}
              className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border px-3 py-3 text-sm cursor-pointer bg-elevated text-foreground hover:bg-subtle has-[:checked]:bg-primary-muted has-[:checked]:border-primary has-[:checked]:font-semibold"
            >
              <input
                type="radio"
                value={count}
                {...register('questionCount')}
                className="border-border text-primary focus:ring-primary"
              />
              {count} questions
            </label>
          ))}
        </div>
        {errors.questionCount && (
          <p className="mt-1 text-sm text-error">{errors.questionCount.message}</p>
        )}
      </fieldset>

      {/* SETUP-05: Start Quiz button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? 'Creating session...' : 'Start Quiz'}
      </button>
    </form>
  )
}
