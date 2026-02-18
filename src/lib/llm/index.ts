// src/lib/llm/index.ts
// Factory function that reads VITE_DEFAULT_LLM_PROVIDER and returns the configured provider.
// Switching providers requires only a .env.local change — no code changes.
import { ClaudeProvider } from './claude'
import { OpenAIProvider } from './openai'
import type { LLMProvider } from './types'

export type { LLMProvider, QuestionGenerationParams } from './types'

export function getLLMProvider(): LLMProvider {
  const provider = import.meta.env.VITE_DEFAULT_LLM_PROVIDER || 'anthropic'

  if (provider === 'openai') {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) throw new Error('VITE_OPENAI_API_KEY not set in .env.local')
    return new OpenAIProvider(apiKey)
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set in .env.local')
  return new ClaudeProvider(apiKey)
}
