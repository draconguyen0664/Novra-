'use client';

import { FormEvent, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export function AiPrompt({ locale, copy }: { locale: Locale; copy: Dictionary['aiConsultation'] }) {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setReply('');
    try {
      const response = await fetch('/api/ai-consultation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt.trim() || copy.fallbackPrompt, locale }) });
      const body = await response.json() as { reply?: string };
      if (!response.ok || !body.reply) throw new Error('AI_FAILED');
      setReply(body.reply);
    } catch { setReply(copy.error); }
    finally { setLoading(false); }
  };

  return <div className="ximi-ai-interface"><div className="ximi-chat-stream" aria-label={copy.conversationLabel}><p className="ximi-chat-bubble ximi-chat-user">{copy.userExample}</p><p className="ximi-chat-bubble ximi-chat-ai"><span aria-hidden="true">✦</span>{copy.assistantExample}</p>{reply && <p className="ximi-chat-bubble ximi-chat-ai" role="status"><span aria-hidden="true">✦</span>{reply}</p>}</div><form className="ximi-ai-panel" onSubmit={submit}><div className="ximi-ai-status"><span aria-hidden="true" />{copy.status}</div><label htmlFor="novra-ai-prompt">{copy.inputLabel}</label><textarea id="novra-ai-prompt" rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={copy.placeholder} maxLength={2000} /><div className="ximi-ai-actions"><div className="ximi-suggestions" aria-label={copy.suggestionsLabel}>{copy.suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setPrompt(suggestion)}>{suggestion}</button>)}</div><button className="ximi-ai-send" type="submit" aria-label={copy.sendAria} disabled={loading}>{loading ? copy.sending : copy.send}<span aria-hidden="true">↗</span></button></div><p className="ximi-ai-note">{copy.note}</p></form></div>;
}

export function CapabilitiesAccordion({ groups }: { groups: Dictionary['capabilities']['groups'] }) {
  const [open, setOpen] = useState(0);
  return <div className="ximi-capability-list">{groups.map((group, index) => { const expanded = open === index; const panelId = `capability-panel-${index}`; return <article className={`ximi-capability${expanded ? ' is-open' : ''}`} key={group.title}><h3><button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? -1 : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{group.title}</strong><i aria-hidden="true" /></button></h3><div className="ximi-capability-panel" id={panelId} aria-hidden={!expanded}><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div></article>; })}</div>;
}

export function XimiFaqAccordion({ items }: { items: Dictionary['faq']['items'] }) {
  const [open, setOpen] = useState(0);
  const answers = useRef<Array<HTMLDivElement | null>>([]);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    const panels = answers.current;
    panels.forEach((panel, index) => { if (!panel) return; const expanded = open === index; if (!mounted.current) gsap.set(panel, { height: expanded ? 'auto' : 0, autoAlpha: expanded ? 1 : 0 }); else gsap.to(panel, { height: expanded ? 'auto' : 0, autoAlpha: expanded ? 1 : 0, duration: .42, ease: 'power3.inOut', overwrite: true }); });
    mounted.current = true;
    return () => panels.forEach((panel) => { if (panel) gsap.killTweensOf(panel); });
  }, [open]);
  return <div className="ximi-faq-list">{items.map((item, index) => { const expanded = open === index; const answerId = `novra-faq-answer-${index}`; return <article className={`ximi-faq-item${expanded ? ' is-open' : ''}`} key={item.question}><h3><button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setOpen(expanded ? -1 : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.question}</strong><i aria-hidden="true" /></button></h3><div ref={(element) => { answers.current[index] = element; }} id={answerId} className="ximi-faq-answer" aria-hidden={!expanded}><p>{item.answer}</p></div></article>; })}</div>;
}
