import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  existing.count += 1;
  if (buckets.size > 5000) for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
  return { allowed: existing.count <= limit, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

export function hashIdentifier(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

export function hasTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  return origin === new URL(request.url).origin;
}

export function cleanPlainText(value: string) {
  return value.replace(/[<>]/g, '').replace(/\u0000/g, '').trim();
}

export async function readJsonBody(request: NextRequest, maxBytes = 16_384): Promise<unknown> {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('INVALID_JSON');
  }
}
