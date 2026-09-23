import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try { return NextResponse.json({ data: await prisma.project.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }) }); }
  catch (error) { console.error('Projects read failed', error); return NextResponse.json({ data: [], code: 'DATA_UNAVAILABLE' }, { status: 503 }); }
}
