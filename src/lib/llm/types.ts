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

export interface LLMProvider {
  // Non-streaming: returns complete question JSON string
  generateQuestion(params: QuestionGenerationParams): Promise<string>
  // Streaming: yields text chunks as they arrive from the LLM
  generateQuestionStream(params: QuestionGenerationParams): AsyncIterable<string>
}
