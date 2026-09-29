import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/sections/Hero';
import { XimiProof } from '@/components/sections/XimiProof';
import { Projects } from '@/components/sections/Projects';
import { ExperienceMotion } from '@/components/sections/ExperienceMotion';
import { XimiSections } from '@/components/sections/XimiSections';
import { getDictionary } from '@/i18n/dictionaries';
import { isLocale } from '@/i18n/config';
import { getHomepageCms } from '@/lib/cms-public';
import { localizedMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(locale, 'home', await getDictionary(locale));
}

export default async function Home({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ service?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [baseDictionary, query] = await Promise.all([getDictionary(locale), searchParams]);
  const cms = await getHomepageCms(locale, baseDictionary);
  return <main id="main" className="cms-home">
    <Hero dictionary={cms.dictionary} config={cms.sections.hero} cards={cms.heroCards} />
    <XimiProof dictionary={cms.dictionary} config={cms.sections['hero-projects']} />
    <Projects locale={locale} dictionary={cms.dictionary} config={cms.sections.projects} />
    <ExperienceMotion words={cms.dictionary.experience.words} label={cms.dictionary.experience.label} config={cms.sections.experience} />
    <XimiSections locale={locale} dictionary={cms.dictionary} initialService={query.service} sections={cms.sections} services={cms.services} pricing={cms.pricing} faqs={cms.faqs} projects={cms.projects} />
  </main>;
}