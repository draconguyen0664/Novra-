import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let counts = { inquiries: 0, projects: 0, posts: 0, services: 0 };
  try { const [inquiries, projects, posts, services] = await Promise.all([prisma.contactInquiry.count({ where: { status: 'NEW' } }), prisma.project.count(), prisma.blogPost.count(), prisma.service.count()]); counts = { inquiries, projects, posts, services }; } catch (error) { console.error('Admin dashboard data unavailable', error); }
  return <><header className="admin-page-head"><p>OVERVIEW</p><h1>Dashboard</h1></header><div className="admin-stats">{Object.entries(counts).map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div></>;
}
