import { notFound } from 'next/navigation';
import { LeadDetail } from '@/components/admin/LeadDetail';
import { authorizeAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizeAdmin('leads'))) notFound();
  const { id } = await params;
  const lead = await prisma.contactInquiry.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } } } });
  if (!lead) notFound();
  return <LeadDetail initial={lead} />;
}