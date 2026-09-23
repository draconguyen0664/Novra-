'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import content from '@/data/content.json';

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const answers = useRef<Array<HTMLDivElement | null>>([]);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const panels = answers.current;
    panels.forEach((answer, index) => {
      if (!answer) return;
      const expanded = open === index;
      if (!mounted.current) {
        gsap.set(answer, { height: expanded ? 'auto' : 0, autoAlpha: expanded ? 1 : 0 });
        return;
      }
      gsap.to(answer, {
        height: expanded ? 'auto' : 0,
        autoAlpha: expanded ? 1 : 0,
        duration: 0.38,
        ease: 'power3.inOut',
        overwrite: true,
      });
    });
    mounted.current = true;
    return () => panels.forEach((answer) => { if (answer) gsap.killTweensOf(answer); });
  }, [open]);

  return (
    <section className="faq-section" id="faq">
      <div className="shell faq-layout">
        <div className="faq-list">
          {content.faq.map((item, index) => {
            const expanded = open === index;
            const answerId = `faq-answer-${index}`;
            return (
              <article className={`faq-item${expanded ? ' is-open' : ''}`} key={item.question}>
                <h3>
                  <button
                    className="faq-question"
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={answerId}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    <span className="faq-number">{String(index + 1).padStart(2, '0')}.</span>
                    <span>{item.question}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={answerId}
                  className="faq-answer"
                  aria-hidden={!expanded}
                  ref={(element) => { answers.current[index] = element; }}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="faq-aside">
          <p className="eyebrow">FAQ</p>
          <h2>Ainda tem dúvidas?</h2>
          <p>Tem mais perguntas? Teremos prazer em respondê-las. Não hesite em entrar em contato.</p>
          <Link className="button" href="#contato">Inicie um projeto</Link>
        </aside>
      </div>
    </section>
  );
}