# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** Developers can practice interviews in their spare time with realistic LLM-driven questions so they can be ready for any job interview or internal assessments at the company they're currently working at.
**Current focus:** Phase 1 — Authentication & Foundation

## Current Position

Phase: 1 of 4 (Authentication & Foundation)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-18 — Completed 01-02 Authentication UI Layer (AuthContext, auth forms, ProtectedRoute, router config)

Progress: [██░░░░░░░░] 15%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 18 min
- Total execution time: 35 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Auth & Foundation | 2/3 | 35 min | 18 min |
| 2. Quiz Setup & Q Gen | 0/4 | - | - |
| 3. Eval & Scoring | 0/4 | - | - |
| 4. Dashboard & Analytics | 0/4 | - | - |

**Recent Trend:**
- Last 5 plans: 01-01 (27 min), 01-02 (8 min)
- Trend: Accelerating

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
- **[01-02]** DashboardPlaceholder in App.tsx — to be replaced when 01-03 implements real Dashboard component

### Pending Todos

- **IMPORTANT:** Run `supabase/migrations/20260218194543_users_table.sql` in Supabase Dashboard SQL Editor before auth flow works end-to-end. Migration creates `public.users` table with RLS and triggers.
- **01-03:** Replace DashboardPlaceholder in src/App.tsx with real Dashboard import when 01-03 completes

### Blockers/Concerns

- Phase 2: Question generation quality must pass < 20% malformed/off-difficulty gate before Phase 2 ships
- Phase 3: LLM evaluation accuracy must exceed 85% on test suite — highest risk in the project
- Phase 3: Stateless evaluation design (fresh context per answer) is mandatory to prevent context window degradation

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 01-02 Authentication UI Layer. Auth forms, AuthContext, ProtectedRoute, and router all complete. Migration must be applied in Supabase Dashboard before end-to-end auth flow works.
Resume file: None
