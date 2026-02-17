# Stack Research: Interview Prep Tools

**Research date:** February 17, 2025

## LLM Integration

### Recommended Stack

#### Primary LLM Provider SDKs
- **openai ^1.50.0** — Latest OpenAI SDK with stable streaming support, function calling, and vision capabilities. Mature, well-documented, widely used in production.
- **@anthropic-ai/sdk ^0.27.0** — Anthropic SDK with strong streaming support via EventSource API, competitive pricing, and excellent Claude model performance for reasoning tasks.
- **langchain ^0.2.0+** — Framework for chaining LLM calls, managing prompts, and handling streaming. Particularly useful for complex multi-step reasoning in interview scenarios.

#### Supporting Libraries
- **zod ^3.23.0** — Schema validation and type-safe LLM response parsing. Essential for validating structured outputs from LLM function calls.
- **ai ^3.4.0** — Vercel AI library providing unified streaming interface across multiple LLM providers (OpenAI, Anthropic, Ollama, etc.). Lightweight alternative to LangChain for simple use cases.
- **js-tiktoken ^1.0.14** — Token counting library for accurate usage tracking and cost estimation before making API calls.

### Reasoning

**Why OpenAI + Anthropic?**
- OpenAI maintains the most mature streaming implementation for real-time feedback
- Claude models (Anthropic) excel at detailed reasoning and constructive feedback—critical for interview prep
- Redundancy: if one provider has issues, fallback is simple
- Both have excellent JavaScript SDKs with TypeScript support

**Why not LangChain for MVP?**
- LangChain adds overhead for simple question generation and evaluation
- Increased bundle size (affects React client)
- Better to start with direct SDK usage, add LangChain if multi-step agent workflows become necessary (e.g., research questions, validate code execution)

**Why Zod + ai + js-tiktoken?**
- Zod ensures type safety when parsing LLM JSON responses
- `ai` library provides the cleanest streaming abstraction for React
- Token counting prevents surprise API costs and enables progress estimation

---

## Database Layer

### Schema Patterns

#### Core Tables (Supabase PostgreSQL)

**users**
```sql
id (uuid, pk)
email (text, unique)
created_at (timestamp)
updated_at (timestamp)
```

**quiz_sessions**
```sql
id (uuid, pk)
user_id (uuid, fk → users)
topic (text) -- e.g., 'React', 'TypeScript', 'System Design'
difficulty (enum) -- 'beginner', 'intermediate', 'advanced'
question_type (enum) -- 'multiple_choice', 'coding', 'open_ended'
started_at (timestamp)
completed_at (timestamp, nullable)
status (enum) -- 'in_progress', 'completed', 'abandoned'
total_questions (int)
questions_answered (int)
score (float, nullable) -- 0-100
duration_seconds (int, nullable)
created_at (timestamp)
```

**questions** (immutable log of LLM-generated questions)
```sql
id (uuid, pk)
session_id (uuid, fk → quiz_sessions)
sequence_number (int) -- order in session
prompt_template (text) -- LLM system prompt used
question_text (text) -- the actual question shown to user
question_context (jsonb) -- topic, subtopic, difficulty metadata
model_used (text) -- 'gpt-4', 'claude-3-sonnet', etc.
llm_request_tokens (int)
llm_response_tokens (int)
created_at (timestamp)
```

**answers** (user responses and evaluations)
```sql
id (uuid, pk)
question_id (uuid, fk → questions)
user_answer (text) -- user's response
answer_submitted_at (timestamp)
evaluation_status (enum) -- 'pending', 'evaluated', 'error'
feedback (text) -- LLM-generated feedback
score (float) -- 0-100 for this question
model_used_for_eval (text) -- which model evaluated
eval_request_tokens (int)
eval_response_tokens (int)
time_spent_seconds (int)
created_at (timestamp)
```

**attempt_metadata** (optional, for tracking iteration)
```sql
id (uuid, pk)
answer_id (uuid, fk → answers)
iteration_number (int)
revised_answer (text, nullable) -- if user revises
previous_feedback (text)
created_at (timestamp)
```

#### Indexes for Performance
```sql
-- Fast session lookup
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);

-- Fast question retrieval for a session
CREATE INDEX idx_questions_session_id ON questions(session_id);

-- Fast answer lookups
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_evaluation_status ON answers(evaluation_status);

-- Analytics queries
CREATE INDEX idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);
CREATE INDEX idx_answers_score ON answers(score);
```

#### Why This Schema?
- **Immutable question log**: Enables auditing, understanding model behavior over time
- **Separate answers table**: Allows multi-attempt scenarios without corrupting question history
- **jsonb for context**: Flexible metadata without schema changes as requirements evolve
- **Token tracking**: Enables cost analysis and optimization
- **Evaluation status tracking**: Supports async evaluation patterns (evaluate in background)

---

## Frontend State Management

### Recommended Approach: Zustand with React Context

**Primary choice: Zustand 4.4.0+**

```typescript
// Example store structure
interface QuizStore {
  // Session state
  currentSession: QuizSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;

  // Answer state
  userAnswer: string;
  feedback: string | null;
  isEvaluating: boolean;

  // Quiz progress
  answers: Map<string, AnswerEvaluation>;
  sessionScore: number | null;

  // Actions
  startSession: (topic: string, difficulty: string) => Promise<void>;
  submitAnswer: (answer: string) => Promise<AnswerEvaluation>;
  getNextQuestion: () => Promise<void>;
  completeSession: () => Promise<void>;
}
```

**Why Zustand over Redux/Context?**
- Minimal boilerplate compared to Redux
- Built-in TypeScript support without decorator overhead
- Smaller bundle size (~2KB) vs Redux ecosystem
- Better performance for streaming updates (no re-render overhead)
- Excellent for complex async flows via middleware

**Why not Context alone?**
- Context triggers re-renders on any state change—problematic during LLM streaming where state updates are frequent
- Zustand's subscription model only re-renders components that use the changed slice

### Optional: TanStack Query (React Query) for Server State
- **@tanstack/react-query ^5.50.0** — Handle session caching, background refetching, polling for evaluation status
- Separates client state (Zustand) from server state (TanStack Query)
- Built-in stale-while-revalidate semantics

---

## Streaming & Real-time Evaluation

### Best Practices

#### Client-Side Streaming (Question Generation)
```typescript
import { useEffect, useState } from 'react';
import { openai } from '@/lib/llm';

function QuestionDisplay() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQuestion = async () => {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: 'Generate a React question...' }],
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        setQuestion(prev => prev + delta);
      }
      setIsLoading(false);
    };

    generateQuestion();
  }, []);

  return <div>{question}</div>;
}
```

#### Evaluation Streaming (Feedback)
```typescript
// Use Vercel AI library for cleaner streaming
import { useCompletion } from 'ai/react';

function AnswerFeedback({ userAnswer, question }) {
  const { completion, isLoading } = useCompletion({
    api: '/api/evaluate-answer',
    body: { userAnswer, question },
  });

  return <div className="feedback">{completion}</div>;
}
```

#### Server-Side Streaming (Recommended)
- Generate questions and evaluations on backend (Node.js + Express/Next.js)
- Stream responses through HTTP
- Avoids exposing LLM API keys to client
- Enables cost tracking and rate limiting

**Backend example (Node.js with OpenAI SDK):**
```typescript
app.post('/api/generate-question', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages: [/* ... */],
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ delta })}\n\n`);
  }

  res.end();
});
```

#### Frontend Consumption via EventSource
```typescript
function useStreamingQuestion() {
  const [question, setQuestion] = useState('');

  const startStreaming = useCallback(async (topic: string) => {
    const response = await fetch('/api/generate-question', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          setQuestion(prev => prev + data.delta);
        }
      }
    }
  }, []);

  return { question, startStreaming };
}
```

#### Progressive Feedback Strategy
1. **Immediate**: Stream first sentence of feedback as answer is submitted (latency: <500ms)
2. **Incremental**: Stream rest of feedback token-by-token
3. **Final**: Parse and store structured evaluation data (scores, code issues)
4. **Async**: Background task processes detailed code analysis if needed

---

## Code Evaluation (if applicable)

### For Coding Problems

#### Safe Execution Approach
- **Never execute user code in-browser or on public servers**
- **Recommended: Use sandboxed services**

#### Option 1: CodeRunner / CodeExecutor API (Recommended)
- **judge0-api** (free, self-hosted, or paid API)
  - Supports 60+ languages
  - Runs code in isolated containers
  - Returns stdout, stderr, execution time
  - Reasonable rate limits

**Integration:**
```typescript
const evaluateCode = async (code: string, language: string) => {
  const response = await fetch('https://judge0-api.com/submissions', {
    method: 'POST',
    body: JSON.stringify({
      source_code: code,
      language_id: languageToJudge0Id(language),
    }),
  });

  const submission = await response.json();

  // Poll for result
  const result = await pollSubmissionResult(submission.token);
  return result; // { stdout, stderr, time, memory }
};
```

#### Option 2: LLM-Based Evaluation (No Execution)
- Use Claude/GPT-4 to review code
- Check for correctness, best practices, performance issues
- Fast, no infrastructure needed, but less precise
- **Recommended for MVP** where actual execution isn't critical

```typescript
const evaluateCodeViaMask = async (code: string, question: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: `Review this solution to: ${question}\n\n${code}`,
      },
    ],
  });

  return response.choices[0].message.content;
};
```

#### Option 3: Hybrid Approach (Recommended for Production)
1. Use LLM for initial feedback (fast, cheap)
2. Run against test cases in background (judge0)
3. Update feedback with actual test results asynchronously

#### What NOT to Do
- Do not use `eval()` or `Function()` constructor with user code
- Do not execute code directly in Node.js without isolation
- Do not expose execution to untrusted user code without sandboxing

---

## Key Decisions

| Choice | Rationale | Confidence |
|--------|-----------|-----------|
| **OpenAI + Anthropic SDKs** | Mature streaming, Claude excels at feedback, built redundancy | High |
| **Zustand for state** | Minimal boilerplate, excellent streaming performance, TypeScript native | High |
| **Server-side streaming** | Security (hide API keys), cost tracking, rate limiting | High |
| **Supabase PostgreSQL schema** | Immutable question log, token tracking for cost analysis, audit trail | High |
| **Judge0 for code execution** | Battle-tested, supports many languages, safe sandboxing | Medium |
| **LLM-based code review (MVP)** | Faster to market, no infrastructure, good enough for feedback | High |
| **Zod for response validation** | Type safety prevents JSON parsing bugs with LLM outputs | High |
| **TanStack Query for caching** | Reduces API calls, better UX with background updates | Medium |

---

## Anti-patterns to Avoid

### LLM Integration
- **Storing raw API keys in environment files without encryption** — Use secret management (Vercel Secrets, Supabase Vault, AWS Secrets Manager)
- **Making LLM calls directly from React without backend** — Exposes API keys, no rate limiting, no audit trail
- **Ignoring token counting** — Leads to surprise bills; always estimate tokens before making calls
- **Streaming to client with no timeout** — Stuck requests; implement 30-60s timeout on streams
- **Using simple string concatenation for prompts** — Leads to injection attacks; use templating or structured prompts (OpenAI function calling, Anthropic tools)

### Database
- **Storing answers and evaluations in same record** — Prevents multi-attempt workflows and makes queries complex
- **No indexing on session lookups** — UI becomes slow when loading user history
- **Storing entire LLM response as plaintext without metadata** — Makes analytics impossible; parse and store structured data (score, feedback, reasoning)
- **Mutable question records** — Prevents understanding model behavior over time and breaks analytics

### State Management
- **Using Context for everything including server data** — Kills performance during streaming updates
- **Storing LLM streaming state as Redux actions** — Redux wasn't designed for high-frequency updates; use Zustand subscriptions instead
- **No separation of loading/error states** — UI becomes inconsistent when streaming starts/fails; track `isEvaluating`, `evaluationError` separately

### Real-time Feedback
- **No timeout on streaming requests** — Browser hangs if LLM doesn't respond; always implement `AbortController`
- **Updating UI on every token** — Causes jank with JavaScript rendering; debounce updates to 100-200ms batches
- **No fallback if streaming fails mid-response** — User sees partial feedback; gracefully degrade to full response on timeout

### Code Execution
- **Executing user code in-process** — One malicious submission crashes the entire application
- **No input validation before sending to judge0** — Submitting huge code blocks wastes quota; limit to 50KB
- **No timeout on code execution** — Infinite loops hang the evaluation; use judge0's `cpu_time_limit` parameter

---

## Implementation Priority (MVP → Production)

### Phase 1: MVP (Week 1-2)
- OpenAI SDK + streaming
- Zustand for state
- Supabase schema (users, sessions, questions, answers)
- LLM-based code review (no execution)
- React hooks for streaming UI

### Phase 2: Enhancement (Week 3-4)
- Add Anthropic SDK as fallback
- Implement TanStack Query for caching
- Add judge0 for actual code execution
- Token counting + cost tracking dashboard
- Error recovery and retry logic

### Phase 3: Optimization (Week 5+)
- LangChain for multi-step reasoning (research questions, validate solutions)
- Implement rate limiting + quotas
- Analytics dashboard
- A/B testing different LLM models
- Cache frequently asked questions

---

## Summary: Why This Stack?

**The recommended approach balances:**
1. **Developer velocity** — Zustand + direct SDK usage = fast implementation
2. **Production readiness** — Streaming, error handling, cost tracking built-in
3. **Flexibility** — Easy to swap LLM providers, add caching, implement code execution
4. **Cost efficiency** — Token counting, caching, and streaming prevent waste
5. **Scalability** — Immutable schema, proper indexing, async evaluation patterns

This stack is optimized for a 2-4 person team shipping an MVP in 3-4 weeks while maintaining a path to a sustainable, profitable product.
