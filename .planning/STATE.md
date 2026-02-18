# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** Developers can practice interviews in their spare time with realistic LLM-driven questions so they can be ready for any job interview or internal assessments at the company they're currently working at.
**Current focus:** Phase 2 — Quiz Setup & Question Generation

## Current Position

Phase: 2 of 4 (Quiz Setup & Question Generation)
Plan: 2 of 4 in current phase
Status: In progress
Last activity: 2026-02-18 — Completed 02-01 Quiz Infrastructure & LLM Provider Abstraction. DB migration, TypeScript types, Zod schemas, and LLM abstraction layer complete.

Progress: [████░░░░░░] 31%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 41 min
- Total execution time: 164 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Auth & Foundation | 3/3 COMPLETE | 161 min | 54 min |
| 2. Quiz Setup & Q Gen | 1/4 | 3 min | 3 min |
| 3. Eval & Scoring | 0/4 | - | - |
| 4. Dashboard & Analytics | 0/4 | - | - |

**Recent Trend:**
- Last 5 plans: 01-01 (27 min), 01-02 (8 min), 01-03 (126 min incl. human-verify checkpoint), 02-01 (3 min)
- Trend: Human verification checkpoints add significant wall-clock time; execution time for auto tasks remains fast

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

### Pending Todos

- Supabase migration `supabase/migrations/20260218194543_users_table.sql` APPLIED — confirmed working during Phase 1 verification
- Supabase migration `supabase/migrations/002_quiz_schema.sql` CREATED — must be applied manually in Supabase Dashboard → SQL Editor before Plan 02-03 runs
- VITE_ANTHROPIC_API_KEY must be set in .env.local before Plan 02-03 (question generation) runs

### Blockers/Concerns

- Phase 2: Question generation quality must pass < 20% malformed/off-difficulty gate before Phase 2 ships
- Phase 3: LLM evaluation accuracy must exceed 85% on test suite — highest risk in the project
- Phase 3: Stateless evaluation design (fresh context per answer) is mandatory to prevent context window degradation

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 02-01 Quiz Infrastructure & LLM Provider Abstraction (3 tasks, 3 commits). SUMMARY at .planning/phases/02-quiz-setup-and-question-generation/02-01-SUMMARY.md. Next: 02-02 Quiz Setup Form UI.
Resume file: None
