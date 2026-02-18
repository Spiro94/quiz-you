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
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* SETUP-01: Programming Topics (multi-select checkboxes) */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-900 mb-3">
          Programming Topics <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AVAILABLE_TOPICS.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300"
            >
              <input
                type="checkbox"
                value={topic}
                {...register('topics')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {topic}
            </label>
          ))}
        </div>
        {errors.topics && (
          <p className="mt-2 text-sm text-red-600">{errors.topics.message}</p>
        )}
      </fieldset>

      {/* SETUP-02: Difficulty Level */}
      <div>
        <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-900 mb-2">
          Difficulty <span className="text-red-500">*</span>
        </label>
        <select
          id="difficulty"
          {...register('difficulty')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="beginner">Beginner — fundamentals, basic syntax</option>
          <option value="normal">Normal — real-world scenarios, moderate complexity</option>
          <option value="advanced">Advanced — edge cases, architecture, performance</option>
        </select>
        {errors.difficulty && (
          <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
        )}
      </div>

      {/* SETUP-03: Question Types */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-900 mb-3">
          Question Types <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-2">
          {[
            { value: 'coding', label: 'Coding Problems', description: 'Write or review code to solve a problem' },
            { value: 'theoretical', label: 'Theoretical Questions', description: 'Explain concepts, tradeoffs, or best practices' }
          ].map(({ value, label, description }) => (
            <label
              key={value}
              className="flex items-start gap-3 rounded-md border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300"
            >
              <input
                type="checkbox"
                value={value}
                {...register('questionTypes')}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">{label}</span>
                <span className="block text-xs text-gray-500">{description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.questionTypes && (
          <p className="mt-2 text-sm text-red-600">{errors.questionTypes.message}</p>
        )}
      </fieldset>

      {/* SETUP-04: Number of Questions */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-900 mb-3">
          Number of Questions <span className="text-red-500">*</span>
        </legend>
        <div className="flex gap-3">
          {(['5', '10', '20'] as const).map((count) => (
            <label
              key={count}
              className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-200 px-3 py-3 text-sm cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300 has-[:checked]:font-semibold"
            >
              <input
                type="radio"
                value={count}
                {...register('questionCount')}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {count} questions
            </label>
          ))}
        </div>
        {errors.questionCount && (
          <p className="mt-1 text-sm text-red-600">{errors.questionCount.message}</p>
        )}
      </fieldset>

      {/* SETUP-05: Start Quiz button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating session...' : 'Start Quiz'}
      </button>
    </form>
  )
}
