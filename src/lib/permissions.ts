import type { UserRole } from '@prisma/client';

export type Permission =
  | 'dashboard' | 'homepage' | 'pages' | 'services' | 'projects' | 'pricing'
  | 'blog' | 'faq' | 'leads' | 'ai' | 'media' | 'navigation' | 'footer'
  | 'seo' | 'settings' | 'users';

const grants: Record<UserRole, Permission[] | '*'> = {
  ADMIN: '*',
  SUPER_ADMIN: '*',
  EDITOR: ['dashboard', 'homepage', 'pages', 'services', 'projects', 'blog', 'faq', 'media'],
  MARKETING: ['dashboard', 'blog', 'seo', 'leads', 'pricing', 'media'],
};

export function can(role: UserRole, permission: Permission) {
  const allowed = grants[role];
  return allowed === '*' || allowed.includes(permission);
}