# Pitfalls Research: LLM-Powered Interview Prep

**Research date:** 2026-02-17

## LLM Quality & Consistency

### Pitfall: Inconsistent Question Quality Across Sessions
**Description:** Questions vary wildly in difficulty, clarity, and relevance despite identical settings. Users get vastly different question sets despite selecting the same parameters, leading to unfair scoring and frustration.

**Warning signs:**
- Questions at "beginner" level require advanced concepts
- Same difficulty settings produce wildly different question complexity week-to-week
- Questions are vague, unanswerable, or contain errors
- Question generation fails silently or produces malformed output
- Users report "unfair" questions that contradict stated difficulty

**Prevention:**
- Strong, versioned base prompt with 3-5 exemplar questions for each difficulty level
- Strict output validation against schema before returning to user
- Difficulty calibration metrics (token count, concept complexity, edge cases required)
- Reject and regenerate questions that fail validation
- Maintain a question audit log with difficulty scores
- A/B test prompts before rolling out to all users
- Prompt versioning in code (v1.0, v1.1, etc.) with change logs

**Phase to address:** Question Generation (before question shown to user)

**Related LLM concerns:**
- Model versions change behavior unexpectedly
- Temperature/sampling parameters affect consistency
- Prompt injection from user context data

---

### Pitfall: Poor Answer Evaluation and Scoring
**Description:** The LLM evaluates answers inconsistently, giving false negatives (correct answers marked wrong) or false positives (incorrect answers marked correct), making scores unreliable. Users distrust the scoring system or get unfair feedback.

**Warning signs:**
- User submits textbook-correct answer but gets 40% score with vague feedback
- Clearly wrong answers receive passing scores
- Same answer style scores differently depending on minor wording changes
- Feedback contradicts the score (e.g., "Great answer!" but 0% score)
- Users dispute scores but appeal system is absent or weak
- Pattern: coding questions scored harsher than theoretical ones

**Prevention:**
- Multi-step evaluation process: (1) initial LLM evaluation, (2) schema validation, (3) edge case detection
- Explicit scoring rubric in prompt with point allocation per concept
- Generate and include reference model answer in evaluation prompt
- Require LLM to cite which parts of the answer were correct/incorrect
- For coding questions: validate with test cases (automated), not just LLM judgment
- Implement confidence scoring: "I am 95% confident this is correct"
- User feedback loop: allow users to flag incorrect evaluations
- Monthly audits: sample 100 evaluations and manually review for accuracy
- Separate evaluator LLM from question generator for objectivity

**Phase to address:** Answer Evaluation (before feedback shown to user)

**Related LLM concerns:**
- LLM tends to be overly generous or overly harsh depending on prompt framing
- Context length can affect evaluation quality (longer conversations degrade)
- Model temperature affects consistency (too high = random, too low = biased)

---

### Pitfall: Prompt Drift and Degradation Over Time
**Description:** As features are added, special cases are handled in prompts, and prompts accumulate complexity and contradictions. Behavior becomes unpredictable, and old issues resurface with new features.

**Warning signs:**
- Prompt file has grown to 5000+ tokens with many "if/then" rules
- New features break existing behavior (e.g., adding time limits breaks difficulty progression)
- Special case handling scattered through codebase (not centralized)
- Changes to prompts make behavior worse, not better
- Hard to remember why specific prompt decisions were made
- Rolling back a prompt change is risky (unknown what it affects)

**Prevention:**
- Store prompts as versioned documents with semantic versioning (v1.0.0)
- Maintain a PROMPTS.md changelog documenting each version, why it changed, what it fixed
- Keep prompts <2000 tokens; break complex logic into multiple prompts
- Use a prompt testing framework: test prompts against fixed test cases before deployment
- Archive old prompts for comparison and rollback
- Document the "why" for each prompt decision in comments
- Regular prompt audits (monthly) to identify and eliminate redundant rules
- Central prompt configuration file, not scattered through code

**Phase to address:** Development (ongoing)

**Related LLM concerns:**
- Longer prompts = higher latency and cost
- Conflicting instructions in prompt confuse LLM
- Fine-tuning becomes harder with cluttered prompts

---

### Pitfall: Context Window Overflow in Long Sessions
**Description:** As users progress through many questions in one session, the conversation context grows. Later questions are evaluated using accumulated context, which degrades quality and consistency. Later questions may be influenced by earlier answers, leading to unfair scoring.

**Warning signs:**
- Questions later in session have worse quality than early questions
- Evaluation seems influenced by patterns in previous answers (e.g., if user answered Q1 poorly, Q8 is scored harsher)
- Cost per question increases through the session
- LLM starts repeating feedback from earlier questions
- Long sessions timeout or fail partway through

**Prevention:**
- Use stateless evaluation: evaluate each answer independently with fresh context
- Don't accumulate conversation history; create new conversation for each question/answer pair
- For progress feedback, send only summary metrics (score, topics covered), not full conversation
- Compress context between questions: "User has answered 4 questions, avg score 75%, topics: arrays, strings"
- Monitor token count per request and request, reject if it exceeds 70% of model limit
- Consider session breaks: after 10 questions, reset context and show progress page
- Cache system prompts and reuse to reduce redundant tokens

**Phase to address:** Answer Evaluation and Progress Tracking

**Related LLM concerns:**
- Most models have hard token limits (100K, 200K); exceeding causes failure
- Longer context = slower response and higher cost
- Later tokens in context have less influence on output (position bias)

---

## Answer Evaluation Reliability

### Pitfall: False Negatives - Penalizing Correct Answers
**Description:** The LLM marks a correct answer as wrong due to strict interpretation, minor wording differences, or failure to recognize equivalent solutions.

**Warning signs:**
- Common correct approaches are marked wrong (e.g., "You should use forEach, not map" when both are correct)
- Equivalent implementations in different styles are scored differently
- Answers that match industry best practices still get low scores
- Users report answers matching official documentation being marked wrong
- Pattern in which model (Claude vs GPT) tends to be harsher

**Prevention:**
- Provide multiple acceptable answer formats in the evaluation prompt
- For code questions, validate with automated test cases instead of LLM judgment alone
- Include "alternative solutions" section in model answer prompt
- Require LLM to evaluate against learning outcome, not syntax/style
- For ambiguous questions, accept multiple interpretations (document this)
- Use constrained output format: "Mark as CORRECT, PARTIAL, or INCORRECT with specific reason"
- User appeal mechanism: "I believe this is correct" → manual review within 24h

**Phase to address:** Answer Evaluation (before scoring)

**Related LLM concerns:**
- LLM's training data may not include all valid approaches
- LLM can be overly strict about formatting or style
- Different models have different evaluation standards

---

### Pitfall: False Positives - Accepting Incorrect Answers
**Description:** The LLM gives credit for incorrect answers, incomplete solutions, or answers that demonstrate misunderstanding. Users pass questions they shouldn't, inflating scores and hiding knowledge gaps.

**Warning signs:**
- Users report passing questions they knew they answered wrong
- Scores don't match actual ability (user fails interviews after high scores here)
- Partial answers get full credit
- Conceptually flawed approaches are marked correct
- Pattern: theoretical questions scored more leniently than coding

**Prevention:**
- Include negative examples in evaluation prompt: "These would be WRONG: [examples]"
- For code, require passing all test cases to receive credit (not 50% for partial)
- Require LLM to identify what was missing or incorrect in the answer
- Implement minimum rubric: answer must address 3+ key points to pass
- For partial credit, cap at 50-60%, never 100% for incomplete answer
- User-submitted test cases: ask user "what test cases should I fail if wrong?" and validate
- Cross-check with predefined criteria before assigning score

**Phase to address:** Answer Evaluation (before scoring)

**Related LLM concerns:**
- LLM tends to be generous, especially with open-ended questions
- LLM may misunderstand what a question is really asking

---

## Prompt Engineering Challenges

### Pitfall: Vague or Ambiguous Questions from Generator
**Description:** Generated questions are unclear, have multiple valid interpretations, or lack necessary context. Users struggle to understand what's being asked, leading to frustration and invalid answers.

**Warning signs:**
- Users ask "what does this mean?" in comments
- High variance in interpretation: different users answer the "same" question differently
- Questions appear to have missing information
- Questions reference undefined terms or concepts
- Follow-up clarifications needed but not available to user

**Prevention:**
- In generation prompt: require question to be answerable with stated knowledge level
- Include quality checklist: "Is this question clear? Does it have necessary context? Can it be answered in the stated difficulty?"
- Reject questions that LLM flags as ambiguous
- Peer review: have a human (or second LLM) verify question clarity before deployment
- Include example answer outline in generation to validate question is answerable
- Allow users to request clarification (future feature), but detect in real-time for now
- For coding questions, provide sample test cases to clarify expectations

**Phase to address:** Question Generation (before question shown to user)

**Related LLM concerns:**
- LLM may assume context the user doesn't have
- LLM may generate questions too similar to training data (lacks originality)

---

### Pitfall: Evaluation Prompt Inconsistency
**Description:** The evaluation prompt changes accidentally or doesn't match the generation prompt. Questions generated with one rubric are evaluated with a different one, creating unfair scoring.

**Warning signs:**
- Question says "design a function" but evaluation looks for "write a production function"
- Generation and evaluation prompts have different difficulty interpretations
- Evaluation prompt uses criteria not mentioned in the question
- Score doesn't match feedback quality

**Prevention:**
- Store both prompts (generation + evaluation) together in code
- Validate at runtime: ensure evaluation prompt references generation prompt's context
- Use constants for shared rubric definitions (don't duplicate in prompts)
- When updating one, update the other (add validation check)
- Documentation: PROMPTS.md should document the relationship between generation and evaluation

**Phase to address:** Question Generation + Answer Evaluation (validation layer)

**Related LLM concerns:**
- Prompt engineering is brittle; small changes affect output
- Different model versions interpret prompts differently

---

## User Experience Failures

### Pitfall: Overwhelming or Incomprehensible Feedback
**Description:** Feedback is too lengthy, too technical, contradictory, or fails to guide the user toward improvement. Users don't know what they did wrong or how to improve.

**Warning signs:**
- Feedback is longer than the original answer
- Feedback uses jargon without explanation
- Feedback is vague ("improve your explanation") without specifics
- Feedback contradicts the score
- Users skip reading feedback because it's too much
- No model answer to learn from
- Feedback addresses the question answered, not the question asked

**Prevention:**
- Feedback structure (enforce in prompt):
  1. What was correct (1-2 sentences)
  2. What was missing or wrong (1-3 sentences with specific examples)
  3. How to improve (1-2 actionable items)
  4. Reference to model answer
- Limit feedback to <300 tokens
- Require model answer be included and clearly marked
- For code, show specific lines that are problematic
- Use the "explain like I'm 12" rule: can a junior understand this feedback?
- Format feedback with clear sections: [CORRECT], [MISSING], [IMPROVEMENT]
- Include one resource (link or concept name) user can study

**Phase to address:** Answer Evaluation → Feedback Generation

**Related LLM concerns:**
- LLM's natural tendency is to generate long feedback
- LLM may use jargon it assumes the user knows
- LLM feedback can be verbose and repetitive

---

### Pitfall: Difficulty Progression Missteps
**Description:** Questions suddenly jump in difficulty, frustrating users. Or difficulty is too static, boring users. Difficulty progression (if enabled) doesn't match user performance accurately.

**Warning signs:**
- User scores 95% on questions, next question is beginner level (should escalate)
- User scores 30% on question, next question is expert level (should regress)
- Difficulty jumps feel random or inconsistent
- Users toggle off adaptive difficulty because it's broken
- No feedback on why difficulty changed
- Difficulty doesn't account for question type (coding vs theory)

**Prevention:**
- Define difficulty progression logic explicitly:
  - 80%+ score → increase difficulty (or stay same if already hard)
  - 50-80% score → stay same difficulty
  - <50% score → decrease difficulty (or give easier variant)
- Include difficulty reasoning in question metadata: "This question requires [concepts]"
- Show user what triggered difficulty change ("You got the last 2 right, so questions are harder now")
- For optional progression: clearly explain the algorithm to user before starting
- Per-topic tracking: user might be strong in arrays but weak in recursion (don't blindly escalate)
- Difficulty progression only after min 3 questions (avoid noise)
- Allow user to manually adjust difficulty mid-session

**Phase to address:** Progress Tracking (between questions)

**Related LLM concerns:**
- LLM may not generate questions at target difficulty consistently
- Difficulty calibration is subjective and model-dependent

---

### Pitfall: Feedback Paralysis - Users Don't Know What to Study
**Description:** Feedback identifies gaps but doesn't point users to resources or next steps. Users feel lost and don't know what to learn next.

**Warning signs:**
- Feedback says "You struggled with recursion" but no link to tutorials
- User finishes quiz confused about what went wrong
- Dashboard doesn't show pattern of weak topics
- Users don't return because they don't know how to improve
- No recommendation for next quiz settings

**Prevention:**
- After quiz completion, show:
  1. Topics where user struggled (sorted by frequency)
  2. Suggested next quiz settings ("Try: Intermediate - Recursion - Coding")
  3. One recommended resource per weak topic (curated list)
- Include learning objectives in feedback: "You should understand: [concept A, concept B]"
- In dashboard, show trend: weak topics from last 3 sessions
- Suggest "retry this topic" feature (regenerate harder questions on same topic)
- For critical gaps, flag as "recommended practice area" in session summary
- Link to external resources (docs, tutorials) only for high-confidence gaps

**Phase to address:** Quiz Completion → Dashboard

**Related LLM concerns:**
- LLM can identify gaps but may not have current resource recommendations
- Curated resource links require manual maintenance (not LLM-driven)

---

### Pitfall: Session Loss or Incomplete Saves
**Description:** User's quiz session is lost, answers don't save, or scores are lost due to connection issues, browser crashes, or app bugs. User loses progress and trust in the app.

**Warning signs:**
- User reports completed quiz missing from history
- Session saved but one answer missing
- Score changed after session ended
- Connection interrupted mid-answer submission
- Browser tab crashes, user returns to find session gone
- No "resume session" option after interruption

**Prevention:**
- Save answer immediately after submission (not after evaluation)
- Persist session state to local storage as backup
- Implement "resume session" feature: user can pick up where they left off
- For critical operations (answer submission), use optimistic UI + server confirmation
- Implement atomic writes: entire answer package or nothing (no partial saves)
- Session timeout: if user inactive >30 min, auto-save state and offer "resume"
- Add session recovery: user can view in-progress sessions from dashboard
- Log all state changes server-side for debugging

**Phase to address:** Throughout (answer submission, progress tracking, session management)

**Related LLM concerns:**
- LLM evaluation is slow (20-60 seconds); session can fail during evaluation
- Long evaluations can timeout; implement retry logic

---

## Database/Persistence Issues

### Pitfall: Inconsistent Session Data and Score Corruption
**Description:** Session data becomes inconsistent (answer count mismatch, score doesn't match answers), or data is lost due to transaction failures. Leaderboards or analytics are unreliable.

**Warning signs:**
- Session shows 8 questions answered but only 7 scores recorded
- Total score doesn't match sum of question scores (off-by-one errors)
- User views session again and sees different scores
- Historical data missing or incomplete
- Analytics show impossible values (110% average score)
- Duplicate sessions appear in history

**Prevention:**
- Use database transactions: answer submission is atomic (all-or-nothing)
- Session metadata: record total questions, expected score range at save time
- Validation on read: verify answer count matches score count before returning to user
- Add unique IDs to answers: prevent duplicate submissions from race conditions
- Soft deletes: never delete sessions, mark as deleted, allow recovery
- Audit log: record every score change with timestamp and reason
- Periodic integrity checks: run script to validate score = sum(answer scores)
- Handle concurrent submissions: use database locks or conflict resolution

**Phase to address:** Answer Submission + Session Completion

**Related LLM concerns:**
- Evaluation can be slow and fail partway; need clear state management
- Evaluation failure doesn't mean answer wasn't submitted

---

### Pitfall: Missing or Incorrect Historical Data
**Description:** User's session history is incomplete, shows wrong dates/scores, or misses recent sessions. User can't track progress or review past sessions.

**Warning signs:**
- Dashboard shows 5 sessions but user completed 7
- Session timestamps are incorrect (off by hours/timezone)
- Recent session doesn't appear until next day
- Can't access session data after a few weeks (deletion policy?)
- Historical analytics show wrong trends

**Prevention:**
- Use server-side timestamps (not client time, which can be wrong)
- Save full session snapshot: all metadata at creation and completion time
- Keep all historical data (or at least 2+ years)
- Implement proper timezone handling: store UTC, display user's timezone
- For "recent sessions" queries, include sessions from today + last 7 days
- Validate session timestamps when writing and reading (catch impossible times)
- Schema versioning: if session schema changes, migrate old data properly

**Phase to address:** Quiz Completion + Dashboard

**Related LLM concerns:**
- Session completion is async (evaluation happens in background); track this state

---

## Cost Management

### Pitfall: Unbounded LLM API Costs
**Description:** API costs scale unexpectedly or spike due to inefficient prompts, repetitive calls, or lack of user limits. Per-user costs can be $1-5+ per session, making the service economically unviable.

**Warning signs:**
- API bill is 10x higher than expected
- Cost per user per month exceeds revenue (if monetized)
- Long prompts (3000+ tokens) are standard
- Questions are regenerated because first attempt failed (wasteful)
- No rate limiting; power user can burn $100+ in one session
- Evaluation is called multiple times for same answer (no caching)

**Prevention:**
- Per-user API cost limits: $0.50-1.00 per session (hard cap)
- Prompt optimization: Remove examples from prompts, use few-shot instead of zero-shot
- Cache question generation: don't regenerate same topic/difficulty combinations
- Reuse evaluator context: don't include full question in evaluation prompt, use ID reference
- Batch operations: generate 5 questions in one call instead of 5 separate calls
- Model selection: use faster, cheaper models for non-critical operations (e.g., gpt-3.5 for validation)
- Implement request deduplication: if same question is requested twice, use cache
- Monitor cost per session: alert if >$2, track per-user monthly spend
- Cost optimization phase: regularly review expensive operations and optimize prompts

**Phase to address:** Question Generation + Answer Evaluation (design)

**Related LLM concerns:**
- LLM quality ≠ cost; cheaper models may be sufficient for some tasks
- Prompt engineering directly impacts token usage

---

### Pitfall: Slow Response Times During High Load
**Description:** When multiple users submit answers simultaneously, LLM API becomes bottleneck. Users wait 30+ seconds for feedback. App appears broken or unresponsive.

**Warning signs:**
- Response time increases at certain times (lunch, evening)
- Users report "loading..." spinner lasting >10 seconds
- Some users time out waiting for evaluation
- API rate limits are being hit
- No queue or prioritization system

**Prevention:**
- Implement request queuing: process evaluations in order, show user ETA
- Async feedback: submit answer, immediately show "submitted" state, deliver feedback when ready
- For time-sensitive operations (answer submission), process in background and notify user
- Implement exponential backoff: if API overloaded, retry with increasing delay
- Set realistic timeouts: don't wait >60 seconds for LLM response, fail gracefully
- For cached/simple evaluations, show results instantly; complex ones are "in progress"
- Load shedding: if queue >50 items, reject new requests politely ("Try again in 1 min")
- Use faster models for high-load times or simple operations

**Phase to address:** Answer Evaluation (implementation)

**Related LLM concerns:**
- Different LLM providers have different latency/reliability
- Switching providers mid-session could cause UX issues

---

## Key Pitfalls to Watch

| Pitfall | Risk Level | Prevention | Phase |
|---------|-----------|-----------|-------|
| Inconsistent question quality | High | Strong versioned prompts + validation before display | Question Generation |
| False negatives in scoring | High | Multi-step evaluation + test cases + audit log | Answer Evaluation |
| False positives in scoring | High | Negative examples + minimum rubric + cross-checks | Answer Evaluation |
| Overwhelming feedback | Medium | Structured feedback format + model answer + <300 tokens | Feedback Generation |
| Unbounded API costs | High | Caching + prompt optimization + per-user limits | Design |
| Context degradation in long sessions | Medium | Stateless evaluation + session resets | Answer Evaluation |
| Session data loss | High | Atomic writes + local storage backup + recovery feature | Session Management |
| Difficult difficulty progression | Medium | Explicit logic + per-topic tracking + user feedback | Progress Tracking |
| Poor prompt versioning | Medium | Semantic versioning + changelog + test framework | Development |
| Slow response times | Medium | Async processing + queuing + exponential backoff | Answer Evaluation |

---

## Success Indicators

**Things going RIGHT:**

- Questions consistently match stated difficulty (users report "just right" difficulty)
- Scoring is accurate: users who pass here pass real interviews, who fail here struggle in real interviews
- Feedback is actionable: users report making progress based on suggestions
- Session history is complete and accurate: users can track weeks of progress
- Users return for multiple sessions: engagement is high, completion rate >60%
- Scores are fair: no pattern of certain question types being systematically over/under-graded
- Cost per user per month is sustainable (< $0.50 per session)
- Response times are fast: 95% of evaluations complete in <10 seconds
- User trust is high: <1% of evaluations disputed, users report feeling the scoring is fair

---

## Implementation Roadmap

**Phase 1 (MVP - Must Have):**
- Versioned prompts with clear documentation
- Basic validation of question output
- Single-pass evaluation (no multi-step checks yet)
- Session persistence to database
- Simple cost tracking

**Phase 2 (Stability - Should Have):**
- Multi-step answer evaluation (initial → validation → cross-check)
- User feedback loop for incorrect evaluations
- Structured feedback format
- Test framework for prompts
- Difficulty progression logic

**Phase 3 (Optimization - Nice to Have):**
- Caching for question generation
- Async evaluation with queuing
- Context window management
- Advanced user analytics
- A/B testing framework for prompts

**Phase 4+ (Advanced - Future):**
- Automated prompt optimization
- Multiple LLM provider support
- Advanced session recovery
- Real-time difficulty calibration
