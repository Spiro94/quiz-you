---
phase: 03-answer-evaluation-and-scoring
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, typescript, quiz-answers, atomic-persistence]

# Dependency graph
requires:
  - phase: 02-quiz-setup-and-question-generation
    provides: quiz_sessions and quiz_questions tables this table references via foreign keys
provides:
  - quiz_answers table with RLS policies, indexes, and auto-updated_at trigger
  - QuizAnswerRow, QuizAnswerInsert, QuizAnswerUpdate TypeScript types
  - insertAnswer() function that saves answer with status='pending_evaluation' and returns full row
  - updateAnswerEvaluation() function that atomically writes score/feedback/model_answer and sets status='completed'
  - markAnswerEvaluationFailed() function for exhausted-retry scenarios
  - completeQuizSession() function that marks quiz_sessions status='completed'
affects:
  - 03-02-PLAN.md (uses insertAnswer, updateAnswerEvaluation from this layer)
  - 03-03-PLAN.md (uses InsertAnswerParams, EvaluationUpdateParams interfaces)
  - 03-04-PLAN.md (uses completeQuizSession, reads quiz_answers rows for completion logic)
  - 04-dashboard-analytics (reads quiz_answers table for history queries)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atomic two-step persistence: INSERT with status='pending_evaluation', then UPDATE with evaluation result — answer survives if evaluation fails"
    - "RLS via EXISTS subquery to quiz_sessions.user_id — mirrors quiz_questions pattern established in Phase 2"
    - "(SELECT auth.uid()) subquery form in RLS policies — O(1) evaluation, not O(n) per row"
    - "Auto-updated_at trigger pattern — consistent with quiz_sessions trigger"

key-files:
  created:
    - supabase/migrations/20260219000000_quiz_answers.sql
    - src/lib/quiz/answers.ts
  modified:
    - src/types/database.ts

key-decisions:
  - "question_index denormalized onto quiz_answers — avoids JOIN to quiz_questions for Phase 4 history queries (fast O(1) lookup by session+index)"
  - "question_id is nullable (SET NULL on quiz_question delete) — answer survives even if source question is deleted"
  - "reasoning field stored in DB (G-Eval chain-of-thought) — enables debugging evaluation quality without re-running LLM"
  - "completeQuizSession() placed in answers.ts not sessions.ts — operates at answer submission boundary, co-located with the functions that trigger it"
  - "UNIQUE (session_id, question_index) constraint — prevents duplicate answers per question per session at DB level"

patterns-established:
  - "Atomic answer persistence: insertAnswer() before LLM call, updateAnswerEvaluation() after success — DATA-01/DATA-03 guaranteed"
  - "Status lifecycle: pending_evaluation -> completed | evaluation_failed | skipped"

requirements-completed: [DATA-01, DATA-03, EVAL-05]

# Metrics
duration: 1min
completed: 2026-02-19
---

# Phase 3 Plan 01: Answer Persistence Foundation Summary

**quiz_answers table with RLS, auto-updated_at trigger, and atomic two-step persistence service (insertAnswer + updateAnswerEvaluation) ensuring no orphaned answers if LLM evaluation fails**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-19T15:06:09Z
- **Completed:** 2026-02-19T15:07:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `supabase/migrations/20260219000000_quiz_answers.sql` with full RLS policies (select/insert/update), two indexes (session_id, status), and auto-updated_at trigger — applied to Supabase remote database via `supabase db push`
- Added `quiz_answers` table definition to `src/types/database.ts` with complete Row/Insert/Update shapes and exported `QuizAnswerRow`, `QuizAnswerInsert`, `QuizAnswerUpdate` type aliases
- Created `src/lib/quiz/answers.ts` with four service functions: `insertAnswer` (returns full row with ID for subsequent update), `updateAnswerEvaluation` (atomic write of score/feedback/model_answer/status=completed), `markAnswerEvaluationFailed` (retry-exhausted path), and `completeQuizSession` (COMP-01 session lifecycle)
- All TypeScript type checks pass (npx tsc --noEmit zero errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create quiz_answers migration and TypeScript types** - `fc4d8d9` (feat)
2. **Task 2: Create atomic answer persistence service** - `79d8b59` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `supabase/migrations/20260219000000_quiz_answers.sql` - quiz_answers table DDL with RLS policies, indexes, and auto-updated_at trigger
- `src/types/database.ts` - Added quiz_answers table definition with Row/Insert/Update shapes and QuizAnswerRow/Insert/Update type aliases
- `src/lib/quiz/answers.ts` - Atomic answer persistence service with four exported functions and two exported interfaces

## Decisions Made
- question_index denormalized onto quiz_answers to avoid JOIN to quiz_questions for Phase 4 dashboard history queries
- question_id is nullable (ON DELETE SET NULL) so answer data survives if source question is deleted
- reasoning (G-Eval chain-of-thought) stored in DB for debugging evaluation quality without re-running LLM
- completeQuizSession() co-located in answers.ts (not sessions.ts) since it fires at answer submission boundary alongside the other answer persistence functions
- UNIQUE (session_id, question_index) enforced at DB level to prevent duplicate answers per question per session

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Supabase CLI was not cached locally — `npx supabase` triggered a first-time install download (`supabase@2.76.11`). Migration applied cleanly with one expected NOTICE: "trigger does not exist, skipping" on the DROP TRIGGER IF EXISTS statement (normal for first-time table creation). No blockers.

## User Setup Required

None - migration applied automatically via `supabase db push` during task execution.

## Next Phase Readiness
- `insertAnswer()` and `updateAnswerEvaluation()` are ready for Plan 03-02 (LLM evaluation engine)
- `InsertAnswerParams` and `EvaluationUpdateParams` interfaces exported for Plan 03-03 (answer form component)
- `completeQuizSession()` ready for Plan 03-04 (session completion flow)
- quiz_answers table live in Supabase with RLS blocking cross-user access

---
*Phase: 03-answer-evaluation-and-scoring*
*Completed: 2026-02-19*
