import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { site } from '@/data/site';
import { MotionController } from '@/animations/MotionController';
import './globals.css';
const lausanne = localFont({ src: [{path:'../assets/lausanne-regular.woff2',weight:'400',style:'normal'},{path:'../assets/lausanne-light.woff2',weight:'200',style:'normal'}], variable:'--font-lausanne', display:'swap', fallback:['Arial'],adjustFontFallback:'Arial' });
export const metadata: Metadata = { metadataBase:new URL(site.url), title:{default:site.title,template:'%s | Novra'}, description:site.description,alternates:{canonical:'/'},openGraph:{title:site.title,description:site.description,url:'/',siteName:site.name,locale:'vi_VN',type:'website',images:[{url:'/opengraph-image.jpg',width:1200,height:630,alt:'Novra — Thiết kế website và sản phẩm số'}]},twitter:{card:'summary_large_image',title:site.title,description:site.description,images:['/opengraph-image.jpg']},robots:{index:true,follow:true},icons:{icon:'/icon.svg'} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="vi" className={lausanne.variable}><body><a href="#main" className="skip-link">Pular para o conteúdo</a>{children}<MotionController /></body></html>; }
