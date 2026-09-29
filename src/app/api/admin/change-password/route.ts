import { compare, hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIdentifier, hasTrustedOrigin, rateLimit, readJsonBody } from '@/lib/security';

const schema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z.string().min(8).max(200),
});

export async function POST(request: NextRequest) {
  const session = await authorizeAdmin('users');
  if (!session?.user?.id) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });

  const limitKey = `change-password:${session.user.id}:${hashIdentifier(getClientIp(request))}`;
  if (!rateLimit(limitKey, 5, 15 * 60 * 1000).allowed) {
    return NextResponse.json({ code: 'RATE_LIMITED' }, { status: 429 });
  }

  try {
    const value = schema.parse(await readJsonBody(request, 4096));
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.active || !(await compare(value.currentPassword, user.passwordHash))) {
      return NextResponse.json({ code: 'INVALID_CURRENT_PASSWORD' }, { status: 401 });
    }
    if (value.currentPassword === value.newPassword) {
      return NextResponse.json({ code: 'PASSWORD_UNCHANGED' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hash(value.newPassword, 12) },
      }),
      prisma.auditLog.create({
        data: { userId: user.id, action: 'CHANGE_PASSWORD', resource: 'users', resourceId: user.id },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin password change failed', error);
    return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 });
  }
}
