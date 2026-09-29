import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { can, type Permission } from '@/lib/permissions';
import { createAdminResource, isAdminResource, listAdminResource, type AdminResource } from '@/lib/admin-resources';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';
import { prisma } from '@/lib/prisma';

const permissions: Record<AdminResource, Permission> = {
  projects: 'projects', blog: 'blog', services: 'services', pricing: 'pricing', faqs: 'faq',
};

async function context(resource: string) {
  const session = await auth();
  if (!session?.user) return { response: NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 }) };
  if (!isAdminResource(resource)) return { response: NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 }) };
  if (!can(session.user.role, permissions[resource])) return { response: NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 }) };
  return { session, resource };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const values = await params;
  const result = await context(values.resource);
  if ('response' in result) return result.response;
  try { return NextResponse.json({ data: await listAdminResource(result.resource) }); }
  catch (error) { console.error('Admin list failed', error); return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const values = await params;
  const result = await context(values.resource);
  if ('response' in result) return result.response;
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const data = await createAdminResource(result.resource, await readJsonBody(request, 128_000));
    const resourceId = typeof data === 'object' && data && 'id' in data ? String(data.id) : undefined;
    await prisma.auditLog.create({ data: { userId: result.session.user.id, action: 'CREATE', resource: result.resource, resourceId } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Admin create failed', error);
    return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 });
  }
}