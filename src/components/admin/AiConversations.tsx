'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type Conversation = { id: string; sessionId: string; locale: string; createdAt: string; lead?: { id: string; name: string } | null; messages: { id: string; role: string; content: string; createdAt: string }[] };
type LeadValues = { name: string; email: string; phone: string; company: string };

export function AiConversations() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [converting, setConverting] = useState<Conversation | null>(null);
  const [notice, setNotice] = useState('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<LeadValues>();

  const load = () => fetch('/api/admin/cms/ai').then((response) => response.json()).then((body) => setItems(body.data || []));
  useEffect(() => { void load(); }, []);

  const convert = handleSubmit(async (values) => {
    if (!converting) return;
    const response = await fetch('/api/admin/ai/' + converting.id + '/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    setNotice(response.ok ? 'Đã chuyển hội thoại thành lead.' : 'Không thể chuyển thành lead.');
    if (response.ok) { setConverting(null); reset(); await load(); }
  });

  return <div className="admin-ai-layout">
    <section className="admin-panel admin-conversation-list">
      {items.length ? items.map((item) => <button className={selected?.id === item.id ? 'is-active' : ''} key={item.id} onClick={() => setSelected(item)}><strong>{item.sessionId.slice(0, 12)}…</strong><span>{item.locale.toUpperCase()} · {item.messages.length} tin nhắn</span><small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>{item.lead && <i>Lead: {item.lead.name}</i>}</button>) : <div className="admin-empty">Chưa có hội thoại AI.</div>}
    </section>
    <section className="admin-panel admin-conversation">
      {selected ? <><div className="admin-panel-head"><div><h2>Hội thoại</h2><p>{selected.sessionId}</p></div>{selected.lead ? <a href={'/admin/leads/' + selected.lead.id}>Xem lead ↗</a> : <button className="admin-primary" onClick={() => setConverting(selected)}>Chuyển thành lead</button>}</div><div className="admin-message-stream">{selected.messages.map((message) => <article className={message.role === 'USER' ? 'is-user' : ''} key={message.id}><small>{message.role === 'USER' ? 'KHÁCH' : 'NOVRA AI'}</small><p>{message.content}</p></article>)}</div></> : <div className="admin-empty">Chọn một hội thoại để xem nội dung.</div>}
    </section>
    {converting && <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={convert}><h2>Chuyển thành lead</h2><p>Chỉ nhập thông tin khi khách đã tự nguyện cung cấp.</p><label>Tên<input required {...register('name')} /></label><label>Email<input type="email" required {...register('email')} /></label><label>Điện thoại<input required {...register('phone')} /></label><label>Công ty<input {...register('company')} /></label><div><button type="button" onClick={() => setConverting(null)}>Hủy</button><button className="admin-primary" disabled={isSubmitting}>Tạo lead</button></div></form></div>}
    {notice && <div className="admin-toast">{notice}<button onClick={() => setNotice('')}>×</button></div>}
  </div>;
}