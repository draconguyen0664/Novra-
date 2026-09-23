import { z } from 'zod';
import { prisma } from './prisma';

export const adminResources = ['projects', 'blog', 'services', 'pricing', 'faqs'] as const;
export type AdminResource = (typeof adminResources)[number];
export const isAdminResource = (value: string): value is AdminResource => adminResources.includes(value as AdminResource);

const projectSchema = z.object({ slugVi: z.string().min(1).max(160), slugEn: z.string().min(1).max(160), titleVi: z.string().min(1).max(200), titleEn: z.string().min(1).max(200), descriptionVi: z.string().min(1).max(2000), descriptionEn: z.string().min(1).max(2000), category: z.string().min(1).max(120), coverImage: z.string().min(1).max(500), gallery: z.array(z.string().max(500)).default([]), client: z.string().max(160).nullable().optional(), year: z.number().int().min(2000).max(2100).nullable().optional(), projectUrl: z.string().url().max(500).nullable().optional(), featured: z.boolean().default(false), sortOrder: z.number().int().default(0), published: z.boolean().default(false) });
const blogSchema = z.object({ slugVi: z.string().min(1).max(160), slugEn: z.string().min(1).max(160), titleVi: z.string().min(1).max(240), titleEn: z.string().min(1).max(240), excerptVi: z.string().min(1).max(600), excerptEn: z.string().min(1).max(600), contentVi: z.string().min(1).max(100000), contentEn: z.string().min(1).max(100000), coverImage: z.string().min(1).max(500), categoryId: z.string().nullable().optional(), seoTitleVi: z.string().max(240).nullable().optional(), seoTitleEn: z.string().max(240).nullable().optional(), seoDescriptionVi: z.string().max(400).nullable().optional(), seoDescriptionEn: z.string().max(400).nullable().optional(), published: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional() });
const serviceSchema = z.object({ slugVi: z.string().min(1).max(160), slugEn: z.string().min(1).max(160), nameVi: z.string().min(1).max(200), nameEn: z.string().min(1).max(200), descriptionVi: z.string().min(1).max(2000), descriptionEn: z.string().min(1).max(2000), contentVi: z.string().min(1).max(50000), contentEn: z.string().min(1).max(50000), icon: z.string().max(500).nullable().optional(), sortOrder: z.number().int().default(0), published: z.boolean().default(false) });
const pricingSchema = z.object({ key: z.string().min(1).max(100), nameVi: z.string().min(1).max(200), nameEn: z.string().min(1).max(200), labelVi: z.string().min(1).max(120), labelEn: z.string().min(1).max(120), priceFrom: z.number().int().nonnegative(), originalPrice: z.number().int().nonnegative().nullable().optional(), currency: z.string().min(3).max(8).default('VND'), durationVi: z.string().min(1).max(120), durationEn: z.string().min(1).max(120), descriptionVi: z.string().min(1).max(2000), descriptionEn: z.string().min(1).max(2000), featuresVi: z.array(z.string().max(300)), featuresEn: z.array(z.string().max(300)), recommended: z.boolean().default(false), sortOrder: z.number().int().default(0), published: z.boolean().default(false) });
const faqSchema = z.object({ questionVi: z.string().min(1).max(500), questionEn: z.string().min(1).max(500), answerVi: z.string().min(1).max(5000), answerEn: z.string().min(1).max(5000), sortOrder: z.number().int().default(0), published: z.boolean().default(false) });

const schemas = { projects: projectSchema, blog: blogSchema, services: serviceSchema, pricing: pricingSchema, faqs: faqSchema } as const;

export function validateAdminResource(resource: AdminResource, payload: unknown, partial = false) {
  return (partial ? schemas[resource].partial() : schemas[resource]).parse(payload);
}

export function listAdminResource(resource: AdminResource) {
  switch (resource) {
    case 'projects': return prisma.project.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] });
    case 'blog': return prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' } });
    case 'services': return prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] });
    case 'pricing': return prisma.pricingPlan.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] });
    case 'faqs': return prisma.fAQ.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] });
  }
}

export function createAdminResource(resource: AdminResource, payload: unknown) {
  switch (resource) {
    case 'projects': return prisma.project.create({ data: projectSchema.parse(payload) });
    case 'blog': return prisma.blogPost.create({ data: blogSchema.parse(payload) });
    case 'services': return prisma.service.create({ data: serviceSchema.parse(payload) });
    case 'pricing': return prisma.pricingPlan.create({ data: pricingSchema.parse(payload) });
    case 'faqs': return prisma.fAQ.create({ data: faqSchema.parse(payload) });
  }
}

export function updateAdminResource(resource: AdminResource, id: string, payload: unknown) {
  switch (resource) {
    case 'projects': return prisma.project.update({ where: { id }, data: projectSchema.partial().parse(payload) });
    case 'blog': return prisma.blogPost.update({ where: { id }, data: blogSchema.partial().parse(payload) });
    case 'services': return prisma.service.update({ where: { id }, data: serviceSchema.partial().parse(payload) });
    case 'pricing': return prisma.pricingPlan.update({ where: { id }, data: pricingSchema.partial().parse(payload) });
    case 'faqs': return prisma.fAQ.update({ where: { id }, data: faqSchema.partial().parse(payload) });
  }
}

export function deleteAdminResource(resource: AdminResource, id: string) {
  switch (resource) {
    case 'projects': return prisma.project.delete({ where: { id } });
    case 'blog': return prisma.blogPost.delete({ where: { id } });
    case 'services': return prisma.service.delete({ where: { id } });
    case 'pricing': return prisma.pricingPlan.delete({ where: { id } });
    case 'faqs': return prisma.fAQ.delete({ where: { id } });
  }
}
