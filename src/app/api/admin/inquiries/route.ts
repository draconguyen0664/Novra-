import { InquiryStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  if (!getAdminSessionFromRequest(request)) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  const status = request.nextUrl.searchParams.get('status');
  const query = request.nextUrl.searchParams.get('q')?.slice(0, 100).trim();
  const where: Prisma.ContactInquiryWhereInput = {};
  if (status && Object.values(InquiryStatus).includes(status as InquiryStatus)) where.status = status as InquiryStatus;
  if (query) where.OR = [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }, { phone: { contains: query, mode: 'insensitive' } }];
  try { return NextResponse.json({ data: await prisma.contactInquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 }) }); }
  catch (error) { console.error(error); return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 }); }
}
