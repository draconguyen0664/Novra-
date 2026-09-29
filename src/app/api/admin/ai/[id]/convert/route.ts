import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';

const schema = z.object({ name: z.string().min(1), email: z.string().email(), phone: z.string().min(6), company: z.string().optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authorizeAdmin('ai');
  if (!session) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const { id } = await params;
    const values = schema.parse(await readJsonBody(request, 8192));
    const conversation = await prisma.aiConversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
    if (!conversation || conversation.leadId) return NextResponse.json({ code: 'NOT_AVAILABLE' }, { status: 400 });
    const lead = await prisma.contactInquiry.create({ data: {
      name: values.name, email: values.email, phone: values.phone, company: values.company || null,
      services: ['AI consultation'], budget: 'Chưa xác định',
      details: conversation.messages.map((message) => (message.role === 'USER' ? 'Khách: ' : 'Novra AI: ') + message.content).join('\n\n').slice(0, 12000),
      locale: conversation.locale, source: 'ai-consultation',
    } });
    await prisma.aiConversation.update({ where: { id }, data: { leadId: lead.id } });
    await prisma.auditLog.create({ data: { userId: session.user.id, action: 'CONVERT_TO_LEAD', resource: 'ai', resourceId: id } });
    return NextResponse.json({ data: lead }, { status: 201 });
  } catch { return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}