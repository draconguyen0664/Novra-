import Link from 'next/link';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { site } from '@/data/site';

type Settings = { email?: string | null; phone?: string | null; address?: string | null; facebook?: string | null; linkedIn?: string | null; zalo?: string | null; footerContent?: unknown } | null;
type FooterContent = { descriptionVi?: string; descriptionEn?: string; contact?: string; socialLinks?: string; copyright?: string };

export function Footer({ locale, dictionary, settings }: { locale: Locale; dictionary: Dictionary; settings?: Settings }) {
  const serviceKeys = ['business-website', 'landing-page', 'web-app', 'ui-ux', 'seo', 'design-system', 'consulting'];
  const configured = settings?.footerContent && typeof settings.footerContent === 'object' && !Array.isArray(settings.footerContent) ? settings.footerContent as FooterContent : {};
  const configuredSocials = configured.socialLinks?.split('\n').map((value) => value.trim()).filter(Boolean);
  const socialLinks = configuredSocials?.length ? configuredSocials : [settings?.facebook || site.facebook, settings?.linkedIn || site.linkedin, settings?.zalo || site.zalo, 'mailto:' + (settings?.email || site.email)];
  const address = configured.contact?.split('\n').filter(Boolean) || (settings?.address ? [settings.address, settings.phone || '', settings.email || ''] : dictionary.footer.address);
  const description = locale === 'vi' ? configured.descriptionVi : configured.descriptionEn;
  return <footer className="site-footer" data-dark>
    {description && <p className="shell footer-description">{description}</p>}
    <div className="shell footer-columns">{dictionary.footer.columns.map((column, columnIndex) => <div key={column.title}><p className="eyebrow">{column.title}</p>{column.links.map((label, index) => {
      const href = columnIndex === 0 ? localePath(locale, 'contact') + '?service=' + (serviceKeys[index] || 'other') : columnIndex === 1 ? localePath(locale, 'projects') : socialLinks[index] || site.facebook;
      return <Link href={href} key={label}>{label}</Link>;
    })}</div>)}</div>
    <div className="shell footer-meta"><p>{address.map((line) => <span key={line}>{line}<br /></span>)}</p><p>{configured.copyright || dictionary.footer.copyright}</p></div>
    <Link className="footer-wordmark" href={localePath(locale, 'home') + '#hero'} aria-label={dictionary.common.backToTop}>novra*</Link>
  </footer>;
}