import { HeroProjectFan } from './HeroProjectFan';

export function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="shell hero-copy">
        <h1>Design e desenvolvimento de produtos digitais</h1>
        <p>Uma nova geração de sites, sistemas e aplicativos construídos com design de excelência, valor e sempre superando as expectativas</p>
      </div>
      <HeroProjectFan />
    </section>
  );
}