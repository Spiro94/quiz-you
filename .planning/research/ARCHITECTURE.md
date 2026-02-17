# Architecture Research: Interview Prep Tools

**Research date:** 2026-02-17

## Executive Summary

Interview prep tools require a distributed architecture balancing real-time user interactions with asynchronous LLM operations. This document outlines the architectural patterns, component boundaries, and data flow for Quiz You—a React-based technical interview practice platform powered by Supabase and LLMs.

---

## System Components

### Frontend Layer

#### Quiz Session UI
- **QuizContainer**: Main orchestrator for active quiz session
  - Tracks current question index, user responses, session metadata
  - Manages transition between question display and result/feedback views
  - Handles session state (in-progress, completed, abandoned)
- **QuestionDisplay**: Renders single question with formatting
  - Displays question text, code samples, context
  - Shows timer (if enabled), question progress (e.g., "5/10")
  - Supports markdown rendering for technical content
- **AnswerInput**: Accepts user responses
  - Text area for theoretical questions
  - Code editor (Monaco or Ace) for coding problems
  - Optional multi-language selection for code answers
- **FeedbackDisplay**: Shows evaluation results
  - LLM-generated feedback on answer quality
  - Model solution code comparison
  - Score breakdown and reasoning
  - Navigation to next question or session summary

#### Dashboard Layer
- **SessionsList**: Historical view of completed quizzes
  - Displays recent sessions (paginated, filterable by topic/date)
  - Shows session stats (score, duration, topics covered)
  - Links to detailed session review
- **ProgressOverview**: User performance metrics
  - Average scores by topic and difficulty
  - Topics mastered vs. needs work
  - Suggested next steps (harder difficulty, weak topics)
- **SessionDetail**: Deep dive into past session
  - All questions and answers with feedback
  - Score progression through session
  - Difficulty recommendations

#### Authentication UI
- **LoginForm**: Email/password authentication
  - Email validation, password requirements
  - Error handling (invalid credentials, account locked)
  - Password reset flow
- **SignupForm**: New account creation
  - Email verification (optional for v1)
  - Onboarding questionnaire (experience level, topics of interest)
  - Terms acceptance
- **ProfileSettings**: User preferences
  - LLM provider selection (Claude, OpenAI, etc.)
  - Difficulty preference defaults
  - Session preferences (code editor theme, language)

#### Quiz Setup Form
- **TopicSelector**: Multi-select programming languages/technologies
  - Autocomplete suggestions
  - Show skill level per topic (if tracked)
  - Save as favorite topic combinations
- **DifficultySelector**: Choose baseline difficulty
  - Radio buttons: Beginner, Normal, Advanced
  - Visual description of each level
  - Show average completion time per difficulty
- **QuestionTypeSelector**: Coding, theoretical, or mixed
  - Radio buttons for quiz composition
  - Explain differences between types
  - Show time estimates
- **AdaptiveDifficultyToggle**: Optional adaptive progression
  - Checkbox to enable/disable
  - Explain how it works
  - Show performance threshold for leveling up

### Backend Services

#### Session Management
- **SessionService**: CRUD operations on quiz sessions
  - Create new session with user selections (topics, difficulty, question types)
  - Update session state (question index, current score, status)
  - Retrieve session history for dashboard
  - Calculate session summary metrics
  - Mark sessions as complete

#### Question Generation Service
- **QuestionGeneratorService**: LLM-driven question creation
  - Accept session parameters (topics, difficulty, question type)
  - Stream or poll LLM for question generation
  - Parse and validate generated questions
  - Store generated questions in database (for reuse and analytics)
  - Handle retries on invalid LLM output
  - Support batch generation (all questions at session start vs. on-demand)

#### Answer Evaluation Service
- **AnswerEvaluatorService**: LLM-driven assessment
  - Accept question, user answer, and expected solution context
  - Stream or poll LLM for evaluation response
  - Parse evaluation output (score, feedback, model solution)
  - Validate score is in expected range (0-100)
  - Update session with evaluation results
  - Calculate adaptive difficulty recommendation

#### User Progress Tracking
- **ProgressService**: Analytics and insights
  - Calculate topic-specific performance metrics
  - Track difficulty progression per user
  - Identify weak areas (topics with < 60% average score)
  - Recommend next difficulty level based on session performance
  - Track learning trends (performance over time)

#### Data Persistence (Supabase)
- **Database Client**: Supabase connection management
  - Authentication state management
  - Secure user session tokens
  - Connection pooling
  - Error handling and retry logic

### LLM Integration Layer

#### LLM Provider Abstraction
- **LLMProviderFactory**: Returns configured provider instance
  - Support Claude (Anthropic), OpenAI, others
  - Read provider configuration from environment or user settings
  - Handle provider-specific API differences
- **BaseLLMProvider**: Abstract interface
  - `generateQuestion(topic, difficulty, type): Promise<Question>`
  - `evaluateAnswer(question, answer): Promise<Evaluation>`
  - `streamQuestion()` / `streamEvaluation()`: Streaming variants
- **ClaudeProvider**: Anthropic-specific implementation
  - Uses Claude API with structured output (JSON mode if available)
  - System prompt engineering for consistent question format
  - Streaming support for real-time feedback
- **OpenAIProvider**: OpenAI-specific implementation
  - Uses GPT-4/GPT-4o with function calling or JSON mode
  - Equivalent system prompt structure
  - Streaming support

#### LLM Prompt Engineering
- **QuestionPromptTemplate**: System + user prompt for generation
  - System: Role definition, output format, quality standards
  - User: Topic, difficulty, question type, format specification
  - Example: "Generate a medium-difficulty JavaScript coding problem about async/await"
- **EvaluationPromptTemplate**: System + user prompt for assessment
  - System: Evaluator role, scoring rubric, output format
  - User: Question, user answer, evaluation criteria
  - Example: "Score this answer 0-100. Provide feedback and a model solution"

---

## Data Flow

### Quiz Session Flow (Happy Path)

```
User → Login → Dashboard → Start Quiz
                ↓
           Select: Topics, Difficulty, Question Type
                ↓
           Trigger: Create Session (Backend)
                ↓
    Backend DB: Insert Session (status=generating_questions)
                ↓
      LLM Service: Generate First Question
                ↓
    Backend DB: Insert Question, Update Session (status=question_ready)
                ↓
         Frontend: Display Question
                ↓
            User: Enter Answer → Submit
                ↓
      LLM Service: Evaluate Answer (streaming feedback)
                ↓
    Backend DB: Insert Answer + Evaluation, Update Score
                ↓
         Frontend: Display Feedback + "Next Question" Button
                ↓
     [Loop: Generate → Display → Answer → Evaluate]
        Until: User quits OR session.questionsAnswered == session.totalQuestions
                ↓
    Backend DB: Mark Session Complete, Calculate Summary
                ↓
         Frontend: Show Quiz Summary (Score, Topic Breakdown, Next Steps)
                ↓
           User: View Dashboard or Start New Session
```

### Question Generation & Evaluation Flow

#### Generation Flow (Streaming)
```
Session Created (topics=["JavaScript"], difficulty="normal", type="coding")
                ↓
          QuestionGenerator.generate()
                ↓
     Invoke LLM with System + User Prompt
                ↓
      LLM Response Stream: "```json\n{question: ..., difficulty: ..., ..."
                ↓
     Parse JSON from Stream (line-by-line)
                ↓
   Validate Question Schema (title, description, difficulty, examples)
                ↓
         DB Insert: questions table
                ↓
    Return Question to Frontend
        (Can start streaming after first ~500ms)
```

#### Evaluation Flow (Streaming)
```
User Submits Answer for Question
                ↓
        EvaluatorService.evaluate()
                ↓
   Prepare Prompt: question text + user answer
                ↓
   Invoke LLM with System + User Prompt
                ↓
    LLM Response Stream: "score: 78, feedback: ..., model_solution: ..."
                ↓
   Parse Structured Response from Stream
                ↓
  Validate Score Range (0-100), Extract Feedback Text
                ↓
    DB Insert: answers + evaluations tables
                ↓
  Update Session Score + Check Adaptive Difficulty
                ↓
    Stream Parsed Feedback to Frontend
       (Visible within 1-2 seconds typically)
```

#### Generation Flow (Batch - Alternative)
```
Session Created
                ↓
   Generate ALL Questions Upfront (e.g., 10 questions)
                ↓
   Store in DB with status="generated"
                ↓
   Return Questions to Frontend
                ↓
   [Faster question display during session]
   [Trade-off: Higher latency at session start]
```

### Session Lifecycle

```
┌─────────────────┐
│ Session States  │
└─────────────────┘

[created] → [generating_questions] → [question_ready] → [in_progress]
                                          ↕
                                     (repeat per Q)
                                          ↓
                                      [user_answered]
                                          ↓
                                     [evaluating]
                                          ↓
                                      [evaluated]
                                          ↓
                                   [completed] or [abandoned]

Timestamps: created_at, started_at, last_activity_at, completed_at
```

---

## LLM Integration Pattern

### When to Call LLM

#### Question Generation
- **Trigger**: Session starts or user requests next question (on-demand mode)
- **Frequency**: Once per question (or once per session if batch mode)
- **Blocking**: Should not block session start; can show placeholder while generating
- **Fallback**: Pre-generated question bank for demo/offline mode (optional for v1)

#### Answer Evaluation
- **Trigger**: User submits answer via form
- **Frequency**: Once per answer
- **Blocking**: Should stream results to user; show "Evaluating..." state
- **Timeout**: Set reasonable timeout (e.g., 30 seconds) before fallback error message

#### Feedback Generation
- **Trigger**: Included in evaluation call
- **Frequency**: Once per evaluation (not separate call)
- **Format**: Structured output (JSON) to extract feedback, score, model solution

#### Difficulty Recommendation
- **Trigger**: End of session (optional, can defer to v1.1)
- **Frequency**: Once per completed session
- **Method**: Calculate from session metrics (average score, time per question)

### Streaming vs. Polling

#### Streaming (Recommended for Quiz Context)
**Advantages:**
- User sees feedback in real-time (1-2 second start, progressive display)
- Better UX: feels responsive, not stuck waiting
- Reduced backend state management (no polling endpoints needed)
- Cost savings: can show partial results without waiting for full response

**Implementation:**
```
POST /api/evaluate
Body: { questionId, answer }
Response: text/event-stream
Event 1: { type: "feedback", data: "The answer demonstrates..." }
Event 2: { type: "score", data: 78 }
Event 3: { type: "model_solution", data: "const correctAnswer = ..." }
Event 4: { type: "complete" }
```

**Trade-offs:**
- More complex to implement (requires ReadableStream on frontend)
- Harder to test (mock streaming)
- Network interruption mid-stream requires retry logic

#### Polling (Simpler but Less Ideal)
**Advantages:**
- Simpler implementation (standard REST)
- Easier testing and debugging
- Standard error handling

**Implementation:**
```
POST /api/evaluate → Returns 202 Accepted + jobId
GET /api/evaluate/{jobId} → Returns { status: "pending" | "complete", data: ... }
Client polls every 500ms until complete
```

**Trade-offs:**
- Latency: User waits 1+ seconds to see any feedback
- Higher server load: More requests for same work
- UX: Feels sluggish in practice

**Recommendation:** Use streaming for initial sessions; can add polling fallback for unsupported browsers or network conditions.

---

## Database Schema Overview

### Core Tables

#### `users`
- `id` (UUID, PK)
- `email` (string, unique, indexed)
- `password_hash` (string, Supabase handles)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `preferred_llm_provider` (string: "claude", "openai", etc.)
- `experience_level` (enum: "beginner", "intermediate", "advanced") — optional, for recommendations
- `favorite_topics` (JSON array) — optional, for quick session creation

#### `sessions`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `status` (enum: "in_progress", "completed", "abandoned")
- `created_at` (timestamp)
- `completed_at` (timestamp, nullable)
- `total_questions` (integer) — how many questions in this session
- `final_score` (decimal 0-100, nullable) — calculated after completion
- `metadata` (JSON: { topics: [], difficulty: "normal", question_types: [], adaptive_enabled: bool })

#### `questions`
- `id` (UUID, PK)
- `session_id` (UUID, FK → sessions)
- `question_index` (integer) — order in session (1, 2, 3...)
- `topic` (string, indexed) — e.g., "JavaScript async/await"
- `difficulty` (enum: "beginner", "normal", "advanced")
- `type` (enum: "coding", "theoretical", "mixed")
- `question_text` (text) — full question prompt
- `example_input` (text, nullable) — for coding questions
- `example_output` (text, nullable) — for coding questions
- `language` (string, nullable) — for code questions (JS, Python, etc.)
- `generated_by_llm` (string) — provider that generated ("claude", "gpt-4", etc.)
- `created_at` (timestamp)
- **Indexes**: (session_id, question_index), (topic, difficulty)

#### `answers`
- `id` (UUID, PK)
- `question_id` (UUID, FK → questions)
- `session_id` (UUID, FK → sessions) — denormalized for query performance
- `user_id` (UUID, FK → users) — denormalized
- `answer_text` (text) — user's response
- `submitted_at` (timestamp)
- `skipped` (boolean) — true if user clicked "Skip"
- **Indexes**: (session_id, submitted_at), (user_id, submitted_at)

#### `evaluations`
- `id` (UUID, PK)
- `answer_id` (UUID, FK → answers, unique)
- `score` (decimal 0-100)
- `feedback` (text) — LLM-generated feedback
- `model_solution` (text, nullable) — reference correct answer
- `evaluation_time_ms` (integer) — how long LLM took to evaluate
- `evaluated_by_llm` (string) — provider used
- `created_at` (timestamp)
- **Indexes**: (answer_id), (score for analytics)

#### `session_summaries` (Denormalized, Optional)
- `id` (UUID, PK)
- `session_id` (UUID, FK → sessions, unique)
- `user_id` (UUID, FK → users)
- `average_score` (decimal)
- `scores_by_topic` (JSON: { "JavaScript": 82, "Python": 76 })
- `completion_time_minutes` (integer)
- `recommended_next_difficulty` (enum) — calculated by algorithm
- `created_at` (timestamp)
- **Purpose**: Pre-computed summary for fast dashboard queries

### Schema Design Rationale

**Denormalization (session_id, user_id in answers/evaluations):**
- Avoids complex JOINs for common queries (all answers in a session)
- Trades storage for query performance (important for dashboard)

**Separations of concerns:**
- `answers` stores user input (immutable once submitted)
- `evaluations` stores LLM assessment (can be re-run on same answer if needed)
- Allows potential future feature: "Get another opinion" (re-evaluate with different LLM)

**LLM Provider Tracking:**
- `questions.generated_by_llm`, `evaluations.evaluated_by_llm`
- Enables analytics on question quality by provider
- Supports audit trail for pricing (if using pay-per-call model)

---

## Build Order Dependencies

### Phase 1: Foundation & Authentication (Week 1)
```
Priority: CRITICAL

1.1 Supabase Setup
    - Create Supabase project
    - Run migrations for: users table
    - Configure auth (email/password)
    - Set up RLS policies

1.2 Frontend Auth UI
    - Build LoginForm component
    - Build SignupForm component
    - Create AuthContext (React Context for current user)
    - Integrate Supabase Auth client
    - Protect routes (redirect unauthenticated to login)

1.3 Dashboard Stub
    - Create empty Dashboard component (placeholder)
    - Verify authenticated users can navigate to it

Deliverable: Users can sign up, log in, view empty dashboard
```

### Phase 2: Quiz Setup & Question Generation (Week 2)
```
Priority: CRITICAL

2.1 Database Schema
    - Create sessions, questions tables
    - Set up indexes for common queries
    - Configure RLS policies

2.2 LLM Integration Layer
    - Create LLMProvider interface (abstract)
    - Implement ClaudeProvider (or OpenAI, depending on preference)
    - Set up environment variables for LLM API keys
    - Test prompt templates locally

2.3 Quiz Setup UI
    - Build TopicSelector component
    - Build DifficultySelector component
    - Build QuestionTypeSelector component
    - Build AdaptiveDifficultyToggle (checkbox, can leave unchecked for v1)

2.4 QuestionGenerator Backend Service
    - Create API endpoint: POST /api/sessions → creates session, returns session ID
    - Implement QuestionGeneratorService
    - Call LLM to generate first question (streaming or polling)
    - Insert generated question into DB
    - Return question to frontend

2.5 QuestionDisplay Frontend
    - Build QuestionDisplay component
    - Connect to backend to fetch current question
    - Render question text, examples, code (with syntax highlighting)
    - Show question progress (e.g., "Question 1 of 10")

Deliverable: Users can start quiz, see questions (LLM-generated)
Blocking: Phase 1 must be complete
```

### Phase 3: Answer Submission & Evaluation (Week 3)
```
Priority: CRITICAL

3.1 Database Schema Extension
    - Create answers, evaluations tables
    - Add RLS policies

3.2 AnswerInput Component
    - Build text area for theoretical questions
    - Integrate code editor (Monaco or Ace) for coding problems
    - Handle form submission

3.3 Answer Evaluation Backend Service
    - Create API endpoint: POST /api/evaluate
    - Implement AnswerEvaluatorService
    - Call LLM to evaluate answer (streaming or polling)
    - Parse evaluation response (score, feedback, model solution)
    - Store in DB

3.4 FeedbackDisplay Component
    - Build feedback display (score, feedback text, model solution)
    - Handle "Next Question" navigation
    - Update session state

3.5 Quiz Session Orchestration
    - Implement question loop in QuizContainer
    - Fetch next question after evaluation
    - Keep session state in sync with backend

Deliverable: Users can answer questions, see evaluated feedback, navigate through quiz
Blocking: Phase 2 must be complete
```

### Phase 4: Session Summary & Dashboard (Week 4)
```
Priority: HIGH

4.1 Session Completion Flow
    - When all questions answered, mark session complete
    - Calculate summary stats (average score, scores by topic)
    - Store in session_summaries table

4.2 Quiz Summary Screen
    - Build SessionSummary component
    - Show final score, topic breakdown, difficulty progression
    - Display recommended next difficulty
    - Button to start new quiz or view history

4.3 Dashboard Implementation
    - Build SessionsList component (fetch all sessions for user)
    - Build ProgressOverview component (calculate metrics from session_summaries)
    - Pagination, filtering by date/topic
    - Link to SessionDetail view

4.4 Session Detail / Review
    - Build SessionDetail component
    - Show all questions + answers + evaluations from session
    - Allow scroll-through review

4.5 Analytics & Recommendations
    - Implement recommendation algorithm (boost difficulty if avg > 85%, reduce if < 60%)
    - Store recommendation in session_summaries

Deliverable: Users can see quiz history, performance metrics, receive recommendations
Blocking: Phase 3 must be complete
```

### Phase 5: Polish & Optimization (Week 5+)
```
Priority: MEDIUM

5.1 Error Handling & Resilience
    - Retry logic for LLM failures
    - Fallback: pre-generated question bank for demo
    - Network error recovery

5.2 Performance Optimization
    - Lazy-load dashboard (infinite scroll or pagination)
    - Cache questions (if using batch generation)
    - Optimize database queries (add indexes as needed)

5.3 UI Polish
    - Add loading states, spinners, skeleton screens
    - Improve responsive design (mobile-friendly)
    - Accessibility review (WCAG)

5.4 User Onboarding
    - First-time user flow (tips, tutorial)
    - Email verification (optional)

5.5 Provider Switching (Optional for v1)
    - Build settings page to switch LLM provider
    - Test with OpenAI, Claude, others
    - Store user preference in DB

Blocking: Phase 4 should be mostly complete
```

### Critical Path Summary
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
  (1w)    (1w)     (1w)     (1w)    (1w+)

Minimum Viable Product (MVP) = Phase 1 + 2 + 3
Time to MVP: ~3 weeks
Full feature set (Phase 4) = 4 weeks
Polish (Phase 5) = incremental, runs in parallel
```

---

## Scalability Considerations

### Question Generation
- **Bottleneck**: LLM API rate limits and latency (~20-30s per question with Claude)
- **Solution 1 (Batch)**: Generate all 10 questions at session start (higher upfront latency, ~5 min, but smooth session flow)
- **Solution 2 (On-demand)**: Generate question-by-question (lower latency to start, but user waits between questions)
- **Solution 3 (Pre-cache)**: Pre-generate common topic/difficulty/type combinations, serve from cache (highest performance, but storage cost)

### Answer Evaluation
- **Bottleneck**: LLM API rate limits (~$0.10-0.50 per evaluation depending on provider)
- **Solution**: Queue evaluations with rate limiting; show "Evaluation pending" state if backlogged
- **Cost**: At 1000 users x 10 evaluations/month = 10k evaluations = $1k-5k/month (estimate)

### Database Queries
- **Bottleneck**: Full-text search on question_text (large strings) for topic matching
- **Solution**: Add `topic` column (indexed) instead of searching question_text
- **Indexes**: Prioritize (session_id, question_index), (user_id, created_at), (topic, difficulty)

### Concurrent Users
- **Supabase connection pooling**: Default 100 connections; scale if >50 concurrent users
- **Frontend state**: Keep quiz state in-memory; periodically sync to backend (avoid constant updates)

### Costs
| Component | Estimated Cost | Notes |
|-----------|---|---|
| Supabase | $25-100/mo | Depends on data size, concurrent users |
| LLM (Claude) | $500-5k/mo | Scales with usage; batch generation reduces cost |
| Hosting (Vercel) | $20/mo | React frontend |
| **Total** | **~$600-5k/mo** | Dominated by LLM usage |

### Caching Strategy
- **Frontend**: Cache session state in-memory; persist to IndexedDB for offline resilience
- **Backend**: Cache generated questions in Supabase for 24h (avoid regenerating same topic/difficulty)
- **LLM Cache**: Use LLM provider's native caching (e.g., Claude prompt caching) for system prompts

---

## Key Architectural Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|-----------|
| **React + Vite** | Fast dev experience, modern tooling, small bundle size | Limited to browser runtime (no native mobile without RN/Flutter) |
| **Supabase (Auth + DB)** | Integrated auth + database reduces complexity; real-time subscriptions included | Vendor lock-in; limited to PostgreSQL; Supabase-specific RLS learning curve |
| **LLM Provider Abstraction** | Support Claude, OpenAI, others; switch without code changes | Extra abstraction layer; must handle provider API differences |
| **Streaming Evaluations** | Real-time feedback improves UX | More complex to implement; harder to test; network dependency |
| **On-demand Question Generation** | Lower session startup latency; questions feel fresh | User waits between questions (~20-30s); higher API cost |
| **Batch Question Generation (Alternative)** | Smooth session experience; lower per-question cost | Higher session startup latency (~5 min); predictable questions |
| **No Pre-generated Questions (v1)** | Ensures variety, aligns with "LLM-driven" value prop | Single point of failure if LLM API is down |
| **Client-side Answer Input (No Backend Validation)** | Simpler API, faster submission | Users could submit invalid JSON/code; handle gracefully |
| **Difficulty Progression Algorithm (Optional)** | Personalized challenge level increases engagement | Requires 3+ sessions of data; can feel patronizing if too aggressive |
| **Email/Password Auth Only (v1)** | Simple to implement; sufficient for MVP | Requires password reset flow; higher support burden |
| **Denormalized session_id in answers** | Fast queries for quiz session history | Data consistency burden (must keep in sync on deletes) |
| **Separate answers + evaluations Tables** | Allows re-evaluation on same answer; audit trail | Extra query; denormalization in schema |

---

## Implementation Roadmap

### Week 1: Auth & Session Foundation
- [ ] Supabase project setup
- [ ] Users table + RLS
- [ ] LoginForm, SignupForm components
- [ ] AuthContext provider
- [ ] Route protection

### Week 2: Question Generation
- [ ] Sessions, questions tables
- [ ] LLMProvider abstraction + ClaudeProvider
- [ ] Quiz setup form components
- [ ] POST /api/sessions endpoint
- [ ] Question generation backend service
- [ ] QuestionDisplay component
- [ ] First integration test (end-to-end quiz start)

### Week 3: Answer Evaluation
- [ ] Answers, evaluations tables
- [ ] AnswerInput component (text + code editor)
- [ ] POST /api/evaluate endpoint
- [ ] AnswerEvaluatorService
- [ ] FeedbackDisplay component
- [ ] Quiz loop + state management (next question flow)

### Week 4: Dashboard & Analytics
- [ ] Session completion flow
- [ ] SessionSummary component
- [ ] SessionsList component
- [ ] ProgressOverview + metrics calculation
- [ ] SessionDetail review view
- [ ] Difficulty recommendation algorithm

### Week 5+: Polish & Optimization
- [ ] Error handling + retries
- [ ] Loading states and skeleton screens
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Performance optimization (caching, indexing)
- [ ] Settings page (LLM provider switching)
- [ ] Pre-generated question fallback (if time permits)

---

## Deployment Checklist

- [ ] Environment variables configured (LLM API keys, Supabase URL, service role key)
- [ ] CORS configured (frontend origin whitelisted in Supabase)
- [ ] RLS policies reviewed and tested
- [ ] Database backups enabled (Supabase automatic)
- [ ] Error logging set up (Sentry, LogRocket, or Supabase logs)
- [ ] Frontend hosted (Vercel, Netlify, or static hosting)
- [ ] API routes deployed (Vercel functions, backend, or edge functions)
- [ ] LLM provider fallback configured (if using multiple providers)
- [ ] Performance monitoring (Vercel Analytics, Lighthouse CI)
- [ ] Security review: auth tokens, API keys, input validation

---

## Future Enhancements (v1.1+)

1. **Time Limits**: Add per-question timer; enforce submission timeout
2. **Hints System**: LLM-generated hints if user stuck for N seconds
3. **Code Sandbox**: Execute user code and compare output to expected (for coding problems)
4. **Social Features**: Share scores, compete with friends (privacy-aware)
5. **Mobile App**: React Native or Flutter wrapper
6. **Spaced Repetition**: Revisit weak areas based on learning science
7. **Interview Scenarios**: Simulate real interview (timed rounds, camera/mic record)
8. **Team Admin**: Companies manage team members, track progress
9. **Custom Questions**: Admins upload proprietary interview questions
10. **Analytics Dashboard**: Company-level metrics, hiring pipeline insights

---

## References & Best Practices

### Interview Prep Patterns
- **LeetCode/HackerRank model**: Question library + judge system
- **Pramp model**: Real person-to-person interviews (social, real-time)
- **Interviewing.io model**: Mock interviews with feedback
- **Quiz You blend**: LLM-generated questions + structured evaluation

### Streaming Best Practices
- Use `text/event-stream` MIME type
- Send heartbeat every 30s if no data (prevent timeout)
- Client-side implement exponential backoff on reconnect
- Gracefully degrade to polling if streaming unavailable

### LLM Structured Output
- Use JSON mode if available (Claude, GPT-4)
- Include JSON schema in prompt for clarity
- Parse incrementally during streaming
- Fallback: regex parsing if JSON parsing fails

### Database Performance
- Index on commonly filtered columns (topic, difficulty, user_id)
- Denormalize if join cost > replication cost
- Use Supabase's real-time subscriptions sparingly (can impact performance)
- Paginate results (don't fetch all sessions at once)

---

**Document Version:** 1.0
**Last Updated:** 2026-02-17
**Status:** Ready for implementation phase
