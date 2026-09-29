import type { PublicHeroCard, PublicSection } from '@/lib/cms-public';
import type { Dictionary } from '@/i18n/dictionaries';
import { HeroProjectFan } from './HeroProjectFan';

export function Hero({ dictionary, config, cards }: { dictionary: Dictionary; config?: PublicSection; cards?: PublicHeroCard[] }) {
  return <section id="hero" className="hero" hidden={config?.enabled === false} style={{ order: config?.sortOrder }}><div className="shell hero-copy"><h1>{dictionary.hero.title}</h1><p>{dictionary.hero.copy}</p></div><HeroProjectFan label={dictionary.hero.fanLabel} cardLabel={dictionary.hero.cardLabel} cards={cards} /></section>;
}