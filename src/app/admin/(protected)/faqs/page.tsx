import { AdminResourceManager, type AdminField } from '@/components/admin/AdminResourceManager';
const fields: AdminField[] = [
  { name: 'questionVi', label: 'Vietnamese question', required: true }, { name: 'questionEn', label: 'English question', required: true }, { name: 'answerVi', label: 'Vietnamese answer', type: 'textarea', required: true }, { name: 'answerEn', label: 'English answer', type: 'textarea', required: true }, { name: 'sortOrder', label: 'Sort order', type: 'number' }, { name: 'published', label: 'Published', type: 'checkbox' },
];
export default function Page() { return <><header className="admin-page-head"><p>CMS</p><h1>FAQs</h1></header><AdminResourceManager resource="faqs" titleField="questionEn" fields={fields} /></>; }
