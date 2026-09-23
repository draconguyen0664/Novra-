import type { Locale } from '@/i18n/config';

type InquiryEmail = { name: string; phone: string; company?: string; email: string; services: string[]; budget: string; details: string; preferredContactMethod?: string; locale: Locale };

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to, subject, html }) });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}

export async function sendInquiryEmails(inquiry: InquiryEmail) {
  const admin = process.env.EMAIL_TO;
  if (!admin) return { admin: false, customer: false };
  const rows = [['Name', inquiry.name], ['Phone', inquiry.phone], ['Company', inquiry.company || '—'], ['Email', inquiry.email], ['Services', inquiry.services.join(', ')], ['Budget', inquiry.budget], ['Preferred contact', inquiry.preferredContactMethod || '—'], ['Details', inquiry.details]];
  const adminHtml = `<h1>New Novra inquiry</h1>${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}`;
  const confirmation = inquiry.locale === 'vi' ? { subject: 'Novra đã nhận yêu cầu của bạn', body: `Xin chào ${escapeHtml(inquiry.name)},<br><br>Novra đã nhận yêu cầu và sẽ liên hệ với bạn sớm.` } : { subject: 'Novra received your inquiry', body: `Hello ${escapeHtml(inquiry.name)},<br><br>Novra received your inquiry and will contact you soon.` };
  const adminSent = await sendEmail(admin, `New inquiry — ${inquiry.name}`, adminHtml);
  const customerSent = await sendEmail(inquiry.email, confirmation.subject, `<p>${confirmation.body}</p>`);
  return { admin: adminSent, customer: customerSent };
}
