import { HomepageManager } from '@/components/admin/HomepageManager';
import { AdminDataManager, type DataField } from '@/components/admin/AdminDataManager';

const heroFields: DataField[] = [
  { name: 'projectId', label: 'Project ID' }, { name: 'image', label: 'Image URL', required: true },
  { name: 'link', label: 'Liên kết' }, { name: 'visible', label: 'Hiển thị', type: 'checkbox' },
  { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
];

export default function HomepagePage() {
  return <>
    <header className="admin-page-head"><div><p>NỘI DUNG</p><h1>Trang chủ</h1><span>Quản lý thứ tự, trạng thái và nội dung song ngữ của từng section.</span></div><a href="/vi" target="_blank" rel="noreferrer">Xem trang chủ ↗</a></header>
    <HomepageManager />
    <header className="admin-page-head admin-subhead"><div><p>HERO</p><h2>Hero Fan Projects</h2><span>Chỉ quản lý ảnh, liên kết và thứ tự; chuyển động vẫn do code kiểm soát.</span></div></header>
    <AdminDataManager resource="hero-cards" titleField="image" fields={heroFields} sortable />
  </>;
}