import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hasTrustedOrigin, readJsonBody } from '@/lib/security';

const defaults = [
  ['hero', 'Hero'], ['hero-projects', 'Hero Fan Projects'], ['experience', 'Experience'],
  ['ai-consultation', 'AI Consultation'], ['services', 'Services'], ['projects', 'Projects'],
  ['why-novra', 'Why Novra'], ['pricing', 'Pricing'], ['capabilities', 'Capabilities'],
  ['process', 'Process'], ['faq', 'FAQ'], ['about', 'About'], ['contact', 'Contact'],
  ['final-cta', 'Final CTA'],
] as const;

const updateSchema = z.object({
  sections: z.array(z.object({ id: z.string(), sortOrder: z.number().int().nonnegative() })).optional(),
  section: z.object({
    id: z.string(),
    enabled: z.boolean().optional(),
    contentVi: z.record(z.string(), z.unknown()).nullable().optional(),
    contentEn: z.record(z.string(), z.unknown()).nullable().optional(),
  }).optional(),
});

async function homepage() {
  const page = await prisma.page.upsert({
    where: { key: 'homepage' },
    create: { key: 'homepage', name: 'Trang chủ', slugVi: 'trang-chu', slugEn: 'home' },
    update: {},
  });
  const existing = await prisma.pageSection.findMany({ where: { pageId: page.id }, select: { key: true } });
  const current = new Set(existing.map((item) => item.key));
  const missing = defaults.flatMap(([key, name], sortOrder) => current.has(key) ? [] : [{ pageId: page.id, key, name, sortOrder }]);
  if (missing.length) await prisma.pageSection.createMany({ data: missing });
  return prisma.page.findUniqueOrThrow({
    where: { id: page.id },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function GET() {
  if (!(await authorizeAdmin('homepage'))) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  try { return NextResponse.json({ data: await homepage() }); }
  catch (error) { console.error('Homepage CMS load failed', error); return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 }); }
}

export async function PATCH(request: NextRequest) {
  const session = await authorizeAdmin('homepage');
  if (!session) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const payload = updateSchema.parse(await readJsonBody(request, 256_000));
    await homepage();
    if (payload.sections) {
      await prisma.$transaction(payload.sections.map((item) => prisma.pageSection.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })));
    }
    if (payload.section) {
      const { id, ...data } = payload.section;
      await prisma.pageSection.update({ where: { id }, data: data as Prisma.PageSectionUpdateInput });
    }
    await prisma.auditLog.create({ data: { userId: session.user.id, action: 'UPDATE', resource: 'homepage' } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ data: await homepage() });
  } catch (error) {
    console.error('Homepage CMS update failed', error);
    return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 });
  }
}