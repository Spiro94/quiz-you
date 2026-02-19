---
phase: 03-answer-evaluation-and-scoring
plan: 03
subsystem: ui
tags: [react, hooks, typescript, markdown-it, evaluation, scoring, llm, spinner, retry]

# Dependency graph
requires:
  - phase: 03-answer-evaluation-and-scoring
    provides: insertAnswer/updateAnswerEvaluation/markAnswerEvaluationFailed persistence functions (03-01), evaluateWithRetry G-Eval service with EvaluationParams/EvaluationResult types (03-02)
  - phase: 02-quiz-setup-and-question-generation
    provides: QuizContext (moveToNextQuestion), AnswerInput component, GeneratedQuestion type, QuizSession page structure
provides:
  - useAnswerEvaluation hook: full 3-step atomic lifecycle (insertAnswer -> evaluateWithRetry -> updateAnswerEvaluation) with evaluating/evaluation/error/elapsedSeconds/reset state
  - EvaluationResult component: score ring (0-100 with color tiers), feedback (markdown-it), model answer (markdown-it), Next Question / Finish Quiz button
  - QuizSession.tsx: handleSubmit wired to real evaluation pipeline; evaluation state toggles between AnswerInput and EvaluationResult; loading/error/retry UI
affects:
  - 03-04-PLAN.md (QuizSession.tsx handles isLastQuestion; 03-04 will add session completion summary screen)
  - 04-dashboard-analytics (quiz_answers rows now populated with real scores/feedback from live evaluations)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRef for lastAnswerRef — stores last submitted answer for Retry re-submission without useState re-render overhead"
    - "useEffect + setInterval on evaluating boolean — drives elapsedSeconds timer, cleaned up on unmount and state change"
    - "Conditional render chain: evaluation ? EvaluationResult : evaluating ? spinner : evalError ? error panel : AnswerInput — clean single source of truth"
    - "handleNext = reset() + moveToNextQuestion() — two-step: clear hook state first, then advance quiz context"

key-files:
  created:
    - src/hooks/useAnswerEvaluation.ts
    - src/components/quiz/EvaluationResult.tsx
  modified:
    - src/pages/QuizSession.tsx

key-decisions:
  - "useAnswerEvaluation accepts a fallback GeneratedQuestion (empty) for the case when session.currentQuestionIndex is beyond the generated questions array — prevents crash on hook initialization before first question loads"
  - "AnswerInput.onSubmit type (string) => void is compatible with async handleSubmit — TypeScript accepts async functions where void return is expected"
  - "EvaluationResult always shown with the question still visible above — user can review question while reading feedback/model answer"
  - "isLastQuestion uses currentQuestionIndex >= totalQuestions - 1 — shows 'Finish Quiz' label on last question before final submission"
  - "Retry calls submitAnswer(lastAnswerRef.current) — reuses the exact same answer string, inserting a new quiz_answers row (previous pending_evaluation row stays as evaluation_failed)"

patterns-established:
  - "Evaluation display: score color tiers: >=85 green, >=70 blue, >=50 yellow, <50 red — consistent across all future evaluation UI"
  - "Error UI for evaluation: evalError && !evaluating && !evaluation — three-way guard prevents showing error and result simultaneously"

requirements-completed: [QUIZ-04, EVAL-01, EVAL-02, EVAL-03, EVAL-04, EVAL-05]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 3 Plan 03: Answer Submission Flow Summary

**useAnswerEvaluation hook + EvaluationResult component wired to QuizSession — complete 3-step atomic evaluation lifecycle (insert -> G-Eval -> update) with color-coded score display, markdown feedback, 20s "still evaluating" indicator, and retry on failure**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T15:16:11Z
- **Completed:** 2026-02-19T15:18:24Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `src/hooks/useAnswerEvaluation.ts` implementing the full atomic 3-step lifecycle: insertAnswer (pending_evaluation) -> evaluateWithRetry (G-Eval) -> updateAnswerEvaluation (completed), with elapsedSeconds timer and markAnswerEvaluationFailed on exhausted retries
- Created `src/components/quiz/EvaluationResult.tsx` with score color tiers (green/blue/yellow/red), markdown-it-rendered feedback and model answer (html:false, XSS-safe), and context-aware Next Question / Finish Quiz button
- Updated `src/pages/QuizSession.tsx`: removed Phase 2 stub handleSubmit, wired to useAnswerEvaluation, added loading spinner with "Still evaluating..." at 20s, retry button on error, conditional AnswerInput / EvaluationResult render switch

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useAnswerEvaluation hook** - `a5e0c56` (feat)
2. **Task 2: Build EvaluationResult component and wire QuizSession** - `2a1352f` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/hooks/useAnswerEvaluation.ts` - Hook: 3-step atomic evaluation lifecycle, elapsedSeconds timer, error/retry state, reset function
- `src/components/quiz/EvaluationResult.tsx` - Component: score with color tiers, feedback (markdown-it), model answer (markdown-it), Next/Finish button
- `src/pages/QuizSession.tsx` - Page: handleSubmit wired to submitAnswer(), evaluation loading/error/result UI, AnswerInput hidden during/after evaluation

## Decisions Made
- useAnswerEvaluation accepts an empty-fallback GeneratedQuestion for hook initialization before first question loads — prevents null crash on hook mount
- AnswerInput.onSubmit type `(string) => void` accepts the async handleSubmit — TypeScript's void compatibility rules allow this without needing to update AnswerInput's interface
- EvaluationResult displays with the QuestionDisplay still visible above it — user can review the question while reading feedback
- Retry re-submits lastAnswerRef.current, which inserts a new quiz_answers row (the failed evaluation_failed row stays in DB for auditability)
- isLastQuestion: currentQuestionIndex >= totalQuestions - 1 — correct boundary showing 'Finish Quiz' on the last question

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript check passed zero errors on both tasks. Build succeeds with one pre-existing chunk size warning (Monaco editor lazy-loaded, ~794KB chunk — not a blocker per plan spec).

## User Setup Required

None - no external service configuration required. Evaluation pipeline uses VITE_ANTHROPIC_API_KEY already configured in Phase 2.

## Next Phase Readiness
- Full answer submission + evaluation flow is live: user submits answer, sees spinner, gets score/feedback/model answer
- `completeQuizSession()` from 03-01 ready for Plan 03-04 (session completion + summary screen)
- Phase 4 (dashboard) can now read quiz_answers rows with real scores, feedback, and model answers

---
*Phase: 03-answer-evaluation-and-scoring*
*Completed: 2026-02-19*

## Self-Check: PASSED

- FOUND: src/hooks/useAnswerEvaluation.ts
- FOUND: src/components/quiz/EvaluationResult.tsx
- FOUND: src/pages/QuizSession.tsx (modified)
- FOUND: .planning/phases/03-answer-evaluation-and-scoring/03-03-SUMMARY.md
- FOUND: a5e0c56 (Task 1 commit)
- FOUND: 2a1352f (Task 2 commit)
- TypeScript: npx tsc -p tsconfig.app.json --noEmit = 0 errors
