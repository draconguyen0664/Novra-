import { AdminDataManager, type DataField } from '@/components/admin/AdminDataManager';
const fields: DataField[] = [
  { name: 'name', label: 'Họ tên', required: true }, { name: 'email', label: 'Email', required: true },
  { name: 'password', label: 'Mật khẩu (tối thiểu 12 ký tự)', type: 'password' },
  { name: 'role', label: 'Vai trò', type: 'select', options: ['SUPER_ADMIN', 'EDITOR', 'MARKETING', 'ADMIN'], required: true },
  { name: 'active', label: 'Đang hoạt động', type: 'checkbox' },
];
export default function Page() { return <><header className="admin-page-head"><div><p>HỆ THỐNG</p><h1>Người dùng</h1><span>Phân quyền được kiểm tra tại cả giao diện và API.</span></div></header><AdminDataManager resource="users" titleField="name" fields={fields} /></>; }