// src/pages/QuizSetup.tsx
// Quiz setup page: renders QuizSetupForm, handles session creation and navigation.
// Layout matches .pen wizardWrap: bg-background, centered, 680px wide, gap 32.
// The QuizSetupForm itself renders the step indicator and wizard card.
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
    // .pen Screen/Quiz-Setup-1: fill background, vertical, justifyContent center, alignItems center
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* .pen wizardWrap: width 680, vertical layout, gap 32 */}
      <div className="w-full" style={{ maxWidth: 680 }}>
        <QuizSetupForm onSubmit={handleSubmit} onCancel={() => navigate('/dashboard')} error={error} />
      </div>
    </div>
  )
}
