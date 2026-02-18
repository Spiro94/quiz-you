// src/types/quiz.ts
// Zod schemas and TypeScript types for quiz configuration and generated questions.
// These are the single source of truth for form validation (Plan 02-02) and
// LLM output validation (Plan 02-03).
import { z } from 'zod'

// Available programming languages and technologies
// Mirrors the topics seeded in 002_quiz_schema.sql
export const AVAILABLE_TOPICS = [
  'JavaScript', 'TypeScript', 'Python', 'Dart', 'Go', 'Rust', 'Java', 'SQL',
  'React', 'Flutter', 'Node.js', 'Next.js',
  'System Design', 'Data Structures', 'Algorithms'
] as const

export const DifficultyEnum = z.enum(['beginner', 'normal', 'advanced'])
export type Difficulty = z.infer<typeof DifficultyEnum>

export const QuestionTypeEnum = z.enum(['coding', 'theoretical'])
export type QuestionType = z.infer<typeof QuestionTypeEnum>

export const QuestionCountEnum = z.enum(['5', '10', '20'])
export type QuestionCount = z.infer<typeof QuestionCountEnum>

// Schema for the quiz setup form (used by React Hook Form + Zod resolver in Plan 02-02)
export const QuizSetupSchema = z.object({
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  difficulty: DifficultyEnum,
  questionTypes: z.array(QuestionTypeEnum).min(1, 'Select at least one question type'),
  questionCount: QuestionCountEnum
})
export type QuizSetupFormData = z.infer<typeof QuizSetupSchema>

// Schema for validating LLM-generated question output
// The LLM must return a JSON object conforming to this schema
export const GeneratedQuestionSchema = z.object({
  title: z.string().min(10, 'Question title too short').max(300),
  body: z.string().min(50, 'Question body too short'),
  type: QuestionTypeEnum,
  difficulty: DifficultyEnum,
  topic: z.string().min(1),
  expectedFormat: z.string().optional()
})
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>
