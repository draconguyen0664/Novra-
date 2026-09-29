import { AdminDataManager, type DataField } from '@/components/admin/AdminDataManager';
const fields: DataField[] = [
  { name: 'labelVi', label: 'Nhãn tiếng Việt', required: true }, { name: 'labelEn', label: 'English label', required: true },
  { name: 'urlVi', label: 'URL tiếng Việt', required: true }, { name: 'urlEn', label: 'English URL', required: true },
  { name: 'visible', label: 'Hiển thị', type: 'checkbox' }, { name: 'openInNewTab', label: 'Mở tab mới', type: 'checkbox' },
  { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
];
export default function Page() { return <><header className="admin-page-head"><div><p>WEBSITE</p><h1>Menu</h1><span>Kéo thả để sắp xếp menu header.</span></div></header><AdminDataManager resource="navigation" titleField="labelVi" fields={fields} sortable /></>; }