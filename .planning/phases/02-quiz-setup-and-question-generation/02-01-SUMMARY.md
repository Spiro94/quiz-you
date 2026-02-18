---
phase: 02-quiz-setup-and-question-generation
plan: "01"
subsystem: infrastructure
tags: [database, llm, supabase, rls, typescript, zod, anthropic, openai]
dependency_graph:
  requires: []
  provides:
    - supabase/migrations/002_quiz_schema.sql
    - src/types/quiz.ts
    - src/types/database.ts (extended)
    - src/lib/llm/types.ts
    - src/lib/llm/claude.ts
    - src/lib/llm/openai.ts
    - src/lib/llm/index.ts
    - src/lib/llm/prompts.ts
  affects:
    - 02-02 (QuizSetupSchema, AVAILABLE_TOPICS for form validation)
    - 02-03 (getLLMProvider, LLMProvider interface for question generation)
    - 02-04 (GeneratedQuestionSchema, QuizQuestionRow for question display)
tech_stack:
  added:
    - "@anthropic-ai/sdk@0.77.0: Anthropic Claude client with streaming support"
    - "openai@6.22.0: OpenAI client for fallback provider"
    - "react-hook-form@7.71.1: Form state management for quiz setup (Plan 02-02)"
    - "@hookform/resolvers@5.2.2: Zod resolver for React Hook Form"
    - "@tanstack/react-query@5.90.21: Server state management for quiz sessions"
    - "@monaco-editor/react@4.7.0: Code editor for coding problem answers (Plan 02-04)"
    - "markdown-it@14.1.1: Markdown rendering for question text (Plan 02-04)"
  patterns:
    - "LLMProvider interface pattern — provider switchable via VITE_DEFAULT_LLM_PROVIDER env var"
    - "Zod schemas as single source of truth for both form validation and LLM output validation"
    - "dangerouslyAllowBrowser: true — required for Anthropic/OpenAI SDK in Vite browser context"
    - "RLS policies using (SELECT auth.uid()) subquery form — consistent with 001 migration"
    - "Versioned prompts (PROMPT_VERSION=v1.0) for A/B tracking of question quality"
key_files:
  created:
    - supabase/migrations/002_quiz_schema.sql
    - src/types/quiz.ts
    - src/lib/llm/types.ts
    - src/lib/llm/prompts.ts
    - src/lib/llm/claude.ts
    - src/lib/llm/openai.ts
    - src/lib/llm/index.ts
  modified:
    - src/types/database.ts
    - .env.example
    - package.json
decisions:
  - "dangerouslyAllowBrowser: true is required for both Anthropic and OpenAI SDKs when running in Vite browser context — these SDKs detect browser environments and require explicit opt-in"
  - "PROMPT_VERSION=v1.0 embedded in every LLM prompt to enable tracing and A/B comparison of question quality over time"
  - "getLLMProvider() defaults to 'anthropic' if VITE_DEFAULT_LLM_PROVIDER is unset — prevents silent failures"
  - "topics table has no RLS — it is reference data (public read), not user data; RLS would add overhead with no security benefit"
  - "002_quiz_schema.sql uses IF NOT EXISTS throughout — idempotent, safe to re-run if applied twice"
metrics:
  duration_minutes: 3
  tasks_completed: 3
  tasks_total: 3
  files_created: 7
  files_modified: 3
  completed_date: "2026-02-18"
requirements_satisfied:
  - SETUP-01
  - SETUP-02
  - SETUP-03
  - SETUP-04
---

# Phase 2 Plan 1: Quiz Infrastructure & LLM Provider Abstraction Summary

**One-liner:** Supabase quiz schema (3 tables, RLS, 15 seeded topics) + switchable LLM provider abstraction (Claude primary, OpenAI fallback) with Zod schemas as validation source of truth.

## What Was Built

This plan created the pure infrastructure layer that all subsequent Phase 2 plans depend on. No UI was built — only database tables, TypeScript types, Zod schemas, and the LLM provider abstraction.

### Database (002_quiz_schema.sql)

Three tables created:

- **topics** — Reference table with 15 seeded programming languages/technologies. No RLS (public reference data).
- **quiz_sessions** — Stores session configuration (topics[], difficulty, question_types[], question_count, status). RLS: users see/modify only their own sessions (3 policies).
- **quiz_questions** — Stores LLM-generated questions linked to sessions. RLS: users access only questions in their own sessions (2 policies, using EXISTS subquery against quiz_sessions).

All RLS policies use `(SELECT auth.uid())` subquery form per the established 001 pattern (O(1) evaluation).

### TypeScript Types (src/types/database.ts)

Extended the existing Database interface with quiz_sessions, quiz_questions, and topics table definitions. Added convenience type aliases: `QuizSessionRow`, `QuizSessionInsert`, `QuizQuestionRow`, `QuizQuestionInsert`, `TopicRow`.

### Quiz Domain Types (src/types/quiz.ts)

Zod schemas serve as the single source of truth for:
- Form validation in Plan 02-02 (`QuizSetupSchema`)
- LLM output validation in Plan 02-03 (`GeneratedQuestionSchema`)
- Enums: `DifficultyEnum` (beginner/normal/advanced), `QuestionTypeEnum` (coding/theoretical), `QuestionCountEnum` (5/10/20)
- `AVAILABLE_TOPICS` array (15 entries, mirrors SQL seed data)

### LLM Provider Abstraction (src/lib/llm/)

| File | Role |
|------|------|
| `types.ts` | `LLMProvider` interface + `QuestionGenerationParams` type |
| `prompts.ts` | `buildQuestionPrompt()` with versioning (PROMPT_VERSION=v1.0) |
| `claude.ts` | `ClaudeProvider` — claude-opus-4-6, streaming + non-streaming |
| `openai.ts` | `OpenAIProvider` — gpt-4o, streaming + non-streaming (fallback) |
| `index.ts` | `getLLMProvider()` factory — reads `VITE_DEFAULT_LLM_PROVIDER`, throws descriptive errors if API key missing |

## Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| @anthropic-ai/sdk | 0.77.0 | Claude API client |
| openai | 6.22.0 | OpenAI fallback client |
| react-hook-form | 7.71.1 | Quiz setup form state (Plan 02-02) |
| @hookform/resolvers | 5.2.2 | Zod resolver for React Hook Form |
| @tanstack/react-query | 5.90.21 | Server state for quiz sessions |
| @monaco-editor/react | 4.7.0 | Code editor for answers (Plan 02-04) |
| markdown-it | 14.1.1 | Markdown rendering for questions (Plan 02-04) |

## Key Design Decisions

### Why dangerouslyAllowBrowser: true

Both `@anthropic-ai/sdk` and `openai` packages detect browser environments and refuse to initialize without explicit opt-in. This is intentional — they warn that API keys in browser code are exposed in the bundle. For this project this is acceptable because:
1. The keys are scoped to question generation only (no billing-sensitive operations)
2. A proper production deployment would route through a backend proxy — this is a v1 decision

### Why topics has no RLS

`topics` is reference data seeded at migration time. All authenticated users need to read it for the quiz setup form. RLS would require a policy like `TO authenticated USING (true)` which adds overhead with zero security benefit. Tables with public read-only data do not need RLS.

### Prompt Versioning

`PROMPT_VERSION = 'v1.0'` is embedded in every LLM prompt payload. This enables:
- Tracing poor quality questions back to a specific prompt version
- A/B testing prompt iterations in future plans
- Auditing: if question quality degrades, the version tells you when the prompt changed

## Deviations from Plan

None — plan executed exactly as written. The SQL migration file name `002_quiz_schema.sql` follows the plan's specified naming convention (not timestamped like the first migration). This is intentional for readability.

## Manual Step Required

The SQL migration `supabase/migrations/002_quiz_schema.sql` must be applied manually:
1. Open Supabase Dashboard → SQL Editor → New query
2. Paste the contents of `002_quiz_schema.sql`
3. Click Run
4. Verify: quiz_sessions, quiz_questions, topics appear in Table Editor with 15 rows in topics

API keys must be set in `.env.local` before Plan 02-03 (question generation) runs:
- `VITE_ANTHROPIC_API_KEY=sk-ant-...` (from https://console.anthropic.com → API Keys)
- `VITE_OPENAI_API_KEY=sk-...` (optional fallback)
- `VITE_DEFAULT_LLM_PROVIDER=anthropic`

## Verification Results

- `npx tsc --noEmit` — PASS (zero errors)
- `npm run build` — PASS (402.45kB bundle, 92ms)
- getLLMProvider() throws descriptive error when API key missing — VERIFIED
- buildQuestionPrompt() includes PROMPT_VERSION and difficulty guide — VERIFIED
- .env.local covered by .gitignore — VERIFIED

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: Dependencies | 1697bd4 | Install 7 packages, update .env.example |
| Task 2: DB migration | 7f0b2e1 | SQL migration + database.ts extensions |
| Task 3: LLM layer | 4b6acd5 | All llm/* files + src/types/quiz.ts |
