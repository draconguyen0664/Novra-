import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authorizeAdmin('leads');
  if (!session) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const { id } = await params;
    const { content } = z.object({ content: z.string().min(1).max(5000) }).parse(await readJsonBody(request, 8192));
    const data = await prisma.leadNote.create({ data: { leadId: id, authorId: session.user.id, content }, include: { author: { select: { name: true } } } });
    return NextResponse.json({ data }, { status: 201 });
  } catch { return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}