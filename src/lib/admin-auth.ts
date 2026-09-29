import 'server-only';
import { auth } from '@/auth';
import { can, type Permission } from '@/lib/permissions';

export async function getAdminSession() {
  return auth();
}

export async function authorizeAdmin(permission: Permission) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, permission)) return null;
  return session;
}
