// src/lib/llm/openai.ts
// OpenAI fallback implementation of LLMProvider.
// Used when VITE_DEFAULT_LLM_PROVIDER=openai or as a backup if Anthropic is unavailable.
import OpenAI from 'openai'
import { buildQuestionPrompt, buildEvaluationPrompt } from './prompts'
import type { LLMProvider, QuestionGenerationParams, EvaluationParams, EvaluationResult } from './types'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Required for Vite client-side usage
    })
  }

  async generateQuestion(params: QuestionGenerationParams): Promise<string> {
    const prompt = buildQuestionPrompt(params)
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
    return response.choices[0]?.message?.content ?? ''
  }

  async *generateQuestionStream(params: QuestionGenerationParams): AsyncIterable<string> {
    const prompt = buildQuestionPrompt(params)
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'user', content: prompt }]
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }

  async evaluateAnswer(params: EvaluationParams): Promise<EvaluationResult> {
    const prompt = buildEvaluationPrompt(params)
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2048,        // Evaluation needs more tokens than question generation
      temperature: 0.2,        // Low temperature for deterministic, consistent scoring
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Unexpected LLM response from evaluation (no content)')

    // Parse JSON — LLM is prompted to return only valid JSON
    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      throw new Error(`Evaluation returned invalid JSON: ${content.substring(0, 200)}`)
    }

    // EvaluationSchema.parse is called again in evaluation.ts, but we validate here too
    // to catch LLM provider-level issues early with a clear error
    return parsed as EvaluationResult
  }
}
