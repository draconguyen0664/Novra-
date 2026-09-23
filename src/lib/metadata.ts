import type { Metadata } from 'next';
import { localePath, type Locale, type RouteKey } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { site } from '@/data/site';

export function localizedMetadata(locale: Locale, route: RouteKey, dictionary: Dictionary): Metadata {
  const seo = dictionary.seo[route];
  const path = localePath(locale, route);
  return {
    metadataBase: new URL(site.url),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: path,
      languages: { 'vi-VN': localePath('vi', route), en: localePath('en', route), 'x-default': localePath('vi', route) },
    },
    openGraph: { title: seo.title, description: seo.description, url: path, siteName: site.name, locale: locale === 'vi' ? 'vi_VN' : 'en_US', type: 'website', images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: seo.title }] },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: ['/opengraph-image.jpg'] },
    robots: { index: true, follow: true },
    icons: { icon: '/icon.svg' },
  };
}
