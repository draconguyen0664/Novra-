import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteAdminResource, isAdminResource, updateAdminResource, type AdminResource } from '@/lib/admin-resources';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';
import { prisma } from '@/lib/prisma';

async function context(request: NextRequest, params: Promise<{ resource: string; id: string }>) { const session = getAdminSessionFromRequest(request); if (!session) return { response: NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 }) }; if (!hasTrustedOrigin(request)) return { response: NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 }) }; const values = await params; if (!isAdminResource(values.resource)) return { response: NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 }) }; return { session, resource: values.resource as AdminResource, id: values.id }; }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const result = await context(request, params); if ('response' in result) return result.response;
  try { const data = await updateAdminResource(result.resource, result.id, await readJsonBody(request, 128_000)); await prisma.auditLog.create({ data: { userId: result.session.userId, action: 'UPDATE', resource: result.resource, resourceId: result.id } }); return NextResponse.json({ data }); } catch (error) { console.error(error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const result = await context(request, params); if ('response' in result) return result.response;
  try { await deleteAdminResource(result.resource, result.id); await prisma.auditLog.create({ data: { userId: result.session.userId, action: 'DELETE', resource: result.resource, resourceId: result.id } }); return NextResponse.json({ ok: true }); } catch (error) { console.error(error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}
