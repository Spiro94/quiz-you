# Research Summary: Quiz You

**Synthesis Date:** February 17, 2026
**Status:** Ready for requirements and roadmap development

---

## Executive Summary

Quiz You is an LLM-powered interview prep platform targeting software engineers preparing for technical interviews (coding, behavioral, system design). The core differentiator is **dynamic question generation via Claude/GPT** instead of static question banks, enabling unlimited variety and topic customization. This is a **high-risk/high-reward** approach: execution risk is significant (LLM quality consistency, evaluation reliability), but the market opportunity is substantial (interview prep is a $500M+ market, fragmented by platform).

The recommended approach is a **lean MVP (4 weeks, 5 phases)** validating core assumptions: (1) Can we generate quality questions consistently? (2) Will users trust AI-based scoring? (3) Can we sustain unit economics (<$0.50 LLM cost per session)? The tech stack is modern and proven (React/Vite, Supabase, OpenAI/Claude), but success hinges on **ruthless execution discipline**—every pitfall identified in research will manifest if not actively managed.

**Key Risk:** Evaluation reliability is the single point of failure. If users feel scoring is unfair or feedback is unhelpful, adoption stalls regardless of question quality.

---

## Technology Stack

### Recommended Core Technologies

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Frontend** | React 18 + Vite | Latest | Fast dev loop, minimal bundle, TypeScript native |
| **State** | Zustand 4.4+ | Latest | Streaming-friendly (no re-render overhead), low boilerplate |
| **Styling** | Tailwind CSS | Latest | Utility-first, responsive design, rapid UI iteration |
| **Code Editor** | Monaco Editor | Latest | Industry standard, supports 50+ languages, reliable |
| **Database** | Supabase (PostgreSQL) | Latest | Integrated auth + DB, real-time subscriptions, audit-friendly schema |
| **LLM - Primary** | Claude 3.5 (Anthropic) | Latest | Superior reasoning, excellent feedback quality, partnership advantage |
| **LLM - Fallback** | GPT-4/GPT-4o (OpenAI) | Latest | Mature streaming, function calling, redundancy |
| **SDK Strategy** | Direct SDK usage | @anthropic-ai/sdk ^0.27, openai ^1.50 | Avoid LangChain overhead in MVP; add if multi-step workflows needed |
| **Response Parsing** | Zod | ^3.23 | Type-safe schema validation for LLM JSON responses |
| **Streaming** | Vercel AI library | ^3.4 | Unified interface across LLM providers, handles streaming complexity |
| **Token Counting** | js-tiktoken | ^1.0.14 | Cost estimation before API calls, prevent surprise bills |
| **Caching** | TanStack Query | ^5.50 (optional v2) | Reduce API calls, background polling for eval status |
| **Hosting** | Vercel (frontend) + Edge Functions | Latest | Integrated Next.js support, serverless scale, built-in monitoring |
| **Code Execution** | Piston API or LLM-only | Latest | Sandboxed execution for coding problems (or defer to v1.1 with LLM judgment) |

### Stack Reasoning

**Why OpenAI + Anthropic?**
- **Redundancy**: If one provider has issues, fallback to other (critical for user-facing service)
- **Best-of-breed**: Claude excels at detailed reasoning/feedback (critical for interview prep). OpenAI excels at consistency and cost.
- **Avoid lock-in**: Direct SDK usage allows provider switching without refactoring

**Why not LangChain for MVP?**
- Adds 50+ KB to bundle (impacts first load)
- Overkill for simple question generation + evaluation
- Add only when multi-step agent workflows needed (later phases)

**Why Zustand over Redux?**
- Streaming updates (token-by-token feedback) trigger frequent state changes
- Zustand's subscription model only re-renders affected components (Redux re-renders entire tree)
- Bundle size: ~2KB vs Redux's ecosystem (15+KB)

**Why server-side streaming?**
- Security: API keys stay on backend, not exposed to client
- Cost control: Rate limiting and quota enforcement possible
- Audit trail: All LLM calls logged for cost tracking and quality analysis

### Key Dependencies & Constraints

- **LLM API latency**: 20-60 seconds per question/evaluation → Must stream results to avoid perceived app freeze
- **Token usage**: Unbounded if not managed → Implement per-session cost limits ($0.50-1.00 hard cap)
- **Context window**: 100K+ tokens (Claude) → Stateless evaluation critical (no conversation accumulation)

---

## Feature Framework

### Table Stakes (MVP Required)

These features must ship or users abandon the app:

| Feature | Complexity | Notes |
|---------|-----------|-------|
| **Question generation (LLM)** | Medium | Core differentiator; quality gate required before display |
| **Topic + difficulty selection** | Low | Users need control (no one-size-fits-all) |
| **Text/code input for answers** | Low | Text area + Monaco editor |
| **Answer evaluation (LLM-based)** | Medium | **Critical risk area** — inconsistent scoring kills trust |
| **Feedback display** | Medium | Must be concise (<300 tokens), actionable, include model answer |
| **Session history** | Low | Users abandon if progress isn't tracked |
| **Per-topic accuracy breakdown** | Low | High-value for small lift (1-2 days) |
| **Progress visualization** | Low | Dashboard with topic accuracy breakdown |

### Competitive Differentiators

| Feature | Why it matters | Effort | v1 or v2 |
|---------|-------------|--------|----------|
| **LLM-generated questions** | Unlimited variety vs LeetCode's 1,400 static questions | Built-in | v1 |
| **Adaptive difficulty** | Personalized challenge escalation (e.g., 85%+ → harder) | Medium | v1.1 |
| **Hybrid evaluation** | Test cases (for correctness) + LLM (for approach quality) | High | v1.1+ |
| **Structured feedback** | Clear "What was correct / Missing / How to improve" format | Medium | v1 |
| **Per-topic weak area identification** | "You struggled with recursion 3x; try easier variant" | Low | v1 |
| **Interview pattern taxonomy** | "Two Pointers," "Sliding Window," "Graph BFS" grouping | Medium | v1.1 |
| **Timed mode** | Simulate real interview pressure | Medium | v1.1 |
| **Real mock interviews** | Live person-to-person feedback (Pramp integration) | Very High | v2+ |

### Features to Defer (Anti-Features)

**Explicitly NOT in v1:**
- Native mobile apps (web responsive covers 80%, ROI not justified)
- Video explanations (1-2 hours production per question, expensive)
- Social/leaderboards (need 1000+ users to feel real, can demotivate)
- Spaced repetition (useful but not critical for short-term interview prep)
- Enterprise features (premature before B2C product-market fit)
- IDE plugins (smaller user base doesn't justify)

**These can be v1.1+ based on user demand.**

### Implementation Complexity

**Low (v1 scope, 1-2 days each):**
- Session history, basic progress tracking, per-topic accuracy

**Medium (v1 scope, 3-5 days each):**
- Question generation (needs quality gates + testing)
- Answer evaluation (needs multi-step validation)
- Adaptive difficulty logic
- Structured feedback format

**High (defer to v1.1+):**
- Test case execution (security/reliability)
- Interview pattern taxonomy (requires stable question volume)
- Hints/progressive disclosure (UX complexity)
- Analytics dashboard (post-validation feature)

---

## System Architecture

### Component Breakdown

**Frontend:**
- `QuizContainer` — Orchestrates session state, question flow
- `QuestionDisplay` — Renders question with syntax highlighting
- `AnswerInput` — Text area + Monaco editor for user responses
- `FeedbackDisplay` — Score, feedback, model answer
- `Dashboard` — Session history, progress metrics
- `QuizSetup` — Topic/difficulty/type selectors

**Backend Services:**
- `SessionService` — Create, update, retrieve sessions
- `QuestionGeneratorService` — LLM-driven question creation with validation
- `AnswerEvaluatorService` — LLM-driven assessment with rubric checking
- `ProgressService` — Analytics, weak area identification, recommendations
- `LLMProviderFactory` — Abstract Claude/OpenAI with fallback strategy

**Database (Supabase PostgreSQL):**
- `users` — Auth, preferences
- `sessions` — Quiz metadata, status, final score
- `questions` — Generated questions (immutable, logged for auditing)
- `answers` — User responses (immutable once submitted)
- `evaluations` — LLM scores, feedback (linked to answers)
- `session_summaries` — Denormalized metrics for fast dashboard queries

### Data Flow (Happy Path)

```
1. User selects topic (JavaScript), difficulty (medium), type (coding)
2. Backend creates session (status=generating_questions)
3. LLM generates Q1 → validated → stored → displayed
4. User enters answer → backend stores immediately (before evaluation)
5. Backend evaluates answer (streaming feedback to client)
6. Client displays: score + feedback + model answer
7. Backend generates Q2 while user reads feedback [non-blocking]
8. Loop until all questions answered or user exits
9. Session marked complete, summary calculated
```

**Critical:** Save answer immediately after submission (don't wait for LLM evaluation). Async evaluation prevents session loss on timeout.

### Build Dependencies (Critical Path)

**Phase 1 (Week 1): Auth Foundation**
- Supabase setup, users table, auth UI
- Deliverable: Users can sign up and log in

**Phase 2 (Week 2): Question Generation**
- Sessions/questions schema, LLM integration, quiz setup form
- Generate first question on-demand
- Deliverable: Users see LLM-generated questions

**Phase 3 (Week 3): Answer Evaluation**
- Answers/evaluations schema, answer input UI, evaluation service
- LLM-based scoring with rubric
- Deliverable: Users answer questions and get feedback

**Phase 4 (Week 4): Dashboard & Analytics**
- Session completion, summary screen, history view
- Progress metrics, weak area identification
- Deliverable: Users see session history and metrics

**Phase 5 (Week 5+): Polish**
- Error handling, loading states, mobile responsiveness
- Cost tracking, performance optimization

**MVP = Phases 1-3 (~3 weeks). Full feature set = Phases 1-4 (~4 weeks).**

### Streaming Strategy

Use **Server-Sent Events (SSE) + Streaming** for question generation and answer evaluation:

```
POST /api/generate-question → text/event-stream
Event 1: data: {"type":"question_text","data":"Write a function..."}
Event 2: data: {"type":"question_text","data":" that reverses..."}
...
Event N: data: {"type":"complete"}

Client receives tokens in real-time, renders progressively.
```

**Trade-off:** More complex than polling, but much better UX (user sees feedback in 1-2s vs 30+s).

### Scalability Constraints

| Bottleneck | Solution |
|-----------|----------|
| LLM latency (20-60s/question) | Batch generation or on-demand streaming |
| LLM cost ($0.10-0.50/eval) | Caching, prompt optimization, per-user limits |
| Context window degradation | Stateless evaluation (fresh context per answer) |
| Concurrent users | Supabase connection pooling, async evaluation queue |

**Cost estimate:** ~$0.50-1.00 per user per session. At 1,000 users = $500-1,000/month LLM cost.

---

## Critical Risks & Mitigation

### Top 5 Pitfalls (By Impact)

#### 1. **Inconsistent Question Quality** (HIGH RISK)
**Problem:** Questions vary wildly in difficulty despite identical settings. Users get "unfair" easy/hard questions, score seems random.

**Prevention:**
- Strong versioned prompt (v1.0, v1.1, etc.) with 3-5 exemplar questions per difficulty level
- Strict schema validation before returning question to user
- Difficulty calibration: reject questions that don't match stated difficulty
- Spot-check samples manually (audit log, track over time)
- A/B test prompts before rollout

**Phase:** Question Generation (Week 2)
**Confidence:** HIGH (well-documented LLM prompt engineering patterns)

#### 2. **False Positive & False Negative Scoring** (HIGH RISK)
**Problem:** LLM marks correct answers wrong (false negative) or wrong answers correct (false positive). Users distrust scoring system, feel unfairly graded.

**Prevention:**
- Multi-step evaluation: (1) LLM initial score, (2) schema validation, (3) cross-check against rubric
- Explicit scoring rubric in prompt with point allocation per concept
- For coding: use test cases (automated), not just LLM judgment
- Require LLM to cite which answer parts were correct/incorrect
- Include negative examples in eval prompt ("These would be WRONG: [examples]")
- User feedback loop: allow disputing scores, monthly audits of 100 random evals
- For partial credit: cap at 50-60%, never 100% for incomplete answer

**Phase:** Answer Evaluation (Week 3)
**Confidence:** MEDIUM (LLM evaluation is inherently subjective; test cases help but require problem design)

#### 3. **Unbounded LLM API Costs** (HIGH RISK)
**Problem:** API bill spikes unexpectedly. Per-user cost exceeds revenue, service becomes economically unviable.

**Prevention:**
- Hard cap on per-session cost ($0.50-1.00 absolute maximum)
- Prompt optimization: remove examples, use few-shot instead of zero-shot
- Cache generated questions (don't regenerate same topic/difficulty/type combos)
- Batch operations: generate 5 questions in one call instead of 5 separate
- Use cheaper models for non-critical tasks (e.g., gpt-3.5-turbo for initial validation)
- Monitor cost per session, alert if >$2, track per-user monthly spend

**Phase:** Design (Weeks 2-3 implementation)
**Confidence:** HIGH (token counting and cost tracking are standard practices)

#### 4. **Session Loss or Incomplete Data** (HIGH RISK)
**Problem:** User's session is lost due to connection issues or browser crash. User loses progress and trust.

**Prevention:**
- Save answer immediately after submission (don't wait for LLM evaluation)
- Persist session state to local storage as backup
- Implement "resume session" feature for interrupted sessions
- For critical operations, use optimistic UI + server confirmation
- Atomic writes: entire answer package or nothing
- Session timeout: auto-save state after 30 min inactivity
- Log all state changes server-side for debugging

**Phase:** Throughout (Answer Submission, Session Management)
**Confidence:** HIGH (standard SPA best practices)

#### 5. **Context Window Degradation** (MEDIUM RISK)
**Problem:** As user progresses through many questions in one session, conversation context grows. Later questions/evaluations degrade in quality.

**Prevention:**
- Use stateless evaluation: evaluate each answer independently with fresh context (no conversation history)
- Don't accumulate session conversation; create new context for each Q&A pair
- Monitor token count per request, reject if >70% of model limit
- Consider session breaks: after 10 questions, reset context, show progress page
- Cache system prompts to reduce redundant tokens

**Phase:** Answer Evaluation (Week 3)
**Confidence:** HIGH (stateless design is standard for scalable systems)

### Risk Roadmap

| Phase | Critical Pitfall | Mitigation | Go/No-Go |
|-------|-----------------|-----------|----------|
| **Week 2 (Q Gen)** | Inconsistent question quality | Versioned prompts + validation + spot-checks | Ship only if <20% quality fail rate |
| **Week 3 (Eval)** | False pos/neg scoring | Multi-step eval + rubric + test cases | Ship only if >85% eval accuracy on test suite |
| **Week 3 (Eval)** | Context degradation | Stateless design, fresh context per answer | Ship with monitoring (flag if degradation detected) |
| **Throughout** | Unbounded costs | Per-session cap + prompt optimization | Track cost per session daily |
| **Throughout** | Session loss | Atomic writes + local backup + resumption | Implement before beta |

---

## Implementation Timeline

### MVP: 3 Weeks (Phases 1-3)

**Week 1: Authentication & Foundation**
- Supabase project setup, users table, RLS policies
- LoginForm, SignupForm, AuthContext
- Protected routes, dashboard stub
- **Deliverable:** Users can sign up and log in

**Week 2: Question Generation**
- Sessions/questions schema with indexes
- LLM provider abstraction (Claude + OpenAI)
- Prompt engineering (generation + validation)
- Quiz setup form (topic/difficulty/type selectors)
- POST /api/sessions endpoint → generates first question
- QuestionDisplay component with streaming
- **Deliverable:** Users see LLM-generated questions
- **Quality gate:** <20% malformed questions, <5% off-difficulty questions

**Week 3: Answer Evaluation**
- Answers/evaluations schema
- AnswerInput (text + Monaco editor)
- POST /api/evaluate endpoint with streaming evaluation
- Multi-step evaluation (LLM + schema validation)
- FeedbackDisplay component
- Quiz session loop (next question flow)
- **Deliverable:** Users answer questions and receive feedback
- **Quality gate:** >85% evaluation accuracy on test cases

**MVP Release:** End of Week 3 (~21 days)

### Full Feature Set: 4 Weeks (Phases 1-4)

**Week 4: Dashboard & Analytics**
- Session completion flow, summary calculation
- SessionSummary component (final score, topic breakdown)
- SessionsList component (history, pagination)
- ProgressOverview (per-topic accuracy, weak areas)
- SessionDetail (review past sessions)
- Difficulty progression recommendations
- **Deliverable:** Users see complete session history and metrics

**Phase 5 (Week 5+): Polish & Optimization**
- Error handling and retry logic
- Loading states, skeleton screens, animations
- Mobile responsiveness (responsive design, NOT native app)
- Cost tracking dashboard
- Performance optimization (query indexing, caching)
- User onboarding (first-time flow)
- Settings page (LLM provider switching)

### Effort Estimates

| Component | Effort | Critical Path |
|-----------|--------|----------------|
| Auth + Supabase setup | 2 days | Yes |
| LLM integration + prompts | 3 days | Yes |
| Question generation | 3 days | Yes |
| Answer evaluation | 4 days | Yes |
| Quiz session orchestration | 2 days | Yes |
| Dashboard + analytics | 3 days | No (can defer) |
| Error handling + resilience | 3 days | No |
| UI polish | 3 days | No |
| **Total** | **23 days** | **15 days to MVP** |

**Critical path to MVP: 3 weeks (15-18 days active work).**

---

## Success Metrics

### Launch Validation (First 100 Users)

| Metric | Target | Why |
|--------|--------|-----|
| **Question Quality Score** | >80% "accurate to difficulty" | Directly impacts trust |
| **Evaluation Accuracy** | >85% on test suite | Users must trust scoring |
| **Session Completion Rate** | >60% (finish 8+ questions) | Engagement baseline |
| **Return Rate** | >40% (return within 7 days) | Product-market signal |
| **Cost per Session** | <$1.00 | Economics viability |
| **Feedback Helpfulness** | >70% find feedback actionable | Learning outcome |
| **User Trust Score** | >4/5 (survey) | Adoption blocker |

### Scaling Validation (100-1000 Users)

| Metric | Target | Phase |
|--------|--------|-------|
| Weak area accuracy | >80% correctly identified | Week 4 (analytics) |
| Adaptive difficulty adoption | >30% enable toggle | v1.1 |
| Session data corruption | 0% (audit trail) | Week 3-4 |
| Average response time | <10s (95th percentile) | Week 4+ (optimization) |

### Business Metrics

- **Cost per user per month:** $0.20-0.50 (LLM only)
- **Revenue per user (if $10/mo subscription):** $10
- **Gross margin:** 95%+ (before infrastructure)
- **Payback period:** 1-2 months per user

---

## Research Quality & Gaps

### Confidence Levels

| Area | Confidence | Basis |
|------|-----------|--------|
| **Stack choices** | HIGH | Proven technologies, industry standard patterns |
| **Feature prioritization** | HIGH | Detailed competitive analysis, LeetCode/Pramp comparison |
| **Architecture** | MEDIUM-HIGH | Clear component boundaries, standard patterns, but LLM integration specifics (prompts, quality gates) require testing |
| **Pitfalls** | HIGH | Well-documented LLM failure modes, interview prep domain knowledge |
| **Timeline** | MEDIUM | Optimistic (assumes no major LLM quality issues). Actual time depends on evaluation accuracy bottleneck. |
| **Economics** | MEDIUM | Cost estimates based on current API pricing; LLM provider pricing may shift |

### Known Gaps & Unknowns

1. **Evaluation reliability is assumed, not proven.** The biggest unknown: Can an LLM accurately score interview answers? Will users trust AI grading? This needs early validation (Week 3 quality gate).

2. **Prompt engineering is bespoke.** No two domains require identical prompts. Quiz You's generation/evaluation prompts will need 2-4 weeks of iteration to stabilize (A/B testing, user feedback).

3. **Mobile experience:** Research assumes responsive design is sufficient, but engagement data could justify native app. Monitor after Week 4 launch.

4. **Long-term cost sustainability:** At $0.50/session with current LLM pricing, the economics work for B2C ($10/month subscription). If pricing changes or usage patterns shift, this becomes critical.

5. **User demand for adaptive difficulty / timed mode:** Deferred to v1.1, but unclear if these are "nice to have" or "must have" for product-market fit.

### What Needs Validation During Implementation

- [ ] **Week 2:** Can question generation quality gates catch 95%+ of bad questions?
- [ ] **Week 3:** Can LLM evaluation accuracy exceed 85% on diverse question types?
- [ ] **Week 4:** Do users report scoring feels fair? (NPS survey with 50+ users)
- [ ] **Week 4:** Do weak area recommendations actually help users improve?
- [ ] **After launch:** What's the cost per session in production (vs. estimates)?

---

## Dependency & Blocking Issues

### External Dependencies

- **LLM API availability:** Anthropic Claude + OpenAI (both required for redundancy)
- **Supabase (Auth + Database):** Managed service, minimal risk
- **Monaco Editor:** Open source, stable, no licensing concerns

### Internal Dependencies (Critical Path)

```
Phase 1 (Auth) → Phase 2 (Questions) → Phase 3 (Eval) → Phase 4 (Dashboard)
```

**No parallel work possible on critical path.** Polish (Phase 5) can run in parallel after Phase 3.

### Blocking Risks

- **If LLM evaluation accuracy <70%:** Feature is unshipable. Fallback to manual review or LeetCode-style test cases only (requires significant redesign).
- **If question quality <60%:** Users abandon. Requires prompt redesign + retraining (1-2 week delay).
- **If cost per session >$1.50:** Economics don't work. Requires batch generation or cheaper model switch (impacts latency/quality).

---

## Recommendations for Roadmapper

### Phase Strategy

1. **Execute Phases 1-3 in strict 3-week timeline** (MVP validation)
2. **Build monitoring and quality gates into Week 2-3** (don't wait for user feedback to discover issues)
3. **Phase 4 (dashboard) is optional for v1 if MVP validates** (features matter less than core scoring trust)
4. **Defer Phase 5 polish until after user validation** (responsive design covers 90% of needs)

### Risk Prioritization

1. **Evaluation reliability** (Week 3) — Make or break feature. Invest in multi-step validation + test suite.
2. **Question quality** (Week 2) — Second-order risk. Strong prompts + validation gates mitigate.
3. **Cost management** (Throughout) — Third-order. Implement per-session caps early, monitor daily.

### Success Criteria

- **Week 2:** >80% of generated questions pass quality validation
- **Week 3:** >85% of LLM evaluations match human review
- **Week 4:** Users report "fair" scoring (NPS >4/5)
- **Post-launch:** Cost per session <$0.75 actual (vs. $1.00 estimate)

---

## Sources

### Research Files Synthesized

1. **STACK.md** (2026-02-17)
   - LLM integration (OpenAI + Anthropic SDKs)
   - Frontend state (Zustand)
   - Database schema (Supabase PostgreSQL)
   - Streaming patterns (EventSource API)
   - Code execution (Judge0 or LLM-only)

2. **FEATURES.md** (2026-02-17)
   - Table stakes vs. differentiators
   - Competitive landscape (LeetCode, AlgoExpert, Pramp, etc.)
   - Feature complexity breakdown
   - Implementation priority (MVP scope)
   - User pain points (running out of questions, unfair feedback, etc.)

3. **ARCHITECTURE.md** (2026-02-17)
   - Component boundaries (frontend, backend services, LLM layer)
   - Data flow (question generation → evaluation → feedback)
   - Build dependencies (critical path 5 phases)
   - Scalability considerations (LLM latency, cost, concurrency)
   - Database schema (users, sessions, questions, answers, evaluations)

4. **PITFALLS.md** (2026-02-17)
   - LLM quality risks (inconsistency, degradation, context window)
   - Evaluation reliability (false positives, false negatives)
   - User experience failures (feedback quality, difficulty progression)
   - Data persistence (session loss, corruption)
   - Cost management (unbounded API spend)
   - Prevention strategies for each pitfall

### Key References

- **LeetCode model:** Manual curation, 1,400+ questions, community solutions
- **AlgoExpert model:** Curated paths, video explanations (expensive)
- **Pramp model:** Real person-to-person mock interviews
- **Interviewing.io model:** Expert-led feedback, premium pricing
- **Interview prep market:** ~$500M TAM, fragmented by platform (coding, behavioral, system design)

---

**Document Version:** 1.0
**Last Updated:** February 17, 2026
**Status:** Ready for Requirements Definition
**Next Step:** Orchestrator proceeds to `/gsd:requirements-definition`
