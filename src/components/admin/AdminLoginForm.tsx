'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
    setLoading(false);
    if (!response.ok) { setError('Invalid email or password.'); return; }
    router.replace('/admin/dashboard'); router.refresh();
  };
  return <form className="admin-login-card" onSubmit={submit}><p className="admin-kicker">NOVRA ADMIN</p><h1>Sign in</h1><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form>;
}
