'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type Values = z.infer<typeof schema>;

export function AdminLoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Values>();
  const [error, setError] = useState('');

  const submit = handleSubmit(async (values) => {
    setError('');
    if (!schema.safeParse(values).success) {
      setError('Vui lòng kiểm tra email và mật khẩu.');
      return;
    }
    const result = await signIn('credentials', { ...values, redirect: false });
    if (result?.error) {
      setError('Email hoặc mật khẩu không đúng.');
      return;
    }
    router.replace('/admin/dashboard');
    router.refresh();
  });

  return <form className="admin-login-card" onSubmit={submit}>
    <p className="admin-kicker">NOVRA ADMIN</p>
    <h1>Đăng nhập</h1>
    <p className="admin-login-intro">Quản lý nội dung và khách hàng của Novra.</p>
    <label>Email<input {...register('email')} type="email" autoComplete="username" required /></label>
    <label>Mật khẩu<input {...register('password')} type="password" autoComplete="current-password" minLength={8} required /></label>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
  </form>;
}