import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioProjects, type PortfolioTag } from '@/data/portfolio';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export function Projects({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.legacyProjects;
  return <section id="cases" className="section projects"><div className="shell"><SectionHeading label={copy.kicker}>{copy.heading[0]}<br />{copy.heading[1]}</SectionHeading><div className="project-grid">{portfolioProjects.map((project, index) => <article className={`project-card ${index % 3 === 2 ? 'project-wide' : ''}`} key={project.title}><a href={`${localePath(locale, 'projects')}#${project.title.toLowerCase().replace(/\s+/g, '-')}`} aria-label={`${copy.projectAria} ${project.title}`}><div className="project-media">{project.image && <Image src={project.image} alt={`${project.title} — Novra`} fill sizes={index % 3 === 2 ? '90vw' : '(max-width:809px) 90vw, 45vw'} />}{project.video && <video data-preview muted loop playsInline preload="none" poster={project.image || `/media/project-poster-${index}.webp`} aria-label={`${copy.previewAria} ${project.title}`}><source data-src={project.video} /></video>}<span className="project-arrow" aria-hidden="true">↗</span></div><div className="project-description"><ul className="project-tags flex flex-wrap">{project.tags.map((tag) => <li key={tag}>{copy.tags[tag as PortfolioTag]}</li>)}</ul><h3>{project.title}</h3></div></a></article>)}</div></div></section>;
}
