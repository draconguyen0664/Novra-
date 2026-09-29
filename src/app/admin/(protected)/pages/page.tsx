import { AdminDataManager, type DataField } from '@/components/admin/AdminDataManager';
const fields: DataField[] = [
  { name: 'key', label: 'Khóa nội bộ', required: true }, { name: 'name', label: 'Tên trang', required: true },
  { name: 'slugVi', label: 'Slug tiếng Việt', required: true }, { name: 'slugEn', label: 'English slug', required: true },
  { name: 'published', label: 'Đã xuất bản', type: 'checkbox' },
];
export default function Page() { return <><header className="admin-page-head"><div><p>NỘI DUNG</p><h1>Trang</h1><span>Quản lý các trang song ngữ của website.</span></div></header><AdminDataManager resource="pages" titleField="name" fields={fields} /></>; }