import Link from 'next/link';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { site } from '@/data/site';

export function Footer({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const serviceKeys = ['business-website', 'landing-page', 'web-app', 'ui-ux', 'seo', 'design-system', 'consulting'];
  const socialLinks = [site.facebook, site.linkedin, site.zalo, `mailto:${site.email}`];
  return <footer className="site-footer" data-dark><div className="shell footer-columns">{dictionary.footer.columns.map((column, columnIndex) => <div key={column.title}><p className="eyebrow">{column.title}</p>{column.links.map((label, index) => {
    const href = columnIndex === 0 ? `${localePath(locale, 'contact')}?service=${serviceKeys[index] || 'other'}` : columnIndex === 1 ? localePath(locale, 'projects') : socialLinks[index] || site.facebook;
    return <Link href={href} key={label}>{label}</Link>;
  })}</div>)}</div><div className="shell footer-meta"><p>{dictionary.footer.address.map((line) => <span key={line}>{line}<br /></span>)}</p><p>{dictionary.footer.copyright}</p></div><Link className="footer-wordmark" href={`${localePath(locale, 'home')}#hero`} aria-label={dictionary.common.backToTop}>novra*</Link></footer>;
}
