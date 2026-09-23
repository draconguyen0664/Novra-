'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AdminResource } from '@/lib/admin-resources';

export type AdminField = { name: string; label: string; type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'list' | 'url'; required?: boolean };
type Item = Record<string, unknown> & { id: string };

export function AdminResourceManager({ resource, titleField, fields }: { resource: AdminResource; titleField: string; fields: AdminField[] }) {
  const [items, setItems] = useState<Item[]>([]); const [editing, setEditing] = useState<Item | null>(null); const [message, setMessage] = useState('');
  useEffect(() => { let active = true; fetch(`/api/admin/${resource}`).then((response) => response.json()).then((body: { data?: Item[] }) => { if (active) setItems(body.data || []); }).catch(() => undefined); return () => { active = false; }; }, [resource]);
  const refresh = async () => { const response = await fetch(`/api/admin/${resource}`); const body = await response.json() as { data?: Item[] }; setItems(body.data || []); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage(''); const form = new FormData(event.currentTarget); const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.type === 'checkbox') {
        payload[field.name] = form.get(field.name) === 'on';
      } else if (field.type === 'number') {
        const value = String(form.get(field.name) || '');
        if (value) payload[field.name] = Number(value);
        else if (editing && (field.name === 'year' || field.name === 'originalPrice')) payload[field.name] = null;
      } else if (field.type === 'list') {
        payload[field.name] = String(form.get(field.name) || '').split('\n').map((value) => value.trim()).filter(Boolean);
      } else {
        const value = String(form.get(field.name) || '').trim();
        payload[field.name] = value || null;
      }
    });
    const response = await fetch(editing ? `/api/admin/${resource}/${editing.id}` : `/api/admin/${resource}`, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) { setMessage('Could not save. Check all required fields.'); return; }
    setMessage('Saved.'); setEditing(null); event.currentTarget.reset(); await refresh();
  };
  const remove = async (item: Item) => { if (!confirm(`Delete ${String(item[titleField] || 'this item')}?`)) return; const response = await fetch(`/api/admin/${resource}/${item.id}`, { method: 'DELETE' }); if (response.ok) { if (editing?.id === item.id) setEditing(null); await refresh(); } };
  return <div className="admin-resource-layout"><form className="admin-editor" onSubmit={submit} key={editing?.id || 'new'}><div className="admin-editor-head"><h2>{editing ? 'Edit item' : 'New item'}</h2>{editing && <button type="button" onClick={() => setEditing(null)}>Cancel</button>}</div>{fields.map((field) => field.type === 'checkbox' ? <label className="admin-check" key={field.name}><input name={field.name} type="checkbox" defaultChecked={Boolean(editing?.[field.name])} />{field.label}</label> : <label key={field.name}>{field.label}{field.type === 'textarea' || field.type === 'list' ? <textarea name={field.name} rows={field.type === 'list' ? 4 : 6} required={field.required} defaultValue={field.type === 'list' && Array.isArray(editing?.[field.name]) ? (editing?.[field.name] as unknown[]).join('\n') : String(editing?.[field.name] ?? '')} /> : <input name={field.name} type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'} required={field.required} defaultValue={String(editing?.[field.name] ?? '')} />}</label>)}<button className="admin-save" type="submit">{editing ? 'Update' : 'Create'}</button><p role="status">{message}</p></form><div className="admin-resource-list">{items.map((item) => <article key={item.id}><div><strong>{String(item[titleField] || item.id)}</strong><span>{item.published === true ? 'Published' : 'Draft'}</span></div><p>{String(item.descriptionEn || item.excerptEn || item.answerEn || item.key || '')}</p><div><button type="button" onClick={() => setEditing(item)}>Edit</button><button className="is-danger" type="button" onClick={() => remove(item)}>Delete</button></div></article>)}</div></div>;
}
