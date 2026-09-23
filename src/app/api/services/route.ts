import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { try { return NextResponse.json({ data: await prisma.service.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }) }); } catch (error) { console.error(error); return NextResponse.json({ data: [], code: 'DATA_UNAVAILABLE' }, { status: 503 }); } }
