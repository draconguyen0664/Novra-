import { z } from 'zod';
import { locales } from '@/i18n/config';

export const serviceIds = ['business-website', 'landing-page', 'ecommerce', 'web-app', 'ui-ux', 'seo', 'design-system', 'consulting', 'other'] as const;
export const budgetIds = ['under-5m', '5-10m', '10-30m', '30-50m', 'above-50m', 'unsure'] as const;
export const contactMethodIds = ['phone', 'zalo', 'email'] as const;
export const contactSourceIds = ['homepage', 'contact-page'] as const;

export type ContactValidationMessages = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  details: string;
};

export const createContactSchema = (messages: ContactValidationMessages) => z.object({
  name: z.string().trim().min(1, messages.name).max(100, messages.name),
  phone: z.string().trim().min(7, messages.phone).max(24, messages.phone).regex(/^[+\d][\d\s().-]{6,23}$/, messages.phone),
  company: z.string().trim().max(120, messages.company).optional().default(''),
  email: z.string().trim().email(messages.email).max(160, messages.email),
  services: z.array(z.enum(serviceIds)).min(1, messages.service).max(serviceIds.length, messages.service),
  budget: z.enum(budgetIds, { message: messages.budget }),
  details: z.string().trim().min(20, messages.details).max(5000, messages.details),
  preferredContactMethod: z.enum(contactMethodIds).optional(),
  locale: z.enum(locales),
  source: z.enum(contactSourceIds).optional().default('homepage'),
  website: z.literal('').optional().default(''),
  startedAt: z.number().int().nonnegative(),
});

export type ContactFormInput = z.input<ReturnType<typeof createContactSchema>>;
export type ContactFormValues = z.output<ReturnType<typeof createContactSchema>>;
