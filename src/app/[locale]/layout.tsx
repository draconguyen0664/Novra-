import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { MotionController } from '@/animations/MotionController';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StructuredData } from '@/components/seo/StructuredData';
import { getDictionary } from '@/i18n/dictionaries';
import { isLocale, locales } from '@/i18n/config';
import '../globals.css';
import '../../styles/lower-sections.css';
import '../../styles/novra-sections.css';
import '../../styles/contact-inquiry.css';
import '../../styles/localized-pages.css';

const lausanne = localFont({ src: [{ path: '../../assets/lausanne-regular.woff2', weight: '400', style: 'normal' }, { path: '../../assets/lausanne-light.woff2', weight: '200', style: 'normal' }], variable: '--font-lausanne', display: 'swap', fallback: ['Arial'], adjustFontFallback: 'Arial' });

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  return <html lang={locale} className={lausanne.variable}><body><a href="#main" className="skip-link">{dictionary.common.skipToContent}</a><Header locale={locale} dictionary={dictionary} />{children}<Footer locale={locale} dictionary={dictionary} /><MotionController /><StructuredData locale={locale} dictionary={dictionary} /></body></html>;
}
