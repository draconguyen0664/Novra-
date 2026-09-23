'use client';
import { useRouter } from 'next/navigation';
export function AdminLogout() { const router = useRouter(); return <button className="admin-logout" type="button" onClick={async () => { await fetch('/api/admin/session', { method: 'DELETE' }); router.replace('/admin/login'); router.refresh(); }}>Sign out</button>; }
