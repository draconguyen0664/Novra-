import { NextRequest, NextResponse } from 'next/server';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  if (!(await authorizeAdmin('leads'))) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const params = request.nextUrl.searchParams;
  const q = params.get('q')?.trim();
  const status = params.get('status') || undefined;
  const service = params.get('service') || undefined;
  const budget = params.get('budget') || undefined;
  const page = Math.max(1, Number(params.get('page') || 1));
  const where = {
    ...(status ? { status: status as never } : {}),
    ...(service ? { services: { has: service } } : {}),
    ...(budget ? { budget } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }, { phone: { contains: q, mode: 'insensitive' as const } }] } : {}),
  };
  try {
    const [data, total] = await Promise.all([
      prisma.contactInquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 20, take: 20 }),
      prisma.contactInquiry.count({ where }),
    ]);
    return NextResponse.json({ data, total, page, pages: Math.max(1, Math.ceil(total / 20)) });
  } catch (error) { console.error('Lead list failed', error); return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 }); }
}