import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { createAdminResource, isAdminResource, listAdminResource } from '@/lib/admin-resources';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  if (!getAdminSessionFromRequest(request)) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  const { resource } = await params;
  if (!isAdminResource(resource)) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  try { return NextResponse.json({ data: await listAdminResource(resource) }); } catch (error) { console.error(error); return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  const { resource } = await params;
  if (!isAdminResource(resource)) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  try { const data = await createAdminResource(resource, await readJsonBody(request, 128_000)); const resourceId = typeof data === 'object' && data && 'id' in data ? String(data.id) : undefined; await prisma.auditLog.create({ data: { userId: session.userId, action: 'CREATE', resource, resourceId } }); return NextResponse.json({ data }, { status: 201 }); }
  catch (error) { console.error(error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}
