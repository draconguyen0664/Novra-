import { AdminResourceManager, type AdminField } from '@/components/admin/AdminResourceManager';
const fields: AdminField[] = [
  { name: 'questionVi', label: 'Câu hỏi tiếng Việt', required: true }, { name: 'questionEn', label: 'English question', required: true },
  { name: 'answerVi', label: 'Trả lời tiếng Việt', type: 'textarea', required: true }, { name: 'answerEn', label: 'English answer', type: 'textarea', required: true },
  { name: 'sortOrder', label: 'Thứ tự', type: 'number' }, { name: 'published', label: 'Đã xuất bản', type: 'checkbox' },
];
export default function Page() { return <><header className="admin-page-head"><div><p>NỘI DUNG</p><h1>FAQ</h1><span>Câu hỏi thường gặp song ngữ.</span></div></header><AdminResourceManager resource="faqs" titleField="questionVi" fields={fields} /></>; }