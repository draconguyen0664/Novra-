import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminLogout } from '@/components/admin/AdminLogout';
import { getAdminSession } from '@/lib/auth';

const links = [['Dashboard', '/admin/dashboard'], ['Inquiries', '/admin/inquiries'], ['Projects', '/admin/projects'], ['Blog', '/admin/blog'], ['Services', '/admin/services'], ['Pricing', '/admin/pricing'], ['FAQs', '/admin/faqs']];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession(); if (!session) redirect('/admin/login');
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin/dashboard">novra*</Link><nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><div className="admin-account"><span>{session.email}</span><AdminLogout /></div></aside><main className="admin-main">{children}</main></div>;
}
