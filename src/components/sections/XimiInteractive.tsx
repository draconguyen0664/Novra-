'use client';

import { FormEvent, KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type AiResponse =
  | { success: true; message: string; sessionId?: string }
  | { success: false; code?: string; message?: string };

type MessageBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[]; ordered: boolean };

function InlineMessageText({ content }: { content: string }) {
  return <>{content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => (
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <span key={index}>{part}</span>
  ))}</>;
}

function ChatMessageContent({ content }: { content: string }) {
  const blocks: MessageBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let ordered = false;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', content: paragraph.join(' ') });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list, ordered });
    list = [];
    ordered = false;
  };

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    const bullet = line.match(/^[-*•]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);

    if (!line) {
      flushParagraph();
      flushList();
    } else if (bullet || numbered) {
      flushParagraph();
      const nextOrdered = Boolean(numbered);
      if (list.length && ordered !== nextOrdered) flushList();
      ordered = nextOrdered;
      list.push((bullet || numbered)![1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  const renderItems = (items: string[]) => items.map((item, index) => (
    <li key={`${index}-${item}`}><InlineMessageText content={item} /></li>
  ));

  return (
    <div className="ximi-chat-content">
      {blocks.map((block, index) => block.type === 'list'
        ? block.ordered
          ? <ol key={`list-${index}`}>{renderItems(block.items)}</ol>
          : <ul key={`list-${index}`}>{renderItems(block.items)}</ul>
        : <p key={`paragraph-${index}`}><InlineMessageText content={block.content} /></p>)}
    </div>
  );
}
export function AiPrompt({ locale, copy }: { locale: Locale; copy: Dictionary['aiConsultation'] }) {
  const [prompt, setPrompt] = useState('');
  const sessionId = useRef('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial', role: 'assistant', content: copy.initialMessage },
  ]);
  const [notice, setNotice] = useState('');
  const [failedMessage, setFailedMessage] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const messageElements = useRef(new Map<string, HTMLDivElement>());
  const messageSequence = useRef(0);
  const lastAnimatedId = useRef('initial');
  const submitting = state === 'submitting';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 68), 160)}px`;
  }, [prompt]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, notice, state]);

  useLayoutEffect(() => {
    const latest = messages.at(-1);
    if (!latest || latest.id === 'initial' || latest.id === lastAnimatedId.current) return;
    lastAnimatedId.current = latest.id;
    const element = messageElements.current.get(latest.id);
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(
      element,
      { x: latest.role === 'user' ? 8 : -8, y: 12, autoAlpha: 0 },
      { x: 0, y: 0, autoAlpha: 1, duration: latest.role === 'user' ? 0.52 : 0.56, ease: 'power3.out' },
    );
    return () => { gsap.killTweensOf(element); };
  }, [messages]);

  const nextMessageId = (role: ChatMessage['role']) => `${role}-${Date.now()}-${messageSequence.current++}`;

  const noticeForCode = (code?: string) => {
    if (code === 'RATE_LIMITED') return copy.rateLimited;
    if (code === 'AI_NOT_CONFIGURED') return copy.unavailable;
    return copy.error;
  };

  const sendMessage = async (rawMessage: string, retry = false) => {
    const message = rawMessage.trim();
    if (!message || submitting) return;

    const lastMessage = messages.at(-1);
    const historyMessages = retry && lastMessage?.role === 'user' && lastMessage.content === message
      ? messages.slice(0, -1)
      : messages;

    if (!retry) {
      setMessages((current) => [...current, { id: nextMessageId('user'), role: 'user', content: message }]);
    }
    setPrompt('');
    setNotice('');
    setFailedMessage('');
    setState('submitting');

    try {
      const response = await fetch('/api/ai-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          locale,
          history: historyMessages.slice(-16).map(({ role, content }) => ({ role, content })),
          sessionId: sessionId.current || undefined,
        }),
      });
      const body = await response.json().catch(() => null) as AiResponse | null;

      if (!response.ok || !body || body.success !== true || !body.message) {
        const code = body && body.success === false ? body.code : undefined;
        setNotice(noticeForCode(code));
        setFailedMessage(message);
        setState('error');
        return;
      }

      if (body.sessionId) sessionId.current = body.sessionId;
      setMessages((current) => [...current, { id: nextMessageId('assistant'), role: 'assistant', content: body.message }]);
      setState('success');
    } catch {
      setNotice(copy.error);
      setFailedMessage(message);
      setState('error');
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(prompt);
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

        <div ref={streamRef} className="ximi-chat-stream" role="log" aria-live="polite" aria-busy={submitting} aria-label={copy.conversationLabel}>
          {messages.map((message) => (
            <div
              key={message.id}
              ref={(element) => {
                if (element) messageElements.current.set(message.id, element);
                else messageElements.current.delete(message.id);
              }}
              className={`ximi-chat-bubble ximi-chat-${message.role === 'assistant' ? 'ai' : 'user'}${message.id === 'initial' ? ' ximi-chat-initial' : ''}`}
            >
              {message.role === 'assistant' && <span className="ximi-chat-icon" aria-hidden="true">✦</span>}
              <ChatMessageContent content={message.content} />
            </div>
          ))}
          {submitting && <div className="ximi-chat-bubble ximi-chat-ai ximi-chat-typing" aria-label={copy.sending}><span /><span /><span /></div>}
        </div>

        {notice && (
          <div className="ximi-ai-notice" role="status">
            <span aria-hidden="true">i</span>
            <span className="ximi-ai-notice-copy">{notice}</span>
            {failedMessage && <button className="ximi-ai-retry" type="button" disabled={submitting} onClick={() => void sendMessage(failedMessage, true)}>{copy.retry}</button>}
          </div>
        )}

        <div className="ximi-ai-quick">
          <p>{copy.suggestionsLabel}</p>
          <div className="ximi-suggestions">
            {copy.suggestions.map((suggestion) => <button type="button" key={suggestion.label} disabled={submitting} onClick={() => void sendMessage(suggestion.prompt)}>{suggestion.label}</button>)}
          </div>
        </div>

        <div className="ximi-ai-composer">
          <label className="ximi-visually-hidden" htmlFor="novra-ai-prompt">{copy.inputLabel}</label>
          <textarea ref={textareaRef} id="novra-ai-prompt" rows={1} value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={handleKeyDown} placeholder={copy.placeholder} maxLength={3000} />
          <button className="ximi-ai-send" type="submit" aria-label={copy.sendAria} disabled={submitting || !prompt.trim()}>
            <span>{submitting ? copy.sending : copy.send}</span>
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

export function XimiFaqAccordion({ items }: { items: readonly { question: string; answer: string }[] }) {
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
