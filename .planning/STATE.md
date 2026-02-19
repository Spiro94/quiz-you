# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** Developers can practice interviews in their spare time with realistic LLM-driven questions so they can be ready for any job interview or internal assessments at the company they're currently working at.
**Current focus:** Phase 3 — Evaluation & Scoring

## Current Position

Phase: 3 of 4 (Evaluation & Scoring)
Plan: 2 of 4 in current phase
Status: In progress — 03-01 complete
Last activity: 2026-02-19 — Completed 03-01 quiz_answers migration, TypeScript types, and atomic persistence service (insertAnswer, updateAnswerEvaluation, completeQuizSession). DATA-01, DATA-03, EVAL-05 foundation complete.

Progress: [███████░░░] 63%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 24 min
- Total execution time: 169 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Auth & Foundation | 3/3 COMPLETE | 161 min | 54 min |
| 2. Quiz Setup & Q Gen | 4/4 COMPLETE | 76 min | 19 min |
| 3. Eval & Scoring | 1/4 | 1 min | 1 min |
| 4. Dashboard & Analytics | 0/4 | - | - |

**Recent Trend:**
- Last 5 plans: 01-03 (126 min incl. human-verify), 02-01 (3 min), 02-02 (~0 min), 02-03 (4 min), 02-04 (69 min incl. human-verify)
- Trend: Auto tasks execute fast; human verification checkpoints dominate wall-clock time

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- LLM provider switchable — different orgs may have preferences; build abstraction layer in Phase 2
- No OAuth for v1 — email/password only; simplifies Phase 1 scope
- Supabase for both auth and DB — integrated solution reduces complexity
- Skip questions with 0% — allows forward progress without session abandonment (Phase 2/3)
- Evaluation reliability is the single point of failure — invest in multi-step rubric validation in Phase 3
- **[01-01]** Trigger-based profile creation chosen over client-side INSERT — eliminates race condition where auth signup succeeds but profile creation fails; 100% profile coverage guaranteed
- **[01-01]** RLS policies use `(SELECT auth.uid())` subquery form — evaluated once per query, not per row; prevents O(n) function calls
- **[01-01]** `react-router-dom` and `zod` installed in 01-01 alongside `@supabase/supabase-js` — avoids blocking deviations in Plans 02/03
- **[01-02]** getSession() called first then onAuthStateChange() — dual-init ensures session restored from localStorage before listener fires (critical for AUTH-03)
- **[01-02]** loading state starts true, resolves false only after getSession() completes — prevents ProtectedRoute redirect flash on browser refresh
- **[01-02]** signOut({ scope: 'global' }) awaited before navigate('/login') — ensures session destroyed before redirect
- **[01-03]** @tailwindcss/vite plugin chosen over tailwind.config.js approach — Vite-native, zero configuration file needed
- **[01-03]** EmptyState CTA button disabled in Phase 1 — becomes functional in Phase 2 quiz setup
- **[01-03]** Phase 1 human-verify checkpoint passed — all AUTH-01, AUTH-02, AUTH-03, AUTH-04, DATA-02 criteria confirmed in live browser
- **[02-01]** `dangerouslyAllowBrowser: true` required for Anthropic/OpenAI SDKs in Vite browser context — both SDKs detect browser and require explicit opt-in
- **[02-01]** PROMPT_VERSION=v1.0 embedded in every LLM prompt — enables tracing question quality to specific prompt versions for A/B tracking
- **[02-01]** topics table has no RLS — reference data (public read only), RLS adds overhead with no security benefit
- **[02-01]** getLLMProvider() defaults to 'anthropic' if VITE_DEFAULT_LLM_PROVIDER unset — throws descriptive error if API key missing (not cryptic SDK error)
- **[02-02]** Form component is purely presentational (onSubmit callback prop) — QuizSetup page owns session creation and navigation, keeping form reusable and testable
- **[02-02]** questionCount parsed from string to int in createQuizSession() — radio values are strings but DB column type is 5|10|20 integer union
- **[02-03]** QuizProvider wraps only /quiz/:sessionId route (session-scoped, not app-scoped) — prevents stale state between quiz sessions
- **[02-03]** Relationships: [] required in database.ts tables for supabase-js v2 GenericTable — without it Insert types resolve to never in tsc -b mode
- **[02-03]** checkDifficultyMatch() uses text-length + vocabulary heuristic (no second LLM call) — keeps question generation O(1) cost per question
- [Phase 02-04]: useRef guard (autoRequestedIndexRef) prevents re-triggering LLM call when addQuestion() causes re-render — essential for cost control
- [Phase 02-04]: Monaco editor lazy-loaded via React.lazy — defers 1.5MB chunk until user hits a coding question
- [Phase 02-04]: markdown-it html: false enforced — LLM HTML output escaped before dangerouslySetInnerHTML, XSS-safe
- **[03-01]** question_index denormalized onto quiz_answers — avoids JOIN to quiz_questions for Phase 4 history queries
- **[03-01]** question_id nullable (ON DELETE SET NULL) — answer survives if source question is deleted
- **[03-01]** reasoning (G-Eval chain-of-thought) stored in DB — enables debugging evaluation quality without re-running LLM
- **[03-01]** completeQuizSession() co-located in answers.ts (not sessions.ts) — fires at answer submission boundary alongside other answer persistence functions
- **[03-01]** UNIQUE (session_id, question_index) enforced at DB level — prevents duplicate answers per question per session

### Pending Todos

- Supabase migration `supabase/migrations/20260218194543_users_table.sql` APPLIED — confirmed working during Phase 1 verification
- Supabase migration `supabase/migrations/002_quiz_schema.sql` APPLIED — confirmed working during Phase 2 verification (quiz_sessions and quiz_questions tables functional)
- Supabase migration `supabase/migrations/20260219000000_quiz_answers.sql` APPLIED — quiz_answers table live with RLS
- VITE_ANTHROPIC_API_KEY confirmed working in .env.local — question generation verified in Phase 2

### Blockers/Concerns

- Phase 2: RESOLVED — Question generation quality gate passed during 02-04 human verification
- Phase 3: LLM evaluation accuracy must exceed 85% on test suite — highest risk in the project
- Phase 3: Stateless evaluation design (fresh context per answer) is mandatory to prevent context window degradation

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 03-01 quiz_answers migration + atomic persistence service (2 tasks, 2 commits). SUMMARY at .planning/phases/03-answer-evaluation-and-scoring/03-01-SUMMARY.md. DATA-01, DATA-03, EVAL-05 foundation verified. Next: Phase 3 Plan 02.
Resume file: None
