'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AdminResource } from '@/lib/admin-resources';
import { RichTextEditor } from './RichTextEditor';

export type AdminField = { name: string; label: string; type?: 'text' | 'textarea' | 'richtext' | 'number' | 'checkbox' | 'list' | 'url'; required?: boolean };
type Item = Record<string, unknown> & { id: string };
type Values = Record<string, unknown>;
const formSchema = z.record(z.string(), z.unknown());

function copySuffix() {
  return '-copy-' + Date.now().toString().slice(-6);
}

function defaultValues(fields: AdminField[], item?: Item | null) {
  return Object.fromEntries(fields.map((field) => {
    const value = item?.[field.name];
    if (field.type === 'checkbox') return [field.name, Boolean(value)];
    if (field.type === 'list') return [field.name, Array.isArray(value) ? value.join('\n') : ''];
    return [field.name, value ?? ''];
  }));
}

export function AdminResourceManager({ resource, titleField, fields }: { resource: AdminResource; titleField: string; fields: AdminField[] }) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const { register, control, reset, handleSubmit, formState: { isSubmitting, isDirty } } = useForm<Values>({ defaultValues: defaultValues(fields) });

  const endpoint = '/api/admin/' + resource;
  const refresh = useCallback(async () => {
    const response = await fetch(endpoint);
    const body = await response.json() as { data?: Item[] };
    setItems(body.data || []);
    setLoading(false);
  }, [endpoint]);

  useEffect(() => {
    let active = true;
    void fetch(endpoint)
      .then((response) => response.json() as Promise<{ data?: Item[] }>)
      .then((body) => { if (active) { setItems(body.data || []); setLoading(false); } })
      .catch(() => { if (active) { setNotice('Không thể tải dữ liệu.'); setLoading(false); } });
    return () => { active = false; };
  }, [endpoint]);
  useEffect(() => { reset(defaultValues(fields, editing)); }, [editing, fields, reset]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (isDirty) event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const visibleFields = fields.filter((field) => !field.name.endsWith('Vi') && !field.name.endsWith('En') || field.name.endsWith(language === 'vi' ? 'Vi' : 'En'));
  const filtered = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const shown = filtered.slice((page - 1) * 20, page * 20);

  const normalize = (values: Values, publish?: boolean) => {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.type === 'checkbox') payload[field.name] = Boolean(value);
      else if (field.type === 'number') payload[field.name] = value === '' || value == null ? (['year', 'originalPrice'].includes(field.name) ? null : 0) : Number(value);
      else if (field.type === 'list') payload[field.name] = String(value || '').split('\n').map((entry) => entry.trim()).filter(Boolean);
      else payload[field.name] = String(value || '').trim() || (field.required ? '' : null);
    }
    if (publish && fields.some((field) => field.name === 'published')) payload.published = true;
    return payload;
  };

  const save = (publish = false) => handleSubmit(async (values) => {
    setNotice('');
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) { setNotice('Dữ liệu không hợp lệ.'); return; }
    const response = await fetch(editing ? '/api/admin/' + resource + '/' + editing.id : '/api/admin/' + resource, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalize(parsed.data, publish)),
    });
    if (!response.ok) { setNotice('Không thể lưu. Vui lòng kiểm tra các trường bắt buộc.'); return; }
    setNotice(publish ? 'Đã lưu và xuất bản.' : 'Đã lưu.');
    setEditing(null);
    reset(defaultValues(fields));
    await refresh();
  });

  const duplicate = async (item: Item) => {
    const payload = normalize(defaultValues(fields, item));
    const suffix = copySuffix();
    for (const key of ['slugVi', 'slugEn', 'key']) if (typeof payload[key] === 'string') payload[key] = payload[key] + suffix;
    for (const key of ['titleVi', 'titleEn', 'nameVi', 'nameEn']) if (typeof payload[key] === 'string') payload[key] = payload[key] + ' (copy)';
    if ('published' in payload) payload.published = false;
    const response = await fetch('/api/admin/' + resource, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setNotice(response.ok ? 'Duplicated as draft.' : 'Could not duplicate this item.');
    if (response.ok) await refresh();
  };

  const remove = async () => {
    if (!deleting) return;
    const response = await fetch('/api/admin/' + resource + '/' + deleting.id, { method: 'DELETE' });
    if (response.ok) { setDeleting(null); if (editing?.id === deleting.id) setEditing(null); await refresh(); setNotice('Đã xóa nội dung.'); }
    else setNotice('Không thể xóa nội dung.');
  };

  return <div className="admin-resource">
    <div className="admin-list-toolbar"><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm kiếm…" /><span>{filtered.length} mục</span><button className="admin-primary" type="button" onClick={() => setEditing(null)}>+ Thêm mới</button></div>
    <div className="admin-resource-layout">
      <form className="admin-editor" onSubmit={save(false)}>
        <div className="admin-editor-head"><div><small>{editing ? 'CHỈNH SỬA' : 'TẠO MỚI'}</small><h2>{editing ? String(editing[titleField] || 'Nội dung') : 'Nội dung mới'}</h2></div>{editing && <button type="button" onClick={() => setEditing(null)}>Hủy</button>}</div>
        <div className="admin-tabs"><button className={language === 'vi' ? 'is-active' : ''} type="button" onClick={() => setLanguage('vi')}>Tiếng Việt</button><button className={language === 'en' ? 'is-active' : ''} type="button" onClick={() => setLanguage('en')}>English</button></div>
        {visibleFields.map((field) => field.type === 'checkbox'
          ? <label className="admin-check" key={field.name}><input {...register(field.name)} type="checkbox" />{field.label}</label>
          : <label key={field.name}>{field.label}
            {field.type === 'richtext'
              ? <Controller control={control} name={field.name} render={({ field: controller }) => <RichTextEditor value={String(controller.value || '')} onChange={controller.onChange} />} />
              : field.type === 'textarea' || field.type === 'list'
                ? <textarea {...register(field.name)} rows={field.type === 'list' ? 4 : 6} required={field.required} />
                : <input {...register(field.name)} type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'} required={field.required} />}
          </label>)}
        <div className="admin-form-actions"><button className="admin-save" disabled={isSubmitting} type="submit">{isSubmitting ? 'Đang lưu…' : 'Lưu'}</button>{fields.some((field) => field.name === 'published') && <button className="admin-primary" disabled={isSubmitting} type="button" onClick={save(true)}>Lưu & Xuất bản</button>}<button type="button" onClick={() => { setEditing(null); reset(defaultValues(fields)); }}>Hủy</button></div>
      </form>
      <section className="admin-resource-list">
        {loading ? <div className="admin-empty">Đang tải…</div> : shown.length ? shown.map((item) => <article key={item.id}>
          <div><strong>{String(item[titleField] || item.id)}</strong><span className={item.published === true ? 'is-published' : ''}>{item.published === true ? 'Đã xuất bản' : 'Bản nháp'}</span></div>
          <p>{String(item.descriptionVi || item.excerptVi || item.answerVi || item.key || '')}</p>
          <small>Cập nhật {item.updatedAt ? new Date(String(item.updatedAt)).toLocaleDateString('vi-VN') : '—'}</small>
          <div><button type="button" onClick={() => setEditing(item)}>Chỉnh sửa</button><button type="button" onClick={() => duplicate(item)}>Nhân bản</button><button className="is-danger" type="button" onClick={() => setDeleting(item)}>Xóa</button></div>
        </article>) : <div className="admin-empty"><strong>Chưa có nội dung.</strong><p>Nhấn “Thêm mới” để bắt đầu.</p></div>}
        {pages > 1 && <div className="admin-pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button><span>Trang {page}/{pages}</span><button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>→</button></div>}
      </section>
    </div>
    {deleting && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><h2>Xóa nội dung này?</h2><p>Hành động này không thể hoàn tác.</p><div><button type="button" onClick={() => setDeleting(null)}>Hủy</button><button className="is-danger" type="button" onClick={remove}>Xóa</button></div></div></div>}
    {notice && <div className="admin-toast" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
  </div>;
}