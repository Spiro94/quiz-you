// src/context/QuizContext.tsx
// Local quiz session state management using React Context.
// Stores: session config, current question index, generated questions, skipped questions.
// NOT persisted to localStorage — session is fetched from Supabase on mount (Plan 02-04).
// TanStack Query handles server state; this Context handles derived UI state only.
import React, { createContext, useContext, useState } from 'react'
import type { QuizSessionRow } from '../types/database'
import type { GeneratedQuestion } from '../types/quiz'

export interface QuizSessionState {
  sessionId: string
  config: {
    topics: string[]
    difficulty: QuizSessionRow['difficulty']
    questionTypes: string[]
    questionCount: number
  }
  currentQuestionIndex: number
  totalQuestions: number
  questions: GeneratedQuestion[]             // Questions generated so far
  skippedQuestions: Set<number>             // Indices of skipped questions
}

interface QuizContextType {
  session: QuizSessionState | null
  // Initialize from a fetched quiz_sessions row
  initializeSession: (sessionRow: QuizSessionRow) => void
  // Add a newly generated question to local state
  addQuestion: (question: GeneratedQuestion) => void
  // Skip current question (adds to skipped set, advances index)
  skipQuestion: () => void
  // Advance to next question (after answer submitted)
  moveToNextQuestion: () => void
  // Progress helpers
  getProgress: () => { current: number; total: number; percent: number }
  isSessionComplete: () => boolean
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<QuizSessionState | null>(null)

  const initializeSession = (sessionRow: QuizSessionRow) => {
    setSession({
      sessionId: sessionRow.id,
      config: {
        topics: sessionRow.topics,
        difficulty: sessionRow.difficulty,
        questionTypes: sessionRow.question_types,
        questionCount: sessionRow.question_count
      },
      currentQuestionIndex: 0,
      totalQuestions: sessionRow.question_count,
      questions: [],
      skippedQuestions: new Set()
    })
  }

  const addQuestion = (question: GeneratedQuestion) => {
    setSession(prev => {
      if (!prev) return null
      return { ...prev, questions: [...prev.questions, question] }
    })
  }

  const skipQuestion = () => {
    setSession(prev => {
      if (!prev) return null
      const newSkipped = new Set(prev.skippedQuestions)
      newSkipped.add(prev.currentQuestionIndex)
      return {
        ...prev,
        skippedQuestions: newSkipped,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }
    })
  }

  const moveToNextQuestion = () => {
    setSession(prev => {
      if (!prev) return null
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }
    })
  }

  const getProgress = () => {
    if (!session) return { current: 0, total: 0, percent: 0 }
    const current = session.currentQuestionIndex + 1
    const total = session.totalQuestions
    return {
      current: Math.min(current, total),
      total,
      percent: Math.round((Math.min(current, total) / total) * 100)
    }
  }

  const isSessionComplete = () => {
    if (!session) return false
    return session.currentQuestionIndex >= session.totalQuestions
  }

  return (
    <QuizContext.Provider value={{
      session,
      initializeSession,
      addQuestion,
      skipQuestion,
      moveToNextQuestion,
      getProgress,
      isSessionComplete
    }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuizSession(): QuizContextType {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuizSession must be used within a QuizProvider')
  }
  return context
}
