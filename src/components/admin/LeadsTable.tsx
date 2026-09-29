'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Lead = { id: string; name: string; phone: string; email: string; company?: string | null; services: string[]; budget: string; locale: string; createdAt: string; status: string };
const statuses = ['', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'SPAM'];

export function LeadsTable() {
  const [items, setItems] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('q', query);
      if (status) params.set('status', status);
      fetch('/api/admin/leads?' + params).then((response) => response.json()).then((body) => { setItems(body.data || []); setPages(body.pages || 1); }).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [query, status, page]);

  return <section className="admin-panel">
    <div className="admin-filters"><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm tên, email, số điện thoại…" /><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>{statuses.map((value) => <option key={value} value={value}>{value || 'Tất cả trạng thái'}</option>)}</select></div>
    {loading ? <div className="admin-empty">Đang tải leads…</div> : items.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tên</th><th>Liên hệ</th><th>Dịch vụ</th><th>Ngân sách</th><th>Ngày</th><th>Trạng thái</th></tr></thead><tbody>{items.map((lead) => <tr key={lead.id}><td><Link href={'/admin/leads/' + lead.id}><strong>{lead.name}</strong><small>{lead.company || lead.locale.toUpperCase()}</small></Link></td><td>{lead.email}<small>{lead.phone}</small></td><td>{lead.services.join(', ')}</td><td>{lead.budget}</td><td>{new Date(lead.createdAt).toLocaleDateString('vi-VN')}</td><td><span className={'admin-status status-' + lead.status.toLowerCase()}>{lead.status}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>Không tìm thấy lead.</strong><p>Lead từ form liên hệ sẽ xuất hiện tại đây.</p></div>}
    <div className="admin-pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>← Trước</button><span>Trang {page}/{pages}</span><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Sau →</button></div>
  </section>;
}