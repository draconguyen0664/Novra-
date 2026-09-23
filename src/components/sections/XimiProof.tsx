import Image from 'next/image';
import { featuredProjects } from '@/data/portfolio';
import type { Dictionary } from '@/i18n/dictionaries';

export function XimiProof({ dictionary }: { dictionary: Dictionary }) {
  const copy = dictionary.proof;
  return <section className="ximi-proof" id="proof" data-dark><div className="shell"><header className="ximi-proof-heading"><p className="ximi-kicker">{copy.kicker}</p><h2>{copy.heading.map((line) => <span key={line}><span>{line}</span></span>)}</h2><p>{copy.copy}</p></header><div className="ximi-proof-reel">{featuredProjects.map((project, index) => <a className="ximi-proof-card" href={project.href} target="_blank" rel="noreferrer" key={project.name}><figure><Image src={project.image} alt={`${copy.imageAlt} ${project.name}`} fill sizes="(max-width:809px) 78vw, 32vw" /></figure><div><span>{String(index + 1).padStart(2, '0')}</span><h3>{project.name}</h3><i aria-hidden="true">↗</i></div></a>)}</div><div className="ximi-proof-metrics">{copy.metrics.map(([value, label]) => <p key={label}><strong>{value}</strong><span>{label}</span></p>)}</div></div></section>;
}
