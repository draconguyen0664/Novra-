import { redirect } from 'next/navigation';
import { AdminSidebar, type AdminNavGroup } from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/admin-auth';
import { can } from '@/lib/permissions';

const groups: AdminNavGroup[] = [
  { items: [{ label: 'Tổng quan', href: '/admin/dashboard', permission: 'dashboard', icon: '◫' }] },
  { label: 'NỘI DUNG', items: [
    { label: 'Trang chủ', href: '/admin/homepage', permission: 'homepage', icon: '⌂' },
    { label: 'Trang', href: '/admin/pages', permission: 'pages', icon: '□' },
    { label: 'Dịch vụ', href: '/admin/services', permission: 'services', icon: '◇' },
    { label: 'Dự án', href: '/admin/projects', permission: 'projects', icon: '▣' },
    { label: 'Bảng giá', href: '/admin/pricing', permission: 'pricing', icon: '₫' },
    { label: 'Blog', href: '/admin/blog', permission: 'blog', icon: '✎' },
    { label: 'FAQ', href: '/admin/faq', permission: 'faq', icon: '?' },
  ] },
  { label: 'CRM', items: [
    { label: 'Khách hàng / Leads', href: '/admin/leads', permission: 'leads', icon: '◎' },
    { label: 'AI Conversations', href: '/admin/ai', permission: 'ai', icon: '✦' },
  ] },
  { label: 'MEDIA', items: [{ label: 'Thư viện', href: '/admin/media', permission: 'media', icon: '▧' }] },
  { label: 'WEBSITE', items: [
    { label: 'Menu', href: '/admin/navigation', permission: 'navigation', icon: '☷' },
    { label: 'Footer', href: '/admin/footer', permission: 'footer', icon: '⌄' },
    { label: 'SEO', href: '/admin/seo', permission: 'seo', icon: '↗' },
  ] },
  { label: 'HỆ THỐNG', items: [
    { label: 'Cài đặt', href: '/admin/settings', permission: 'settings', icon: '⚙' },
    { label: 'Người dùng', href: '/admin/users', permission: 'users', icon: '♙' },
  ] },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session?.user) redirect('/admin/login');
  const visibleGroups = groups.map((group) => ({ ...group, items: group.items.filter((item) => can(session.user.role, item.permission)) })).filter((group) => group.items.length);
  return <div className="admin-shell">
    <AdminSidebar groups={visibleGroups} user={session.user} />
    <main className="admin-main">
      <div className="admin-topbar"><span>Novra CMS</span><a href="/vi" target="_blank" rel="noreferrer">Xem website ↗</a></div>
      {children}
    </main>
  </div>;
}