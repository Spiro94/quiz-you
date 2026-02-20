---
phase: 04-dashboard-analytics
plan: 04
subsystem: ui
tags: [recharts, react-query, dashboard, analytics, barchart, linechart, recommendation]

# Dependency graph
requires:
  - phase: 04-02
    provides: useSessions hook + FilterBar + SessionHistoryList on Dashboard page
  - phase: 04-03
    provides: session detail data layer and routing
  - phase: 04-01
    provides: session_summaries table with final_score + per-session data for trends
provides:
  - Recharts BarChart of per-topic accuracy (DASH-04)
  - Recharts LineChart of session scores over time (DASH-05)
  - NextQuizRecommendation card with weak areas + suggested difficulty (DASH-06)
  - getTopicAccuracy() query with in-memory topic grouping via quiz_questions join
  - getPerformanceTrends() time-series query from session_summaries
  - computeRecommendation() pure function (weak topics < 70, difficulty thresholds)
  - Dashboard analytics section: recommendation card + 2-column chart grid
affects: [future phase analytics, potential server-side aggregation migration]

# Tech tracking
tech-stack:
  added: [recharts]
  patterns:
    - React Query shared cache across components (useTopicAccuracy + usePerformanceTrends used in both charts AND recommendation)
    - Explicit TypeScript cast (as unknown as) for Supabase join queries when Relationships are empty arrays
    - In-memory grouping for v1 analytics (< 500 rows threshold per RESEARCH.md)
    - Horizontal BarChart layout for long topic names (better UX than vertical)

key-files:
  created:
    - src/lib/dashboard/aggregations.ts
    - src/hooks/useTopicAccuracy.ts
    - src/hooks/usePerformanceTrends.ts
    - src/components/dashboard/PerTopicAccuracy.tsx
    - src/components/dashboard/PerformanceTrends.tsx
    - src/components/dashboard/NextQuizRecommendation.tsx
  modified:
    - src/pages/Dashboard.tsx

key-decisions:
  - "Explicit AnswerWithTopic type cast (as unknown as) for Supabase join query — Relationships:[] empty arrays cause join result to resolve as never in tsc"
  - "In-memory topic grouping from quiz_answers + quiz_questions join — safe for v1 (<500 rows per RESEARCH.md), avoids Postgres GROUP BY complexity"
  - "Recharts Tooltip formatter typed as (value: number | undefined) — Recharts v2 types require optional value to handle missing data points"
  - "Horizontal BarChart layout for topic accuracy — topic names are long strings; horizontal bars avoid label truncation"
  - "NextQuizRecommendation uses React Query shared cache from useTopicAccuracy + usePerformanceTrends — no duplicate network requests; hooks cache-hit when called in same component tree"
  - "Default difficulty 'normal' for recommendation — session_summaries has no difficulty field for trend data; RESEARCH.md noted this as acceptable v1 simplification"

patterns-established:
  - "Recharts horizontal BarChart pattern with Cell color-coding by score tier"
  - "Recharts LineChart with date-fns tickFormatter for date X-axis"
  - "Supabase join type cast pattern: (as unknown as { data: T | null; error: PostgrestError | null }) to work around empty Relationships arrays"

requirements-completed: [DASH-04, DASH-05, DASH-06]

# Metrics
duration: ~15min
completed: 2026-02-20
---

# Phase 4 Plan 04: Analytics Components Summary

**Recharts BarChart + LineChart analytics layer on dashboard with per-topic accuracy, performance trend, and AI-driven next-quiz recommendation — closes DASH-04, DASH-05, DASH-06**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-20T20:36:27Z
- **Completed:** 2026-02-20
- **Tasks:** 2 auto (+ 1 human-verify checkpoint reached)
- **Files modified:** 7

## Accomplishments
- Recharts installed + aggregation data layer (getTopicAccuracy, getPerformanceTrends, computeRecommendation) implemented in src/lib/dashboard/aggregations.ts
- React Query hooks (useTopicAccuracy, usePerformanceTrends) with 10-minute staleTime for analytics cache
- PerTopicAccuracy: horizontal bar chart with per-score-tier color coding (green/blue/yellow/red), sorted weakest-first
- PerformanceTrends: line chart with date-formatted X-axis and 0-100 Y-axis, last 30 sessions chronological
- NextQuizRecommendation: card showing up to 3 weak topics (avgScore < 70) + suggested difficulty derived from last 5 sessions
- Dashboard.tsx updated with analytics section below session history (full-width recommendation card + 2-column chart grid on lg screens)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Recharts + aggregation queries + React Query hooks** - `f78edee` (feat)
2. **Task 2: Analytics components + Dashboard page integration** - `76e56e0` (feat)

**Plan metadata:** (pending — committed after checkpoint)

## Files Created/Modified
- `src/lib/dashboard/aggregations.ts` - getTopicAccuracy(), getPerformanceTrends(), computeRecommendation() + TopicAccuracy, TrendPoint, RecommendationResult interfaces
- `src/hooks/useTopicAccuracy.ts` - React Query hook wrapping getTopicAccuracy()
- `src/hooks/usePerformanceTrends.ts` - React Query hook wrapping getPerformanceTrends()
- `src/components/dashboard/PerTopicAccuracy.tsx` - Recharts horizontal BarChart (68 lines)
- `src/components/dashboard/PerformanceTrends.tsx` - Recharts LineChart with date-fns (67 lines)
- `src/components/dashboard/NextQuizRecommendation.tsx` - Recommendation card with Start Quiz CTA (76 lines)
- `src/pages/Dashboard.tsx` - Added analytics section imports + JSX section below SessionHistoryList

## Decisions Made
- Explicit AnswerWithTopic TypeScript cast for Supabase join query — Relationships:[] empty arrays cause the Supabase type system to resolve join result as `never`; used `as unknown as { data: AnswerWithTopic[] | null; error: PostgrestError | null }` pattern
- Recharts Tooltip formatter types accept `number | undefined` — Recharts v2 types mark value as possibly undefined to handle missing data series; parameter signature must match
- Default difficulty 'normal' for computeRecommendation in NextQuizRecommendation — session_summaries doesn't store the difficulty used during session; v1 simplification per RESEARCH.md
- Horizontal BarChart layout — topic names are long strings; vertical bars would truncate labels on narrow screens

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Supabase join query TypeScript error (type 'never' on join result)**
- **Found during:** Task 1 (aggregations.ts TypeScript check)
- **Issue:** `quiz_answers.select(...quiz_questions!inner...)` returned type `never` because `Relationships: []` is empty in database.ts, preventing Supabase from resolving the join shape
- **Fix:** Defined explicit `AnswerWithTopic` type and cast query result using `as unknown as { data: AnswerWithTopic[] | null; error: PostgrestError | null }`; also imported `PostgrestError` from `@supabase/supabase-js`
- **Files modified:** src/lib/dashboard/aggregations.ts
- **Verification:** `npx tsc -p tsconfig.app.json --noEmit` — 0 errors
- **Committed in:** f78edee (Task 1 commit)

**2. [Rule 1 - Bug] Recharts Tooltip formatter value type incompatibility**
- **Found during:** Task 2 (TypeScript check of analytics components)
- **Issue:** Recharts v2 `Formatter<number, string>` type defines `value` as `number | undefined` (handles missing data points); plan's formatter signatures typed `value: number` — TypeScript rejected this
- **Fix:** Updated formatter parameter types to `value: number | undefined` and `_name: string | undefined` in both PerTopicAccuracy and PerformanceTrends formatters; added `?? 0` nullish coalescing for safe display
- **Files modified:** src/components/dashboard/PerTopicAccuracy.tsx, src/components/dashboard/PerformanceTrends.tsx
- **Verification:** `npx tsc -p tsconfig.app.json --noEmit` — 0 errors
- **Committed in:** 76e56e0 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 x Rule 1 TypeScript type bugs)
**Impact on plan:** Both fixes necessary for TypeScript compilation. No scope creep. Plan code unchanged in behavior.

## Issues Encountered
- Recharts ships its own TypeScript types (no @types/recharts needed) — plan correctly noted this; confirmed by checking node_modules/recharts/types/ directory
- Supabase Relationships:[] pattern is a known project constraint (documented in STATE.md from Phase 2); required same workaround pattern as other join queries in this project

## User Setup Required
None - no external service configuration required. Recharts installed via npm. No new environment variables.

## Next Phase Readiness
- Phase 4 is now fully implemented (all 4 plans complete: 04-01 through 04-04)
- Human verification checkpoint (Task 3) covers all 11 Phase 4 requirements across the entire phase
- All Phase 4 auto tasks committed; project at 100% implementation for all planned phases
- Human verify is the only remaining step: confirm charts render, filters work, session detail shows Q/A, recommendation card appears

---
*Phase: 04-dashboard-analytics*
*Completed: 2026-02-20*
