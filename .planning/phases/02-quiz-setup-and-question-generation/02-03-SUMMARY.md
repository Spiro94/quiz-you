---
phase: 02-quiz-setup-and-question-generation
plan: "03"
subsystem: question-generation
tags: [llm, zod, supabase, react-context, hooks, retry, typescript]
dependency_graph:
  requires:
    - 02-01 (getLLMProvider, GeneratedQuestionSchema, QuizSessionRow, supabase client)
  provides:
    - src/lib/quiz/questions.ts
    - src/context/QuizContext.tsx
    - src/hooks/useQuestionGeneration.ts
  affects:
    - 02-04 (QuizSessionPage consumes generateQuestion, useQuizSession, useQuestionGeneration)
tech_stack:
  added: []
  patterns:
    - "generateQuestion() pipeline: LLM call → JSON clean → Zod parse → difficulty heuristic → Supabase insert"
    - "Exponential backoff retry: 1s/2s/4s across up to 3 attempts"
    - "Session-scoped React Context (QuizProvider wraps only /quiz/:sessionId route)"
    - "useCallback-wrapped generate() in useQuestionGeneration prevents unnecessary re-renders"
key_files:
  created:
    - src/lib/quiz/questions.ts
    - src/context/QuizContext.tsx
    - src/hooks/useQuestionGeneration.ts
  modified:
    - src/App.tsx (added QuizProvider around /quiz/:sessionId route)
    - src/types/database.ts (added Relationships: [] to all table definitions)
    - src/lib/quiz/sessions.ts (cast .select().single() return to QuizSessionRow)
decisions:
  - "QuizProvider wraps only /quiz/:sessionId, not the full app — session state is session-scoped, not user-scoped; mounting at app level would persist stale state between quiz sessions"
  - "checkDifficultyMatch() is a lightweight text-length + vocabulary heuristic, not a second LLM call — keeps cost O(1) per question with no extra latency"
  - "Relationships: [] required for all tables in database.ts to satisfy supabase-js v2 GenericTable constraint — without it, Insert types resolve to never in tsc -b composite build mode"
  - "sessions.ts casts select().single() return to QuizSessionRow — tsc -b infers narrower type than tsc --noEmit; cast is safe because the shape is guaranteed by the insert above it"
metrics:
  duration_minutes: 4
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 3
  completed_date: "2026-02-18"
requirements_satisfied:
  - QUIZ-01
  - QUIZ-06
---

# Phase 2 Plan 3: Question Generation Service & Quiz Session Context Summary

**One-liner:** LLM question generation pipeline (Zod validation + difficulty heuristic + 3-attempt exponential backoff + Supabase persist) with session-scoped QuizContext and useQuestionGeneration hook ready for Plan 02-04.

## What Was Built

### Question Generation Service (src/lib/quiz/questions.ts)

The core LLM integration pipeline. `generateQuestion()` executes in six steps:

1. **LLM call** — `getLLMProvider().generateQuestion(params)` calls Claude or OpenAI via the abstraction from Plan 02-01
2. **JSON cleaning** — Strips markdown code fences (` ```json `) the LLM may add despite prompt instructions
3. **JSON parse** — Throws descriptive error on parse failure with first 200 chars of raw response
4. **Zod validation** — `GeneratedQuestionSchema.safeParse()` with field-level error messages
5. **Difficulty heuristic** — `checkDifficultyMatch()` validates body length and vocabulary against requested difficulty
6. **Supabase insert** — Persists question to `quiz_questions` table before returning

Retry loop: 3 attempts with 1s/2s/4s exponential backoff. On third failure, throws descriptive aggregated error.

**checkDifficultyMatch() heuristics:**
- beginner: body <= 800 chars AND no advanced vocabulary
- normal: body >= 80 chars AND <= 1500 chars
- advanced: body >= 300 chars OR contains advanced vocabulary (abstract, generics, concurrency, distributed, etc.)

### Quiz Session Context (src/context/QuizContext.tsx)

React Context managing local UI state across quiz pages:

| State | Type | Purpose |
|-------|------|---------|
| session | QuizSessionState or null | Full session state including config |
| currentQuestionIndex | number | Current position in session |
| questions | GeneratedQuestion[] | Questions generated so far |
| skippedQuestions | Set<number> | Indices of skipped questions |

Key behaviors:
- `initializeSession(sessionRow)` — populates state from a fetched `quiz_sessions` row
- `skipQuestion()` — atomically updates `skippedQuestions` AND increments `currentQuestionIndex` in a **single** `setSession` call (no race condition)
- `getProgress()` — returns `{current, total, percent}` clamped to avoid overflow
- `isSessionComplete()` — returns true when `currentQuestionIndex >= totalQuestions`

### useQuestionGeneration Hook (src/hooks/useQuestionGeneration.ts)

React hook wrapping `generateQuestion()` with loading/error/data state:

```typescript
const { question, isLoading, error, generate, reset } = useQuestionGeneration({ sessionId })
```

- `generate(params, questionIndex)` — sets isLoading=true before async call, always sets isLoading=false in finally block
- `reset()` — clears question/error/isLoading for UI reuse
- All callbacks wrapped in `useCallback` with minimal dependencies

### App.tsx Routing

QuizProvider added around `/quiz/:sessionId` route only (not app-level):
```tsx
<Route path="/quiz/:sessionId" element={
  <ProtectedRoute>
    <QuizProvider>
      {/* QuizSessionPage added in Plan 02-04 */}
    </QuizProvider>
  </ProtectedRoute>
} />
```

## Live API Call Test

No live API call test was performed in this plan — the generation pipeline requires a running Supabase session with a valid `quiz_sessions` row. The Supabase migration (002_quiz_schema.sql) must be applied first. API call testing deferred to Plan 02-04 which wires the full quiz session page.

## checkDifficultyMatch() Heuristic Observations

The heuristic is intentionally coarse. Edge cases:
- A 250-char advanced question with no vocabulary keywords would fail the heuristic and trigger a retry — this is acceptable (retry cost is one LLM call)
- A normal question of exactly 80 chars passes beginner heuristic too — this overlap is acceptable since difficulty labeling comes from the LLM's own `difficulty` field in the JSON
- The vocabulary regex covers the most common advanced CS terms; it will not catch all cases but will catch obvious beginner/advanced mismatches

## dangerouslyAllowBrowser Note

No new SDK calls added in this plan — `dangerouslyAllowBrowser: true` was handled in Plan 02-01 for both Anthropic and OpenAI SDKs. The `generateQuestion()` function delegates to `getLLMProvider()` which already handles this.

## QuizContext Design Decisions

QuizProvider is **session-scoped, not app-scoped** because:
1. Each quiz session is independent — state from one session must not bleed into the next
2. Mounting at app level would require explicit state reset on session start (fragile)
3. Session-scoped mounting via the route means React unmounts/remounts the context on route change, providing automatic cleanup

TanStack Query (installed in Plan 02-01) handles server state (fetching session from Supabase). QuizContext handles only derived UI state (current index, skipped set, local question list).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing Relationships field in database.ts table definitions**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** supabase-js v2.96 `GenericTable` interface requires `Relationships: GenericRelationship[]` on each table definition. Without it, `tsc -b` (composite build mode) resolves Insert types to `never`, making all `.insert()` calls fail type-checking. `npx tsc --noEmit` passed (different resolution path) but `npm run build` (`tsc -b`) failed.
- **Fix:** Added `Relationships: []` to all four table definitions (users, quiz_sessions, quiz_questions, topics) in `src/types/database.ts`
- **Files modified:** src/types/database.ts
- **Commit:** 1055064

**2. [Rule 1 - Bug] sessions.ts return type incompatibility in tsc -b mode**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** After fixing the `Relationships` field, `tsc -b` still failed on sessions.ts because `.select().single()` returns a narrower inferred type in composite build mode. The `data` variable typed as `{}` rather than the full `QuizSessionRow`.
- **Fix:** Added `as QuizSessionRow` cast to both return sites in sessions.ts. The cast is safe — the shape is guaranteed by the Supabase insert + select above it.
- **Files modified:** src/lib/quiz/sessions.ts
- **Commit:** 1055064

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS — zero errors |
| `npm run build` | PASS — 492.12kB bundle, 110ms |
| generateQuestion() retry backoff logic | VERIFIED — attempt 0: no wait, attempt 1: 1s, attempt 2: 2s |
| Supabase insert runs only after both validate + difficulty checks | VERIFIED — insert is Step 5, after validateQuestion (Step 3) and checkDifficultyMatch (Step 4) |
| skipQuestion() single setState call | VERIFIED — single setSession call updates both fields atomically |
| isSessionComplete() >= check | VERIFIED — `currentQuestionIndex >= totalQuestions` handles edge case where index overshoots |
| getProgress() clamped | VERIFIED — Math.min(current, total) prevents percent > 100 |
| useQuestionGeneration finally block | VERIFIED — setIsLoading(false) in finally ensures loading always clears |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: Question generation service | fe37bc2 | generateQuestion() with Zod, retry, Supabase persist |
| Task 2: QuizContext + hook + routing | 1055064 | QuizContext, useQuestionGeneration, App.tsx wiring, bug fixes |

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/quiz/questions.ts | FOUND |
| src/context/QuizContext.tsx | FOUND |
| src/hooks/useQuestionGeneration.ts | FOUND |
| 02-03-SUMMARY.md | FOUND |
| Commit fe37bc2 | FOUND |
| Commit 1055064 | FOUND |
