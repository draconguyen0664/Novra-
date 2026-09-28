import 'server-only';
import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  client ??= new OpenAI({ apiKey, maxRetries: 1, timeout: 25_000 });
  return client;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-5-mini';
}
