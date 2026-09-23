import { site } from '@/data/site';
import { ximiFaq } from '@/data/ximitech';

export function StructuredData() {
  const data = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url, email: site.email },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, inLanguage: 'pt-BR' },
    { '@context': 'https://schema.org', '@type': 'WebPage', name: site.title, description: site.description, url: site.url, inLanguage: 'pt-BR' },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: ximiFaq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
