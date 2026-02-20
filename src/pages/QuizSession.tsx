// src/pages/QuizSession.tsx
// Quiz session page redesigned to match quiz-you.pen Screen/Question and Screen/Feedback.
// Layout: vertical fill — qTopBar (60px) + qBody (fill, horizontal) with qLeft (fill) + qRight (580px).
// qTopBar: logo left, progress center (text + bar), score badge + skip right.
// Question mode: qLeft shows question (meta badges, title 20px, code block), qRight shows answer panel.
// Feedback mode: qLeft shows question+user answer, qRight shows score ring, AI feedback, model answer.
// All logic (generation, evaluation, skip, complete) is unchanged.
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useQuizSession } from '../context/QuizContext'
import { useQuestionGeneration } from '../hooks/useQuestionGeneration'
import { useAnswerEvaluation } from '../hooks/useAnswerEvaluation'
import { getQuizSession } from '../lib/quiz/sessions'
import { completeQuizSession, insertSkippedAnswer } from '../lib/quiz/answers'
import { QuestionDisplay } from '../components/quiz/QuestionDisplay'
import { AnswerInput } from '../components/quiz/AnswerInput'
import { EvaluationResult } from '../components/quiz/EvaluationResult'
import type { QuizSessionRow } from '../types/database'

// Zap icon — matches .pen qTopLogoIcon
function ZapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

export default function QuizSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
  const lastAnswerRef = useRef<string>('')

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

  const isLastQuestion = session
    ? session.currentQuestionIndex >= session.totalQuestions - 1
    : false

  // Step 1: Fetch session from Supabase on mount
  useEffect(() => {
    if (!sessionId) return
    getQuizSession(sessionId)
      .then(row => {
        if (!row) { setFetchError('Quiz session not found.'); return }
        setSessionRow(row)
        initializeSession(row)
      })
      .catch(err => {
        setFetchError(err instanceof Error ? err.message : 'Failed to load session.')
      })
  }, [sessionId, initializeSession])

  useEffect(() => {
    autoRequestedIndexRef.current = null
  }, [sessionId])

  // Step 2: Generate questions
  useEffect(() => {
    if (!session || !sessionRow) return
    if (isSessionComplete()) {
      completeQuizSession(session.sessionId).then(() => {
        if (user?.id) queryClient.invalidateQueries({ queryKey: ['sessions', user.id] })
      }).catch(() => {})
      navigate(`/session/${session.sessionId}/summary`)
      return
    }
    if (session.questions.length > session.currentQuestionIndex) {
      autoRequestedIndexRef.current = session.currentQuestionIndex
      return
    }
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

  void user

  const handleSkip = () => {
    resetEvaluation()
    if (session) {
      const currentQ = session.questions[session.currentQuestionIndex]
      insertSkippedAnswer({
        sessionId: session.sessionId,
        questionIndex: session.currentQuestionIndex,
        questionTitle: currentQ?.title
      }).catch(() => {})
    }
    skipQuestion()
  }

  const handleSubmit = async (answer: string) => {
    lastAnswerRef.current = answer
    await submitAnswer(answer)
  }

  const handleNext = () => {
    resetEvaluation()
    moveToNextQuestion()
  }

  const handleRetry = () => {
    if (lastAnswerRef.current) void submitAnswer(lastAnswerRef.current)
  }

  const progress = getProgress()

  // --- Loading/error full-screen states ---
  if (!sessionRow && !fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-error font-medium">{fetchError}</p>
          <button onClick={() => navigate('/quiz/setup')} className="text-sm text-accent underline">
            Start a new quiz
          </button>
        </div>
      </div>
    )
  }

  // --- Main 2-column layout matching .pen Screen/Question and Screen/Feedback ---
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">

      {/* qTopBar — .pen: height 60, bg-surface, border-bottom, padding [0, 32], space-between, center */}
      <header className="h-[60px] flex-shrink-0 bg-surface border-b border-border flex items-center justify-between px-8">

        {/* qTopLogo — 24px logo mark + "QuizYou" text */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center text-foreground">
            <ZapIcon />
          </div>
          <span className="text-[15px] font-bold text-foreground">QuizYou</span>
        </div>

        {/* qTopCenter — progress text + 200px bar */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[13px] font-medium text-muted-foreground">
            {evaluation
              ? `Question ${progress.current} of ${progress.total} — Feedback`
              : `Question ${progress.current} of ${progress.total}`
            }
          </span>
          <div className="w-[200px] h-1 bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* qTopRight — score badge + skip button (question mode) or just score badge (feedback mode) */}
        <div className="flex items-center gap-4">
          {/* Score badge — .pen qScoreBadge: bg-primary-muted, rounded-full, gap 6, padding [6,12] */}
          <div className="flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-[13px] font-semibold text-primary">
              {progress.percent > 0 ? `Score: ${progress.percent}%` : 'Score: 0%'}
            </span>
          </div>

          {/* Skip button — only in question input mode (.pen qSkipBtn: Secondary/Ghost) */}
          {question && !isLoading && !evaluation && !evaluating && (
            <button
              onClick={handleSkip}
              className="rounded-lg bg-elevated border border-border h-10 px-4 text-sm font-medium text-foreground hover:bg-subtle transition"
            >
              Skip
            </button>
          )}
        </div>
      </header>

      {/* qBody — fill remaining height, horizontal layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* qLeft — fill width, vertical, right border, padding [40, 48], gap 24, overflow-y-auto */}
        <div className="flex-1 overflow-y-auto border-r border-border" style={{ padding: '40px 48px' }}>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm">Generating question...</p>
            </div>
          )}

          {/* Question generation error */}
          {error && !isLoading && (
            <div className="rounded-lg bg-error-muted border border-error p-6 space-y-3">
              <p className="text-sm text-error font-medium">Failed to generate question</p>
              <p className="text-xs text-error">{error}</p>
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
                  className="rounded-md bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleSkip}
                  className="rounded-md border border-error px-3 py-1.5 text-xs font-medium text-error hover:bg-error-muted transition"
                >
                  Skip this question
                </button>
              </div>
            </div>
          )}

          {/* Question content in left panel */}
          {question && !isLoading && (
            <div className="flex flex-col gap-6">
              {/* In feedback mode: show question in muted style + user answer box */}
              {evaluation ? (
                <QuestionDisplay question={question} feedbackMode />
              ) : (
                <QuestionDisplay question={question} />
              )}
            </div>
          )}
        </div>

        {/* qRight — 580px fixed, vertical, padding 40, gap 20, overflow-y-auto */}
        <div className="w-[580px] flex-shrink-0 overflow-y-auto flex flex-col gap-5" style={{ padding: 40 }}>

          {/* Answer input mode */}
          {question && !isLoading && !evaluation && (
            <AnswerInput
              question={question}
              onSubmit={handleSubmit}
              onSkip={handleSkip}
              isSubmitting={evaluating}
            />
          )}

          {/* Evaluation loading */}
          {evaluating && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {elapsedSeconds < 20 ? (
                <p className="text-sm">Evaluating your answer...</p>
              ) : (
                <p className="text-sm text-warning">Still evaluating... (taking longer than usual)</p>
              )}
            </div>
          )}

          {/* Evaluation error */}
          {evalError && !evaluating && !evaluation && (
            <div className="rounded-lg bg-error-muted border border-error p-6 space-y-3">
              <p className="text-sm text-error font-medium">Evaluation failed</p>
              <p className="text-xs text-error">{evalError}</p>
              <button
                onClick={handleRetry}
                className="rounded-md bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Evaluation result in right panel */}
          {evaluation && (
            <EvaluationResult
              evaluation={evaluation}
              onNext={handleNext}
              isLastQuestion={isLastQuestion}
            />
          )}
        </div>
      </div>
    </div>
  )
}
