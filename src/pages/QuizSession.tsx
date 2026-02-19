// src/pages/QuizSession.tsx
// Quiz session page. Orchestrates: session fetch → question generation → display → skip/submit → loop.
// Uses QuizContext (useQuizSession) for local session state and useQuestionGeneration for LLM calls.
// Phase 3: wired to useAnswerEvaluation for full evaluation lifecycle.
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuizSession } from '../context/QuizContext'
import { useQuestionGeneration } from '../hooks/useQuestionGeneration'
import { useAnswerEvaluation } from '../hooks/useAnswerEvaluation'
import { getQuizSession } from '../lib/quiz/sessions'
import { QuestionDisplay } from '../components/quiz/QuestionDisplay'
import { ProgressIndicator } from '../components/quiz/ProgressIndicator'
import { AnswerInput } from '../components/quiz/AnswerInput'
import { EvaluationResult } from '../components/quiz/EvaluationResult'
import { TopicBadge } from '../components/quiz/TopicBadge'
import type { QuizSessionRow } from '../types/database'

export default function QuizSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    session,
    initializeSession,
    addQuestion,
    skipQuestion,
    moveToNextQuestion,
    getProgress,
    isSessionComplete
  } = useQuizSession()

  const { question, isLoading, error, generate } = useQuestionGeneration({
    sessionId: sessionId ?? ''
  })

  const [sessionRow, setSessionRow] = useState<QuizSessionRow | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const autoRequestedIndexRef = useRef<number | null>(null)

  // Store last submitted answer for Retry button re-submission
  const lastAnswerRef = useRef<string>('')

  // Current question for the hook — null-safe with a fallback
  const currentQuestion = session?.questions[session.currentQuestionIndex] ?? null

  const {
    submitAnswer,
    evaluating,
    evaluation,
    error: evalError,
    elapsedSeconds,
    reset: resetEvaluation
  } = useAnswerEvaluation({
    sessionId: sessionId ?? '',
    questionIndex: session?.currentQuestionIndex ?? 0,
    question: currentQuestion ?? {
      title: '',
      body: '',
      type: 'theoretical',
      difficulty: 'normal',
      topic: ''
    },
    questionId: null
  })

  // isLastQuestion: true when current question is the final one in the session
  const isLastQuestion = session
    ? session.currentQuestionIndex >= session.totalQuestions - 1
    : false

  // Step 1: Fetch session from Supabase on mount
  useEffect(() => {
    if (!sessionId) return

    getQuizSession(sessionId)
      .then(row => {
        if (!row) {
          setFetchError('Quiz session not found.')
          return
        }
        setSessionRow(row)
        initializeSession(row)
      })
      .catch(err => {
        setFetchError(err instanceof Error ? err.message : 'Failed to load session.')
      })
  }, [sessionId, initializeSession])

  // Reset auto-generation guard when changing sessions.
  useEffect(() => {
    autoRequestedIndexRef.current = null
  }, [sessionId])

  // Step 2: Generate first question when session is ready, then each subsequent question
  useEffect(() => {
    if (!session || !sessionRow) return
    if (isSessionComplete()) {
      navigate('/dashboard') // Session complete — Phase 3 will add a summary screen
      return
    }

    // Only generate if we haven't already generated a question for this index
    if (session.questions.length > session.currentQuestionIndex) {
      autoRequestedIndexRef.current = session.currentQuestionIndex
      return
    }

    // Auto-generate at most once per index; retries are user-triggered via "Regenerate".
    if (autoRequestedIndexRef.current === session.currentQuestionIndex) return
    autoRequestedIndexRef.current = session.currentQuestionIndex

    const params = {
      topics: session.config.topics,
      difficulty: session.config.difficulty,
      types: session.config.questionTypes as ('coding' | 'theoretical')[],
      sessionId: session.sessionId,
      questionIndex: session.currentQuestionIndex
    }

    generate(params, session.currentQuestionIndex).then(generated => {
      if (generated) addQuestion(generated)
    })
  }, [session, sessionRow, navigate, generate, addQuestion, isSessionComplete])

  const handleSkip = () => {
    skipQuestion()
  }

  const handleSubmit = async (answer: string) => {
    // Store for retry if evaluation fails
    lastAnswerRef.current = answer
    await submitAnswer(answer)
    // moveToNextQuestion() is called by EvaluationResult's onNext, not here
  }

  const handleNext = () => {
    resetEvaluation()
    moveToNextQuestion()
  }

  const handleRetry = () => {
    if (lastAnswerRef.current) {
      void submitAnswer(lastAnswerRef.current)
    }
  }

  const progress = getProgress()

  // Suppress unused variable warning — user may be used in Phase 3 for personalization
  void user

  // Loading state
  if (!sessionRow && !fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading session...</p>
      </div>
    )
  }

  // Session fetch error
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-600 font-medium">{fetchError}</p>
          <button
            onClick={() => navigate('/quiz/setup')}
            className="text-sm text-blue-600 underline"
          >
            Start a new quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session header: topic badges + progress indicator */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-3xl space-y-2">
          {/* QUIZ-06: Topics covered in session */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500 mr-1">Topics:</span>
            {session?.config.topics.map(topic => (
              <TopicBadge key={topic} topic={topic} />
            ))}
          </div>
          {/* QUIZ-05: Progress indicator */}
          <ProgressIndicator
            current={progress.current}
            total={progress.total}
            percent={progress.percent}
          />
        </div>
      </header>

      {/* Main question area */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Question generation loading state */}
        {isLoading && (
          <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-8">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm">Generating question...</p>
            </div>
          </div>
        )}

        {/* Question generation error state */}
        {error && !isLoading && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-6 space-y-3">
            <p className="text-sm text-red-700 font-medium">Failed to generate question</p>
            <p className="text-xs text-red-600">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!session) return
                  const params = {
                    topics: session.config.topics,
                    difficulty: session.config.difficulty,
                    types: session.config.questionTypes as ('coding' | 'theoretical')[],
                    sessionId: session.sessionId,
                    questionIndex: session.currentQuestionIndex
                  }
                  generate(params, session.currentQuestionIndex).then(generated => {
                    if (generated) addQuestion(generated)
                  })
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
              >
                Regenerate
              </button>
              <button
                onClick={handleSkip}
                className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Skip this question
              </button>
            </div>
          </div>
        )}

        {/* Question display, answer input, and evaluation result */}
        {question && !isLoading && (
          <>
            {/* QUIZ-01: Question display with clear formatting — always visible */}
            <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
              <QuestionDisplay question={question} />
            </div>

            {/* Evaluation result panel — shown after successful evaluation */}
            {evaluation && (
              <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
                <EvaluationResult
                  evaluation={evaluation}
                  onNext={handleNext}
                  isLastQuestion={isLastQuestion}
                />
              </div>
            )}

            {/* Evaluation loading state — shown while LLM is evaluating */}
            {evaluating && (
              <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  {elapsedSeconds < 20 ? (
                    <p className="text-sm">Evaluating your answer...</p>
                  ) : (
                    <p className="text-sm text-amber-600">Still evaluating... (taking longer than usual)</p>
                  )}
                </div>
              </div>
            )}

            {/* Evaluation error state — shown after failed evaluation (all retries exhausted) */}
            {evalError && !evaluating && !evaluation && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-6 space-y-3">
                <p className="text-sm text-red-700 font-medium">Evaluation failed</p>
                <p className="text-xs text-red-600">{evalError}</p>
                <button
                  onClick={handleRetry}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                >
                  Retry
                </button>
              </div>
            )}

            {/* QUIZ-02 + QUIZ-03: Answer input — hidden after evaluation or during evaluation */}
            {!evaluation && !evaluating && (
              <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Your Answer</h3>
                <AnswerInput
                  question={question}
                  onSubmit={handleSubmit}
                  onSkip={handleSkip}
                  isSubmitting={evaluating}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
