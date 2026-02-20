# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** Developers can practice interviews in their spare time with realistic LLM-driven questions so they can be ready for any job interview or internal assessments at the company they're currently working at.
**Current focus:** PROJECT COMPLETE — all 4 phases delivered, 35/35 requirements satisfied, ready for launch

## Current Position

Phase: 4 of 4 (Dashboard & Analytics) — COMPLETE
Plan: 4 of 4 in current phase — COMPLETE
Status: Phase 4 complete — 04-01, 04-02, 04-03, 04-04 all delivered and verified. All 11 Phase 4 requirements satisfied (COMP-02-05, DASH-01-07). All 35 v1 requirements shipped.
Last activity: 2026-02-20 — Phase 4 human-verify checkpoint APPROVED. Recharts analytics, session summaries, dashboard history, session detail view, and aggregation layer complete. All requirements verified in browser.

Progress: [███████████████] 100% (PROJECT COMPLETE — all phases delivered)

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 22 min
- Total execution time: 221 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Auth & Foundation | 3/3 COMPLETE | 161 min | 54 min |
| 2. Quiz Setup & Q Gen | 4/4 COMPLETE | 76 min | 19 min |
| 3. Eval & Scoring | 4/4 COMPLETE | 48 min | 12 min |
| 4. Dashboard & Analytics | 4/4 (human-verify pending) | ~23 min | ~6 min |

**Recent Trend:**
- Last 5 plans: 03-04 (43 min incl. human-verify), 04-01 (2 min), 04-02 (5 min), 04-03 (1 min), 04-04 (~15 min auto)
- Trend: Auto tasks execute fast; human verification checkpoints dominate wall-clock time

*Updated after each plan completion*
| Phase 05 P01 | 2 | 2 tasks | 7 files |

## Accumulated Context

### Roadmap Evolution

- Phase 5 added: UI Redesign with quiz-you.pen — apply design system to all screens (2026-02-20)

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
- [Phase 03-02]: temperature=0.2 for ClaudeProvider.evaluateAnswer() — deterministic scoring; question generation uses default 1.0 for creativity
- [Phase 03-02]: max_tokens=2048 for evaluations (vs 1024 for question generation) — evaluation output needs 2x budget for reasoning+feedback+modelAnswer
- [Phase 03-02]: EVAL_PROMPT_VERSION='v1.0' versioned separately from PROMPT_VERSION='v1.0' — allows independent versioning of question and evaluation prompts
- **[03-03]** useAnswerEvaluation accepts empty-fallback GeneratedQuestion — prevents null crash on hook initialization before first question loads
- **[03-03]** AnswerInput.onSubmit `(string) => void` compatible with async handleSubmit — TypeScript void compatibility allows this without interface update
- **[03-03]** EvaluationResult shows question above feedback — user can review question while reading model answer
- **[03-03]** Retry inserts new quiz_answers row — failed evaluation_failed row stays in DB for auditability
- **[03-03]** Score color tiers: >=85 green, >=70 blue, >=50 yellow, <50 red — consistent evaluation display pattern for future UI
- **[03-04]** insertSkippedAnswer() co-located in answers.ts alongside insertAnswer/completeQuizSession — consistent service boundary for all DB answer operations
- **[03-04]** completeQuizSession() called inside isSessionComplete useEffect (not handleNext) — fires on all completion paths (last-answer AND last-skip)
- **[03-04]** Best-effort pattern for insertSkippedAnswer/completeQuizSession — UI progress must never be blocked by DB write failures
- **[03-04]** OpenAI evaluateAnswer() implemented during verification for provider parity — gpt-4o, temperature=0.2, max_tokens=2048, mirrors ClaudeProvider
- **[03-04]** resetEvaluation() called at top of handleSkip — clears prior question error state before advancing to prevent stale UI
- **[04-01]** computeSessionSummary() receives _topic-enriched answers — caller does question_index → topic join so pure function stays Supabase-free
- **[04-01]** session_summaries upserted with onConflict: session_id — idempotent protection against double-fire from React StrictMode/re-renders
- **[04-01]** Summary insert is non-fatal (console.error only) — session completion always succeeds even if session_summaries write fails
- **[04-01]** QuizSession.tsx navigate changed from /dashboard to /session/:sessionId/summary — closes quiz loop with feedback before dashboard return
- **[04-01]** src/lib/dashboard/ directory established for pure computation functions with no Supabase dependency
- **[04-02]** QueryClientProvider added to main.tsx — useQuery hooks require it at app root; was missing despite @tanstack/react-query being installed
- **[04-02]** Server-side pagination via Supabase .range() — no client-side data slicing; overlaps() for array topic filter
- **[04-02]** Pagination state in URL search params; filter state in React useState — browser back works for pagination
- **[04-03]** Single .select() with nested quiz_questions() and quiz_answers() — avoids N+1 pitfall documented in RESEARCH.md
- **[04-03]** Map<number, QuizAnswerRow> keyed by question_index — O(n) answer correlation, not O(n^2)
- **[04-03]** staleTime: 10 minutes for session detail — data is immutable after session completes
- **[04-04]** Explicit AnswerWithTopic type cast (as unknown as) for Supabase join query — Relationships:[] empty arrays cause join result to resolve as never in tsc
- **[04-04]** In-memory topic grouping from quiz_answers + quiz_questions join — safe for v1 (<500 rows per RESEARCH.md), avoids Postgres GROUP BY complexity
- **[04-04]** Recharts Tooltip formatter typed as (value: number | undefined) — Recharts v2 types require optional value to handle missing data points
- **[04-04]** Horizontal BarChart layout for topic accuracy — topic names are long strings; horizontal bars avoid label truncation
- **[04-04]** Default difficulty 'normal' for recommendation — session_summaries has no difficulty field; v1 simplification per RESEARCH.md
- [Phase 05-01]: Tailwind v4 @theme block in CSS is the only token registration method — tailwind.config.ts is v3 only
- [Phase 05-01]: Google Fonts import placed BEFORE @import tailwindcss so body font-family resolves in @layer base

### Pending Todos

- Supabase migration `supabase/migrations/20260218194543_users_table.sql` APPLIED — confirmed working during Phase 1 verification
- Supabase migration `supabase/migrations/002_quiz_schema.sql` APPLIED — confirmed working during Phase 2 verification (quiz_sessions and quiz_questions tables functional)
- Supabase migration `supabase/migrations/20260219000000_quiz_answers.sql` APPLIED — quiz_answers table live with RLS
- VITE_ANTHROPIC_API_KEY confirmed working in .env.local — question generation verified in Phase 2

### Blockers/Concerns

- Phase 2: RESOLVED — Question generation quality gate passed during 02-04 human verification
- Phase 3: RESOLVED — LLM evaluation accuracy validated in 03-04 human verify; all 9 Phase 3 requirements confirmed live in browser
- Phase 3: RESOLVED — Stateless evaluation design confirmed working; no context window degradation observed during verification

## Session Continuity

Last session: 2026-02-20
Completed: Phase 4-04-PLAN.md — human verification checkpoint APPROVED. All 4 Phase 4 plans complete. All 35 v1 requirements satisfied. Project ready for launch.
Resume file: None
Status: PROJECT COMPLETE
