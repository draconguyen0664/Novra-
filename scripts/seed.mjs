import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const services = [
  { slugVi: 'website-theo-yeu-cau', slugEn: 'custom-websites', nameVi: 'Website theo yêu cầu', nameEn: 'Custom Websites', descriptionVi: 'Website phù hợp mục tiêu kinh doanh và thương hiệu.', descriptionEn: 'Websites tailored to business goals and brand.', contentVi: 'Thiết kế, phát triển, SEO nền tảng và bàn giao vận hành.', contentEn: 'Design, development, technical SEO and operational handover.' },
  { slugVi: 'web-app', slugEn: 'web-apps', nameVi: 'Web App', nameEn: 'Web Apps', descriptionVi: 'Công cụ vận hành, dashboard và hệ thống nội bộ.', descriptionEn: 'Operating tools, dashboards and internal systems.', contentVi: 'Phân tích quy trình, thiết kế UX và phát triển theo phạm vi.', contentEn: 'Workflow discovery, UX design and scoped development.' },
  { slugVi: 'seo', slugEn: 'seo', nameVi: 'SEO & tối ưu chuyển đổi', nameEn: 'SEO & Conversion', descriptionVi: 'Tối ưu khả năng tìm thấy và chuyển đổi.', descriptionEn: 'Improve discoverability and conversion.', contentVi: 'SEO kỹ thuật, cấu trúc nội dung và đo lường.', contentEn: 'Technical SEO, content structure and measurement.' },
];
for (const [sortOrder, service] of services.entries()) await prisma.service.upsert({ where: { slugEn: service.slugEn }, create: { ...service, sortOrder, published: true }, update: { ...service, sortOrder, published: true } });

await prisma.siteSetting.upsert({ where: { id: 'primary' }, create: { companyName: 'Novra', phone: '088 888 9805', email: 'hello@novra.vn', zalo: 'https://zalo.me/0888889805', defaultLocale: 'vi' }, update: {} });
console.log('Novra starter data seeded.');
await prisma.$disconnect();
