'use client';

import { useEffect, useRef, useState } from 'react';

export type Language = 'VI' | 'EN' | 'PT';

const languages: Language[] = ['VI', 'EN', 'PT'];

type LanguageSwitcherProps = {
  value: Language;
  onChange: (language: Language) => void;
  mobile?: boolean;
};

export function LanguageSwitcher({ value, onChange, mobile = false }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const select = (language: Language) => {
    onChange(language);
    setOpen(false);
    triggerRef.current?.focus();
  };

  if (mobile) {
    return (
      <div className="mobile-language" aria-label="Ngôn ngữ">
        <span className="mobile-language-label">Language</span>
        <div className="mobile-language-options">
          {languages.map((language) => (
            <button
              type="button"
              key={language}
              className={language === value ? 'is-selected' : undefined}
              aria-pressed={language === value}
              onClick={() => onChange(language)}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`language-switcher${open ? ' is-open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="language-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="language-options"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            const index = event.key === 'ArrowDown' ? 0 : languages.length - 1;
            requestAnimationFrame(() => optionRefs.current[index]?.focus());
          }
        }}
      >
        <span>{value}</span>
        <svg className="language-chevron" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>
      <div
        id="language-options"
        className="language-options"
        role="listbox"
        aria-label="Chọn ngôn ngữ"
        aria-hidden={!open}
      >
        {languages.map((language, index) => (
          <button
            ref={(element) => { optionRefs.current[index] = element; }}
            type="button"
            role="option"
            aria-selected={language === value}
            tabIndex={open ? 0 : -1}
            key={language}
            onClick={() => select(language)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
              event.preventDefault();
              const direction = event.key === 'ArrowDown' ? 1 : -1;
              const next = (index + direction + languages.length) % languages.length;
              optionRefs.current[next]?.focus();
            }}
          >
            {language}
          </button>
        ))}
      </div>
    </div>
  );
}
