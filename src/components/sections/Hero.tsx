import type { Dictionary } from '@/i18n/dictionaries';
import { HeroProjectFan } from './HeroProjectFan';

export function Hero({ dictionary }: { dictionary: Dictionary }) {
  return <section id="hero" className="hero"><div className="shell hero-copy"><h1>{dictionary.hero.title}</h1><p>{dictionary.hero.copy}</p></div><HeroProjectFan label={dictionary.hero.fanLabel} cardLabel={dictionary.hero.cardLabel} /></section>;
}
