// src/lib/llm/prompts.ts
// Versioned question generation prompts.
// Version is included in the prompt so output can be traced to a specific prompt version.
// Update PROMPT_VERSION when changing the prompt to enable A/B tracking.
import type { QuestionGenerationParams } from './types'

export const PROMPT_VERSION = 'v1.0'

export function buildQuestionPrompt(params: QuestionGenerationParams): string {
  const { topics, difficulty, types } = params
  const topicList = topics.join(', ')
  const typeList = types.includes('coding') && types.includes('theoretical')
    ? 'either a coding problem or a theoretical question (choose based on what best tests the topic)'
    : types.includes('coding')
      ? 'a coding problem requiring a code solution'
      : 'a theoretical question requiring a written explanation'

  const difficultyGuide = {
    beginner: 'suitable for developers with 0-1 years of experience. Focus on fundamentals, basic syntax, and simple concepts.',
    normal: 'suitable for developers with 1-3 years of experience. Include real-world scenarios and moderate complexity.',
    advanced: 'suitable for developers with 3+ years of experience. Cover edge cases, performance considerations, and architectural decisions.'
  }[difficulty]

  return `You are a technical interviewer generating a single interview question.

Generate ${typeList} about one of these topics: ${topicList}
Difficulty level: ${difficulty} — ${difficultyGuide}

IMPORTANT: Return ONLY a valid JSON object. No markdown fences, no explanation, no preamble.

Required JSON structure:
{
  "title": "Brief question title (10-200 chars)",
  "body": "Full question text with context (50-1500 chars). For coding questions include the problem statement, constraints, and example inputs/outputs. For theoretical questions include the scenario or concept to explain.",
  "type": "${types.length === 1 ? types[0] : 'coding or theoretical'}",
  "difficulty": "${difficulty}",
  "topic": "The specific topic from [${topicList}] this question covers",
  "expectedFormat": "e.g. 'Python function', 'Paragraph explanation', 'SQL query'"
}

Prompt version: ${PROMPT_VERSION}`
}
