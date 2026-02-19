// src/lib/llm/claude.ts
// Anthropic Claude implementation of LLMProvider.
// Uses claude-opus-4-6 as specified in project decisions (highest reasoning, 92% HumanEval).
import Anthropic from '@anthropic-ai/sdk'
import { buildQuestionPrompt, buildEvaluationPrompt } from './prompts'
import type { LLMProvider, QuestionGenerationParams, EvaluationParams, EvaluationResult } from './types'

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true // Required for Vite client-side usage
    })
  }

  async generateQuestion(params: QuestionGenerationParams): Promise<string> {
    const prompt = buildQuestionPrompt(params)
    const message = await this.client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected LLM response type')
    return content.text
  }

  async *generateQuestionStream(params: QuestionGenerationParams): AsyncIterable<string> {
    const prompt = buildQuestionPrompt(params)
    const stream = this.client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text
      }
    }
  }

  async evaluateAnswer(params: EvaluationParams): Promise<EvaluationResult> {
    const prompt = buildEvaluationPrompt(params)
    const message = await this.client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,        // Evaluation needs more tokens than question generation
      temperature: 0.2,        // Low temperature for deterministic, consistent scoring
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected LLM response type from evaluation')

    // Parse JSON — LLM is prompted to return only valid JSON
    let parsed: unknown
    try {
      parsed = JSON.parse(content.text)
    } catch {
      throw new Error(`Evaluation returned invalid JSON: ${content.text.substring(0, 200)}`)
    }

    // EvaluationSchema.parse is called again in evaluation.ts, but we validate here too
    // to catch LLM provider-level issues early with a clear error
    return parsed as EvaluationResult
  }
}
