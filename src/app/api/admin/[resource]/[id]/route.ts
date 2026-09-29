import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { can, type Permission } from '@/lib/permissions';
import { deleteAdminResource, isAdminResource, updateAdminResource, type AdminResource } from '@/lib/admin-resources';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';
import { prisma } from '@/lib/prisma';

const permissions: Record<AdminResource, Permission> = {
  projects: 'projects', blog: 'blog', services: 'services', pricing: 'pricing', faqs: 'faq',
};

async function context(request: NextRequest, params: Promise<{ resource: string; id: string }>) {
  const session = await auth();
  if (!session?.user) return { response: NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 }) };
  if (!hasTrustedOrigin(request)) return { response: NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 }) };
  const values = await params;
  if (!isAdminResource(values.resource)) return { response: NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 }) };
  if (!can(session.user.role, permissions[values.resource])) return { response: NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 }) };
  return { session, resource: values.resource, id: values.id };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const result = await context(request, params);
  if ('response' in result) return result.response;
  try {
    const data = await updateAdminResource(result.resource, result.id, await readJsonBody(request, 128_000));
    await prisma.auditLog.create({ data: { userId: result.session.user.id, action: 'UPDATE', resource: result.resource, resourceId: result.id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin update failed', error);
    return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const result = await context(request, params);
  if ('response' in result) return result.response;
  try {
    await deleteAdminResource(result.resource, result.id);
    await prisma.auditLog.create({ data: { userId: result.session.user.id, action: 'DELETE', resource: result.resource, resourceId: result.id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin delete failed', error);
    return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 });
  }
}