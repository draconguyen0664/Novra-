import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let counts = { leads: 0, projects: 0, posts: 0, services: 0, ai: 0 };
  let leads: Awaited<ReturnType<typeof prisma.contactInquiry.findMany>> = [];
  let activity: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = [];
  try {
    const result = await Promise.all([
      prisma.contactInquiry.count({ where: { status: 'NEW' } }), prisma.project.count(), prisma.blogPost.count(),
      prisma.service.count(), prisma.aiConversation.count(), prisma.contactInquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    ]);
    counts = { leads: result[0], projects: result[1], posts: result[2], services: result[3], ai: result[4] };
    leads = result[5]; activity = result[6];
  } catch (error) { console.error('Admin dashboard data unavailable', error); }

  const cards = [['Lead mới', counts.leads, '/admin/leads'], ['Dự án', counts.projects, '/admin/projects'], ['Bài viết', counts.posts, '/admin/blog'], ['Dịch vụ', counts.services, '/admin/services'], ['Tin nhắn AI', counts.ai, '/admin/ai']] as const;
  return <>
    <header className="admin-page-head"><div><p>TỔNG QUAN</p><h1>Dashboard</h1><span>Tình trạng nội dung và khách hàng của Novra.</span></div><span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span></header>
    <div className="admin-stats">{cards.map(([label, value, href]) => <Link href={href} key={label}><strong>{value}</strong><span>{label}</span><i>↗</i></Link>)}</div>
    <div className="admin-dashboard-grid">
      <section className="admin-panel"><div className="admin-panel-head"><div><h2>Lead mới nhất</h2><p>Yêu cầu tư vấn gần đây</p></div><Link href="/admin/leads">Xem tất cả →</Link></div>{leads.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tên</th><th>Dịch vụ</th><th>Ngân sách</th><th>Ngày</th><th>Trạng thái</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><Link href={'/admin/leads/' + lead.id}><strong>{lead.name}</strong><small>{lead.email}</small></Link></td><td>{lead.services.join(', ')}</td><td>{lead.budget}</td><td>{new Date(lead.createdAt).toLocaleDateString('vi-VN')}</td><td><span className={'admin-status status-' + lead.status.toLowerCase()}>{lead.status}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty">Chưa có lead mới.</div>}</section>
      <aside className="admin-panel admin-quick"><h2>Thao tác nhanh</h2><Link href="/admin/projects">+ Thêm dự án</Link><Link href="/admin/blog">+ Viết bài</Link><Link href="/admin/pricing">+ Thêm bảng giá</Link><Link href="/admin/leads">+ Xem leads</Link></aside>
      <section className="admin-panel admin-activity"><div className="admin-panel-head"><div><h2>Nội dung cập nhật gần đây</h2><p>Nhật ký quản trị</p></div></div>{activity.length ? activity.map((item) => <article key={item.id}><span>{item.action}</span><strong>{item.resource}</strong><time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time></article>) : <div className="admin-empty">Chưa có hoạt động.</div>}</section>
    </div>
  </>;
}