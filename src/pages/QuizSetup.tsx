// src/pages/QuizSetup.tsx
// Quiz setup page: renders QuizSetupForm, handles session creation and navigation.
// On valid form submit: calls createQuizSession(), navigates to /quiz/:sessionId.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { QuizSetupForm } from '../components/quiz/QuizSetupForm'
import { createQuizSession } from '../lib/quiz/sessions'
import type { QuizSetupFormData } from '../types/quiz'

export default function QuizSetupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: QuizSetupFormData) => {
    if (!user) return
    setError(null)

    try {
      const session = await createQuizSession(user.id, data)
      navigate(`/quiz/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Configure Your Quiz</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select your topics, difficulty, and format, then start your session.
          </p>
        </div>

        <div className="rounded-lg bg-surface border border-border p-6">
          <QuizSetupForm onSubmit={handleSubmit} error={error} />
        </div>
      </div>
    </div>
  )
}
