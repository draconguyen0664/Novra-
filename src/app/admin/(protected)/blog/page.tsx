import { AdminResourceManager, type AdminField } from '@/components/admin/AdminResourceManager';
import { AdminDataManager, type DataField } from '@/components/admin/AdminDataManager';

const fields: AdminField[] = [
  { name: 'slugVi', label: 'Slug tiếng Việt', required: true }, { name: 'slugEn', label: 'English slug', required: true },
  { name: 'titleVi', label: 'Tiêu đề tiếng Việt', required: true }, { name: 'titleEn', label: 'English title', required: true },
  { name: 'excerptVi', label: 'Tóm tắt tiếng Việt', type: 'textarea', required: true }, { name: 'excerptEn', label: 'English excerpt', type: 'textarea', required: true },
  { name: 'contentVi', label: 'Nội dung tiếng Việt', type: 'richtext', required: true }, { name: 'contentEn', label: 'English content', type: 'richtext', required: true },
  { name: 'coverImage', label: 'Cover image URL', required: true }, { name: 'categoryId', label: 'Category ID' },
  { name: 'ogImage', label: 'OG Image URL' }, { name: 'scheduledAt', label: 'Lịch xuất bản (ISO date)' },
  { name: 'seoTitleVi', label: 'SEO title tiếng Việt' }, { name: 'seoTitleEn', label: 'English SEO title' },
  { name: 'seoDescriptionVi', label: 'SEO description tiếng Việt', type: 'textarea' }, { name: 'seoDescriptionEn', label: 'English SEO description', type: 'textarea' },
  { name: 'published', label: 'Đã xuất bản', type: 'checkbox' },
];
const taxonomyFields: DataField[] = [
  { name: 'slug', label: 'Slug', required: true }, { name: 'nameVi', label: 'Tên tiếng Việt', required: true }, { name: 'nameEn', label: 'English name', required: true },
];

export default function Page() {
  return <>
    <header className="admin-page-head"><div><p>NỘI DUNG</p><h1>Blog</h1><span>Bản nháp, bài đã xuất bản và bài lên lịch.</span></div></header>
    <AdminResourceManager resource="blog" titleField="titleVi" fields={fields} />
    <header className="admin-page-head admin-subhead"><div><p>PHÂN LOẠI</p><h2>Danh mục</h2></div></header>
    <AdminDataManager resource="categories" titleField="nameVi" fields={taxonomyFields} />
    <header className="admin-page-head admin-subhead"><div><p>PHÂN LOẠI</p><h2>Tags</h2></div></header>
    <AdminDataManager resource="tags" titleField="nameVi" fields={taxonomyFields} />
  </>;
}