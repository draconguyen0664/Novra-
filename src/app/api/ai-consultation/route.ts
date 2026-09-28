import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildNovraAiInstructions } from '@/lib/ai-consultation';
import { getOpenAIClient, getOpenAIModel } from '@/lib/openai';
import { getClientIp, hashIdentifier, hasTrustedOrigin, rateLimit, readJsonBody } from '@/lib/security';
import { getDictionary } from '@/i18n/dictionaries';

export const runtime = 'nodejs';

const historyItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(3000),
});

const requestSchema = z.object({
  message: z.string().trim().min(2).max(3000),
  locale: z.enum(['vi', 'en']),
  history: z.array(historyItemSchema).max(20).optional().default([]),
});

type ErrorCode = 'INVALID_ORIGIN' | 'INVALID_INPUT' | 'AI_NOT_CONFIGURED' | 'AI_PROVIDER_ERROR' | 'RATE_LIMITED';

function errorResponse(status: number, code: ErrorCode, message: string, headers?: HeadersInit) {
  console.info('POST /api/ai-consultation', { status, code });
  return NextResponse.json({ success: false, code, message }, { status, headers });
}

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse(403, 'INVALID_ORIGIN', 'Request origin is not allowed.');
  }

  const limit = rateLimit(`ai:${hashIdentifier(getClientIp(request))}`, 15, 60_000);
  if (!limit.allowed) {
    return errorResponse(429, 'RATE_LIMITED', 'Too many requests.', { 'Retry-After': '60' });
  }

  let input: unknown;
  try {
    input = await readJsonBody(request, 64_000);
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'The request body is invalid.');
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return errorResponse(400, 'INVALID_INPUT', 'The consultation request is invalid.');
  }

  const { locale, message } = parsed.data;
  const history = parsed.data.history.slice(-16);
  const dictionary = await getDictionary(locale);
  const openai = getOpenAIClient();

  if (!openai) {
    return errorResponse(503, 'AI_NOT_CONFIGURED', dictionary.aiConsultation.unavailable);
  }

  try {
    const instructions = await buildNovraAiInstructions(locale);
    const response = await openai.responses.create({
      model: getOpenAIModel(),
      instructions,
      input: [...history, { role: 'user' as const, content: message }],
      max_output_tokens: 450,
      store: false,
    });
    const assistantMessage = response.output_text.trim();
    if (!assistantMessage) throw new Error('OpenAI returned an empty response.');

    console.info('POST /api/ai-consultation', { status: 200, model: getOpenAIModel() });
    return NextResponse.json({ success: true, message: assistantMessage });
  } catch (error) {
    const providerError = error as { name?: unknown; message?: unknown; status?: unknown };
    console.error('AI consultation provider error', {
      name: typeof providerError.name === 'string' ? providerError.name : 'UnknownError',
      message: typeof providerError.message === 'string' ? providerError.message.slice(0, 300) : 'Unknown provider error',
      status: typeof providerError.status === 'number' ? providerError.status : undefined,
    });
    return errorResponse(502, 'AI_PROVIDER_ERROR', dictionary.aiConsultation.error);
  }
}
