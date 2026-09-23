import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try { return NextResponse.json({ data: await prisma.blogPost.findMany({ where: { published: true }, include: { category: true }, orderBy: { publishedAt: 'desc' } }) }); }
  catch (error) { console.error('Blog read failed', error); return NextResponse.json({ data: [], code: 'DATA_UNAVAILABLE' }, { status: 503 }); }
}
