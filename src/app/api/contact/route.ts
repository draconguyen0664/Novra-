import { NextRequest, NextResponse } from 'next/server';
import { createContactSchema } from '@/lib/contact-schema';
import { getDictionary } from '@/i18n/dictionaries';
import { cleanPlainText, getClientIp, hashIdentifier, hasTrustedOrigin, rateLimit, readJsonBody } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { sendInquiryEmails } from '@/lib/email';
import { isLocale } from '@/i18n/config';

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ ok: false, code: 'INVALID_ORIGIN' }, { status: 403 });
  const key = `contact:${hashIdentifier(getClientIp(request))}`;
  const limit = rateLimit(key, 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ ok: false, code: 'RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } });

  try {
    const raw = await readJsonBody(request);
    const localeCandidate = typeof raw === 'object' && raw && 'locale' in raw ? String(raw.locale) : 'vi';
    const locale = isLocale(localeCandidate) ? localeCandidate : 'vi';
    const dictionary = await getDictionary(locale);
    const result = createContactSchema(dictionary.contact.validation).safeParse(raw);
    if (!result.success) {
      const allFields = result.error.flatten().fieldErrors;
      const publicFields = ['name', 'phone', 'company', 'email', 'services', 'budget', 'details'] as const;
      const fields = Object.fromEntries(publicFields.flatMap((field) => allFields[field]?.length ? [[field, allFields[field]]] : []));
      return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR', fields }, { status: 400 });
    }
    if (result.data.website) return NextResponse.json({ ok: true });
    if (Date.now() - result.data.startedAt < 1500) return NextResponse.json({ ok: false, code: 'SPAM_DETECTED' }, { status: 400 });

    const input = {
      ...result.data,
      name: cleanPlainText(result.data.name), phone: cleanPlainText(result.data.phone), company: cleanPlainText(result.data.company), email: result.data.email.toLowerCase(), details: cleanPlainText(result.data.details),
    };
    const inquiry = await prisma.contactInquiry.create({ data: { name: input.name, phone: input.phone, company: input.company || null, email: input.email, services: input.services, budget: input.budget, details: input.details, preferredContactMethod: input.preferredContactMethod || null, locale: input.locale, source: input.source } });
    let emailSent = false;
    try { const sent = await sendInquiryEmails(input); emailSent = sent.admin || sent.customer; } catch (error) { console.error('Inquiry email failed', error); }
    return NextResponse.json({ ok: true, id: inquiry.id, emailSent }, { status: 201 });
  } catch (error) {
    console.error('Contact inquiry failed', error);
    const bodyError = error instanceof Error ? error.message : '';
    const status = bodyError === 'PAYLOAD_TOO_LARGE' ? 413 : bodyError === 'INVALID_JSON' ? 400 : 500;
    const code = status === 413 ? 'PAYLOAD_TOO_LARGE' : status === 400 ? 'INVALID_JSON' : 'INTERNAL_ERROR';
    return NextResponse.json({ ok: false, code }, { status });
  }
}
