import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLocale, localePath } from '@/i18n/config';

const legacyRoutes: Record<string, string> = { '/services': localePath('en', 'services'), '/projects': localePath('en', 'projects'), '/pricing': localePath('en', 'pricing'), '/contact': localePath('en', 'contact'), '/dich-vu': localePath('vi', 'services'), '/du-an': localePath('vi', 'projects'), '/bang-gia': localePath('vi', 'pricing'), '/lien-he': localePath('vi', 'contact'), '/blog': localePath(defaultLocale, 'blog') };

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/_next') || pathname === '/robots.txt' || pathname === '/sitemap.xml' || /\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
  const first = pathname.split('/').filter(Boolean)[0];
  if (first && isLocale(first)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = legacyRoutes[pathname] || localePath(defaultLocale, 'home');
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };
