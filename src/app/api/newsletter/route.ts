import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIdentifier, hasTrustedOrigin, rateLimit, readJsonBody } from '@/lib/security';

const schema = z.object({ email: z.string().trim().email().max(160), locale: z.enum(['vi', 'en']) });

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!rateLimit(`newsletter:${hashIdentifier(getClientIp(request))}`, 5, 60 * 60 * 1000).allowed) return NextResponse.json({ ok: false, code: 'RATE_LIMITED' }, { status: 429 });
  try {
    const parsed = schema.safeParse(await readJsonBody(request, 2048));
    if (!parsed.success) return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR' }, { status: 400 });
    await prisma.newsletterSubscriber.upsert({ where: { email: parsed.data.email.toLowerCase() }, create: { email: parsed.data.email.toLowerCase(), locale: parsed.data.locale }, update: { locale: parsed.data.locale, active: true } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) { console.error('Newsletter subscription failed', error); return NextResponse.json({ ok: false, code: 'INTERNAL_ERROR' }, { status: 500 }); }
}
