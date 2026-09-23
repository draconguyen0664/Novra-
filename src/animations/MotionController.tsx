'use client';

import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function MotionController() {
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header');
    const sections = gsap.utils.toArray<HTMLElement>('main > section, body > footer');

    const syncHeader = () => {
      const active = sections.filter((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 40 && rect.bottom > 40;
      }).at(-1);
      const experience = document.querySelector<HTMLElement>('.experience');
      const experienceRect = experience?.getBoundingClientRect();

      header?.classList.toggle('is-dark', Boolean(active?.hasAttribute('data-dark')));
      header?.classList.toggle(
        'is-hidden',
        Boolean(experienceRect && experienceRect.top <= 1 && experienceRect.bottom >= innerHeight - 1),
      );
    };

    const videos = gsap.utils.toArray<HTMLVideoElement>('video[data-preview]');
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          const source = video.querySelector<HTMLSourceElement>('source');
          if (source?.dataset.src && !source.src) {
            source.src = source.dataset.src;
            video.load();
          }
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      });
    }, { rootMargin: '180px 0px' });
    videos.forEach((video) => videoObserver.observe(video));

    window.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('resize', syncHeader, { passive: true });
    syncHeader();

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const lenis = new Lenis({
          smoothWheel: true,
          syncTouch: false,
          duration: 1.08,
          anchors: { offset: -80 },
        });
        const onLenisScroll = () => {
          ScrollTrigger.update();
          syncHeader();
        };
        const tick = (time: number) => lenis.raf(time * 1000);
        lenis.on('scroll', onLenisScroll);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const load = gsap.timeline({ defaults: { ease: 'power3.out' } });
        load
          .fromTo('.site-header', { yPercent: -110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.72, clearProps: 'transform,opacity,visibility' }, 0.05)
          .fromTo('.hero h1', { y: 54, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' }, { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.05 }, 0.12)
          .fromTo('.hero-copy > p', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.72 }, 0.38)
          .fromTo('.hero-visual', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55 }, 0.26);


        gsap.utils.toArray<HTMLElement>('.section-heading').forEach((heading, index) => {
          const label = heading.querySelector('.eyebrow');
          const title = heading.querySelector('h2');
          const start = index % 2 === 0 ? 'top 76%' : 'top 70%';
          if (label) gsap.fromTo(label, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.58, ease: 'power2.out', scrollTrigger: { trigger: heading, start, once: true } });
          if (title) gsap.fromTo(title, { y: 48, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' }, { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: heading, start, once: true } });
        });

        gsap.fromTo('.client-logo', { y: 42, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.66,
          stagger: { each: 0.055, grid: 'auto', from: 'start' },
          ease: 'power3.out',
          scrollTrigger: { trigger: '.client-grid', start: 'top 78%', once: true },
        });

        gsap.utils.toArray<HTMLElement>('.project-card').forEach((card, index) => {
          gsap.fromTo(card, { y: index % 3 === 2 ? 80 : 58, scale: 0.92, autoAlpha: 0 }, {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.92,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: index % 3 === 2 ? 'top 82%' : 'top 88%', once: true },
          });
          const description = card.querySelector('.project-description');
          if (description) gsap.fromTo(description, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, delay: 0.18, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 86%', once: true } });
        });


        gsap.utils.toArray<HTMLElement>('.service-row').forEach((row, index) => {
          gsap.fromTo(row.querySelectorAll('.service'), { y: 70, autoAlpha: 0, clipPath: 'inset(0 0 12% 0)' }, {
            y: 0,
            autoAlpha: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.9,
            stagger: 0.11,
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: index === 0 ? 'top 80%' : 'top 74%', once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>('.stat-card').forEach((card, index) => {
          gsap.fromTo(card, { y: 56, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.76,
            delay: index * 0.09,
            ease: 'power3.out',
            scrollTrigger: { trigger: card.closest('.stat-track') || card, start: 'top 82%', once: true },
          });
        });
        const testimonialImageFrom = innerWidth >= 810 ? { xPercent: -7, autoAlpha: 0, clipPath: 'inset(0 12% 0 0)' } : { y: 42, autoAlpha: 0, clipPath: 'inset(10% 0 0 0)' };
        const testimonialCardFrom = innerWidth >= 810 ? { xPercent: 7, autoAlpha: 0 } : { y: 42, autoAlpha: 0 };
        gsap.fromTo('.testimonial-image', testimonialImageFrom, { xPercent: 0, y: 0, autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: '.testimonial', start: 'top 78%', once: true } });
        gsap.fromTo('.testimonial-card', testimonialCardFrom, { xPercent: 0, y: 0, autoAlpha: 1, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: '.testimonial', start: 'top 78%', once: true } });

        gsap.fromTo('.faq-item', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.58, stagger: 0.055, ease: 'power2.out', scrollTrigger: { trigger: '.faq-list', start: 'top 80%', once: true } });
        gsap.fromTo('.faq-aside > *', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.faq-aside', start: 'top 78%', once: true } });
        gsap.fromTo('.blog-card', { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.76, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.blog-grid', start: 'top 82%', once: true } });

        gsap.fromTo('.contact-intro > *', { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.68, stagger: 0.075, ease: 'power3.out', scrollTrigger: { trigger: '.contact-layout', start: 'top 76%', once: true } });
        gsap.fromTo('.contact-form', { y: 64, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.92, ease: 'power3.out', scrollTrigger: { trigger: '.contact-layout', start: 'top 76%', once: true } });
        gsap.fromTo('.contact-form > *', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.045, ease: 'power2.out', scrollTrigger: { trigger: '.contact-form', start: 'top 72%', once: true } });
        gsap.fromTo('.footer-columns > div, .footer-meta > *', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.66, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.site-footer', start: 'top 80%', once: true } });
        gsap.fromTo('.footer-wordmark', { yPercent: 22, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top 65%', end: 'bottom bottom', scrub: 0.45 } });

        const refresh = gsap.delayedCall(0.2, () => ScrollTrigger.refresh());
        document.fonts.ready.then(() => ScrollTrigger.refresh());

        return () => {
          refresh.kill();
          lenis.off('scroll', onLenisScroll);
          gsap.ticker.remove(tick);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
        };
      });


      return () => media.revert();
    }, document.body);

    return () => {
      videoObserver.disconnect();
      videos.forEach((video) => video.pause());
      window.removeEventListener('scroll', syncHeader);
      window.removeEventListener('resize', syncHeader);
      context.revert();
    };
  }, []);

  return null;
}