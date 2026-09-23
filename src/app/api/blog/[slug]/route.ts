import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await prisma.blogPost.findFirst({ where: { published: true, OR: [{ slugVi: slug }, { slugEn: slug }] }, include: { category: true } });
    return data ? NextResponse.json({ data }) : NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  } catch (error) { console.error('Blog post read failed', error); return NextResponse.json({ code: 'DATA_UNAVAILABLE' }, { status: 503 }); }
}
