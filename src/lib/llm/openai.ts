// src/lib/llm/openai.ts
// OpenAI fallback implementation of LLMProvider.
// Used when VITE_DEFAULT_LLM_PROVIDER=openai or as a backup if Anthropic is unavailable.
import OpenAI from 'openai'
import { buildQuestionPrompt } from './prompts'
import type { LLMProvider, QuestionGenerationParams } from './types'

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
}
