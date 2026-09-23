import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/auth';

export default async function AdminLoginPage() { if (await getAdminSession()) redirect('/admin/dashboard'); return <main className="admin-login"><AdminLoginForm /></main>; }
