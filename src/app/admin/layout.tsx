import localFont from 'next/font/local';
import '../globals.css';
import '../../styles/admin.css';

const lausanne = localFont({ src: [{ path: '../../assets/lausanne-regular.woff2', weight: '400' }, { path: '../../assets/lausanne-light.woff2', weight: '200' }], variable: '--font-lausanne', display: 'swap' });

export const metadata = { title: 'Novra Admin', robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={lausanne.variable}><body className="admin-body">{children}</body></html>;
}
