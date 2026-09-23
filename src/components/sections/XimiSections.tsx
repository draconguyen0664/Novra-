import Image from 'next/image';
import { featuredProjects } from '@/data/portfolio';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { AiPrompt, CapabilitiesAccordion, XimiFaqAccordion } from './XimiInteractive';
import { ContactInquiry } from './ContactInquiry';
import { XimiMotion } from './XimiMotion';

function EditorialHeading({ label, lines, copy }: { label: string; lines: readonly string[]; copy?: string }) {
  return <header className="ximi-heading"><p className="ximi-kicker">{label}</p><h2>{lines.map((line) => <span className="ximi-heading-line" key={line}><span>{line}</span></span>)}</h2>{copy && <p className="ximi-heading-copy">{copy}</p>}</header>;
}

export function XimiSections({ locale, dictionary, initialService }: { locale: Locale; dictionary: Dictionary; initialService?: string }) {
  return <>
    <section className="ximi-section ximi-ai" id="ai-consultation"><div className="shell"><EditorialHeading label={dictionary.aiConsultation.kicker} lines={dictionary.aiConsultation.heading} copy={dictionary.aiConsultation.copy} /><AiPrompt locale={locale} copy={dictionary.aiConsultation} /></div></section>

    <section className="ximi-section ximi-services" id="services"><div className="shell"><EditorialHeading label={dictionary.services.kicker} lines={dictionary.services.heading} copy={dictionary.services.copy} /><div className="ximi-service-list">{dictionary.services.items.map((service, index) => <article className="ximi-service-row" key={service.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{service.title}</h3><p>{service.description}</p><i aria-hidden="true">↗</i></article>)}</div></div></section>

    <section className="ximi-section ximi-projects" id="selected-projects"><div className="shell"><EditorialHeading label={dictionary.selectedProjects.kicker} lines={dictionary.selectedProjects.heading} /><div className="ximi-project-list">{featuredProjects.map((project, index) => { const copy = dictionary.selectedProjects.items[index]; return <article className={`ximi-project${index % 2 ? ' is-reverse' : ''}`} key={project.name}><a className="ximi-project-media" href={project.href} target="_blank" rel="noreferrer"><Image src={project.image} alt={`${dictionary.selectedProjects.imageAlt} ${project.name}`} fill sizes="(max-width:809px) 90vw, 58vw" /></a><div className="ximi-project-copy"><p>{copy.category}</p><h3><a href={project.href} target="_blank" rel="noreferrer">{project.name}<span aria-hidden="true">↗</span></a></h3><p>{copy.description}</p></div></article>; })}</div></div></section>

    <section className="ximi-section ximi-benefits" id="why-novra" data-dark><div className="shell"><div className="ximi-benefit-top"><EditorialHeading label={dictionary.benefits.kicker} lines={dictionary.benefits.heading} copy={dictionary.benefits.copy} /><div className="ximi-screen-stack" aria-label={dictionary.benefits.screenLabel}>{featuredProjects.slice(0, 3).map((project) => <figure className="ximi-screen-layer" key={project.name}><Image src={project.image} alt="" fill sizes="(max-width:809px) 80vw, 42vw" /></figure>)}</div></div><div className="ximi-benefit-grid">{dictionary.benefits.items.map(([title, description], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

    <section className="ximi-section ximi-pricing" id="pricing"><div className="shell"><EditorialHeading label={dictionary.pricing.kicker} lines={dictionary.pricing.heading} copy={dictionary.pricing.copy} /><div className="ximi-pricing-grid">{dictionary.pricing.plans.map((plan, index) => <article className={`ximi-price-panel${'recommended' in plan && plan.recommended ? ' is-recommended' : ''}`} key={plan.key}><div className="ximi-plan-top"><span>{String(index + 1).padStart(2, '0')}</span><small>{plan.label}</small></div><h3>{plan.name}</h3><div className="ximi-plan-price">{'originalPrice' in plan && plan.originalPrice && <del>{plan.originalPrice}</del>}<strong>{plan.price}</strong><span>{dictionary.pricing.startingAt}</span></div><dl><div><dt>{dictionary.pricing.duration}</dt><dd>{plan.time}</dd></div><div><dt>{dictionary.pricing.bestFor}</dt><dd>{plan.bestFor}</dd></div></dl><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><a href={`${localePath(locale, 'contact')}?service=${plan.key}`}>{plan.cta}<span aria-hidden="true">↗</span></a></article>)}</div></div></section>

    <section className="ximi-section ximi-capabilities" id="kho-giao-dien"><div className="shell ximi-capability-layout"><EditorialHeading label={dictionary.capabilities.kicker} lines={dictionary.capabilities.heading} /><CapabilitiesAccordion groups={dictionary.capabilities.groups} /></div></section>

    <section className="ximi-section ximi-process" id="process" data-dark><div className="shell"><EditorialHeading label={dictionary.process.kicker} lines={dictionary.process.heading} copy={dictionary.process.copy} /><div className="ximi-process-track"><div className="ximi-process-line" aria-hidden="true"><span /></div>{dictionary.process.steps.map(([number, title, description]) => <article className="ximi-process-step" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

    <section className="ximi-section ximi-faq" id="faq"><div className="shell ximi-faq-layout"><EditorialHeading label={dictionary.faq.kicker} lines={dictionary.faq.heading} /><XimiFaqAccordion items={dictionary.faq.items} /></div></section>

    <section className="ximi-section ximi-trust" id="about-novra"><div className="shell"><EditorialHeading label={dictionary.about.kicker} lines={dictionary.about.heading} copy={dictionary.about.copy} /><div className="ximi-trust-grid"><article><strong>150+</strong><span>{dictionary.about.projectMetric}</span></article><article><strong>5</strong><span>{dictionary.about.warrantyMetric}</span></article><div>{dictionary.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div></div></section>

    <ContactInquiry locale={locale} dictionary={dictionary} initialService={initialService} />

    <section className="ximi-section ximi-final-cta" id="start-project" data-dark><div className="shell"><p className="ximi-kicker">{dictionary.finalCta.kicker}</p><h2>{dictionary.finalCta.heading.map((line) => <span className="ximi-cta-line" key={line}><span>{line}</span></span>)}</h2><p>{dictionary.finalCta.copy}</p><div className="ximi-cta-actions"><a className="ximi-primary-cta" href={localePath(locale, 'contact')}>{dictionary.finalCta.button}<span aria-hidden="true">↗</span></a><a className="ximi-phone" href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE || '+84888889805'}`}>088 888 9805</a></div></div></section>
    <XimiMotion />
  </>;
}
