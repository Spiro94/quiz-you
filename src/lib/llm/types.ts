// src/lib/llm/types.ts
// Core interface that all LLM provider implementations must satisfy.
// Per project decision: provider must be switchable without changing consumer code.
import type { Difficulty, QuestionType } from '../../types/quiz'

export interface QuestionGenerationParams {
  topics: string[]
  difficulty: Difficulty
  types: QuestionType[]
  sessionId: string     // Used to avoid question repetition within a session
  questionIndex: number // Position in session (for context)
}

export interface EvaluationParams {
  question: string            // Full question body (title + body concatenated)
  questionType: 'coding' | 'theoretical'
  difficulty: 'beginner' | 'normal' | 'advanced'
  topic: string
  userAnswer: string
  expectedFormat?: string     // e.g. "Python function", "Paragraph explanation"
}

export interface EvaluationResult {
  reasoning: string           // G-Eval chain-of-thought (saved to DB, not shown to user in v1)
  score: number               // 0-100
  feedback: string            // Markdown-formatted feedback shown to user
  modelAnswer: string         // Markdown-formatted model/reference answer shown to user
}

export interface LLMProvider {
  // Non-streaming: returns complete question JSON string
  generateQuestion(params: QuestionGenerationParams): Promise<string>
  // Streaming: yields text chunks as they arrive from the LLM
  generateQuestionStream(params: QuestionGenerationParams): AsyncIterable<string>
  // Evaluation: G-Eval scoring with chain-of-thought reasoning
  evaluateAnswer(params: EvaluationParams): Promise<EvaluationResult>
}
