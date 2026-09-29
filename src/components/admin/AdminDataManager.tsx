'use client';

import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type DataField = { name: string; label: string; type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'password' | 'select'; options?: string[]; required?: boolean };
type Item = Record<string, unknown> & { id: string };

function Row({ item, titleField, sortable, onEdit, onDelete }: { item: Item; titleField: string; sortable?: boolean; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id, disabled: !sortable });
  return <article ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
    {sortable && <button className="admin-drag" type="button" {...attributes} {...listeners}>⠿</button>}
    <div><strong>{String(item[titleField] || item.id)}</strong><span>{String(item.email || item.key || item.urlVi || '')}</span></div>
    <div className="admin-row-meta">{item.visible !== undefined && <span>{item.visible ? 'Đang hiện' : 'Đang ẩn'}</span>}{Boolean(item.role) && <span>{String(item.role)}</span>}{item.published !== undefined && <span>{item.published ? 'Đã xuất bản' : 'Bản nháp'}</span>}</div>
    <div><button type="button" onClick={onEdit}>Chỉnh sửa</button><button className="is-danger" type="button" onClick={onDelete}>Xóa</button></div>
  </article>;
}

export function AdminDataManager({ resource, titleField, fields, sortable = false }: { resource: string; titleField: string; fields: DataField[]; sortable?: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [notice, setNotice] = useState('');
  const { register, reset, handleSubmit, formState: { isSubmitting } } = useForm<Record<string, unknown>>();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const endpoint = '/api/admin/cms/' + resource;

  const load = useCallback(async () => {
    const response = await fetch(endpoint);
    const body = await response.json();
    setItems(Array.isArray(body.data) ? body.data : []);
  }, [endpoint]);
  useEffect(() => {
    let active = true;
    void fetch(endpoint)
      .then((response) => response.json())
      .then((body) => { if (active) setItems(Array.isArray(body.data) ? body.data : []); })
      .catch(() => { if (active) setNotice('Không thể tải dữ liệu.'); });
    return () => { active = false; };
  }, [endpoint]);
  useEffect(() => { reset(Object.fromEntries(fields.map((field) => [field.name, field.type === 'checkbox' ? Boolean(editing?.[field.name]) : editing?.[field.name] ?? '']))); }, [editing, fields, reset]);

  const shownFields = fields.filter((field) => !field.name.endsWith('Vi') && !field.name.endsWith('En') || field.name.endsWith(language === 'vi' ? 'Vi' : 'En'));
  const filtered = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query]);

  const submit = handleSubmit(async (raw) => {
    const payload: Record<string, unknown> = editing ? { id: editing.id } : {};
    for (const field of fields) {
      const value = raw[field.name];
      payload[field.name] = field.type === 'checkbox' ? Boolean(value) : field.type === 'number' ? Number(value || 0) : String(value || '').trim() || null;
    }
    const valid = z.record(z.string(), z.unknown()).safeParse(payload);
    if (!valid.success) return;
    const response = await fetch(endpoint, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setNotice(response.ok ? 'Đã lưu thay đổi.' : 'Không thể lưu. Vui lòng kiểm tra dữ liệu.');
    if (response.ok) { setEditing(null); reset({}); await load(); }
  });

  const remove = async (item: Item) => {
    if (!window.confirm('Xóa mục này? Hành động không thể hoàn tác.')) return;
    const response = await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) });
    setNotice(response.ok ? 'Đã xóa.' : 'Không thể xóa.');
    if (response.ok) await load();
  };

  const dragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const next = arrayMove(items, items.findIndex((item) => item.id === active.id), items.findIndex((item) => item.id === over.id));
    setItems(next);
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: next.map((item) => item.id) }) });
    setNotice(response.ok ? 'Đã lưu thứ tự.' : 'Không thể lưu thứ tự.');
    if (!response.ok) await load();
  };

  return <div className="admin-resource">
    <div className="admin-list-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm…" /><span>{filtered.length} mục</span><button className="admin-primary" onClick={() => setEditing(null)}>+ Thêm mới</button></div>
    <div className="admin-resource-layout">
      <form className="admin-editor" onSubmit={submit}>
        <div className="admin-editor-head"><h2>{editing ? 'Chỉnh sửa' : 'Tạo mới'}</h2>{editing && <button type="button" onClick={() => setEditing(null)}>Hủy</button>}</div>
        {fields.some((field) => field.name.endsWith('Vi') || field.name.endsWith('En')) && <div className="admin-tabs"><button className={language === 'vi' ? 'is-active' : ''} type="button" onClick={() => setLanguage('vi')}>Tiếng Việt</button><button className={language === 'en' ? 'is-active' : ''} type="button" onClick={() => setLanguage('en')}>English</button></div>}
        {shownFields.map((field) => field.type === 'checkbox' ? <label className="admin-check" key={field.name}><input type="checkbox" {...register(field.name)} />{field.label}</label> : <label key={field.name}>{field.label}{field.type === 'textarea' ? <textarea rows={5} required={field.required} {...register(field.name)} /> : field.type === 'select' ? <select required={field.required} {...register(field.name)}>{field.options?.map((value) => <option key={value}>{value}</option>)}</select> : <input type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'} required={field.required && !(field.type === 'password' && editing)} {...register(field.name)} />}</label>)}
        <div className="admin-form-actions"><button className="admin-save" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu…' : 'Lưu'}</button><button type="button" onClick={() => setEditing(null)}>Hủy</button></div>
      </form>
      <section className="admin-resource-list">
        {filtered.length ? <DndContext sensors={sensors} onDragEnd={dragEnd}><SortableContext items={filtered.map((item) => item.id)} strategy={verticalListSortingStrategy}>{filtered.map((item) => <Row key={item.id} item={item} titleField={titleField} sortable={sortable} onEdit={() => setEditing(item)} onDelete={() => remove(item)} />)}</SortableContext></DndContext> : <div className="admin-empty">Chưa có dữ liệu.</div>}
      </section>
    </div>
    {notice && <div className="admin-toast">{notice}<button onClick={() => setNotice('')}>×</button></div>}
  </div>;
}