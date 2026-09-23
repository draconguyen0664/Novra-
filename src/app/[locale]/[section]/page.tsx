import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ContactInquiry } from '@/components/sections/ContactInquiry';
import { LocalizedPage } from '@/components/sections/LocalizedPage';
import { getDictionary } from '@/i18n/dictionaries';
import { isLocale, localePath, routeFromSegment, type Locale, type RouteKey } from '@/i18n/config';
import { localizedMetadata } from '@/lib/metadata';
import { prisma } from '@/lib/prisma';

const publicRoutes: RouteKey[] = ['services', 'projects', 'pricing', 'blog', 'contact'];

function resolve(localeValue: string, section: string): { locale: Locale; route: Exclude<RouteKey, 'home'> } {
  if (!isLocale(localeValue)) notFound();
  const route = routeFromSegment(localeValue, section);
  if (!route || !publicRoutes.includes(route)) notFound();
  return { locale: localeValue, route: route as Exclude<RouteKey, 'home'> };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const values = await params;
  const { locale, route } = resolve(values.locale, values.section);
  return localizedMetadata(locale, route, await getDictionary(locale));
}

async function records(route: RouteKey) {
  try {
    if (route === 'services') return await prisma.service.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
    if (route === 'projects') return await prisma.project.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
    if (route === 'pricing') return await prisma.pricingPlan.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
    if (route === 'blog') return await prisma.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } });
  } catch (error) { console.error(`Public ${route} data unavailable`, error); }
  return [];
}

export default async function SectionPage({ params, searchParams }: { params: Promise<{ locale: string; section: string }>; searchParams: Promise<{ service?: string }> }) {
  const values = await params;
  const { locale, route } = resolve(values.locale, values.section);
  const expected = localePath(locale, route);
  if (`/${locale}/${values.section}` !== expected) redirect(expected);
  const [dictionary, query] = await Promise.all([getDictionary(locale), searchParams]);
  if (route === 'contact') return <main id="main"><ContactInquiry locale={locale} dictionary={dictionary} initialService={query.service} standalone /></main>;
  return <LocalizedPage locale={locale} route={route} dictionary={dictionary} records={await records(route)} />;
}
