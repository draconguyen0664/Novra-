import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/admin-auth';

export default async function AdminLoginPage() {
  if ((await getAdminSession())?.user) redirect('/admin/dashboard');
  return <main className="admin-login"><AdminLoginForm /></main>;
}