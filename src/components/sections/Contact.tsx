'use client';

import { FormEvent, useState } from 'react';
import { site } from '@/data/site';

const services = ['Site', 'Landing Page', 'Sistema', 'Consultoria', 'Aplicativo', 'Blog', 'SaaS', 'Fee Mensal', 'Contratação de Horas', 'Design System', 'Telas avulsas'];
const budgets = ['Menos de 10 mil', 'R$10 mil a R$50 mil', 'Acima de 50 mil'];

export function Contact() {
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState('');

  const toggle = (value: string) => setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Novo projeto — ${String(form.get('empresa') || form.get('nome'))}`);
    const body = encodeURIComponent([
      `Nome: ${form.get('nome')}`,
      `Telefone: ${form.get('telefone')}`,
      `Empresa: ${form.get('empresa')}`,
      `E-mail: ${form.get('email')}`,
      `Serviços: ${selected.join(', ')}`,
      `Orçamento: ${budget}`,
      '',
      String(form.get('detalhes') || ''),
    ].join('\n'));
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="contact-section" id="contato" data-dark>
      <div className="shell contact-layout">
        <div className="contact-intro">
          <p className="eyebrow">FALE CONOSCO</p>
          <h2>Seu próximo projeto começa aqui</h2>
          <p>Entendemos seu momento, seus objetivos e mostramos como design e código podem transformar sua ideia em um produto digital de alto nível.</p>
          <ul><li>Entendimento do projeto, objetivos e necessidades;</li><li>Próximos passos claros para tirar o projeto do papel.</li></ul>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a className="button button-light" href="https://wa.me/5519988763916?text=Ol%C3%A1%2C+vim+pelo+site+da+Novra+e+gostaria+de+um+or%C3%A7amento%21">Atendimento WhatsApp</a>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <h3>Conte para nós o que você quer construir.</h3>
          <label>Nome<input name="nome" placeholder="Seu nome..." required /></label>
          <label>Telefone<input name="telefone" inputMode="tel" placeholder="(12) 12345-1234" required /></label>
          <label>Empresa<input name="empresa" placeholder="Sua empresa..." required /></label>
          <label>E-mail<input name="email" type="email" placeholder="Seu e-mail..." required /></label>
          <fieldset><legend>Qual serviço você busca na Novra?*</legend><div className="choice-list">{services.map((value) => <button key={value} type="button" aria-pressed={selected.includes(value)} onClick={() => toggle(value)}>{value}</button>)}</div></fieldset>
          <fieldset><legend>Você já tem algum orçamento em mente?</legend><div className="choice-list">{budgets.map((value) => <button key={value} type="button" aria-pressed={budget === value} onClick={() => setBudget(value)}>{value}</button>)}</div></fieldset>
          <label>Detalhes do projeto<textarea name="detalhes" rows={4} required /></label>
          <button className="submit-button" type="submit">Enviar <span aria-hidden="true">↗</span></button>
        </form>
      </div>
    </section>
  );
}
