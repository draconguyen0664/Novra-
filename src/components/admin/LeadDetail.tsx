'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Note = { id: string; content: string; createdAt: Date | string; author?: { name: string } | null };
type Lead = { id: string; name: string; phone: string; email: string; company?: string | null; services: string[]; budget: string; details: string; locale: string; source: string; status: string; createdAt: Date | string; notes: Note[] };
const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'SPAM'];

export function LeadDetail({ initial }: { initial: Lead }) {
  const router = useRouter();
  const [lead, setLead] = useState(initial);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const updateStatus = async (status: string) => {
    const response = await fetch('/api/admin/leads/' + lead.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) setLead((value) => ({ ...value, status }));
  };
  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    const response = await fetch('/api/admin/leads/' + lead.id + '/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: note }) });
    if (response.ok) { const body = await response.json(); setLead((value) => ({ ...value, notes: [body.data, ...value.notes] })); setNote(''); }
    setSaving(false);
  };

  return <div className="admin-lead-layout">
    <section className="admin-panel admin-lead-main">
      <button className="admin-back" onClick={() => router.push('/admin/leads')}>← Quay lại leads</button>
      <div className="admin-lead-title"><div><h1>{lead.name}</h1><p>{lead.company || 'Khách hàng cá nhân'}</p></div><select value={lead.status} onChange={(event) => updateStatus(event.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></div>
      <dl className="admin-detail-grid"><div><dt>Email</dt><dd><a href={'mailto:' + lead.email}>{lead.email}</a></dd></div><div><dt>Điện thoại</dt><dd><a href={'tel:' + lead.phone}>{lead.phone}</a></dd></div><div><dt>Dịch vụ</dt><dd>{lead.services.join(', ')}</dd></div><div><dt>Ngân sách</dt><dd>{lead.budget}</dd></div><div><dt>Ngôn ngữ</dt><dd>{lead.locale.toUpperCase()}</dd></div><div><dt>Nguồn</dt><dd>{lead.source}</dd></div><div><dt>Ngày tạo</dt><dd>{new Date(lead.createdAt).toLocaleString('vi-VN')}</dd></div></dl>
      <div className="admin-message"><small>NỘI DUNG</small><p>{lead.details}</p></div>
    </section>
    <aside className="admin-panel admin-notes"><h2>Ghi chú nội bộ</h2><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Ví dụ: Đã gọi khách. Khách cần CRM + website." /><button className="admin-primary" disabled={saving} onClick={addNote}>{saving ? 'Đang lưu…' : 'Thêm ghi chú'}</button><div>{lead.notes.map((item) => <article key={item.id}><p>{item.content}</p><small>{item.author?.name || 'Admin'} · {new Date(item.createdAt).toLocaleString('vi-VN')}</small></article>)}</div></aside>
  </div>;
}