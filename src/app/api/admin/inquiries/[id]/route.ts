import { InquiryStatus } from '@prisma/client';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';

const schema = z.object({ status: z.nativeEnum(InquiryStatus) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try { const { id } = await params; const input = schema.parse(await readJsonBody(request, 2048)); const data = await prisma.contactInquiry.update({ where: { id }, data: input }); await prisma.auditLog.create({ data: { userId: session.userId, action: 'STATUS_CHANGE', resource: 'inquiry', resourceId: id, metadata: { status: input.status } } }); return NextResponse.json({ data }); }
  catch (error) { console.error(error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}
