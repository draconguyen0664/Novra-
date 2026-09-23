'use client';

import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function XimiMotion() {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({
        motion: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 1200px)',
        mobile: '(max-width: 809px)',
        finePointer: '(hover: hover) and (pointer: fine)',
      }, (mediaContext) => {
        const conditions = mediaContext.conditions as {
          motion: boolean;
          desktop: boolean;
          mobile: boolean;
          finePointer: boolean;
        };
        if (!conditions.motion) return;

        gsap.utils.toArray<HTMLElement>('.ximi-heading').forEach((heading) => {
          const label = heading.querySelector('.ximi-kicker');
          const lines = heading.querySelectorAll('.ximi-heading-line > span');
          const copy = heading.querySelector('.ximi-heading-copy');
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: heading, start: 'top 78%', once: true },
          });
          if (label) timeline.fromTo(label, { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' });
          timeline.fromTo(lines, { yPercent: 110, rotation: 1.5 }, { yPercent: 0, rotation: 0, duration: 0.92, stagger: 0.09, ease: 'power4.out' }, 0.08);
          if (copy) timeline.fromTo(copy, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62, ease: 'power3.out' }, 0.32);
        });

        const proofTimeline = gsap.timeline({ scrollTrigger: { trigger: '.ximi-proof', start: 'top 72%', once: true } });
        proofTimeline
          .fromTo('.ximi-proof-heading .ximi-kicker', { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
          .fromTo('.ximi-proof-heading h2 > span > span', { yPercent: 110, rotation: 1.5 }, { yPercent: 0, rotation: 0, duration: 0.95, stagger: 0.1, ease: 'power4.out' }, 0.08)
          .fromTo('.ximi-proof-heading > p:last-child', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62, ease: 'power3.out' }, 0.32)
          .fromTo('.ximi-proof-card', { clipPath: 'inset(12% 0 12% 0)', autoAlpha: 0 }, { clipPath: 'inset(0% 0 0% 0)', autoAlpha: 1, duration: 0.82, stagger: 0.09, ease: 'power3.out' }, 0.38)
          .fromTo('.ximi-proof-metrics p', { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.54, stagger: 0.08, ease: 'power2.out' }, 0.62);
        gsap.utils.toArray<HTMLElement>('.ximi-proof-card img').forEach((image) => {
          gsap.fromTo(image, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: image.closest('.ximi-proof-card'), start: 'top bottom', end: 'bottom top', scrub: 0.65 } });
        });
        const aiTimeline = gsap.timeline({ scrollTrigger: { trigger: '.ximi-ai-interface', start: 'top 82%', once: true } });
        aiTimeline
          .fromTo('.ximi-chat-bubble', { y: 36, scale: 0.94, rotation: -1.5, autoAlpha: 0 }, { y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.72, stagger: 0.14, ease: 'power3.out' })
          .fromTo('.ximi-ai-panel', { y: 70, clipPath: 'inset(16% 0 0 0)', autoAlpha: 0 }, { y: 0, clipPath: 'inset(0% 0 0 0)', autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, 0.16)
          .fromTo('.ximi-suggestions button', { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.42, stagger: 0.065, ease: 'power2.out' }, 0.58);
        gsap.to('.ximi-chat-user', { y: -7, rotation: 0.4, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.ximi-chat-ai', { y: 6, rotation: -0.35, duration: 3.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });

        gsap.fromTo('.ximi-service-row', { clipPath: 'inset(0 0 100% 0)', xPercent: -2 }, {
          clipPath: 'inset(0 0 0% 0)', xPercent: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.ximi-service-list', start: 'top 80%', once: true },
        });
        gsap.utils.toArray<HTMLElement>('.ximi-service-row').forEach((row, index) => {
          gsap.to(row, { x: conditions.mobile ? 0 : index % 2 ? 16 : -10, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });

        gsap.utils.toArray<HTMLElement>('.ximi-project').forEach((project) => {
          const mediaElement = project.querySelector('.ximi-project-media');
          const image = project.querySelector('img');
          const copy = project.querySelector('.ximi-project-copy');
          if (mediaElement) gsap.fromTo(mediaElement, { clipPath: 'inset(8% 0 8% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: project, start: 'top 78%', once: true } });
          if (image) gsap.fromTo(image, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
          if (copy) gsap.fromTo(copy, { y: 54 }, { y: -12, ease: 'none', scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });

        const screenLayers = gsap.utils.toArray<HTMLElement>('.ximi-screen-layer');
        gsap.fromTo(screenLayers, { y: 110, rotationX: 13, rotationZ: (index) => (index - 1) * 4, scale: 0.9, autoAlpha: 0 }, {
          y: 0, rotationX: 0, rotationZ: 0, scale: 1, autoAlpha: 1, duration: 1.05, stagger: 0.12, ease: 'power4.out',
          scrollTrigger: { trigger: '.ximi-screen-stack', start: 'top 82%', once: true },
        });
        screenLayers.forEach((layer, index) => {
          gsap.to(layer, { y: (index - 1) * 28, x: (index - 1) * 16, ease: 'none', scrollTrigger: { trigger: '.ximi-benefits', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        });
        gsap.fromTo('.ximi-benefit-grid article', { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.72, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.ximi-benefit-grid', start: 'top 82%', once: true } });

        let cleanupPointerTilt: (() => void) | undefined;
        if (conditions.desktop && conditions.finePointer) {
          const stack = document.querySelector<HTMLElement>('.ximi-screen-stack');
          if (stack) {
            gsap.set(stack, { transformPerspective: 1000, transformOrigin: '50% 50%' });
            const tiltX = gsap.quickTo(stack, 'rotationX', { duration: 0.7, ease: 'power3.out' });
            const tiltY = gsap.quickTo(stack, 'rotationY', { duration: 0.7, ease: 'power3.out' });
            const move = (event: PointerEvent) => {
              const rect = stack.getBoundingClientRect();
              tiltX(-((event.clientY - rect.top) / rect.height - 0.5) * 5);
              tiltY(((event.clientX - rect.left) / rect.width - 0.5) * 6);
            };
            const leave = () => { tiltX(0); tiltY(0); };
            stack.addEventListener('pointermove', move);
            stack.addEventListener('pointerleave', leave);
            cleanupPointerTilt = () => { stack.removeEventListener('pointermove', move); stack.removeEventListener('pointerleave', leave); };
          }
        }

        const panels = gsap.utils.toArray<HTMLElement>('.ximi-price-panel');
        const recommended = panels.find((panel) => panel.classList.contains('is-recommended'));
        const panelOrder = [...panels.filter((panel) => panel !== recommended), ...(recommended ? [recommended] : [])];
        gsap.fromTo(panelOrder, { y: (index) => 50 + index * 16, scale: (index) => index === panelOrder.length - 1 ? 0.96 : 1, autoAlpha: 0 }, {
          y: 0, scale: 1, autoAlpha: 1, duration: 0.82, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.ximi-pricing-grid', start: 'top 82%', once: true },
        });

        gsap.fromTo('.ximi-capability', { xPercent: 8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.ximi-capability-list', start: 'top 80%', once: true } });

        const processSteps = gsap.utils.toArray<HTMLElement>('.ximi-process-step');
        const processTimeline = gsap.timeline({
          scrollTrigger: { trigger: '.ximi-process-track', start: 'top 72%', end: 'bottom 35%', scrub: 0.55 },
        });
        processTimeline.fromTo('.ximi-process-line span', conditions.mobile ? { scaleY: 0 } : { scaleX: 0 }, conditions.mobile ? { scaleY: 1, ease: 'none' } : { scaleX: 1, ease: 'none' }, 0);
        processSteps.forEach((step, index) => processTimeline.fromTo(step, { opacity: 0.28 }, { opacity: 1, duration: 0.2, ease: 'none' }, index * 0.24));

        gsap.fromTo('.ximi-faq-item', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.72, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.ximi-faq-list', start: 'top 82%', once: true } });
        gsap.fromTo('.ximi-trust-grid > *', { scale: 0.94, clipPath: 'inset(0 0 18% 0)', autoAlpha: 0 }, { scale: 1, clipPath: 'inset(0 0 0% 0)', autoAlpha: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.ximi-trust-grid', start: 'top 80%', once: true } });

        const finalTimeline = gsap.timeline({ scrollTrigger: { trigger: '.ximi-final-cta', start: 'top 72%', once: true } });
        finalTimeline
          .fromTo('.ximi-final-cta .ximi-kicker', { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 })
          .fromTo('.ximi-cta-line > span', { yPercent: 110, rotation: 1.5 }, { yPercent: 0, rotation: 0, duration: 1, stagger: 0.1, ease: 'power4.out' }, 0.08)
          .fromTo('.ximi-final-cta > .shell > p:not(.ximi-kicker)', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62 }, 0.4)
          .fromTo('.ximi-cta-actions > *', { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.58, stagger: 0.09 }, 0.55);

        return cleanupPointerTilt;
      });
    }, document.body);

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return null;
}
