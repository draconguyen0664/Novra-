export const site = {
  name: 'Novra',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@novra.vn',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '088 888 9805',
  zalo: process.env.NEXT_PUBLIC_ZALO_URL || 'https://zalo.me/0888889805',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/',
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/',
} as const;
