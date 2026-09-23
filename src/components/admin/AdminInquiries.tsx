'use client';

import { useEffect, useState } from 'react';

type Inquiry = { id: string; name: string; email: string; phone: string; company?: string | null; services: string[]; budget: string; details: string; locale: string; status: string; createdAt: string };
const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'SPAM'];

export function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]); const [status, setStatus] = useState(''); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true; const params = new URLSearchParams(); if (status) params.set('status', status); if (query) params.set('q', query);
    fetch(`/api/admin/inquiries?${params}`).then((response) => response.json()).then((body: { data?: Inquiry[] }) => { if (active) { setItems(body.data || []); setLoading(false); } }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, query]);
  const changeStatus = async (id: string, next: string) => { const response = await fetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) }); if (response.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, status: next } : item)); };
  return <><div className="admin-filters"><input value={query} onChange={(event) => { setLoading(true); setQuery(event.target.value); }} placeholder="Search name, email or phone" /><select value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); }}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></div>{loading ? <p>Loading…</p> : <div className="admin-inquiry-list">{items.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{new Date(item.createdAt).toLocaleString()}</span></div><p><a href={`mailto:${item.email}`}>{item.email}</a> · <a href={`tel:${item.phone}`}>{item.phone}</a>{item.company ? ` · ${item.company}` : ''}</p><p>{item.services.join(', ')} · {item.budget} · {item.locale.toUpperCase()}</p><details><summary>Project details</summary><p>{item.details}</p></details><select value={item.status} onChange={(event) => changeStatus(item.id, event.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></article>)}</div>}</>;
}
