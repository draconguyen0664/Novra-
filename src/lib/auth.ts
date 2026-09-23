import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'novra_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;

type Session = { userId: string; email: string; role: 'ADMIN'; exp: number };

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value && process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET is required');
  return value || 'local-development-secret-change-me';
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(user: Omit<Session, 'exp'>) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Session;
    return session.role === 'ADMIN' && session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch { return null; }
}

export async function getAdminSession() {
  return verifySessionToken((await cookies()).get(COOKIE_NAME)?.value);
}

export function getAdminSessionFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(COOKIE_NAME)?.value);
}

export const sessionCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_SECONDS,
  options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: SESSION_SECONDS },
};
