'use client';

import { FormEvent, KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export function AiPrompt({ locale, copy }: { locale: Locale; copy: Dictionary['aiConsultation'] }) {
  const [prompt, setPrompt] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [notice, setNotice] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const userBubbleRef = useRef<HTMLParagraphElement>(null);
  const assistantBubbleRef = useRef<HTMLParagraphElement>(null);
  const loading = state === 'loading';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 68), 160)}px`;
  }, [prompt]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [submittedPrompt, reply, state]);

  useLayoutEffect(() => {
    if (!submittedPrompt || !userBubbleRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(userBubbleRef.current, { x: 8, y: 12, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.52, ease: 'power3.out' });
  }, [submittedPrompt]);

  useLayoutEffect(() => {
    if (!reply || !assistantBubbleRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(assistantBubbleRef.current, { x: -8, y: 12, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.56, ease: 'power3.out' });
  }, [reply]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = prompt.trim();
    if (!message || loading) return;

    setSubmittedPrompt(message);
    setPrompt('');
    setReply('');
    setNotice('');
    setState('loading');

    try {
      const response = await fetch('/api/ai-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, locale }),
      });
      const body = await response.json() as { configured?: boolean; reply?: string };
      if (!response.ok || !body.reply) throw new Error('AI_FAILED');

      if (body.configured === false) {
        setNotice(copy.unavailable);
        setState('error');
        return;
      }

      setReply(body.reply);
      setState('success');
    } catch {
      setNotice(copy.error);
      setState('error');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="ximi-ai-interface">
      <form className="ximi-ai-panel" onSubmit={submit}>
        <header className="ximi-ai-panel-header">
          <div className="ximi-ai-identity">
            <strong>{copy.productName}</strong>
            <span>{copy.assistantLabel}</span>
          </div>
          <div className="ximi-ai-status"><span aria-hidden="true" />{copy.status}</div>
        </header>

        <div ref={streamRef} className="ximi-chat-stream" role="log" aria-live="polite" aria-label={copy.conversationLabel}>
          <p className="ximi-chat-bubble ximi-chat-ai ximi-chat-initial"><span className="ximi-chat-icon" aria-hidden="true">✦</span>{copy.initialMessage}</p>
          {submittedPrompt && <p ref={userBubbleRef} className="ximi-chat-bubble ximi-chat-user">{submittedPrompt}</p>}
          {loading && <div className="ximi-chat-bubble ximi-chat-ai ximi-chat-typing" aria-label={copy.sending}><span /><span /><span /></div>}
          {reply && <p ref={assistantBubbleRef} className="ximi-chat-bubble ximi-chat-ai"><span className="ximi-chat-icon" aria-hidden="true">✦</span>{reply}</p>}
        </div>

        {notice && <p className="ximi-ai-notice" role="status"><span aria-hidden="true">i</span>{notice}</p>}

        <div className="ximi-ai-quick">
          <p>{copy.suggestionsLabel}</p>
          <div className="ximi-suggestions">
            {copy.suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => { setPrompt(suggestion); textareaRef.current?.focus(); }}>{suggestion}</button>)}
          </div>
        </div>

        <div className="ximi-ai-composer">
          <label className="ximi-visually-hidden" htmlFor="novra-ai-prompt">{copy.inputLabel}</label>
          <textarea ref={textareaRef} id="novra-ai-prompt" rows={1} value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={handleKeyDown} placeholder={copy.placeholder} maxLength={2000} />
          <button className="ximi-ai-send" type="submit" aria-label={copy.sendAria} disabled={loading || !prompt.trim()}>
            <span>{loading ? copy.sending : copy.send}</span>
            <span className="ximi-ai-send-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        <p className="ximi-ai-note">{copy.note}</p>
      </form>
    </div>
  );
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
