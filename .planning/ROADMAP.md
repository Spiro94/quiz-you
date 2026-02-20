# Roadmap: Quiz You

## Overview

Quiz You ships in four sequential phases, each delivering a complete, verifiable user capability. Phase 1 establishes the auth foundation and persistent identity. Phase 2 gives users the ability to configure and experience LLM-generated questions. Phase 3 closes the evaluation loop — users answer questions and receive scored feedback. Phase 4 surfaces the resulting history and analytics so users can measure progress and plan next sessions. Every v1 requirement maps to exactly one phase.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Authentication & Foundation** - Users can create accounts, log in, and see an empty dashboard (completed 2026-02-18)
- [x] **Phase 2: Quiz Setup & Question Generation** - Users can configure a session and see LLM-generated questions (completed 2026-02-19)
- [x] **Phase 3: Answer Evaluation & Scoring** - Users can answer questions and receive scored feedback with model answers (completed 2026-02-19)
- [ ] **Phase 4: Dashboard & Analytics** - Users can review session history, per-topic accuracy, and performance trends

## Phase Details

### Phase 1: Authentication & Foundation

**Goal**: Users have a persistent, secure identity and land on a dashboard that is ready to hold their data.

**Depends on**: Nothing (first phase)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, DATA-02

**Success Criteria** (what must be TRUE):
1. User can create an account with email and password and is redirected to the dashboard on success
2. User can log in with email and password and their session persists across browser refresh without re-authenticating
3. User can log out from any page and is immediately redirected to the login screen
4. User's identity and profile data survive across distinct browser visits (not just refreshes)

**Effort estimate**: 2 days

**Risk**: Low — Supabase auth is well-documented, no LLM dependency

**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Supabase project setup, users table schema, RLS policies, environment config
- [ ] 01-02-PLAN.md — Auth UI: Supabase client, AuthContext, SignupForm, LoginForm, LogoutButton, ProtectedRoute, router wiring
- [ ] 01-03-PLAN.md — Dashboard stub: authenticated landing page with DashboardHeader and empty-state copy

---

### Phase 2: Quiz Setup & Question Generation

**Goal**: Users can configure a quiz session by selecting topics, difficulty, question types, and count, then see one LLM-generated question at a time displayed with clear formatting.

**Depends on**: Phase 1

**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, SETUP-05, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-05, QUIZ-06

**Success Criteria** (what must be TRUE):
1. User can select one or more programming languages, a difficulty level, one or more question types, and a question count (5/10/20), then start a session
2. User sees one LLM-generated question at a time with clear formatting and the active topic list displayed
3. User can see a progress indicator showing current question number and total (e.g., "Question 2 of 10")
4. User can skip a question and the session advances to the next question (skipped marked as 0%)
5. User can enter an answer via text area (theoretical) or code editor (coding problems)

**Effort estimate**: 4 days (includes LLM prompt engineering and quality gate)

**Risk**: Medium — question quality consistency; apply versioned prompts and schema validation. Quality gate: less than 20% malformed or off-difficulty questions before shipping.

**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema (quiz_sessions, quiz_questions, topics tables + RLS), LLM provider abstraction (ClaudeProvider + OpenAIProvider factory)
- [ ] 02-02-PLAN.md — Quiz setup form (topic/difficulty/type/count selectors, Zod validation), session creation API (createQuizSession → Supabase insert)
- [ ] 02-03-PLAN.md — Question generation service (versioned prompt, Zod schema validation, difficulty gate, 3x retry), QuizContext and useQuestionGeneration hook
- [ ] 02-04-PLAN.md — Question display (markdown rendering, type/topic/difficulty badges), AnswerInput (Monaco editor + textarea), ProgressIndicator, TopicBadge, skip logic, human verification checkpoint

---

### Phase 3: Answer Evaluation & Scoring

**Goal**: Users can submit answers and immediately receive a score (0-100), detailed feedback, and a model answer from the LLM. Every answer and evaluation is saved atomically to the database.

**Depends on**: Phase 2

**Requirements**: QUIZ-04, EVAL-01, EVAL-02, EVAL-03, EVAL-04, EVAL-05, COMP-01, DATA-01, DATA-03

**Success Criteria** (what must be TRUE):
1. After submitting an answer, the user receives a score (0-100), detailed feedback on what was correct and what to improve, and a model/reference answer within 30 seconds
2. User can navigate to the next question after reading feedback, and the session loop continues until all questions are answered or skipped
3. The quiz session ends automatically after all questions are completed or skipped
4. All answers, scores, and evaluation results are saved to the database immediately after submission (before LLM evaluation completes), with no missing records
5. Session history is complete and accurate — no gaps in answers or scores after session ends

**Effort estimate**: 4 days (highest-risk phase — LLM evaluation accuracy is the make-or-break feature)

**Risk**: High — false positive/negative scoring undermines user trust. Mitigation: multi-step evaluation (LLM score + schema validation + rubric cross-check), stateless evaluation context per answer. Quality gate: greater than 85% evaluation accuracy on test suite before shipping.

**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — quiz_answers DB migration + TypeScript types + atomic persistence service (insertAnswer, updateAnswerEvaluation, completeQuizSession)
- [ ] 03-02-PLAN.md — G-Eval evaluation service (chain-of-thought scoring, stateless context, 30s timeout, exponential backoff retry, Zod validation, ClaudeProvider.evaluateAnswer)
- [ ] 03-03-PLAN.md — useAnswerEvaluation hook + EvaluationResult component (score/feedback/model answer) + QuizSession answer submission wiring
- [ ] 03-04-PLAN.md — Session completion (completeQuizSession on last question), skip persistence (quiz_answers status='skipped'), human verification checkpoint

---

### Phase 4: Dashboard & Analytics

**Goal**: Users can see their full session history, drill into any past session, view per-topic accuracy, track performance trends over time, and receive a recommended next difficulty level.

**Depends on**: Phase 3

**Requirements**: COMP-02, COMP-03, COMP-04, COMP-05, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07

**Success Criteria** (what must be TRUE):
1. After completing a quiz session, user sees a summary screen with final score, score breakdown by topic, and a recommended next difficulty level based on performance
2. User can return to the dashboard from the session summary screen
3. Dashboard shows a list of past sessions with date, topics covered, score, and duration for each
4. User can open any past session to review all questions, submitted answers, feedback, and scores
5. Dashboard shows per-topic accuracy breakdown, performance trends over time, weak-area recommendations for next quiz settings, and supports filtering or searching session history by date or topic

**Effort estimate**: 3 days

**Risk**: Low to medium — no LLM dependency; complexity is in query performance and data aggregation. Use session_summaries denormalized table for fast dashboard reads.

**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — session_summaries migration + SessionSummaryPage (COMP-02, COMP-03, COMP-04, COMP-05)
- [ ] 04-02-PLAN.md — Dashboard session history list with FilterBar and pagination (DASH-01, DASH-02, DASH-07)
- [ ] 04-03-PLAN.md — Session detail view with all Q/A/feedback (DASH-03)
- [ ] 04-04-PLAN.md — Analytics: per-topic accuracy, performance trends, weak-area recommendation + human verify (DASH-04, DASH-05, DASH-06)

---

## Coverage

**v1 Requirements: 35 total**

| Requirement | Phase | Description |
|-------------|-------|-------------|
| AUTH-01 | Phase 1 | User can create account with email and password |
| AUTH-02 | Phase 1 | User can log in with email and password |
| AUTH-03 | Phase 1 | User session persists across browser refresh |
| AUTH-04 | Phase 1 | User can log out from any page |
| DATA-02 | Phase 1 | User data persists between sessions and browser visits |
| SETUP-01 | Phase 2 | User can select programming languages/technologies |
| SETUP-02 | Phase 2 | User can select difficulty level |
| SETUP-03 | Phase 2 | User can select question types |
| SETUP-04 | Phase 2 | User can select number of questions (5, 10, 20) |
| SETUP-05 | Phase 2 | User can view and start a new quiz session |
| QUIZ-01 | Phase 2 | User sees one question at a time with clear formatting |
| QUIZ-02 | Phase 2 | User can submit answer via text input or code editor |
| QUIZ-03 | Phase 2 | User can skip a question (0% score, moves to next) |
| QUIZ-05 | Phase 2 | Quiz session displays progress indicator |
| QUIZ-06 | Phase 2 | Session shows which topics are covered in current quiz |
| QUIZ-04 | Phase 3 | User can navigate to next question after answer submission |
| EVAL-01 | Phase 3 | LLM evaluates answer and provides a score (0-100) |
| EVAL-02 | Phase 3 | LLM provides detailed feedback on correctness and improvement |
| EVAL-03 | Phase 3 | LLM provides model/reference answer |
| EVAL-04 | Phase 3 | User receives evaluation within 30 seconds |
| EVAL-05 | Phase 3 | Evaluation results are saved to user's history |
| COMP-01 | Phase 3 | Quiz session ends after all questions answered or skipped |
| DATA-01 | Phase 3 | All user sessions, answers, and scores are saved to database |
| DATA-03 | Phase 3 | Session history is accurate and complete |
| COMP-02 | Phase 4 | User sees session summary screen with final score |
| COMP-03 | Phase 4 | Session summary shows score breakdown by topic |
| COMP-04 | Phase 4 | Session summary provides next-difficulty recommendation |
| COMP-05 | Phase 4 | User can return to dashboard from session summary |
| DASH-01 | Phase 4 | User sees dashboard with recent quiz sessions after login |
| DASH-02 | Phase 4 | Dashboard displays past sessions with date, topics, score, duration |
| DASH-03 | Phase 4 | User can view details of any past session |
| DASH-04 | Phase 4 | Dashboard shows per-topic accuracy breakdown |
| DASH-05 | Phase 4 | Dashboard shows performance trends over time |
| DASH-06 | Phase 4 | Dashboard recommends next quiz settings based on weak areas |
| DASH-07 | Phase 4 | User can filter/search session history by date or topic |

**Mapped: 35/35 — 100% coverage. No orphans.**

Phase 1: 5 requirements
Phase 2: 10 requirements
Phase 3: 9 requirements
Phase 4: 11 requirements

---

## Critical Dependencies

```
Phase 1 (Auth) → Phase 2 (Question Gen) → Phase 3 (Evaluation) → Phase 4 (Dashboard)
```

No parallel work on the critical path. Each phase unblocks the next.

## Risk Mitigation Summary

| Phase | Key Risk | Mitigation | Go/No-Go Gate |
|-------|----------|-----------|----------------|
| Phase 2 | Inconsistent question quality | Versioned prompts, schema validation, spot-checks | < 20% malformed/off-difficulty questions |
| Phase 3 | False positive/negative scoring | Multi-step evaluation, rubric, stateless context | > 85% eval accuracy on test suite |
| Phase 3 | Session data loss | Atomic writes, save answer before LLM evaluation starts | 0% missing answers in test run |
| Phase 3 | Context window degradation | Stateless evaluation — fresh context per answer | Monitor token count per request |
| All phases | Unbounded LLM costs | Per-session hard cap ($0.50-1.00), prompt optimization | Track cost per session daily |

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication & Foundation | 0/3 | Complete    | 2026-02-18 |
| 2. Quiz Setup & Question Generation | 4/4 | Complete   | 2026-02-19 |
| 3. Answer Evaluation & Scoring | 4/4 | Complete    | 2026-02-19 |
| 4. Dashboard & Analytics | 3/4 | In progress | - |
