export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const routeKeys = ['home', 'services', 'projects', 'pricing', 'blog', 'contact'] as const;
export type RouteKey = (typeof routeKeys)[number];

export const localizedRoutes: Record<Locale, Record<RouteKey, string>> = {
  vi: {
    home: '',
    services: 'dich-vu',
    projects: 'du-an',
    pricing: 'bang-gia',
    blog: 'blog',
    contact: 'lien-he',
  },
  en: {
    home: '',
    services: 'services',
    projects: 'projects',
    pricing: 'pricing',
    blog: 'blog',
    contact: 'contact',
  },
};

export function localePath(locale: Locale, route: RouteKey, suffix = '') {
  const segment = localizedRoutes[locale][route];
  return `/${locale}${segment ? `/${segment}` : ''}${suffix}`;
}

export function routeFromSegment(locale: Locale, segment?: string): RouteKey | null {
  const entry = Object.entries(localizedRoutes[locale]).find(([, value]) => value === (segment ?? ''));
  return (entry?.[0] as RouteKey | undefined) ?? null;
}

export function switchLocalePath(pathname: string, target: Locale) {
  const segments = pathname.split('/').filter(Boolean);
  const current = isLocale(segments[0] ?? '') ? segments[0] as Locale : defaultLocale;
  const route = routeFromSegment(current, segments[1]);
  if (!route) return localePath(target, 'home');
  const tail = segments.length > 2 ? `/${segments.slice(2).join('/')}` : '';
  return localePath(target, route, tail);
}
