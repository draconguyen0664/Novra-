import { AdminDataManager, type DataField } from '@/components/admin/AdminDataManager';
const fields: DataField[] = [
  { name: 'key', label: 'Trang / khóa', required: true },
  { name: 'titleVi', label: 'SEO title tiếng Việt' }, { name: 'titleEn', label: 'English SEO title' },
  { name: 'descriptionVi', label: 'Mô tả tiếng Việt', type: 'textarea' }, { name: 'descriptionEn', label: 'English description', type: 'textarea' },
  { name: 'ogImage', label: 'OG Image URL' }, { name: 'canonicalUrl', label: 'Canonical URL' },
  { name: 'indexable', label: 'Cho phép index', type: 'checkbox' },
];
export default function Page() { return <><header className="admin-page-head"><div><p>WEBSITE</p><h1>SEO</h1><span>Quản lý metadata cho từng trang và ngôn ngữ.</span></div></header><AdminDataManager resource="seo" titleField="key" fields={fields} /></>; }