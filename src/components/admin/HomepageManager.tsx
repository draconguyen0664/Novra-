'use client';

import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

type Content = Record<string, unknown> | null;
type Section = { id: string; key: string; name: string; enabled: boolean; sortOrder: number; contentVi: Content; contentEn: Content };
type FormValues = { eyebrow: string; heading: string; description: string; primaryCtaLabel: string; primaryCtaUrl: string; secondaryCtaLabel: string; secondaryCtaUrl: string };

const empty: FormValues = { eyebrow: '', heading: '', description: '', primaryCtaLabel: '', primaryCtaUrl: '', secondaryCtaLabel: '', secondaryCtaUrl: '' };

function values(content: Content): FormValues {
  return { ...empty, ...(content || {}) } as FormValues;
}

function SortableRow({ section, onToggle, onEdit }: { section: Section; onToggle: (item: Section) => void; onEdit: (item: Section) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  return <article ref={setNodeRef} className={'admin-section-row' + (isDragging ? ' is-dragging' : '')} style={{ transform: CSS.Transform.toString(transform), transition }}>
    <button className="admin-drag" type="button" aria-label={'Kéo ' + section.name} {...attributes} {...listeners}>⠿</button>
    <div><strong>{section.name}</strong><span>{section.key}</span></div>
    <label className="admin-switch"><input type="checkbox" checked={section.enabled} onChange={() => onToggle(section)} /><span />{section.enabled ? 'Bật' : 'Tắt'}</label>
    <button className="admin-secondary" type="button" onClick={() => onEdit(section)}>Chỉnh sửa</button>
  </article>;
}

export function HomepageManager() {
  const [items, setItems] = useState<Section[]>([]);
  const [editing, setEditing] = useState<Section | null>(null);
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const { register, reset, handleSubmit, formState: { isSubmitting, isDirty } } = useForm<FormValues>({ defaultValues: empty });

  useEffect(() => {
    fetch('/api/admin/homepage').then((response) => response.json()).then((body) => setItems(body.data?.sections || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editing) return;
    reset(values(locale === 'vi' ? editing.contentVi : editing.contentEn));
  }, [editing, locale, reset]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (isDirty) event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  const patch = async (payload: unknown) => {
    const response = await fetch('/api/admin/homepage', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('SAVE_FAILED');
    const body = await response.json();
    setItems(body.data.sections);
    return body.data.sections as Section[];
  };

  const dragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const previous = items;
    const next = arrayMove(items, items.findIndex((item) => item.id === active.id), items.findIndex((item) => item.id === over.id)).map((item, sortOrder) => ({ ...item, sortOrder }));
    setItems(next);
    try { await patch({ sections: next.map(({ id, sortOrder }) => ({ id, sortOrder })) }); setNotice('Đã lưu thứ tự.'); }
    catch { setItems(previous); setNotice('Không thể lưu thứ tự.'); }
  };

  const toggle = async (item: Section) => {
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, enabled: !value.enabled } : value));
    try { await patch({ section: { id: item.id, enabled: !item.enabled } }); setNotice('Đã cập nhật hiển thị.'); }
    catch { setItems((current) => current.map((value) => value.id === item.id ? item : value)); setNotice('Không thể lưu thay đổi.'); }
  };

  const save = handleSubmit(async (form) => {
    if (!editing) return;
    const next = { ...editing, [locale === 'vi' ? 'contentVi' : 'contentEn']: form };
    try {
      const updated = await patch({ section: { id: editing.id, contentVi: next.contentVi, contentEn: next.contentEn } });
      const selected = updated.find((item) => item.id === editing.id) || next;
      setEditing(selected);
      reset(form);
      setNotice('Đã lưu nội dung.');
    } catch { setNotice('Không thể lưu nội dung.'); }
  });

  if (loading) return <div className="admin-empty">Đang tải nội dung trang chủ…</div>;

  return <div className="admin-home-layout">
    <section className="admin-panel">
      <div className="admin-panel-head"><div><h2>Thứ tự section</h2><p>Kéo thả để thay đổi thứ tự hiển thị.</p></div><span>{items.filter((item) => item.enabled).length}/{items.length} đang bật</span></div>
      <DndContext sensors={sensors} onDragEnd={dragEnd}><SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="admin-section-list">{items.map((item) => <SortableRow key={item.id} section={item} onToggle={toggle} onEdit={setEditing} />)}</div>
      </SortableContext></DndContext>
    </section>
    {editing && <aside className="admin-drawer">
      <div className="admin-drawer-head"><div><small>CHỈNH SECTION</small><h2>{editing.name}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Đóng">×</button></div>
      <div className="admin-tabs"><button className={locale === 'vi' ? 'is-active' : ''} type="button" onClick={() => setLocale('vi')}>Tiếng Việt</button><button className={locale === 'en' ? 'is-active' : ''} type="button" onClick={() => setLocale('en')}>English</button></div>
      <form className="admin-editor" onSubmit={save}>
        <label>Eyebrow<input {...register('eyebrow')} /></label>
        <label>Heading<textarea rows={3} {...register('heading')} /></label>
        <label>Mô tả<textarea rows={5} {...register('description')} /></label>
        <div className="admin-form-grid"><label>CTA chính<input {...register('primaryCtaLabel')} /></label><label>URL<input {...register('primaryCtaUrl')} /></label></div>
        <div className="admin-form-grid"><label>CTA phụ<input {...register('secondaryCtaLabel')} /></label><label>URL<input {...register('secondaryCtaUrl')} /></label></div>
        <div className="admin-form-actions"><button className="admin-save" disabled={isSubmitting} type="submit">{isSubmitting ? 'Đang lưu…' : 'Lưu thay đổi'}</button><button type="button" onClick={() => setEditing(null)}>Hủy</button></div>
      </form>
    </aside>}
    {notice && <div className="admin-toast" role="status" onAnimationEnd={() => setNotice('')}>{notice}</div>}
  </div>;
}