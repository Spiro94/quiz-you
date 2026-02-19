---
phase: 03-answer-evaluation-and-scoring
plan: 02
subsystem: api
tags: [llm, anthropic, claude, g-eval, zod, typescript, evaluation, scoring, retry, timeout]

# Dependency graph
requires:
  - phase: 03-answer-evaluation-and-scoring
    provides: quiz_answers table, insertAnswer/updateAnswerEvaluation persistence functions (03-01)
  - phase: 02-quiz-setup-and-question-generation
    provides: LLMProvider abstraction, ClaudeProvider base, buildQuestionPrompt pattern
provides:
  - EvaluationParams and EvaluationResult interfaces on LLMProvider contract
  - buildEvaluationPrompt() with per-difficulty/per-type rubric and G-Eval 4-step process
  - EVAL_PROMPT_VERSION='v1.0' for A/B prompt tracking
  - evaluateWithRetry() — G-Eval entry point with 30s timeout + 3-attempt exponential backoff + Zod validation
  - EvaluationSchema — Zod validator for LLM output (score integer 0-100, min-length checks)
  - ClaudeProvider.evaluateAnswer() — temperature=0.2, max_tokens=2048, JSON parse with descriptive errors
  - OpenAIProvider.evaluateAnswer() stub — satisfies LLMProvider interface, throws on call
affects:
  - 03-03-PLAN.md (useAnswerEvaluation hook calls evaluateWithRetry())
  - 03-04-PLAN.md (session completion uses evaluation result from this layer)

# Tech tracking
tech-stack:
  added: [zod (already present from Phase 1 — used here for LLM output validation)]
  patterns:
    - "G-Eval pattern: LLM generates chain-of-thought reasoning before committing to numeric score"
    - "Stateless evaluation: each call uses fresh buildEvaluationPrompt(), no prior context carried over"
    - "Double Zod validation: ClaudeProvider parses JSON + evaluation.ts validates schema — catches provider vs consumer failures separately"
    - "Promise.race for timeout enforcement — clean abort without AbortController complexity"
    - "Exponential backoff with 10% jitter: delay = BASE_DELAY * 2^attempt + random(delay * 0.1)"

key-files:
  created:
    - src/lib/llm/evaluation.ts
  modified:
    - src/lib/llm/types.ts
    - src/lib/llm/prompts.ts
    - src/lib/llm/claude.ts
    - src/lib/llm/openai.ts

key-decisions:
  - "temperature=0.2 in ClaudeProvider.evaluateAnswer() — deterministic scoring reduces inter-run variance; question generation uses default 1.0 for creativity"
  - "max_tokens=2048 for evaluations vs 1024 for question generation — evaluation output (reasoning + feedback + modelAnswer) requires 2x token budget"
  - "EvaluationSchema validated in both ClaudeProvider (JSON parse guard) and evaluation.ts (shape guard) — different error contexts, different failure modes"
  - "buildRubric() is unexported (module-private) — rubric strings are implementation detail of prompt building, not part of public API"
  - "OpenAIProvider stub throws instead of implementing — prevents silent incorrect behavior; forces explicit choice if OpenAI evaluation is needed"
  - "EVAL_PROMPT_VERSION='v1.0' exported separately from PROMPT_VERSION='v1.0' — allows independent versioning of question and evaluation prompts"

patterns-established:
  - "Stateless LLM evaluation: never accumulate context between answers — prevents context window degradation"
  - "G-Eval rubric structure: per-difficulty (beginner/normal/advanced) x per-type (coding/theoretical) = 6 distinct rubric strings"
  - "Retry pattern: for loop 0..MAX_RETRIES-1, catch all errors, backoff on non-final attempts, re-throw with attempt count on exhaustion"

requirements-completed: [EVAL-01, EVAL-02, EVAL-03, EVAL-04]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 3 Plan 02: G-Eval Evaluation Service Summary

**G-Eval scoring engine with stateless chain-of-thought prompting, per-difficulty rubrics, Zod output validation, 30-second timeout, and 3-attempt exponential backoff across ClaudeProvider and LLMProvider interface**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T15:10:46Z
- **Completed:** 2026-02-19T15:13:09Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Extended LLMProvider interface with `evaluateAnswer(params: EvaluationParams): Promise<EvaluationResult>` — both ClaudeProvider and OpenAIProvider satisfy it; TypeScript errors clean
- Created `src/lib/llm/evaluation.ts` implementing `evaluateWithRetry()` — G-Eval evaluation with 30s timeout via Promise.race, 3-attempt retry loop with 1s/2s/4s exponential backoff + 10% jitter, Zod EvaluationSchema validation gating each attempt
- Added `buildEvaluationPrompt()` to prompts.ts with 6-variant rubric (3 difficulties x 2 question types), G-Eval 4-step evaluation process (correctness/completeness/quality/presentation), and EVAL_PROMPT_VERSION for tracking

## Task Commits

Each task was committed atomically:

1. **Task 1: Add EvaluationParams/EvaluationResult types and buildEvaluationPrompt** - `bf0d7cf` (feat)
2. **Task 2: Build evaluation service with G-Eval, retry, Zod validation, and update providers** - `24425ff` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/lib/llm/evaluation.ts` - G-Eval service: evaluateWithRetry() + EvaluationSchema (Zod) + timeout/backoff logic
- `src/lib/llm/types.ts` - Added EvaluationParams, EvaluationResult interfaces; extended LLMProvider with evaluateAnswer
- `src/lib/llm/prompts.ts` - Added EVAL_PROMPT_VERSION, buildEvaluationPrompt() with rubric, buildRubric() private helper
- `src/lib/llm/claude.ts` - Implemented ClaudeProvider.evaluateAnswer() with temperature=0.2, max_tokens=2048
- `src/lib/llm/openai.ts` - Added OpenAIProvider.evaluateAnswer() stub throwing 'OpenAI evaluation not implemented'

## Decisions Made
- temperature=0.2 chosen for evaluation (vs default 1.0 for question generation) — deterministic scoring reduces variance between runs on identical inputs
- max_tokens=2048 for evaluations (vs 1024 for questions) — evaluation output includes reasoning + feedback + modelAnswer, needs 2x budget
- Double Zod validation: ClaudeProvider catches JSON parse failures early; evaluation.ts validates shape — separates provider failures from consumer failures
- buildRubric() is module-private (unexported) — rubric strings are a prompt implementation detail, not part of the public API surface
- OpenAIProvider stub throws rather than returning garbage — prevents silent wrong behavior if someone switches providers without implementing evaluation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`npx tsc --noEmit` with composite project references returned zero errors even before implementing evaluateAnswer — the stale `.tsbuildinfo` cache suppressed errors. Used `npx tsc -p tsconfig.app.json --noEmit` directly to confirm errors and then verify zero-error state. No functional impact.

## User Setup Required

None - no external service configuration required. The evaluation service uses VITE_ANTHROPIC_API_KEY already configured in Phase 2.

## Next Phase Readiness
- `evaluateWithRetry()` exported from `src/lib/llm/evaluation.ts` — ready for `useAnswerEvaluation` hook in Plan 03-03
- `EvaluationParams` and `EvaluationResult` interfaces exported from `src/lib/llm/types.ts` — ready for Plan 03-03 hook signature
- `ClaudeProvider.evaluateAnswer()` tested manually via TypeScript compilation — full E2E test happens in 03-03 when wired to the form
- `EvaluationSchema` exported from `evaluation.ts` — can be used in tests or server-side validation in future phases

---
*Phase: 03-answer-evaluation-and-scoring*
*Completed: 2026-02-19*

## Self-Check: PASSED

- FOUND: src/lib/llm/evaluation.ts
- FOUND: src/lib/llm/types.ts (EvaluationParams, EvaluationResult, LLMProvider.evaluateAnswer)
- FOUND: src/lib/llm/prompts.ts (EVAL_PROMPT_VERSION, buildEvaluationPrompt)
- FOUND: src/lib/llm/claude.ts (ClaudeProvider.evaluateAnswer temperature=0.2 max_tokens=2048)
- FOUND: src/lib/llm/openai.ts (OpenAIProvider stub)
- FOUND: .planning/phases/03-answer-evaluation-and-scoring/03-02-SUMMARY.md
- FOUND: bf0d7cf (Task 1 commit)
- FOUND: 24425ff (Task 2 commit)
- TypeScript: npx tsc -p tsconfig.app.json --noEmit = 0 errors
