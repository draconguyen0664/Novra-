'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { AnimatedButton } from './AnimatedButton';
import { AnimatedNavLink } from './AnimatedNavLink';
import { LanguageSwitcher } from './LanguageSwitcher';

type Props = { locale: Locale; dictionary: Dictionary };

export function Header({ locale, dictionary }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { navigation, common } = dictionary;
  const items = [
    { label: navigation.home, href: localePath(locale, 'home') },
    { label: navigation.services, href: localePath(locale, 'services') },
    { label: navigation.templates, href: `${localePath(locale, 'home')}#kho-giao-dien` },
    { label: navigation.projects, href: localePath(locale, 'projects') },
    { label: navigation.blog, href: localePath(locale, 'blog') },
    { label: navigation.pricing, href: localePath(locale, 'pricing') },
  ];

  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); return; }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'), toggle.current].filter((element): element is HTMLElement => Boolean(element));
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const direction = event.shiftKey ? -1 : 1;
      focusable[(current + direction + focusable.length) % focusable.length]?.focus();
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = prior; document.removeEventListener('keydown', keyboard); };
  }, [open]);

  const close = () => setOpen(false);
  const navigationLinks = (mobile = false) => items.map((item) => <AnimatedNavLink key={`${mobile ? 'mobile' : 'desktop'}-${item.href}`} href={item.href} label={item.label} active={item.href.split('#')[0] === pathname && !item.href.includes('#')} onClick={close} />);

  return <header className={`site-header ${open ? 'menu-open' : ''}`}>
    <nav className="shell flex items-center justify-between" aria-label={common.mainNavigation}>
      <Link href={localePath(locale, 'home')} className="brand" aria-label={`Novra — ${navigation.home}`} onClick={close}><Image src="/media/novra-logo.png" alt="Novra" width={104} height={24} priority /></Link>
      <div className="desktop-nav flex items-center">{navigationLinks()}</div>
      <div className="header-actions flex items-center">
        <div className="desktop-language"><LanguageSwitcher locale={locale} labels={common} /></div>
        <AnimatedButton href={localePath(locale, 'contact')} label={navigation.cta} mobileLabel={navigation.contact} onClick={close} />
        <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? common.closeMenu : common.openMenu} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      </div>
    </nav>
    <div ref={panel} id="mobile-menu" className="mobile-menu" hidden={!open}><div className="mobile-navigation">{navigationLinks(true)}</div><LanguageSwitcher mobile locale={locale} labels={common} onNavigate={close} /></div>
  </header>;
}
