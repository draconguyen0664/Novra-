'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Permission } from '@/lib/permissions';
import { AdminLogout } from './AdminLogout';

export type AdminNavGroup = {
  label?: string;
  items: { label: string; href: string; permission: Permission; icon: string }[];
};

export function AdminSidebar({ groups, user }: { groups: AdminNavGroup[]; user: { name?: string | null; email?: string | null; role: string } }) {
  const pathname = usePathname();
  return <aside className="admin-sidebar">
    <Link className="admin-brand" href="/admin/dashboard">novra*</Link>
    <nav aria-label="Quản trị">
      {groups.map((group, index) => <section key={group.label || index}>
        {group.label && <p>{group.label}</p>}
        {group.items.map((item) => <Link className={pathname === item.href || pathname.startsWith(item.href + '/') ? 'is-active' : ''} key={item.href} href={item.href}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}
      </section>)}
    </nav>
    <div className="admin-account"><strong>{user.name || 'Novra Admin'}</strong><span>{user.email}</span><small>{user.role}</small><AdminLogout /></div>
  </aside>;
}