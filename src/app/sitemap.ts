import type { MetadataRoute } from 'next';
import { localePath, locales, routeKeys } from '@/i18n/config';
import { site } from '@/data/site';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => routeKeys.map((route) => ({ url: `${site.url}${localePath(locale, route)}`, lastModified, changeFrequency: route === 'home' ? 'weekly' as const : 'monthly' as const, priority: route === 'home' ? 1 : route === 'contact' ? .8 : .7 })));
  try {
    const [projects, posts] = await Promise.all([prisma.project.findMany({ where: { published: true }, select: { slugVi: true, slugEn: true, updatedAt: true } }), prisma.blogPost.findMany({ where: { published: true }, select: { slugVi: true, slugEn: true, updatedAt: true } })]);
    return [...staticEntries, ...projects.flatMap((project) => [{ url: `${site.url}${localePath('vi', 'projects')}/${project.slugVi}`, lastModified: project.updatedAt, changeFrequency: 'monthly' as const, priority: .6 }, { url: `${site.url}${localePath('en', 'projects')}/${project.slugEn}`, lastModified: project.updatedAt, changeFrequency: 'monthly' as const, priority: .6 }]), ...posts.flatMap((post) => [{ url: `${site.url}${localePath('vi', 'blog')}/${post.slugVi}`, lastModified: post.updatedAt, changeFrequency: 'monthly' as const, priority: .6 }, { url: `${site.url}${localePath('en', 'blog')}/${post.slugEn}`, lastModified: post.updatedAt, changeFrequency: 'monthly' as const, priority: .6 }])];
  } catch { return staticEntries; }
}
