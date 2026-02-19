// src/lib/llm/prompts.ts
// Versioned question generation prompts and evaluation prompts.
// Version is included in the prompt so output can be traced to a specific prompt version.
// Update PROMPT_VERSION / EVAL_PROMPT_VERSION when changing prompts to enable A/B tracking.
import type { QuestionGenerationParams, EvaluationParams } from './types'

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

export const EVAL_PROMPT_VERSION = 'v1.0'

export function buildEvaluationPrompt(params: EvaluationParams): string {
  const rubric = buildRubric(params.difficulty, params.questionType)
  const formatHint = params.expectedFormat
    ? `\nExpected format: ${params.expectedFormat}`
    : ''

  return `You are an expert technical interviewer evaluating a candidate's answer. Be rigorous but fair.

QUESTION (${params.topic} — ${params.difficulty}):
${params.question}${formatHint}

CANDIDATE'S ANSWER:
${params.userAnswer || '[No answer provided]'}

SCORING RUBRIC:
${rubric}

EVALUATION PROCESS — follow these steps in order:
1. Correctness: Is the answer technically accurate? Identify any errors.
2. Completeness: Does it address all parts of the question?
3. Quality: Is the explanation clear and at the appropriate depth for ${params.difficulty} level?
4. Presentation: ${params.questionType === 'coding' ? 'Is the code clean, readable, and efficient?' : 'Is it well-structured with clear reasoning?'}

Return ONLY a valid JSON object — no markdown fences, no explanation outside the JSON:
{
  "reasoning": "Your step-by-step analysis following the 4 evaluation steps above",
  "score": <integer 0-100 matching the rubric>,
  "feedback": "Markdown-formatted feedback: what was good, what to improve, and specific suggestions",
  "modelAnswer": "Markdown-formatted model answer the candidate can learn from"
}

Evaluation prompt version: ${EVAL_PROMPT_VERSION}`
}

function buildRubric(difficulty: 'beginner' | 'normal' | 'advanced', type: 'coding' | 'theoretical'): string {
  const rubrics = {
    beginner: {
      coding: '0-30: Syntax errors or logic is fundamentally wrong. 31-69: Mostly works but has notable bugs or misses key concepts. 70-84: Correct with minor issues. 85-100: Clean, correct solution demonstrating solid fundamentals.',
      theoretical: '0-30: Incorrect or missing key concepts. 31-69: Partially correct, significant gaps in understanding. 70-84: Correct with minor omissions. 85-100: Comprehensive, accurate, well-explained.'
    },
    normal: {
      coding: '0-30: Wrong approach or major logic bugs. 31-69: Works but inefficient, unclear, or misses real-world considerations. 70-84: Good solution, minor optimization opportunity. 85-100: Excellent code quality, efficiency, and clarity.',
      theoretical: '0-30: Fundamental misunderstanding. 31-69: Correct basics but missing important nuance or real-world context. 70-84: Good depth with minor gaps. 85-100: Expert-level insight with clear reasoning.'
    },
    advanced: {
      coding: '0-30: Fails to solve or contains critical bugs. 31-69: Solves but misses edge cases, performance considerations, or best practices. 70-84: Solid solution, one advanced aspect missed. 85-100: Handles edge cases, optimal complexity, production-ready.',
      theoretical: '0-30: Incorrect or superficial. 31-69: Addresses the question but lacks depth or misses key tradeoffs. 70-84: Strong depth, one advanced consideration missing. 85-100: Expert analysis including tradeoffs, real-world implications, and nuance.'
    }
  }
  return rubrics[difficulty][type]
}
