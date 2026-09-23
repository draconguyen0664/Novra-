import Link from 'next/link';
import { site } from '@/data/site';

const columns = [
  ['SERVIÇOS', ['Sites em Framer', 'Landing Page', 'Desenvolvimento de SaaS', 'Aplicativos', 'MVP', 'Design de Interfaces', 'Design System', 'Consultoria de Design']],
  ['CASES', ['Tera', 'Visor', 'Treeunfe', 'Stric', 'Milhas Pix', 'Ver todos os cases']],
  ['REDES SOCIAIS', ['Instagram', 'Behance', 'Dribbble', 'Linkedin', 'WhatsApp', `E-mail (${site.email})`]],
] as const;

export function Footer() {
  return (
    <footer className="site-footer" data-dark>
      <div className="shell footer-columns">
        {columns.map(([title, links]) => <div key={title}><p className="eyebrow">{title}</p>{links.map((label) => <a href={label.startsWith('E-mail') ? `mailto:${site.email}` : site.reference} key={label}>{label}</a>)}</div>)}
      </div>
      <div className="shell footer-meta"><p>Campinas - SP<br />Av. Imperatriz D. Teresa Cristina.<br />CNPJ 39.355.398/0001-14</p><p>© Novra 2026</p></div>
      <Link className="footer-wordmark" href="#hero" aria-label="Voltar ao topo">novra*</Link>
    </footer>
  );
}
