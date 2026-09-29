import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';

const statusSchema = z.object({ status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'SPAM', 'CLOSED']) });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizeAdmin('leads'))) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const { id } = await params;
  const data = await prisma.contactInquiry.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } } } });
  return data ? NextResponse.json({ data }) : NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authorizeAdmin('leads');
  if (!session) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const { id } = await params;
    const payload = statusSchema.parse(await readJsonBody(request, 4096));
    const data = await prisma.contactInquiry.update({ where: { id }, data: payload });
    await prisma.auditLog.create({ data: { userId: session.user.id, action: 'STATUS_CHANGE', resource: 'lead', resourceId: id, metadata: payload } });
    revalidatePath('/admin/leads');
    return NextResponse.json({ data });
  } catch { return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}