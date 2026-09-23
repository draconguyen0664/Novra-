import 'server-only';
import type { Locale } from './config';

const dictionaries = {
  vi: () => import('./vi').then((module) => module.vi),
  en: () => import('./en').then((module) => module.en),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}
