'use client';

import { FormEvent, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ximiCapabilities, ximiFaq } from '@/data/ximitech';

const suggestions = ['Báo giá phù hợp', 'Website doanh nghiệp', 'Website bán hàng', 'Web App', 'SEO Google'];

export function AiPrompt() {
  const [prompt, setPrompt] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = prompt.trim() || 'Tôi muốn được tư vấn website phù hợp.';
    window.location.href = `https://zalo.me/0888889805?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="ximi-ai-interface">
      <div className="ximi-chat-stream" aria-label="Ví dụ hội thoại tư vấn">
        <p className="ximi-chat-bubble ximi-chat-user">Tôi cần một website bán hàng dễ quản lý.</p>
        <p className="ximi-chat-bubble ximi-chat-ai"><span aria-hidden="true">✦</span> Mình sẽ giúp bạn xác định tính năng, thời gian và ngân sách phù hợp.</p>
      </div>
      <form className="ximi-ai-panel" onSubmit={submit}>
        <div className="ximi-ai-status"><span aria-hidden="true" /> Online</div>
        <label htmlFor="ximi-ai-prompt">Mô tả website bạn cần</label>
        <textarea
          id="ximi-ai-prompt"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Hỏi về giá, tính năng, SEO, quy trình hoặc mô tả website bạn cần..."
        />
        <div className="ximi-ai-actions">
          <div className="ximi-suggestions" aria-label="Gợi ý nhanh">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => setPrompt(suggestion)}>{suggestion}</button>
            ))}
          </div>
          <button className="ximi-ai-send" type="submit" aria-label="Gửi yêu cầu tư vấn">Gửi <span aria-hidden="true">↗</span></button>
        </div>
        <p className="ximi-ai-note">AI có thể nhầm lẫn. Báo giá và cam kết chính thức được xác nhận bằng văn bản.</p>
      </form>
    </div>
  );
}

export function CapabilitiesAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="ximi-capability-list">
      {ximiCapabilities.map((group, index) => {
        const expanded = open === index;
        const panelId = `capability-panel-${index}`;
        return (
          <article className={`ximi-capability${expanded ? ' is-open' : ''}`} key={group.title}>
            <h3>
              <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? -1 : index)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{group.title}</strong>
                <i aria-hidden="true" />
              </button>
            </h3>
            <div className="ximi-capability-panel" id={panelId} aria-hidden={!expanded}>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function XimiFaqAccordion() {
  const [open, setOpen] = useState(0);
  const answers = useRef<Array<HTMLDivElement | null>>([]);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const panels = answers.current;
    panels.forEach((panel, index) => {
      if (!panel) return;
      const expanded = open === index;
      if (!mounted.current) {
        gsap.set(panel, { height: expanded ? 'auto' : 0, autoAlpha: expanded ? 1 : 0 });
      } else {
        gsap.to(panel, {
          height: expanded ? 'auto' : 0,
          autoAlpha: expanded ? 1 : 0,
          duration: 0.42,
          ease: 'power3.inOut',
          overwrite: true,
        });
      }
    });
    mounted.current = true;
    return () => panels.forEach((panel) => { if (panel) gsap.killTweensOf(panel); });
  }, [open]);

  return (
    <div className="ximi-faq-list">
      {ximiFaq.map((item, index) => {
        const expanded = open === index;
        const answerId = `ximi-faq-answer-${index}`;
        return (
          <article className={`ximi-faq-item${expanded ? ' is-open' : ''}`} key={item.question}>
            <h3>
              <button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setOpen(expanded ? -1 : index)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.question}</strong>
                <i aria-hidden="true" />
              </button>
            </h3>
            <div ref={(element) => { answers.current[index] = element; }} id={answerId} className="ximi-faq-answer" aria-hidden={!expanded}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
