import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getStorageAdapter } from '@/lib/storage';
import { hasTrustedOrigin } from '@/lib/security';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
const extensions: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg' };

export async function GET() {
  if (!(await authorizeAdmin('media'))) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  return NextResponse.json({ data: await prisma.media.findMany({ orderBy: { createdAt: 'desc' } }) });
}

export async function POST(request: NextRequest) {
  const session = await authorizeAdmin('media');
  if (!session) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !allowed.has(file.type) || file.size > 10 * 1024 * 1024) return NextResponse.json({ code: 'INVALID_FILE' }, { status: 400 });
    const extension = extensions[file.type] || path.extname(file.name).toLowerCase();
    const filename = randomUUID() + extension;
    const buffer = Buffer.from(await file.arrayBuffer());
    let width: number | undefined; let height: number | undefined;
    if (file.type !== 'image/svg+xml') {
      const metadata = await sharp(buffer).metadata(); width = metadata.width; height = metadata.height;
    }
    const uploaded = await getStorageAdapter().upload(new File([buffer], file.name, { type: file.type }), filename);
    const data = await prisma.media.create({ data: { filename: file.name, url: uploaded.url, mimeType: file.type, size: file.size, width, height } });
    await prisma.auditLog.create({ data: { userId: session.user.id, action: 'UPLOAD', resource: 'media', resourceId: data.id } });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { console.error('Media upload failed', error); return NextResponse.json({ code: 'UPLOAD_FAILED' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  const session = await authorizeAdmin('media');
  if (!session) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ code: 'INVALID_ORIGIN' }, { status: 403 });
  try {
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    const media = await prisma.media.delete({ where: { id } });
    await getStorageAdapter().remove(media.url);
    await prisma.auditLog.create({ data: { userId: session.user.id, action: 'DELETE', resource: 'media', resourceId: id } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ code: 'INVALID_REQUEST' }, { status: 400 }); }
}