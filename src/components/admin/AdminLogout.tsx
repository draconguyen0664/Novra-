'use client';

import { signOut } from 'next-auth/react';

export function AdminLogout() {
  return <button className="admin-logout" type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })}>Đăng xuất</button>;
}