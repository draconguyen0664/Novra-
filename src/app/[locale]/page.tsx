import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/sections/Hero';
import { XimiProof } from '@/components/sections/XimiProof';
import { Projects } from '@/components/sections/Projects';
import { ExperienceMotion } from '@/components/sections/ExperienceMotion';
import { XimiSections } from '@/components/sections/XimiSections';
import { getDictionary } from '@/i18n/dictionaries';
import { isLocale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(locale, 'home', await getDictionary(locale));
}

export default async function Home({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ service?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [dictionary, query] = await Promise.all([getDictionary(locale), searchParams]);
  return <main id="main"><Hero dictionary={dictionary} /><XimiProof dictionary={dictionary} /><Projects locale={locale} dictionary={dictionary} /><ExperienceMotion words={dictionary.experience.words} label={dictionary.experience.label} /><XimiSections locale={locale} dictionary={dictionary} initialService={query.service} /></main>;
}
