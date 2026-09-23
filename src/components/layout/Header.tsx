'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/data/site';
import { AnimatedButton } from './AnimatedButton';
import { AnimatedNavLink } from './AnimatedNavLink';
import { LanguageSwitcher, type Language } from './LanguageSwitcher';

export function Header() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('VI');
  const [activeHref, setActiveHref] = useState(site.navigation[0].href);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const updateActiveLink = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let next = site.navigation[0].href;
        site.navigation.forEach((item) => {
          const id = item.href.split('#')[1];
          const section = id ? document.getElementById(id) : null;
          if (section && section.getBoundingClientRect().top <= 120) next = item.href;
        });
        setActiveHref(next);
      });
    };

    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink, { passive: true });
    window.addEventListener('hashchange', updateActiveLink);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActiveLink);
      window.removeEventListener('resize', updateActiveLink);
      window.removeEventListener('hashchange', updateActiveLink);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;

      const focusable = [
        ...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        toggle.current,
      ].filter((element): element is HTMLElement => Boolean(element));
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const direction = event.shiftKey ? -1 : 1;
      focusable[(current + direction + focusable.length) % focusable.length]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prior;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const navigation = (mobile = false) => site.navigation.map((item) => (
    <AnimatedNavLink
      key={`${mobile ? 'mobile' : 'desktop'}-${item.href}`}
      href={item.href}
      label={item.label}
      active={activeHref === item.href}
      onClick={() => {
        setActiveHref(item.href);
        closeMenu();
      }}
    />
  ));

  return (
    <header className={`site-header ${open ? 'menu-open' : ''}`}>
      <nav className="shell flex items-center justify-between" aria-label="Navegação principal">
        <Link href="/#hero" className="brand" aria-label="Novra — Trang chủ" onClick={closeMenu}>
          <Image src="/media/novra-logo.png" alt="Novra" width={104} height={24} priority />
        </Link>

        <div className="desktop-nav flex items-center">{navigation()}</div>

        <div className="header-actions flex items-center">
          <div className="desktop-language">
            <LanguageSwitcher value={language} onChange={setLanguage} />
          </div>
          <AnimatedButton href="/#contato" onClick={closeMenu} />
          <button
            ref={toggle}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div ref={panel} id="mobile-menu" className="mobile-menu" hidden={!open}>
        <div className="mobile-navigation">{navigation(true)}</div>
        <LanguageSwitcher mobile value={language} onChange={setLanguage} />
      </div>
    </header>
  );
}