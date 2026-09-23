import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export default async function AdminPage() { redirect((await getAdminSession()) ? '/admin/dashboard' : '/admin/login'); }
