import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export type PublicSection = { enabled: boolean; sortOrder: number };
export type PublicSections = Record<string, PublicSection>;
export type PublicProject = { name: string; category: string; description: string; image: string; href: string };
export type PublicHeroCard = { src: string; href?: string | null };
export type PublicPricingPlan = { key: string; name: string; label: string; price: string; originalPrice?: string; time: string; bestFor: string; features: readonly string[]; cta: string; recommended?: boolean };

function content(value: Prisma.JsonValue | null, locale: Locale) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function applyCopy(dictionary: Dictionary, key: string, data: Record<string, unknown>) {
  const target = dictionary as unknown as Record<string, Record<string, unknown>>;
  const mapping: Record<string, string> = {
    'ai-consultation': 'aiConsultation', services: 'services', projects: 'selectedProjects',
    'why-novra': 'benefits', pricing: 'pricing', capabilities: 'capabilities',
    process: 'process', faq: 'faq', about: 'about', contact: 'contact', 'final-cta': 'finalCta',
  };
  const targetKey = mapping[key];
  if (!targetKey || !target[targetKey]) return;
  if (typeof data.eyebrow === 'string' && data.eyebrow) target[targetKey].kicker = data.eyebrow;
  if (typeof data.heading === 'string' && data.heading) target[targetKey].heading = data.heading.split('\n').filter(Boolean);
  if (typeof data.description === 'string' && data.description) target[targetKey].copy = data.description;
  if (key === 'final-cta' && typeof data.primaryCtaLabel === 'string' && data.primaryCtaLabel) target[targetKey].button = data.primaryCtaLabel;
}

export async function getHomepageCms(locale: Locale, source: Dictionary) {
  const dictionary = JSON.parse(JSON.stringify(source)) as Dictionary;
  const sections: PublicSections = {};
  let services: { title: string; description: string }[] | undefined;
  let pricing: PublicPricingPlan[] | undefined;
  let faqs: { question: string; answer: string }[] | undefined;
  let projects: PublicProject[] | undefined;
  let heroCards: PublicHeroCard[] | undefined;

  try {
    const [sectionRows, serviceRows, pricingRows, faqRows, projectRows, cardRows] = await Promise.all([
      prisma.pageSection.findMany({ where: { page: { key: 'homepage' } }, orderBy: { sortOrder: 'asc' } }),
      prisma.service.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.pricingPlan.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.fAQ.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.project.findMany({ where: { published: true, OR: [{ showOnHomepage: true }, { featured: true }] }, orderBy: { sortOrder: 'asc' } }),
      prisma.heroProjectCard.findMany({ where: { visible: true }, orderBy: { sortOrder: 'asc' } }),
    ]);
    for (const row of sectionRows) {
      sections[row.key] = { enabled: row.enabled, sortOrder: row.sortOrder };
      const localized = content(locale === 'vi' ? row.contentVi : row.contentEn, locale);
      if (row.key === 'hero') {
        if (typeof localized.heading === 'string' && localized.heading) (dictionary.hero as { title: string; copy: string }).title = localized.heading;
        if (typeof localized.description === 'string' && localized.description) (dictionary.hero as { title: string; copy: string }).copy = localized.description;
      } else applyCopy(dictionary, row.key, localized);
    }
    if (serviceRows.length) services = serviceRows.map((row) => ({ title: locale === 'vi' ? row.nameVi : row.nameEn, description: locale === 'vi' ? row.descriptionVi : row.descriptionEn }));
    if (pricingRows.length) pricing = pricingRows.map((row) => ({
      key: row.key, name: locale === 'vi' ? row.nameVi : row.nameEn, label: locale === 'vi' ? row.labelVi : row.labelEn,
      price: Number(row.priceFrom).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') + ' ' + row.currency,
      originalPrice: row.originalPrice ? Number(row.originalPrice).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') + ' ' + row.currency : undefined,
      time: locale === 'vi' ? row.durationVi : row.durationEn, bestFor: locale === 'vi' ? row.descriptionVi : row.descriptionEn,
      features: locale === 'vi' ? row.featuresVi : row.featuresEn, cta: dictionary.navigation.contact, recommended: row.recommended,
    }));
    if (faqRows.length) faqs = faqRows.map((row) => ({ question: locale === 'vi' ? row.questionVi : row.questionEn, answer: locale === 'vi' ? row.answerVi : row.answerEn }));
    if (projectRows.length) projects = projectRows.map((row) => ({ name: locale === 'vi' ? row.titleVi : row.titleEn, category: row.category, description: locale === 'vi' ? row.descriptionVi : row.descriptionEn, image: row.coverImage, href: '/' + locale + '/du-an/' + (locale === 'vi' ? row.slugVi : row.slugEn) }));
    if (cardRows.length) heroCards = cardRows.map((row) => ({ src: row.image, href: row.link }));
  } catch (error) {
    console.error('Public CMS fallback active', error);
  }
  return { dictionary, sections, services, pricing, faqs, projects, heroCards };
}

export async function getSiteChrome(locale: Locale) {
  try {
    const [navigation, settings] = await Promise.all([
      prisma.navigationItem.findMany({ where: { visible: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.siteSetting.findUnique({ where: { id: 'primary' } }),
    ]);
    return {
      navigation: navigation.map((item) => ({ label: locale === 'vi' ? item.labelVi : item.labelEn, href: locale === 'vi' ? item.urlVi : item.urlEn, openInNewTab: item.openInNewTab })),
      settings,
    };
  } catch (error) {
    console.error('Public chrome CMS fallback active', error);
    return { navigation: [], settings: null };
  }
}