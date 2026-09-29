'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type Media = { id: string; filename: string; url: string; mimeType: string; size: number; width?: number | null; height?: number | null; createdAt: string };

export function MediaLibrary() {
  const [items, setItems] = useState<Media[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Media | null>(null);
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = () => fetch('/api/admin/media').then((response) => response.json()).then((body) => setItems(body.data || []));
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => items.filter((item) => item.filename.toLowerCase().includes(query.toLowerCase())), [items, query]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData(); form.set('file', file);
      const response = await fetch('/api/admin/media', { method: 'POST', body: form });
      if (!response.ok) setNotice('Không thể tải lên ' + file.name);
    }
    await load(); setUploading(false);
  };
  const remove = async (item: Media) => {
    if (!confirm('Xóa tệp ' + item.filename + '?')) return;
    const response = await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) });
    if (response.ok) { setSelected(null); await load(); setNotice('Đã xóa tệp.'); }
  };
  const copy = async (url: string) => { await navigator.clipboard.writeText(location.origin + url); setNotice('Đã sao chép URL.'); };

  return <div className="admin-media">
    <div className="admin-list-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm filename…" /><span>{filtered.length} tệp</span><input ref={input} hidden type="file" multiple accept=".jpg,.jpeg,.png,.webp,.svg" onChange={(event) => upload(event.target.files)} /><button className="admin-primary" disabled={uploading} onClick={() => input.current?.click()}>{uploading ? 'Đang tải…' : '+ Upload'}</button></div>
    {filtered.length ? <div className="admin-media-grid">{filtered.map((item) => <button key={item.id} onClick={() => setSelected(item)}><figure><Image src={item.url} alt={item.filename} fill sizes="240px" unoptimized /></figure><strong>{item.filename}</strong><span>{item.width && item.height ? item.width + '×' + item.height + ' · ' : ''}{Math.ceil(item.size / 1024)} KB</span></button>)}</div> : <div className="admin-empty"><strong>Chưa có media.</strong><p>Tải JPG, PNG, WEBP hoặc SVG để bắt đầu.</p></div>}
    {selected && <div className="admin-modal-backdrop"><div className="admin-modal admin-media-preview"><figure><Image src={selected.url} alt={selected.filename} fill sizes="600px" unoptimized /></figure><h2>{selected.filename}</h2><p>{selected.mimeType} · {Math.ceil(selected.size / 1024)} KB · {new Date(selected.createdAt).toLocaleString('vi-VN')}</p><div><button onClick={() => setSelected(null)}>Đóng</button><button onClick={() => copy(selected.url)}>Copy URL</button><button className="is-danger" onClick={() => remove(selected)}>Xóa</button></div></div></div>}
    {notice && <div className="admin-toast">{notice}<button onClick={() => setNotice('')}>×</button></div>}
  </div>;
}