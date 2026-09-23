import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { site } from '@/data/site';

export function StructuredData({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const language = locale === 'vi' ? 'vi-VN' : 'en';
  const data = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: `${site.url}/${locale}`, email: site.email, telephone: site.phone },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: `${site.url}/${locale}`, inLanguage: language },
    { '@context': 'https://schema.org', '@type': 'WebPage', name: dictionary.seo.home.title, description: dictionary.seo.home.description, url: `${site.url}/${locale}`, inLanguage: language },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: dictionary.faq.items.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
