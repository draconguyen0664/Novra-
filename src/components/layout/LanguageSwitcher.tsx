'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { switchLocalePath, type Locale } from '@/i18n/config';

const languages: Locale[] = ['vi', 'en'];

type Props = { locale: Locale; labels: { language: string; chooseLanguage: string }; mobile?: boolean; onNavigate?: () => void };

export function LanguageSwitcher({ locale, labels, mobile = false, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); };
  }, [open]);

  const select = (nextLocale: Locale) => {
    const search = typeof window === 'undefined' ? '' : window.location.search;
    const hash = typeof window === 'undefined' ? '' : window.location.hash;
    router.push(`${switchLocalePath(pathname, nextLocale)}${search}${hash}`);
    setOpen(false);
    onNavigate?.();
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  if (mobile) return <div className="mobile-language" aria-label={labels.language}><span className="mobile-language-label">{labels.language}</span><div className="mobile-language-options">{languages.map((language) => <button type="button" key={language} className={language === locale ? 'is-selected' : undefined} aria-pressed={language === locale} onClick={() => select(language)}>{language.toUpperCase()}</button>)}</div></div>;

  return <div ref={rootRef} className={`language-switcher${open ? ' is-open' : ''}`}>
    <button ref={triggerRef} type="button" className="language-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls="language-options" onClick={() => setOpen((value) => !value)} onKeyDown={(event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); const index = event.key === 'ArrowDown' ? 0 : languages.length - 1; requestAnimationFrame(() => optionRefs.current[index]?.focus()); }
    }}><span>{locale.toUpperCase()}</span><svg className="language-chevron" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg></button>
    <div id="language-options" className="language-options" role="listbox" aria-label={labels.chooseLanguage} aria-hidden={!open}>{languages.map((language, index) => <button ref={(element) => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={language === locale} tabIndex={open ? 0 : -1} key={language} onClick={() => select(language)} onKeyDown={(event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return; event.preventDefault(); const direction = event.key === 'ArrowDown' ? 1 : -1; optionRefs.current[(index + direction + languages.length) % languages.length]?.focus();
    }}>{language.toUpperCase()}</button>)}</div>
  </div>;
}
