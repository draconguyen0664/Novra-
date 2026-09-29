'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const settingsSchema = z.object({
  companyName: z.string().min(1), logo: z.string().optional(), favicon: z.string().optional(),
  email: z.string().email(), phone: z.string(), zalo: z.string().optional(), facebook: z.string().optional(),
  linkedIn: z.string().optional(), address: z.string().optional(), defaultLocale: z.literal('vi'),
  ga4Id: z.string().optional(), metaPixelId: z.string().optional(), searchConsoleVerification: z.string().optional(),
});
type Settings = z.infer<typeof settingsSchema>;
type Footer = { descriptionVi: string; descriptionEn: string; contact: string; socialLinks: string; copyright: string };

export function SiteSettingsForm({ mode }: { mode: 'settings' | 'footer' }) {
  const [notice, setNotice] = useState('');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const { register, reset, handleSubmit, formState: { isSubmitting } } = useForm<Record<string, string>>();
  const endpoint = '/api/admin/cms/' + mode;

  useEffect(() => { fetch(endpoint).then((response) => response.json()).then((body) => {
    if (mode === 'footer') reset((body.data?.footerContent as Footer) || {});
    else reset(body.data || {});
  }); }, [endpoint, mode, reset]);

  const submit = handleSubmit(async (values) => {
    let payload: unknown = values;
    if (mode === 'footer') payload = { footerContent: values };
    else {
      const parsed = settingsSchema.safeParse({ ...values, defaultLocale: 'vi' });
      if (!parsed.success) { setNotice('Vui lòng kiểm tra email và các trường bắt buộc.'); return; }
      payload = parsed.data;
    }
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setNotice(response.ok ? 'Đã lưu thay đổi.' : 'Không thể lưu thay đổi.');
  });

  return <form className="admin-settings-form" onSubmit={submit}>
    {mode === 'footer' ? <>
      <div className="admin-tabs"><button className={language === 'vi' ? 'is-active' : ''} type="button" onClick={() => setLanguage('vi')}>Tiếng Việt</button><button className={language === 'en' ? 'is-active' : ''} type="button" onClick={() => setLanguage('en')}>English</button></div>
      {language === 'vi' ? <label>Mô tả tiếng Việt<textarea rows={5} {...register('descriptionVi')} /></label> : <label>English description<textarea rows={5} {...register('descriptionEn')} /></label>}
      <label>Thông tin liên hệ<textarea rows={4} {...register('contact')} /></label>
      <label>Liên kết mạng xã hội (mỗi dòng một URL)<textarea rows={4} {...register('socialLinks')} /></label>
      <label>Copyright<input {...register('copyright')} /></label>
    </> : <>
      <div className="admin-settings-grid">
        <label>Tên công ty<input required {...register('companyName')} /></label><label>Email<input type="email" required {...register('email')} /></label>
        <label>Điện thoại<input {...register('phone')} /></label><label>Địa chỉ<input {...register('address')} /></label>
        <label>Logo URL<input {...register('logo')} /></label><label>Favicon URL<input {...register('favicon')} /></label>
        <label>Zalo<input {...register('zalo')} /></label><label>Facebook<input {...register('facebook')} /></label>
        <label>LinkedIn<input {...register('linkedIn')} /></label><label>Ngôn ngữ mặc định<select value="vi" disabled><option value="vi">Tiếng Việt</option></select></label>
      </div>
      <h2>Analytics</h2>
      <div className="admin-settings-grid"><label>GA4 ID<input {...register('ga4Id')} /></label><label>Meta Pixel ID<input {...register('metaPixelId')} /></label><label>Search Console Verification<input {...register('searchConsoleVerification')} /></label></div>
    </>}
    <button className="admin-save" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
    {notice && <p role="status">{notice}</p>}
  </form>;
}