'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { budgetIds, contactMethodIds, createContactSchema, serviceIds, type ContactFormInput, type ContactFormValues } from '@/lib/contact-schema';
import { site } from '@/data/site';

gsap.registerPlugin(ScrollTrigger);

type Props = { locale: Locale; dictionary: Dictionary; initialService?: string; standalone?: boolean };

export function ContactInquiry({ locale, dictionary, initialService, standalone = false }: Props) {
  const copy = dictionary.contact;
  const sectionRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const validInitialService = serviceIds.includes(initialService as (typeof serviceIds)[number]) ? initialService as (typeof serviceIds)[number] : undefined;
  const schema = createContactSchema(copy.validation);
  const { register, handleSubmit, control, setValue, reset, formState: { errors, isSubmitting } } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', company: '', email: '', services: validInitialService ? [validInitialService] : [], details: '', locale, source: standalone ? 'contact-page' : 'homepage', website: '', startedAt: 0 },
  });
  const selectedServices = useWatch({ control, name: 'services' }) || [];
  const selectedBudget = useWatch({ control, name: 'budget' });

  useEffect(() => {
    setValue('startedAt', Date.now(), { shouldDirty: false });
  }, [setValue]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 72%', once: true } });
      timeline.fromTo('.inquiry-kicker', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 })
        .fromTo('.inquiry-heading-line > span', { yPercent: 110, rotate: 2 }, { yPercent: 0, rotate: 0, duration: .82, stagger: .1, ease: 'power4.out' }, .08)
        .fromTo('.inquiry-copy, .inquiry-benefits li, .inquiry-direct', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, stagger: .07 }, .26)
        .fromTo('.inquiry-panel', { y: 44, scale: .98, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: .8, ease: 'power3.out' }, .18)
        .fromTo('.inquiry-field, .inquiry-group, .inquiry-submit', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .42, stagger: .035 }, .42);
    }, section);
    return () => context.revert();
  }, []);

  const submit = async (values: ContactFormValues) => {
    setStatus('idle');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      if (!response.ok) throw new Error('SUBMIT_FAILED');
      setStatus('success');
      reset({ name: '', phone: '', company: '', email: '', services: validInitialService ? [validInitialService] : [], details: '', locale, source: standalone ? 'contact-page' : 'homepage', website: '', startedAt: values.startedAt });
    } catch { setStatus('error'); }
  };

  const toggleService = (service: (typeof serviceIds)[number]) => {
    const next = selectedServices.includes(service) ? selectedServices.filter((value) => value !== service) : [...selectedServices, service];
    setValue('services', next, { shouldValidate: true, shouldDirty: true });
  };

  return <section ref={sectionRef} className={`contact-inquiry${standalone ? ' is-standalone' : ''}`} id="contact-inquiry" data-dark>
    <div className="shell inquiry-layout">
      <div className="inquiry-intro">
        <p className="ximi-kicker inquiry-kicker">{copy.kicker}</p>
        <h2>{copy.heading.map((line) => <span className="inquiry-heading-line" key={line}><span>{line}</span></span>)}</h2>
        <p className="inquiry-copy">{copy.copy}</p>
        <ul className="inquiry-benefits">{copy.benefits.map((benefit) => <li key={benefit}><span aria-hidden="true">✦</span>{benefit}</li>)}</ul>
        <div className="inquiry-direct"><p><span>{copy.emailLabel}</span><a href={`mailto:${site.email}`}>{site.email}</a></p><p><span>{copy.phoneLabel}</span><a href={site.zalo} target="_blank" rel="noreferrer">{site.phone}</a></p></div>
      </div>
      <form className="inquiry-panel" noValidate onSubmit={handleSubmit(submit)}>
        <h3>{copy.formTitle}</h3>
        <div className="inquiry-field-grid">
          <label className="inquiry-field"><span>{copy.fields.name} *</span><input autoComplete="name" placeholder={copy.placeholders.name} {...register('name')} />{errors.name && <small>{errors.name.message}</small>}</label>
          <label className="inquiry-field"><span>{copy.fields.phone} *</span><input autoComplete="tel" inputMode="tel" placeholder={copy.placeholders.phone} {...register('phone')} />{errors.phone && <small>{errors.phone.message}</small>}</label>
          <label className="inquiry-field"><span>{copy.fields.company}</span><input autoComplete="organization" placeholder={copy.placeholders.company} {...register('company')} />{errors.company && <small>{errors.company.message}</small>}</label>
          <label className="inquiry-field"><span>{copy.fields.email} *</span><input autoComplete="email" inputMode="email" placeholder={copy.placeholders.email} {...register('email')} />{errors.email && <small>{errors.email.message}</small>}</label>
        </div>
        <fieldset className="inquiry-group"><legend>{copy.fields.service} *</legend><div className="inquiry-pills">{serviceIds.map((service) => <button type="button" key={service} className={selectedServices.includes(service) ? 'is-selected' : ''} aria-pressed={selectedServices.includes(service)} onClick={() => toggleService(service)}>{copy.services[service]}</button>)}</div>{errors.services && <small>{errors.services.message}</small>}</fieldset>
        <fieldset className="inquiry-group"><legend>{copy.fields.budget} *</legend><div className="inquiry-pills">{budgetIds.map((budget) => <button type="button" key={budget} className={selectedBudget === budget ? 'is-selected' : ''} aria-pressed={selectedBudget === budget} onClick={() => setValue('budget', budget, { shouldValidate: true, shouldDirty: true })}>{copy.budgets[budget]}</button>)}</div>{errors.budget && <small>{errors.budget.message}</small>}</fieldset>
        <label className="inquiry-field inquiry-details"><span>{copy.fields.details} *</span><textarea rows={5} placeholder={copy.placeholders.details} {...register('details')} />{errors.details && <small>{errors.details.message}</small>}</label>
        <fieldset className="inquiry-group"><legend>{copy.fields.preferredContact}</legend><div className="inquiry-pills">{contactMethodIds.map((method) => <label className="inquiry-radio" key={method}><input type="radio" value={method} {...register('preferredContactMethod')} /><span>{copy.contactMethods[method]}</span></label>)}</div></fieldset>
        <label className="inquiry-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" {...register('website')} /></label>
        <input type="hidden" {...register('locale')} /><input type="hidden" {...register('source')} /><input type="hidden" {...register('startedAt', { valueAsNumber: true })} />
        <button className="inquiry-submit" type="submit" disabled={isSubmitting}><span>{isSubmitting ? copy.submitting : copy.submit}</span><span aria-hidden="true">↗</span></button>
        <p className={`inquiry-status${status !== 'idle' ? ` is-${status}` : ''}`} role="status" aria-live="polite">{status === 'success' ? copy.success : status === 'error' ? copy.error : ''}</p>
      </form>
    </div>
  </section>;
}
