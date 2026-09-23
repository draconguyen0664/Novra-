import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLocale, localePath, routeFromSegment, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { prisma } from '@/lib/prisma';
import { site } from '@/data/site';

type Params = Promise<{ locale: string; section: string; slug: string }>;

function resolve(localeValue: string, section: string): { locale: Locale; route: 'projects' | 'blog' } | null {
  if (!isLocale(localeValue)) return null;
  const route = routeFromSegment(localeValue, section);
  return route === 'projects' || route === 'blog' ? { locale: localeValue, route } : null;
}

async function findProject(slug: string) {
  try { return await prisma.project.findFirst({ where: { published: true, OR: [{ slugVi: slug }, { slugEn: slug }] } }); }
  catch (error) { console.error('Project data unavailable', error); return null; }
}

async function findPost(slug: string) {
  try { return await prisma.blogPost.findFirst({ where: { published: true, OR: [{ slugVi: slug }, { slugEn: slug }] } }); }
  catch (error) { console.error('Blog data unavailable', error); return null; }
}
function detailMetadata(title: string, description: string, canonical: string, image: string, slugVi: string, slugEn: string, route: 'projects' | 'blog', isVi: boolean): Metadata {
  return { metadataBase: new URL(site.url), title, description, alternates: { canonical, languages: { 'vi-VN': `${localePath('vi', route)}/${slugVi}`, en: `${localePath('en', route)}/${slugEn}` } }, openGraph: { title, description, url: canonical, siteName: site.name, locale: isVi ? 'vi_VN' : 'en_US', type: route === 'blog' ? 'article' : 'website', images: image ? [image] : ['/opengraph-image.jpg'] }, twitter: { card: 'summary_large_image', title, description, images: image ? [image] : ['/opengraph-image.jpg'] } };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const values = await params; const resolved = resolve(values.locale, values.section); if (!resolved) return {};
  try {
    const isVi = resolved.locale === 'vi';
    if (resolved.route === 'projects') {
      const data = await findProject(values.slug); if (!data) return {};
      const title = isVi ? data.titleVi : data.titleEn; const description = isVi ? data.descriptionVi : data.descriptionEn; const canonical = `${localePath(resolved.locale, 'projects')}/${isVi ? data.slugVi : data.slugEn}`;
      return detailMetadata(title, description, canonical, data.coverImage, data.slugVi, data.slugEn, 'projects', isVi);
    }
    const data = await findPost(values.slug); if (!data) return {};
    const title = isVi ? data.seoTitleVi || data.titleVi : data.seoTitleEn || data.titleEn; const description = isVi ? data.seoDescriptionVi || data.excerptVi : data.seoDescriptionEn || data.excerptEn; const canonical = `${localePath(resolved.locale, 'blog')}/${isVi ? data.slugVi : data.slugEn}`;
    return detailMetadata(title, description, canonical, data.coverImage, data.slugVi, data.slugEn, 'blog', isVi);
  } catch (error) { console.error('Dynamic metadata unavailable', error); return {}; }
}

export default async function DetailPage({ params }: { params: Params }) {
  const values = await params; const resolved = resolve(values.locale, values.section); if (!resolved) notFound();
  const dictionary = await getDictionary(resolved.locale); const isVi = resolved.locale === 'vi';
  if (resolved.route === 'projects') {
      const data = await findProject(values.slug); if (!data) notFound();
      const title = isVi ? data.titleVi : data.titleEn; const description = isVi ? data.descriptionVi : data.descriptionEn;
      return <main id="main"><article className="content-detail"><div className="shell"><p className="ximi-kicker">{dictionary.pages.projects.eyebrow}</p><h1>{title}</h1><p className="content-detail-lead">{description}</p><figure><Image src={data.coverImage} alt={title} fill sizes="90vw" priority /></figure>{data.projectUrl && <a className="content-detail-link" href={data.projectUrl} target="_blank" rel="noreferrer">{dictionary.common.learnMore}<span>↗</span></a>}</div></article></main>;
    }
    const data = await findPost(values.slug); if (!data) notFound();
    const title = isVi ? data.titleVi : data.titleEn; const content = isVi ? data.contentVi : data.contentEn;
    return <main id="main"><article className="content-detail"><div className="shell"><p className="ximi-kicker">{dictionary.pages.blog.eyebrow}</p><h1>{title}</h1><p className="content-detail-lead">{isVi ? data.excerptVi : data.excerptEn}</p><figure><Image src={data.coverImage} alt={title} fill sizes="90vw" priority /></figure><div className="content-detail-body">{content}</div></div></article></main>;
}