import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma, UserRole } from '@prisma/client';
import { authorizeAdmin } from '@/lib/admin-auth';
import type { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';

const resources = ['pages', 'navigation', 'seo', 'settings', 'footer', 'users', 'hero-cards', 'ai', 'media', 'categories', 'tags'] as const;
type Resource = typeof resources[number];

const permissions: Record<Resource, Permission> = {
  pages: 'pages', navigation: 'navigation', seo: 'seo', settings: 'settings', footer: 'footer',
  users: 'users', 'hero-cards': 'homepage', ai: 'ai', media: 'media', categories: 'blog', tags: 'blog',
};

const schemas = {
  pages: z.object({ id: z.string().optional(), key: z.string().min(1), name: z.string().min(1), slugVi: z.string().min(1), slugEn: z.string().min(1), published: z.boolean().default(true) }),
  navigation: z.object({ id: z.string().optional(), labelVi: z.string().min(1), labelEn: z.string().min(1), urlVi: z.string().min(1), urlEn: z.string().min(1), visible: z.boolean().default(true), openInNewTab: z.boolean().default(false), sortOrder: z.number().int().default(0) }),
  seo: z.object({ id: z.string().optional(), key: z.string().min(1), titleVi: z.string().nullable().optional(), titleEn: z.string().nullable().optional(), descriptionVi: z.string().nullable().optional(), descriptionEn: z.string().nullable().optional(), ogImage: z.string().nullable().optional(), canonicalUrl: z.string().nullable().optional(), indexable: z.boolean().default(true) }),
  users: z.object({ id: z.string().optional(), name: z.string().min(1), email: z.string().email(), password: z.string().min(12).optional(), role: z.enum(['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'MARKETING']), active: z.boolean().default(true) }),
  categories: z.object({ id: z.string().optional(), slug: z.string().min(1), nameVi: z.string().min(1), nameEn: z.string().min(1) }),
  tags: z.object({ id: z.string().optional(), slug: z.string().min(1), nameVi: z.string().min(1), nameEn: z.string().min(1) }),
  'hero-cards': z.object({ id: z.string().optional(), projectId: z.string().nullable().optional(), image: z.string().min(1), link: z.string().nullable().optional(), visible: z.boolean().default(true), sortOrder: z.number().int().default(0) }),
};

function validResource(value: string): value is Resource {
  return resources.includes(value as Resource);
}

async function access(resource: string) {
  if (!validResource(resource)) return { response: NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 }) };
  const session = await authorizeAdmin(permissions[resource]);
  if (!session) return { response: NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 }) };
  return { resource, session };
}

async function list(resource: Resource) {
  switch (resource) {
    case 'pages': return prisma.page.findMany({ orderBy: { updatedAt: 'desc' }, include: { _count: { select: { sections: true } } } });
    case 'navigation': return prisma.navigationItem.findMany({ orderBy: { sortOrder: 'asc' } });
    case 'seo': return prisma.seoSetting.findMany({ orderBy: { key: 'asc' } });
    case 'settings':
    case 'footer': return prisma.siteSetting.upsert({ where: { id: 'primary' }, create: { companyName: 'Novra', phone: '', email: '', defaultLocale: 'vi' }, update: {} });
    case 'users': return prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, active: true, createdAt: true, updatedAt: true } });
    case 'hero-cards': return prisma.heroProjectCard.findMany({ orderBy: { sortOrder: 'asc' }, include: { project: { select: { titleVi: true, titleEn: true } } } });
    case 'ai': return prisma.aiConversation.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { messages: { orderBy: { createdAt: 'asc' } }, lead: { select: { id: true, name: true } } } });
    case 'media': return prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    case 'categories': return prisma.category.findMany({ orderBy: { nameVi: 'asc' } });
    case 'tags': return prisma.tag.findMany({ orderBy: { nameVi: 'asc' } });
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const result = await access(resource);
  if ('response' in result) return result.response;
  try { return NextResponse.json({ data: await list(result.resource) }); }
  catch (error) { console.error('CMS list failed', error); return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const result = await access(resource);
  if ('response' in result) return result.response;
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const raw = await readJsonBody(request, 128_000);
    let data: unknown;
    if (result.resource === 'pages') data = await prisma.page.create({ data: schemas.pages.parse(raw) });
    else if (result.resource === 'navigation') data = await prisma.navigationItem.create({ data: schemas.navigation.parse(raw) });
    else if (result.resource === 'seo') data = await prisma.seoSetting.create({ data: schemas.seo.parse(raw) });
    else if (result.resource === 'categories') data = await prisma.category.create({ data: schemas.categories.parse(raw) });
    else if (result.resource === 'tags') data = await prisma.tag.create({ data: schemas.tags.parse(raw) });
    else if (result.resource === 'hero-cards') data = await prisma.heroProjectCard.create({ data: schemas['hero-cards'].parse(raw) });
    else if (result.resource === 'users') {
      const value = schemas.users.parse(raw);
      if (!value.password) return NextResponse.json({ code: 'PASSWORD_REQUIRED' }, { status: 400 });
      data = await prisma.user.create({ data: { name: value.name, email: value.email.toLowerCase(), passwordHash: await hash(value.password, 12), role: value.role, active: value.active } });
    } else return NextResponse.json({ code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
    await prisma.auditLog.create({ data: { userId: result.session.user.id, action: 'CREATE', resource: result.resource } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { console.error('CMS create failed', error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const result = await access(resource);
  if ('response' in result) return result.response;
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const raw = await readJsonBody(request, 256_000) as Record<string, unknown>;
    if (Array.isArray(raw.order) && ['navigation', 'hero-cards'].includes(result.resource)) {
      const model = result.resource === 'navigation' ? prisma.navigationItem : prisma.heroProjectCard;
      await prisma.$transaction(raw.order.map((id, sortOrder) => (model as typeof prisma.navigationItem).update({ where: { id: String(id) }, data: { sortOrder } })));
    } else if (result.resource === 'settings' || result.resource === 'footer') {
      const allowed = result.resource === 'footer'
        ? ['footerContent']
        : ['companyName', 'logo', 'favicon', 'email', 'phone', 'zalo', 'facebook', 'linkedIn', 'address', 'defaultLocale', 'ga4Id', 'metaPixelId', 'searchConsoleVerification'];
      const data = Object.fromEntries(Object.entries(raw).filter(([key]) => allowed.includes(key))) as Prisma.SiteSettingUpdateInput;
      await prisma.siteSetting.upsert({ where: { id: 'primary' }, create: { id: 'primary', companyName: String(raw.companyName || 'Novra'), phone: String(raw.phone || ''), email: String(raw.email || '') }, update: data });
    } else {
      const id = String(raw.id || '');
      if (!id) return NextResponse.json({ code: 'ID_REQUIRED' }, { status: 400 });
      if (result.resource === 'pages') { const value = schemas.pages.parse(raw); const { id: _id, ...data } = value; await prisma.page.update({ where: { id }, data }); }
      else if (result.resource === 'navigation') { const value = schemas.navigation.parse(raw); const { id: _id, ...data } = value; await prisma.navigationItem.update({ where: { id }, data }); }
      else if (result.resource === 'seo') { const value = schemas.seo.parse(raw); const { id: _id, ...data } = value; await prisma.seoSetting.update({ where: { id }, data }); }
      else if (result.resource === 'categories') { const value = schemas.categories.parse(raw); const { id: _id, ...data } = value; await prisma.category.update({ where: { id }, data }); }
      else if (result.resource === 'tags') { const value = schemas.tags.parse(raw); const { id: _id, ...data } = value; await prisma.tag.update({ where: { id }, data }); }
      else if (result.resource === 'hero-cards') { const value = schemas['hero-cards'].parse(raw); const { id: _id, ...data } = value; await prisma.heroProjectCard.update({ where: { id }, data }); }
      else if (result.resource === 'users') {
        const value = schemas.users.parse(raw); const { id: _id, password, ...rest } = value;
        const data: Prisma.UserUpdateInput = { ...rest, email: rest.email.toLowerCase() };
        if (password) data.passwordHash = await hash(password, 12);
        await prisma.user.update({ where: { id }, data });
      } else return NextResponse.json({ code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
    }
    await prisma.auditLog.create({ data: { userId: result.session.user.id, action: 'UPDATE', resource: result.resource } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ data: await list(result.resource) });
  } catch (error) { console.error('CMS update failed', error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const result = await access(resource);
  if ('response' in result) return result.response;
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const { id } = z.object({ id: z.string() }).parse(await readJsonBody(request, 4096));
    if (result.resource === 'pages') await prisma.page.delete({ where: { id } });
    else if (result.resource === 'navigation') await prisma.navigationItem.delete({ where: { id } });
    else if (result.resource === 'seo') await prisma.seoSetting.delete({ where: { id } });
    else if (result.resource === 'categories') await prisma.category.delete({ where: { id } });
    else if (result.resource === 'tags') await prisma.tag.delete({ where: { id } });
    else if (result.resource === 'hero-cards') await prisma.heroProjectCard.delete({ where: { id } });
    else if (result.resource === 'users') {
      if (id === result.session.user.id) return NextResponse.json({ code: 'CANNOT_DELETE_SELF' }, { status: 400 });
      await prisma.user.delete({ where: { id } });
    } else return NextResponse.json({ code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
    await prisma.auditLog.create({ data: { userId: result.session.user.id, action: 'DELETE', resource: result.resource, resourceId: id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (error) { console.error('CMS delete failed', error); return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}