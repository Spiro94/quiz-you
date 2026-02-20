// src/components/quiz/QuizSetupForm.tsx
// Quiz configuration form redesigned to match quiz-you.pen Screen/Quiz-Setup-1 and Quiz-Setup-2.
// Step 1 (Topics): Chip grid — Chip/Active (bg-primary) and Chip/Default (bg-elevated) from .pen.
// Step 2 (Options): Segmented difficulty control, icon-based type cards, stepper for count.
// Step indicator: 3-step bar (Topics → Options → Review) matching .pen wizardWrap/stepIndicator.
// Logic: manual state instead of react-hook-form — same validation rules, same onSubmit contract.
import { useState } from 'react'
import { AVAILABLE_TOPICS } from '../../types/quiz'
import type { QuizSetupFormData } from '../../types/quiz'

interface QuizSetupFormProps {
  onSubmit: (data: QuizSetupFormData) => Promise<void>
  onCancel: () => void
  error?: string | null
}

type Step = 1 | 2
type Difficulty = 'beginner' | 'normal' | 'advanced'
type QuestionType = 'coding' | 'theoretical'
type QuestionCount = '5' | '10' | '20'

const COUNT_OPTIONS: QuestionCount[] = ['5', '10', '20']

export function QuizSetupForm({ onSubmit, onCancel, error }: QuizSetupFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [topics, setTopics] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['coding', 'theoretical'])
  const [questionCount, setQuestionCount] = useState<QuestionCount>('10')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const toggleTopic = (topic: string) =>
    setTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])

  const toggleType = (type: QuestionType) =>
    setQuestionTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])

  const stepCountDown = () => {
    const idx = COUNT_OPTIONS.indexOf(questionCount)
    if (idx > 0) setQuestionCount(COUNT_OPTIONS[idx - 1])
  }

  const stepCountUp = () => {
    const idx = COUNT_OPTIONS.indexOf(questionCount)
    if (idx < COUNT_OPTIONS.length - 1) setQuestionCount(COUNT_OPTIONS[idx + 1])
  }

  const handleContinue = () => {
    if (topics.length === 0) {
      setValidationError('Select at least one topic to continue.')
      return
    }
    setValidationError(null)
    setStep(2)
  }

  const handleSubmit = async () => {
    if (questionTypes.length === 0) {
      setValidationError('Select at least one question type.')
      return
    }
    setValidationError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ topics, difficulty, questionTypes, questionCount })
    } finally {
      setIsSubmitting(false)
    }
  }

  const step1Done = step > 1

  return (
    <div className="flex flex-col gap-8">

      {/* Step indicator — matches .pen stepIndicator */}
      <div className="flex items-center justify-center">
        {/* Step 1 */}
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${step === 1 ? 'bg-primary' : 'bg-subtle'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step1Done ? 'bg-success-muted' : 'bg-white/20'}`}>
            {step1Done ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span className="text-[11px] font-bold text-foreground">1</span>
            )}
          </div>
          <span className={`text-[13px] ${step === 1 ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
            Topics
          </span>
        </div>

        {/* Connector 1 */}
        <div className={`w-12 h-0.5 ${step1Done ? 'bg-success' : 'bg-border'}`} />

        {/* Step 2 */}
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${step === 2 ? 'bg-primary' : 'bg-subtle'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step === 2 ? 'bg-white/20' : 'bg-border'}`}>
            <span className={`text-[11px] font-bold ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>2</span>
          </div>
          <span className={`text-[13px] ${step === 2 ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
            Options
          </span>
        </div>

        {/* Connector 2 */}
        <div className="w-12 h-0.5 bg-border" />

        {/* Step 3 */}
        <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-subtle">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-border">
            <span className="text-[11px] font-bold text-muted-foreground">3</span>
          </div>
          <span className="text-[13px] font-medium text-muted-foreground">Review</span>
        </div>
      </div>

      {/* Wizard card — matches .pen wizardCard: bg-surface, cornerRadius 16, gap 28, padding 40 */}
      <div className="rounded-2xl bg-surface border border-border flex flex-col gap-7" style={{ padding: 40 }}>

        {/* Error display */}
        {(error || validationError) && (
          <div className="rounded-lg bg-error-muted border border-error px-4 py-3">
            <p className="text-sm text-error">{error ?? validationError}</p>
          </div>
        )}

        {step === 1 && (
          <>
            {/* Card header — matches .pen wizardCardHeader: gap 6 */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-foreground font-bold leading-tight" style={{ fontSize: 24, letterSpacing: -0.5 }}>
                What do you want to practice?
              </h2>
              <p className="text-sm text-muted-foreground">
                Select one or more technologies. You can mix languages and frameworks.
              </p>
            </div>

            {/* Topic chip grid — matches .pen chipGrid rows, gap 10 */}
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_TOPICS.map(topic => {
                const active = topics.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`rounded-lg px-3.5 py-1.5 text-[13px] transition border ${
                      active
                        ? 'bg-primary border-transparent text-foreground font-semibold'
                        : 'bg-elevated border-border text-muted-foreground font-medium hover:bg-subtle'
                    }`}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>

            {/* Selected count — matches .pen selectedCount with Badge/Primary */}
            {topics.length > 0 && (
              <div className="flex items-center">
                <span className="inline-flex items-center rounded-full bg-primary-muted px-2.5 py-1 text-xs font-medium text-primary">
                  {topics.length} selected
                </span>
              </div>
            )}

            {/* Actions — matches .pen wizardActions: space-between, Cancel ghost + Continue primary */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-elevated border border-border h-10 px-4 text-sm font-medium text-foreground hover:bg-subtle transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-lg bg-primary h-10 px-4 text-sm font-semibold text-white hover:bg-primary-hover transition"
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Card title — matches .pen s2CardTitle */}
            <h2 className="text-foreground font-bold leading-tight" style={{ fontSize: 24, letterSpacing: -0.5 }}>
              Configure your session
            </h2>

            {/* Difficulty — matches .pen diffSection: label + diffSegment segmented control */}
            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold text-foreground">Difficulty Level</span>
              <div className="flex rounded-lg bg-elevated border border-border overflow-hidden">
                {([
                  { value: 'beginner' as Difficulty, label: 'Beginner', dotClass: 'bg-success', activeClass: 'bg-success-muted text-success' },
                  { value: 'normal' as Difficulty, label: 'Normal', dotClass: 'bg-muted-foreground', activeClass: 'bg-subtle text-muted-foreground' },
                  { value: 'advanced' as Difficulty, label: 'Advanced', dotClass: 'bg-muted-foreground', activeClass: 'bg-subtle text-muted-foreground' },
                ]).map(({ value, label, dotClass, activeClass }) => {
                  const active = difficulty === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDifficulty(value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] transition ${
                        active ? `${activeClass} font-semibold` : 'text-muted-foreground font-medium hover:bg-subtle'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${active ? dotClass : 'bg-muted-foreground'}`} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Question types — matches .pen qtSection: two side-by-side cards with icon */}
            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold text-foreground">Question Types</span>
              <div className="flex gap-3">
                {([
                  {
                    value: 'theoretical' as QuestionType,
                    label: 'Theoretical',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    )
                  },
                  {
                    value: 'coding' as QuestionType,
                    label: 'Coding Problems',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 17 10 11 4 5"/>
                        <line x1="12" y1="19" x2="20" y2="19"/>
                      </svg>
                    )
                  },
                ]).map(({ value, label, icon }) => {
                  const active = questionTypes.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleType(value)}
                      className={`flex-1 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-[13px] font-medium transition ${
                        active
                          ? 'bg-elevated border-primary text-foreground'
                          : 'bg-elevated border-border text-muted-foreground hover:bg-subtle'
                      }`}
                    >
                      <span className={active ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Questions per session — matches .pen numSection: label+sub left, stepper right */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Questions per session</span>
                <span className="text-xs text-muted-foreground">5, 10, or 20 questions</span>
              </div>
              {/* Stepper — matches .pen stepper: stepMinus | divider | stepValue | divider | stepPlus */}
              <div className="flex items-center rounded-lg bg-elevated border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={stepCountDown}
                  aria-label="Decrease"
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-subtle transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <div className="w-px h-6 bg-border" />
                <div className="w-[52px] h-10 flex items-center justify-center">
                  <span className="text-base font-bold text-foreground">{questionCount}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <button
                  type="button"
                  onClick={stepCountUp}
                  aria-label="Increase"
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-subtle transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Actions — matches .pen s2Actions: ← Back ghost, Start Quiz primary */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep(1); setValidationError(null) }}
                className="rounded-lg bg-elevated border border-border h-10 px-4 text-sm font-medium text-foreground hover:bg-subtle transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-primary h-10 px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Creating session...' : 'Start Quiz →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
