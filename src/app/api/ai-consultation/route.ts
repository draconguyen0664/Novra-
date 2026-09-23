import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, hashIdentifier, hasTrustedOrigin, rateLimit, readJsonBody } from '@/lib/security';
import { getDictionary } from '@/i18n/dictionaries';

const schema = z.object({ message: z.string().trim().min(3).max(2000), locale: z.enum(['vi', 'en']) });

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!rateLimit(`ai:${hashIdentifier(getClientIp(request))}`, 15, 60 * 60 * 1000).allowed) return NextResponse.json({ ok: false, code: 'RATE_LIMITED' }, { status: 429 });
  try {
    const parsed = schema.safeParse(await readJsonBody(request, 4096));
    if (!parsed.success) return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR' }, { status: 400 });
    const dictionary = await getDictionary(parsed.data.locale);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: true, configured: false, reply: dictionary.aiConsultation.unavailable });
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5-mini', instructions: parsed.data.locale === 'vi' ? 'Bạn là tư vấn viên website của Novra. Trả lời ngắn gọn bằng tiếng Việt, không tự tạo báo giá hay cam kết.' : 'You are Novra’s website consultant. Reply concisely in English and never invent pricing or commitments.', input: parsed.data.message, max_output_tokens: 350 }) });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const body = await response.json() as { output_text?: string };
    return NextResponse.json({ ok: true, configured: true, reply: body.output_text || dictionary.aiConsultation.unavailable });
  } catch (error) { console.error('AI consultation failed', error); return NextResponse.json({ ok: false, code: 'INTERNAL_ERROR' }, { status: 500 }); }
}
