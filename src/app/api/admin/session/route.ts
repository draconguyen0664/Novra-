import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest, sessionCookie } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';

export async function GET(request: NextRequest) { const session = getAdminSessionFromRequest(request); return session ? NextResponse.json({ user: { email: session.email, role: session.role } }) : NextResponse.json({ user: null }, { status: 401 }); }
export async function DELETE(request: NextRequest) { if (!hasTrustedOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 }); const response = NextResponse.json({ ok: true }); response.cookies.set(sessionCookie.name, '', { ...sessionCookie.options, maxAge: 0 }); return response; }
