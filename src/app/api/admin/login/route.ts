import { compare } from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken, sessionCookie } from '@/lib/auth';
import { getClientIp, hashIdentifier, hasTrustedOrigin, rateLimit, readJsonBody } from '@/lib/security';

const schema = z.object({ email: z.string().email().max(160), password: z.string().min(8).max(200) });

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!rateLimit(`login:${hashIdentifier(getClientIp(request))}`, 10, 15 * 60 * 1000).allowed) return NextResponse.json({ ok: false, code: 'RATE_LIMITED' }, { status: 429 });
  try {
    const parsed = schema.safeParse(await readJsonBody(request, 4096));
    if (!parsed.success) return NextResponse.json({ ok: false, code: 'INVALID_CREDENTIALS' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || user.role !== 'ADMIN' || !(await compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ ok: false, code: 'INVALID_CREDENTIALS' }, { status: 401 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie.name, createSessionToken({ userId: user.id, email: user.email, role: 'ADMIN' }), sessionCookie.options);
    return response;
  } catch (error) { console.error('Admin login failed', error); return NextResponse.json({ ok: false, code: 'INTERNAL_ERROR' }, { status: 500 }); }
}
