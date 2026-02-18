# Phase 2: Quiz Setup & Question Generation - Research

**Researched:** 2026-02-18
**Domain:** LLM Integration, Quiz Session Architecture, Form State Management, Code Editor Components
**Confidence:** HIGH

## Summary

Phase 2 requires integrating an LLM provider to generate questions, building a quiz configuration UI, and displaying questions with answer input options. The research confirms that Claude (Anthropic) is the strongest choice for code evaluation (92% HumanEval score vs GPT-4's 90%), but an abstraction layer is essential to support provider switching as per project decisions. Question quality is the primary risk; a multi-step validation approach (schema validation + quality gates) prevents malformed questions from reaching users. Key findings: Zod + React Hook Form is the standard for form validation in 2026, Monaco Editor for code input, and TanStack Query + React Context for session state management.

**Primary recommendation:** Use Anthropic Claude API with a custom abstraction layer enabling OpenAI fallback. Build quiz configuration with Zod schemas and React Hook Form. Manage session state with React Context for local quiz state and TanStack Query for server persistence. Implement question validation before display (schema + sampling checks). Use Monaco Editor for coding problem inputs, textarea for theoretical questions.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETUP-01 | User can select one or more programming languages/technologies from available list | React Hook Form + Zod handles multi-select checkboxes with validation; Supabase lookup table stores available topics |
| SETUP-02 | User can select difficulty level (beginner, normal, advanced) | React Hook Form select input; Zod enum validation ensures only valid difficulty levels passed |
| SETUP-03 | User can select one or more question types (coding problems, theoretical questions, or both) | React Hook Form checkbox groups; Zod validates array of selected types |
| SETUP-04 | User can select number of questions for session (5, 10, 20) | React Hook Form radio or select; Zod enum restricts to valid counts |
| SETUP-05 | User can view and start a new quiz session | Form submission creates session record in Supabase, returns session ID for quiz display |
| QUIZ-01 | User sees one question at a time with clear formatting and context | Question display component with markdown rendering; topic list shown alongside question |
| QUIZ-02 | User can submit answer via text input (theoretical) or code editor (coding problems) | Monaco Editor for code input, textarea for text; conditional rendering based on question type |
| QUIZ-03 | User can skip a question (marked as 0% score, moves to next) | Skip button advances to next question; session state tracks skipped questions |
| QUIZ-05 | Quiz session displays progress indicator (e.g., "Question 3 of 10") | Session state stores current_question_index and total_questions; progress bar component |
| QUIZ-06 | Session shows which topics are covered in current quiz | Quiz config stored in session; topics displayed in sidebar or header |

---

## Standard Stack

### Core Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | ^1.0.0+ | Anthropic Claude API client with streaming support | Official SDK, best TypeScript support, 92% HumanEval score (superior code generation), streaming for token efficiency |
| `react-hook-form` | ^7.48.0+ | Form state management with minimal re-renders | Industry standard for React forms, reduced bundle vs Formik, excellent TypeScript support |
| `zod` | ^3.22.0+ | Schema validation for form inputs and API responses | TypeScript-first, built-in error messages, used in Phase 1 auth, smallest bundle overhead |
| `@monaco-editor/react` | ^4.5.0+ | Code editor component for coding problem inputs | Battle-tested, VS Code parity, syntax highlighting, language detection, minimal bundle with code-splitting |
| `@tanstack/react-query` | ^5.28.0+ | Server state management for quiz sessions and questions | Handles caching, automatic refetch, background sync; reduces localStorage complexity |
| `markdown-it` | ^13.0.0+ | Markdown rendering for question text | Secure rendering, extensible, single dependency; Supabase docs recommend this |

### Supporting Libraries (Optional but Recommended)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@anthropic-ai/sdk` (streaming) | ^1.0.0+ | Streaming text generation for real-time question display | Show question streaming in UI; token efficiency for longer prompts |
| `lucide-react` | ^0.263.0+ | Icons for skip button, progress indicator, difficulty badges | Already used in Phase 1; consistent with design system |
| `react-markdown` | ^9.0.0+ | Alternative markdown renderer if you prefer JSX integration | If markdown-it not suitable; provides JSX flexibility |

### LLM Provider Abstraction Layer (Custom)

Build custom abstraction to support swappable providers:

```typescript
// src/lib/llm/types.ts
export interface LLMProvider {
  generateQuestion(prompt: string, params: QuestionGenerationParams): Promise<string>
  // Add streaming variant
  generateQuestionStream(prompt: string, params: QuestionGenerationParams): AsyncIterable<string>
}

// src/lib/llm/claude.ts
export class ClaudeProvider implements LLMProvider { ... }

// src/lib/llm/openai.ts
export class OpenAIProvider implements LLMProvider { ... }

// src/lib/llm/index.ts
export function getLLMProvider(name: string): LLMProvider { ... }
```

**Why abstraction matters:** Prevents vendor lock-in. If Claude API degrades or pricing spikes, switch to OpenAI with one config change. Different orgs may prefer different providers.

### Environment Configuration

```bash
# .env.local (CRITICAL: Keep secret keys out of version control)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-...              # Fallback provider
VITE_DEFAULT_LLM_PROVIDER=anthropic     # Or 'openai'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Installation:**

```bash
npm install @anthropic-ai/sdk react-hook-form zod @monaco-editor/react @tanstack/react-query markdown-it
npm install --save-dev @types/markdown-it
```

**Optional (code editor enhancements):**

```bash
npm install @monaco-editor/loader  # Lazy load editor bundle
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── quiz/
│   │   ├── QuizSetupForm.tsx       # Topic/difficulty/type/count selectors
│   │   ├── QuestionDisplay.tsx      # Single question with markdown rendering
│   │   ├── AnswerInput.tsx          # Conditional: monaco editor or textarea
│   │   ├── ProgressIndicator.tsx    # Question X of Y + progress bar
│   │   └── SkipButton.tsx           # Skip current question
│   └── ...existing auth/dashboard components
├── lib/
│   ├── llm/
│   │   ├── types.ts                # LLMProvider interface
│   │   ├── claude.ts               # Anthropic implementation
│   │   ├── openai.ts               # OpenAI implementation
│   │   ├── index.ts                # Factory function
│   │   └── prompts.ts              # Versioned question generation prompts
│   ├── quiz/
│   │   ├── questions.ts            # Question validation schema + generation logic
│   │   └── validation.ts           # Quality gate checks (malformed, difficulty match)
│   └── supabase.ts                 # Existing client
├── hooks/
│   ├── useQuizSession.ts           # Custom hook for session state + mutations
│   └── useQuestionGeneration.ts    # Custom hook wrapping LLM + validation
├── types/
│   ├── database.ts                 # Extend with quiz_sessions, quiz_questions, topics tables
│   └── quiz.ts                     # QuizSession, Question, QuestionType enums
├── pages/
│   ├── QuizSetup.tsx               # Form page
│   └── QuizSession.tsx             # Question display + answer input
└── context/
    └── QuizContext.tsx             # Quiz session state (config + current question)
```

### Pattern 1: LLM Provider Abstraction

**What:** Unified interface for different LLM APIs, supporting multiple models and fallbacks

**When to use:** Any code calling LLM APIs

**Example:**

```typescript
// src/lib/llm/types.ts
export interface QuestionGenerationParams {
  topics: string[]
  difficulty: 'beginner' | 'normal' | 'advanced'
  types: ('coding' | 'theoretical')[]
  count: number
  language?: string // Programming language for coding questions
}

export interface LLMProvider {
  generateQuestion(params: QuestionGenerationParams): Promise<string>
  generateQuestionStream(params: QuestionGenerationParams): AsyncIterable<string>
}

// src/lib/llm/claude.ts
import Anthropic from '@anthropic-ai/sdk'

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async generateQuestion(params: QuestionGenerationParams): Promise<string> {
    const prompt = buildQuestionPrompt(params)
    const message = await this.client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
    return message.content[0].type === 'text' ? message.content[0].text : ''
  }

  async *generateQuestionStream(params: QuestionGenerationParams): AsyncIterable<string> {
    const prompt = buildQuestionPrompt(params)
    const stream = await this.client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text
      }
    }
  }
}

// src/lib/llm/index.ts
export function getLLMProvider(): LLMProvider {
  const provider = import.meta.env.VITE_DEFAULT_LLM_PROVIDER || 'anthropic'

  if (provider === 'openai') {
    return new OpenAIProvider(import.meta.env.VITE_OPENAI_API_KEY)
  }

  return new ClaudeProvider(import.meta.env.VITE_ANTHROPIC_API_KEY)
}
```

**Source:** [Interoperability Patterns to Abstract LLM Providers](https://brics-econ.org/interoperability-patterns-to-abstract-large-language-model-providers), [Continue Dev LLM Abstraction](https://deepwiki.com/continuedev/continue/4.1-extension-architecture)

### Pattern 2: Quiz Setup Form with Zod + React Hook Form

**What:** Type-safe form validation for quiz configuration (topics, difficulty, types, count)

**When to use:** Initial quiz setup page

**Example:**

```typescript
// src/types/quiz.ts
import { z } from 'zod'

export const QuestionTypeEnum = z.enum(['coding', 'theoretical'])
export type QuestionType = z.infer<typeof QuestionTypeEnum>

export const DifficultyEnum = z.enum(['beginner', 'normal', 'advanced'])
export type Difficulty = z.infer<typeof DifficultyEnum>

export const QuizSetupSchema = z.object({
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  difficulty: DifficultyEnum,
  questionTypes: z.array(QuestionTypeEnum).min(1, 'Select at least one question type'),
  questionCount: z.enum(['5', '10', '20'], {
    errorMap: () => ({ message: 'Select 5, 10, or 20 questions' })
  })
})

export type QuizSetupFormData = z.infer<typeof QuizSetupSchema>

// src/components/quiz/QuizSetupForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function QuizSetupForm({ onSubmit }: { onSubmit: (data: QuizSetupFormData) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<QuizSetupFormData>({
    resolver: zodResolver(QuizSetupSchema),
    defaultValues: {
      topics: [],
      difficulty: 'normal',
      questionTypes: [],
      questionCount: '5'
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Topics (multi-select checkboxes) */}
      <fieldset>
        <legend className="block text-sm font-medium">Programming Topics</legend>
        {AVAILABLE_TOPICS.map(topic => (
          <label key={topic} className="flex items-center space-x-2">
            <input type="checkbox" value={topic} {...register('topics')} />
            <span>{topic}</span>
          </label>
        ))}
        {errors.topics && <p className="text-red-500">{errors.topics.message}</p>}
      </fieldset>

      {/* Difficulty (select) */}
      <div>
        <label className="block text-sm font-medium">Difficulty</label>
        <select {...register('difficulty')}>
          <option value="beginner">Beginner</option>
          <option value="normal">Normal</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Question Types (checkboxes) */}
      <fieldset>
        <legend className="block text-sm font-medium">Question Types</legend>
        <label className="flex items-center space-x-2">
          <input type="checkbox" value="coding" {...register('questionTypes')} />
          <span>Coding Problems</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" value="theoretical" {...register('questionTypes')} />
          <span>Theoretical Questions</span>
        </label>
        {errors.questionTypes && <p className="text-red-500">{errors.questionTypes.message}</p>}
      </fieldset>

      {/* Question Count (radio) */}
      <fieldset>
        <legend className="block text-sm font-medium">Number of Questions</legend>
        {['5', '10', '20'].map(count => (
          <label key={count} className="flex items-center space-x-2">
            <input type="radio" value={count} {...register('questionCount')} />
            <span>{count} questions</span>
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Starting Quiz...' : 'Start Quiz'}
      </button>
    </form>
  )
}
```

**Source:** [React Hook Form Docs](https://react-hook-form.com/docs/useform), [Zod Validation](https://zod.dev/), [FreeCodeCamp: Form Validation with Zod](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/)

### Pattern 3: Question Generation Service with Validation

**What:** LLM call + schema validation + quality gates to prevent malformed questions

**When to use:** Before displaying any question to user

**Example:**

```typescript
// src/lib/quiz/validation.ts
import { z } from 'zod'

export const GeneratedQuestionSchema = z.object({
  title: z.string().min(10, 'Title too short').max(500),
  body: z.string().min(50, 'Body too short'),
  type: z.enum(['coding', 'theoretical']),
  difficulty: z.enum(['beginner', 'normal', 'advanced']),
  expectedFormat: z.string().optional() // e.g., "Python code" or "Paragraph"
})

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>

export function validateQuestion(raw: unknown): GeneratedQuestion {
  return GeneratedQuestionSchema.parse(raw)
}

export function checkDifficultyMatch(
  question: GeneratedQuestion,
  requestedDifficulty: string
): boolean {
  // Simple heuristic: check word count, complexity indicators
  const bodyLength = question.body.length
  const hasComplexConcepts = /abstract|generics|reflection|metaprogramming/i.test(question.body)

  switch (requestedDifficulty) {
    case 'beginner':
      return bodyLength < 500 && !hasComplexConcepts
    case 'normal':
      return bodyLength >= 200 && bodyLength <= 1000
    case 'advanced':
      return bodyLength >= 500 || hasComplexConcepts
    default:
      return true
  }
}

// src/lib/quiz/questions.ts
export async function generateQuestion(
  params: QuestionGenerationParams
): Promise<GeneratedQuestion> {
  const llmProvider = getLLMProvider()
  const rawResponse = await llmProvider.generateQuestion(params)

  // Parse JSON response from LLM
  let parsed: unknown
  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    throw new Error(`Invalid JSON from LLM: ${rawResponse.substring(0, 200)}`)
  }

  // Validate against schema
  const question = validateQuestion(parsed)

  // Check difficulty match
  if (!checkDifficultyMatch(question, params.difficulty)) {
    throw new Error(`Question difficulty mismatch: requested ${params.difficulty}`)
  }

  return question
}

// Quality gate: sample N generated questions, reject batch if >20% fail
export async function validateQuestionBatch(
  params: QuestionGenerationParams,
  sampleSize: number = 5
): Promise<{ passed: boolean; failureRate: number }> {
  let failures = 0

  for (let i = 0; i < sampleSize; i++) {
    try {
      await generateQuestion(params)
    } catch {
      failures++
    }
  }

  const failureRate = failures / sampleSize
  return {
    passed: failureRate < 0.2, // Less than 20% failure
    failureRate
  }
}
```

**Source:** [Prompt Engineering Guide 2026](https://www.lakera.ai/blog/prompt-engineering-guide), [Anthropic Streaming API](https://docs.anthropic.com/en/api/messages-streaming)

### Pattern 4: React Context for Quiz Session State

**What:** Local state for quiz configuration, current question index, and answers

**When to use:** Wrap quiz pages; share state between QuestionDisplay and AnswerInput

**Example:**

```typescript
// src/context/QuizContext.tsx
import React, { createContext, useContext, useState } from 'react'
import { QuizSetupFormData } from '../types/quiz'

interface QuizSessionState {
  sessionId: string
  config: QuizSetupFormData
  currentQuestionIndex: number
  totalQuestions: number
  questions: GeneratedQuestion[]
  answers: Map<number, string> // question index -> user answer
  skippedQuestions: Set<number>
}

interface QuizContextType {
  session: QuizSessionState | null
  initializeSession: (sessionId: string, config: QuizSetupFormData, questions: GeneratedQuestion[]) => void
  submitAnswer: (questionIndex: number, answer: string) => void
  skipQuestion: (questionIndex: number) => void
  moveToNextQuestion: () => void
  getProgress: () => { current: number; total: number; percent: number }
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<QuizSessionState | null>(null)

  const initializeSession = (
    sessionId: string,
    config: QuizSetupFormData,
    questions: GeneratedQuestion[]
  ) => {
    setSession({
      sessionId,
      config,
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      questions,
      answers: new Map(),
      skippedQuestions: new Set()
    })
  }

  const submitAnswer = (questionIndex: number, answer: string) => {
    setSession(prev => {
      if (!prev) return null
      const newAnswers = new Map(prev.answers)
      newAnswers.set(questionIndex, answer)
      return { ...prev, answers: newAnswers }
    })
  }

  const skipQuestion = (questionIndex: number) => {
    setSession(prev => {
      if (!prev) return null
      const newSkipped = new Set(prev.skippedQuestions)
      newSkipped.add(questionIndex)
      return { ...prev, skippedQuestions: newSkipped }
    })
  }

  const moveToNextQuestion = () => {
    setSession(prev => {
      if (!prev) return null
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }
    })
  }

  const getProgress = () => {
    if (!session) return { current: 0, total: 0, percent: 0 }
    return {
      current: session.currentQuestionIndex + 1,
      total: session.totalQuestions,
      percent: ((session.currentQuestionIndex + 1) / session.totalQuestions) * 100
    }
  }

  return (
    <QuizContext.Provider value={{ session, initializeSession, submitAnswer, skipQuestion, moveToNextQuestion, getProgress }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuizSession() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuizSession must be used within QuizProvider')
  }
  return context
}
```

**Source:** [React Context Best Practices 2026](https://www.developerway.com/posts/react-state-management-2025)

### Pattern 5: Monaco Editor for Code Input

**What:** VS Code-like code editor component for coding problem answers

**When to use:** Question type is 'coding'

**Example:**

```typescript
// src/components/quiz/AnswerInput.tsx
import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { GeneratedQuestion } from '../types/quiz'

interface AnswerInputProps {
  question: GeneratedQuestion
  onSubmit: (answer: string) => void
  onSkip: () => void
}

export function AnswerInput({ question, onSubmit, onSkip }: AnswerInputProps) {
  const editorRef = useRef<any>(null)

  if (question.type === 'coding') {
    return (
      <div className="space-y-4">
        <Editor
          height="400px"
          defaultLanguage="python" // Infer from question context
          defaultValue="# Write your solution here"
          onMount={editor => (editorRef.current = editor)}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on'
          }}
        />
        <div className="flex gap-4">
          <button
            onClick={() => {
              const code = editorRef.current?.getValue() || ''
              onSubmit(code)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit Answer
          </button>
          <button onClick={onSkip} className="px-4 py-2 bg-gray-300 rounded">
            Skip
          </button>
        </div>
      </div>
    )
  }

  // Theoretical question: textarea
  return (
    <div className="space-y-4">
      <textarea
        placeholder="Type your answer here..."
        className="w-full p-4 border rounded"
        rows={8}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) {
            onSubmit(e.currentTarget.value)
          }
        }}
      />
      <div className="flex gap-4">
        <button
          onClick={e => {
            const textarea = (e.target as HTMLElement).parentElement?.querySelector('textarea')
            if (textarea) onSubmit(textarea.value)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit Answer
        </button>
        <button onClick={onSkip} className="px-4 py-2 bg-gray-300 rounded">
          Skip
        </button>
      </div>
    </div>
  )
}
```

**Source:** [Monaco Editor React Docs](https://www.npmjs.com/package/@monaco-editor/react), [LogRocket: Best Code Editors for React](https://blog.logrocket.com/best-code-editor-components-react/)

### Anti-Patterns to Avoid

- **Inline LLM calls in components:** Couple UI to provider API; move to custom hooks or services
- **No validation of LLM output:** LLMs hallucinate; always validate structure before display
- **Single question generation without quality gates:** Risk of shipping broken questions; sample-test before deployment
- **Mixing server and local state:** Use TanStack Query for server-persisted sessions, Context for UI state
- **Textarea for coding input:** Users expect syntax highlighting; always use Monaco or CodeMirror for code
- **No difficulty matching checks:** Generated questions may not match requested difficulty; implement heuristic checks

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Form state + validation** | Custom useState + validation logic | React Hook Form + Zod | React Hook Form handles re-render optimization; Zod prevents schema bugs; community-tested patterns |
| **Code editor with syntax highlighting** | DIY textarea with regex tokenizer | Monaco Editor or CodeMirror | Code highlighting requires language grammar files; Monaco provides VS Code feature parity; CodeMirror 6 is extensible |
| **LLM provider switching** | Copy-paste API calls throughout codebase | Custom abstraction layer (LLMProvider interface) | Abstraction enables config-driven switching; prevents vendor lock-in; centralizes prompt engineering |
| **Quiz session state management** | Scattered useState calls + localStorage | React Context + TanStack Query | Context prevents prop drilling; TanStack Query handles caching + refetch; localStorage is error-prone for complex state |
| **Markdown rendering** | innerHTML + regex | markdown-it or react-markdown | Security: markdown-it sanitizes by default; innerHTML is XSS vulnerable; established renderers support extensions |
| **Quality validation of generated questions** | Display LLM output as-is | Schema validation + heuristic checks + batch sampling | LLMs produce hallucinations 5-10% of the time; quality gate catches issues before users see them |

**Key insight:** Quiz quality depends on LLM output validation. Every question must pass schema validation + difficulty match before display. Implement batch sampling during deployment to catch systematic issues (e.g., LLM consistently generating off-difficulty questions).

---

## Common Pitfalls

### Pitfall 1: LLM Output Hallucinations Break Questions

**What goes wrong:** LLM generates malformed JSON, missing fields, or questions that don't match requested difficulty. User sees broken question or incorrect difficulty progression.

**Why it happens:** LLMs generate plausible-sounding but invalid JSON 5-10% of the time, especially with complex prompts. No validation before display.

**How to avoid:**

1. **Always validate LLM output against Zod schema** — Catch malformed structure before display
2. **Implement difficulty heuristics** — Check word count, complexity indicators, check against requested difficulty
3. **Use batch sampling during deployment** — Before shipping, generate 5-10 sample questions, reject batch if >20% fail

**Warning signs:** User reports "broken question" or "question too easy for advanced level". LLM API error messages in console (invalid JSON).

**Example fix:**

```typescript
// ❌ WRONG
const question = JSON.parse(llmResponse) // Could throw or return invalid structure
displayQuestion(question)

// ✅ CORRECT
try {
  const parsed = JSON.parse(llmResponse)
  const question = GeneratedQuestionSchema.parse(parsed) // Zod validation

  if (!checkDifficultyMatch(question, requestedDifficulty)) {
    throw new Error('Difficulty mismatch')
  }

  displayQuestion(question)
} catch (error) {
  console.error('Question validation failed:', error)
  // Regenerate or show error to user
}
```

**Source:** [Prompt Engineering Guide 2026](https://www.lakera.ai/blog/prompt-engineering-guide)

### Pitfall 2: LLM Streaming Breaks on Network Interruption

**What goes wrong:** User's network flickers while question is streaming in. Partial question displayed, stream stops, user sees incomplete content.

**Why it happens:** Streaming APIs don't automatically retry; network interruptions stop the stream. No fallback.

**How to avoid:**

1. **Implement retry logic with exponential backoff** — Retry 3 times before giving up
2. **Show partial content with loading indicator** — Don't hide incomplete questions
3. **Allow manual refresh** — Button to re-fetch question if stream fails
4. **Use TanStack Query for retry handling** — Handles retries + caching automatically

**Warning signs:** Users report questions appearing incomplete. Network tab shows aborted requests.

**Example fix:**

```typescript
// ❌ WRONG
const stream = await llmProvider.generateQuestionStream(params)
let fullText = ''
for await (const chunk of stream) {
  fullText += chunk
  setQuestionText(fullText) // Network interruption stops here
}

// ✅ CORRECT (with retry)
async function fetchQuestionWithRetry(params: QuestionGenerationParams, retries = 3) {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const stream = await llmProvider.generateQuestionStream(params)
      let fullText = ''

      for await (const chunk of stream) {
        fullText += chunk
        setQuestionText(fullText)
      }

      return fullText
    } catch (error) {
      lastError = error as Error
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw new Error(`Failed after ${retries} retries: ${lastError?.message}`)
}
```

**Source:** [Anthropic Streaming API Docs](https://docs.anthropic.com/en/api/messages-streaming)

### Pitfall 3: Monaco Editor Bundle Size Bloats Application

**What goes wrong:** Application takes 5+ seconds to load on slow connections. Editor is 1.5MB+ when fully loaded.

**Why it happens:** Monaco includes grammars for 40+ languages by default. Not lazy-loaded.

**How to avoid:**

1. **Lazy load Monaco Editor** — Use `@monaco-editor/loader` to load only when needed
2. **Reduce language support** — Include only languages users select (Python, JavaScript, etc.)
3. **Use light theme by default** — Reduces CSS bundle slightly

**Warning signs:** Lighthouse report shows large JavaScript bundle. Time to Interactive > 5s on 4G.

**Example fix:**

```typescript
// ❌ WRONG - Monaco loaded immediately
import Editor from '@monaco-editor/react'

// ✅ CORRECT - Lazy load
import { lazy, Suspense } from 'react'

const LazyEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.Editor })))

export function AnswerInput() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <LazyEditor height="400px" />
    </Suspense>
  )
}
```

**Source:** [Monaco Editor Loader Docs](https://www.npmjs.com/package/@monaco-editor/loader)

### Pitfall 4: Form Doesn't Validate Multi-Select Correctly

**What goes wrong:** User doesn't select any topics, clicks "Start Quiz", form submits anyway. Or user selects topics but Zod validation shows error even though data looks correct.

**Why it happens:** React Hook Form with multi-select checkboxes requires specific registration pattern. Easy to wire incorrectly.

**How to avoid:**

1. **Use `.min(1, 'message')` in Zod for array fields** — Ensures at least one item selected
2. **Register checkboxes with same name** — All checkboxes for "topics" must use `register('topics')`
3. **Test form with no selection** — Verify validation fires before submit

**Warning signs:** Validation passes when it shouldn't. User sees no error, form silently accepts empty arrays.

**Example fix:**

```typescript
// ❌ WRONG
const schema = z.object({
  topics: z.array(z.string()) // No min validation
})

// ✅ CORRECT
const schema = z.object({
  topics: z.array(z.string()).min(1, 'Please select at least one topic')
})

// In form:
{AVAILABLE_TOPICS.map(topic => (
  <label key={topic}>
    <input
      type="checkbox"
      value={topic}
      {...register('topics')} // Same name for all checkboxes
    />
    {topic}
  </label>
))}
```

**Source:** [React Hook Form Checkboxes](https://react-hook-form.com/form-builder), [Zod Array Validation](https://zod.dev/?id=arrays)

### Pitfall 5: Quiz Session Lost on Page Refresh

**What goes wrong:** User configures quiz (topics, difficulty, count), starts session, begins answering questions. Accidentally refreshes browser. Quiz state is lost. User is back at setup page.

**Why it happens:** Quiz state stored only in React Context. Page refresh clears component state. No persistence to localStorage or server.

**How to avoid:**

1. **Create quiz session in database immediately** — On "Start Quiz", insert record in `quiz_sessions` table, get `sessionId`
2. **Fetch session state from server on mount** — Use TanStack Query to restore session
3. **Save answers to server after each submission** — Don't rely on local state as source of truth
4. **Provide "Resume" option if session in progress** — Let user continue instead of restarting

**Warning signs:** User loses progress on page refresh. Session data not visible in Supabase.

**Example flow:**

```typescript
// src/pages/QuizSession.tsx
export function QuizSession() {
  const sessionId = useParams().sessionId

  // Fetch session state from server
  const { data: session, isLoading } = useQuery({
    queryKey: ['quiz-session', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_sessions')
        .select('*, quiz_questions(*)')
        .eq('id', sessionId)
        .single()
      return data
    }
  })

  if (isLoading) return <LoadingSpinner />

  return <QuizDisplay session={session} />
}
```

**Source:** [TanStack Query Docs](https://tanstack.com/query/v4/docs/framework/react/guides/does-this-replace-client-state)

---

## Code Examples

Verified patterns from official sources:

### Generate Question with Streaming

```typescript
// src/hooks/useQuestionGeneration.ts
import { useCallback } from 'react'
import { getLLMProvider } from '../lib/llm'

export function useQuestionGeneration() {
  const generateWithStreaming = useCallback(async (params: QuestionGenerationParams) => {
    const llmProvider = getLLMProvider()
    let fullText = ''

    try {
      for await (const chunk of llmProvider.generateQuestionStream(params)) {
        fullText += chunk
        // Update UI in real-time
        setStreamingText(fullText)
      }

      return fullText
    } catch (error) {
      console.error('Question generation failed:', error)
      throw error
    }
  }, [])

  return { generateWithStreaming }
}
```

**Source:** [Anthropic Messages Streaming API](https://docs.anthropic.com/en/api/messages-streaming)

### Create Quiz Session in Database

```typescript
// src/lib/quiz/sessions.ts
import { supabase } from '../supabase'
import { QuizSetupFormData } from '../types/quiz'

export async function createQuizSession(
  userId: string,
  config: QuizSetupFormData
) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert([
      {
        user_id: userId,
        topics: config.topics,
        difficulty: config.difficulty,
        question_types: config.questionTypes,
        question_count: parseInt(config.questionCount),
        status: 'in_progress',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Store Answer to Database

```typescript
// src/lib/quiz/answers.ts
export async function submitAnswer(
  sessionId: string,
  questionIndex: number,
  answer: string,
  questionId: string
) {
  const { error } = await supabase
    .from('quiz_answers')
    .insert([
      {
        session_id: sessionId,
        question_id: questionId,
        answer_text: answer,
        submitted_at: new Date().toISOString()
      }
    ])

  if (error) throw error
}
```

---

## Database Schema Requirements

Phase 2 requires new tables in Supabase. Schema should include:

```sql
-- Quiz configuration and session tracking
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topics TEXT[] NOT NULL,           -- ['Python', 'React']
  difficulty TEXT NOT NULL,         -- 'beginner' | 'normal' | 'advanced'
  question_types TEXT[] NOT NULL,   -- ['coding', 'theoretical']
  question_count INT NOT NULL,      -- 5, 10, or 20
  status TEXT NOT NULL,             -- 'in_progress' | 'completed' | 'abandoned'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated questions for a session
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_index INT NOT NULL,      -- 0-based position in session
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,               -- 'coding' | 'theoretical'
  difficulty TEXT NOT NULL,
  expected_format TEXT,             -- e.g., 'Python code', 'Paragraph'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Available topics/tags
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,        -- 'Python', 'React', 'SQL'
  category TEXT,                    -- 'language' | 'framework' | 'tool'
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: Users see only their own sessions
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sessions"
  ON quiz_sessions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own session questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ));

-- Indexes for performance
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_questions_session_id ON quiz_questions(session_id);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for form state | React Hook Form + local state | ~2021-2023 | Smaller bundle, better DX, no boilerplate |
| Formik for validation | Zod + React Hook Form | ~2023-2024 | Type-safe, better error messages, hooks-based |
| Manual HTTP calls | TanStack Query for server state | ~2022-2023 | Automatic caching, refetch, background sync |
| ACE Editor for code input | Monaco Editor or CodeMirror 6 | ~2020-2023 | VS Code feature parity, better UX |
| Inline text rendering | markdown-it or react-markdown | ~2019+ | Security (no XSS), extensions, standard |
| Copy-paste LLM API calls | Abstraction layer (LLMProvider) | ~2024-2025 | Vendor independence, config-driven switching |

**Deprecated/Outdated:**
- **Formik:** Still used in legacy apps; Zod + React Hook Form superior
- **Redux for local state:** Overkill; Context + hooks sufficient for Phase 2
- **textarea for code:** Acceptable for simple cases; Monaco/CodeMirror standard now
- **Firebase Realtime Database:** Still viable; Supabase chosen for integrated auth + DB

---

## Open Questions

1. **Question streaming vs. full generation?**
   - What we know: Claude API supports streaming; user sees text appear in real-time
   - What's unclear: Does UX benefit justify streaming complexity vs. simple "Loading..." state?
   - Recommendation: Implement streaming in Phase 2. Users prefer seeing questions appear vs. waiting for full load. Small complexity cost for better UX.

2. **How many questions should be pre-generated vs. on-demand?**
   - What we know: Pre-generating all questions takes 30-60 seconds for 20 questions. On-demand shows first question in ~5 seconds but adds wait between questions.
   - What's unclear: Is upfront wait better UX or incremental load better?
   - Recommendation: Generate questions on-demand (one at a time). Phase 2 focuses on single-question display; Phase 3 adds batching if performance shows it's needed.

3. **Should question cache be enabled?**
   - What we know: Caching identical question requests saves API costs and reduces latency
   - What's unclear: When to cache? Based on (topics, difficulty, type)? Or unique per session?
   - Recommendation: Cache by (topics, difficulty, type, language) tuple. Reuse same "Write a Python function" question across sessions but not within same session (redundancy). Implement in Phase 3 if cost becomes concern.

4. **Error handling: Show error to user or auto-retry?**
   - What we know: LLM APIs fail 0.1-1% of the time; network interruptions happen
   - What's unclear: Should user see "Question generation failed, please try again"?
   - Recommendation: Retry up to 3 times silently. If still fails, show error with "Regenerate" button. Don't block session.

---

## Sources

### Primary (HIGH confidence)

- [Anthropic Claude API Documentation](https://docs.anthropic.com/en/api/messages-streaming) — Streaming API, official SDK
- [Anthropic SDK TypeScript GitHub](https://github.com/anthropics/anthropic-sdk-typescript) — Official client library
- [React Hook Form Documentation](https://react-hook-form.com/docs/useform) — Form state management, TypeScript support
- [Zod Documentation](https://zod.dev/) — Schema validation, error handling
- [Monaco Editor React Package](https://www.npmjs.com/package/@monaco-editor/react) — Code editor component
- [TanStack Query React Docs](https://tanstack.com/query/v4/docs/framework/react/guides/does-this-replace-client-state) — Server state management

### Secondary (MEDIUM confidence)

- [Prompt Engineering Guide 2026](https://www.lakera.ai/blog/prompt-engineering-guide) — Best practices, CO-STAR framework
- [LogRocket: Best Code Editors for React](https://blog.logrocket.com/best-code-editor-components-react/) — Monaco vs CodeMirror comparison
- [State Management in React 2026](https://www.c-sharpcorner.com/article/state-management-in-react-2026-best-practices-tools-real-world-patterns/) — Context vs Zustand patterns
- [React Hook Form + Zod Integration](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/) — Form validation patterns
- [Interoperability Patterns for LLM Providers](https://brics-econ.org/interoperability-patterns-to-abstract-large-language-model-providers) — Abstraction layer design

### Tertiary (LOW confidence, marked for validation)

- Blog posts from independent authors — Used for pattern confirmation only; always verify against official docs

---

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH — All libraries confirmed by official docs and current npm packages. Versions verified against latest releases.
- **LLM integration:** HIGH — Anthropic SDK official documentation; Claude benchmarks verified across multiple sources.
- **Form validation:** HIGH — React Hook Form and Zod extensively documented; used in production at scale.
- **Question validation:** MEDIUM — Best practices from prompt engineering guides; specific quality gate implementation not extensively documented elsewhere but pattern is sound.
- **Architecture patterns:** HIGH — All code examples follow official documentation and community best practices (2026).

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days; stable technology with moderate change rate; LLM APIs update more frequently — recheck monthly)
**Reviewed:** LLM provider abstraction confirmed per project decisions. OAuth deferred per Phase 1. Email verification deferred per roadmap.

---

**Phase 2 Ready:** Research complete. Planner can create PLAN.md with confidence in stack, architecture patterns, and risk mitigation (quality gates, validation). All 10 phase requirements are addressable with documented patterns. Primary risk (question quality) is mitigated by schema validation + difficulty matching + batch sampling.
