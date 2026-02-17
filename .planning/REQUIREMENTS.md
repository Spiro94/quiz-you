# Requirements: Quiz You

**Defined:** 2026-02-17
**Core Value:** Developers can practice interviews in their spare time with realistic LLM-driven questions so they can be ready for any job interview or internal assessments at the company they're currently working at.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh (remember me)
- [ ] **AUTH-04**: User can log out from any page

### Quiz Setup & Configuration

- [ ] **SETUP-01**: User can select one or more programming languages/technologies from available list
- [ ] **SETUP-02**: User can select difficulty level (beginner, normal, advanced)
- [ ] **SETUP-03**: User can select one or more question types (coding problems, theoretical questions, or both)
- [ ] **SETUP-04**: User can select number of questions for session (5, 10, 20)
- [ ] **SETUP-05**: User can view and start a new quiz session

### Quiz Session Experience

- [ ] **QUIZ-01**: User sees one question at a time with clear formatting and context
- [ ] **QUIZ-02**: User can submit answer via text input (for theoretical questions) or code editor (for coding problems)
- [ ] **QUIZ-03**: User can skip a question (marked as 0% score, moves to next)
- [ ] **QUIZ-04**: User can navigate to next question after answer submission
- [ ] **QUIZ-05**: Quiz session displays progress indicator (e.g., "Question 3 of 10")
- [ ] **QUIZ-06**: Session shows which topics are covered in current quiz

### Answer Evaluation & Feedback

- [ ] **EVAL-01**: LLM evaluates user answer and provides a score (0-100)
- [ ] **EVAL-02**: LLM provides detailed feedback explaining what was correct and what to improve
- [ ] **EVAL-03**: LLM provides model/reference answer for user to learn from
- [ ] **EVAL-04**: User receives evaluation within reasonable time (<30 seconds)
- [ ] **EVAL-05**: Evaluation results are saved to user's history

### Quiz Completion

- [ ] **COMP-01**: Quiz session ends after all questions answered or skipped
- [ ] **COMP-02**: User sees session summary screen with final score
- [ ] **COMP-03**: Session summary shows score breakdown by topic
- [ ] **COMP-04**: Session summary provides recommendation for next difficulty level based on performance
- [ ] **COMP-05**: User can return to dashboard from session summary

### Dashboard & Session History

- [ ] **DASH-01**: User sees dashboard after login showing recent quiz sessions
- [ ] **DASH-02**: Dashboard displays list of past sessions with session date, topics, score, and duration
- [ ] **DASH-03**: User can view details of any past session (all questions, answers, feedback, scores)
- [ ] **DASH-04**: Dashboard shows per-topic accuracy breakdown (average score by technology/language)
- [ ] **DASH-05**: Dashboard shows performance trends and progress over time
- [ ] **DASH-06**: Dashboard recommends next quiz settings based on weak areas and recent performance
- [ ] **DASH-07**: User can filter/search session history by date or topic

### Data Persistence & Reliability

- [ ] **DATA-01**: All user sessions, answers, and scores are saved to database
- [ ] **DATA-02**: User data persists between sessions and browser visits
- [ ] **DATA-03**: Session history is accurate and complete (no missing answers or scores)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Quiz Features

- **ADVAN-01**: Adaptive difficulty toggle - questions get harder/easier based on performance within session
- **ADVAN-02**: Time limits per question with auto-submit on timeout
- **ADVAN-03**: Hints system - LLM provides hints if user stuck for N seconds
- **ADVAN-04**: Question tagging with interview patterns (e.g., "array manipulation", "tree traversal", "API design")

### User Engagement

- **ENGAGE-01**: Streak counter - track consecutive days of practice
- **ENGAGE-02**: Progress notifications - email when user completes milestones
- **ENGAGE-03**: Suggested quiz paths - curated series of quizzes to follow

### Additional Authentication

- **AUTH-05**: OAuth login (Google, GitHub)
- **AUTH-06**: Email verification on signup
- **AUTH-07**: Password reset flow via email link

### Mobile & Platform

- **MOBILE-01**: Native mobile app (iOS/Android)
- **MOBILE-02**: Offline mode - cache questions and allow practice without connection

### Content & Analytics

- **CONTENT-01**: Video explanations for questions (generated or curated)
- **CONTENT-02**: Community discussions on questions/solutions
- **ANALYTICS-01**: Company dashboard - teams can view member progress
- **ANALYTICS-02**: Interview success correlation - track if users who practice improve real interview outcomes

### Advanced Features

- **SOCIAL-01**: Leaderboards and comparison with peers
- **SOCIAL-02**: Share quiz results via link
- **FEEDBACK-01**: User appeal system - flag incorrect evaluations for manual review
- **FEEDBACK-02**: Real human mock interviews integration (partner with Pramp/Interviewing.io)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Video explanations in v1 | Too expensive to produce (manual labor or high-quality video generation); defer to v2 when user base validates feature value |
| Native mobile apps in v1 | Responsive web design covers 80% of use cases; mobile-first strategy adds 3-4 weeks to MVP; web app can drive adoption first |
| Real-time mock interviews with humans | Operational complexity (scheduling, quality control); focus on AI-driven practice first, add human interaction later |
| Leaderboards and social comparison | Premature for v1 user base; privacy concerns; focus on individual improvement first; revisit at 1000+ users |
| OAuth authentication in v1 | Email/password simpler to implement and secure; OAuth adds complexity; can add later if needed |
| Code execution/test cases in v1 | Requires sandbox infrastructure (Judge0, VM); LLM-based code review sufficient for MVP; add execution once evaluation stability proven |
| Custom/private question banks for v1 | Enterprise feature; focus on platform questions first; revisit for team/company plans |
| Interview scenario simulation | Requires video/audio recording, real-time interaction; MVP focuses on async practice; add in future |
| Spaced repetition scheduling | Advanced learning science feature; basic session history sufficient for v1; add after user behavior data collected |
| Integration with job boards | Out of scope for MVP; partnership/API integration can come after v1 validation |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| SETUP-01 | Phase 2 | Pending |
| SETUP-02 | Phase 2 | Pending |
| SETUP-03 | Phase 2 | Pending |
| SETUP-04 | Phase 2 | Pending |
| SETUP-05 | Phase 2 | Pending |
| QUIZ-01 | Phase 2 | Pending |
| QUIZ-02 | Phase 2 | Pending |
| QUIZ-03 | Phase 2 | Pending |
| QUIZ-05 | Phase 2 | Pending |
| QUIZ-06 | Phase 2 | Pending |
| QUIZ-04 | Phase 3 | Pending |
| EVAL-01 | Phase 3 | Pending |
| EVAL-02 | Phase 3 | Pending |
| EVAL-03 | Phase 3 | Pending |
| EVAL-04 | Phase 3 | Pending |
| EVAL-05 | Phase 3 | Pending |
| COMP-01 | Phase 3 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| COMP-02 | Phase 4 | Pending |
| COMP-03 | Phase 4 | Pending |
| COMP-04 | Phase 4 | Pending |
| COMP-05 | Phase 4 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| DASH-05 | Phase 4 | Pending |
| DASH-06 | Phase 4 | Pending |
| DASH-07 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

Phase breakdown:
- Phase 1: 5 requirements (AUTH-01 to AUTH-04, DATA-02)
- Phase 2: 10 requirements (SETUP-01 to SETUP-05, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-05, QUIZ-06)
- Phase 3: 9 requirements (QUIZ-04, EVAL-01 to EVAL-05, COMP-01, DATA-01, DATA-03)
- Phase 4: 11 requirements (COMP-02 to COMP-05, DASH-01 to DASH-07)

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after roadmap creation — traceability finalized*
