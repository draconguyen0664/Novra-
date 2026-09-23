'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroCards } from '@/data/portfolio';

gsap.registerPlugin(ScrollTrigger);

const cardAngles = heroCards.map((_, index) => -52.75 + index * 12.5);
const maxAngle = Math.max(...cardAngles.map(Math.abs));

const getInitialCardState = (angle: number) => {
  const depth = Math.abs(angle) / maxAngle;
  return {
    x: -(angle / maxAngle) * 38,
    y: 54 + depth * 56,
    rotation: angle * 0.12,
    scale: 0.95 - depth * 0.05,
  };
};

export function HeroProjectFan({ label, cardLabel }: { label: string; cardLabel: string }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const parallaxRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    const cards = cardRefs.current.filter((card): card is HTMLDivElement => Boolean(card));
    const parallaxLayers = parallaxRefs.current.filter((layer): layer is HTMLDivElement => Boolean(layer));
    const pointerLayers = pointerRefs.current.filter((layer): layer is HTMLDivElement => Boolean(layer));
    const hero = visual.closest<HTMLElement>('.hero');
    const media = gsap.matchMedia();

    const context = gsap.context(() => {
      media.add({
        finePointer: '(hover: hover) and (pointer: fine)',
        desktop: '(min-width: 1200px)',
        mobile: '(max-width: 809px)',
      }, (mediaContext) => {
        const conditions = mediaContext.conditions as {
          finePointer: boolean;
          desktop: boolean;
          mobile: boolean;
        };

        gsap.set([...parallaxLayers, ...pointerLayers], { x: 0, y: 0, scale: 1 });


        const centerIndex = cardAngles.reduce(
          (closest, angle, index) => Math.abs(angle) < Math.abs(cardAngles[closest]) ? index : closest,
          0,
        );
        const entranceOrder = [centerIndex];
        for (let offset = 1; entranceOrder.length < cards.length; offset++) {
          const left = centerIndex - offset;
          const right = centerIndex + offset;
          if (left >= 0) entranceOrder.push(left);
          if (right < cards.length) entranceOrder.push(right);
        }
        const entranceOffsets = [0, 0.1, 0.2, 0.31, 0.42, 0.54, 0.67, 0.81];

        cards.forEach((card, index) => {
          gsap.set(card, {
            xPercent: -50,
            ...getInitialCardState(cardAngles[index]),
            autoAlpha: 0,
          });
        });

        const entranceTimeline = gsap.timeline({ delay: 0.38 });
        entranceOrder.forEach((index, order) => {
          const angle = cardAngles[index];
          const depth = Math.abs(angle) / maxAngle;
          entranceTimeline.to(cards[index], {
            x: 0,
            y: 0,
            rotation: angle,
            scale: 1,
            autoAlpha: 1,
            duration: 0.92 + depth * 0.16,
            ease: 'power4.out',
          }, entranceOffsets[order] ?? order * 0.12);
        });
        if (hero) {
          const scrollTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          });

          parallaxLayers.forEach((layer, index) => {
            const angle = cardAngles[index];
            const direction = angle / maxAngle;
            const depth = Math.abs(direction);
            const spread = conditions.desktop ? 42 : conditions.mobile ? 14 : 26;
            const drop = conditions.desktop ? 52 : conditions.mobile ? 24 : 36;
            scrollTimeline.to(layer, {
              x: direction * spread,
              y: 10 + depth * drop,
              scale: 1 - depth * 0.018,
              duration: 1,
              ease: 'none',
            }, 0);
          });
        }

        if (!conditions.finePointer || !conditions.desktop) return;

        const moveX = pointerLayers.map((layer) => gsap.quickTo(layer, 'x', { duration: 0.55, ease: 'power3.out' }));
        const moveY = pointerLayers.map((layer) => gsap.quickTo(layer, 'y', { duration: 0.55, ease: 'power3.out' }));
        const handlePointerMove = (event: PointerEvent) => {
          const bounds = visual.getBoundingClientRect();
          const cursorX = (event.clientX - bounds.left) / bounds.width - 0.5;
          const cursorY = (event.clientY - bounds.top) / bounds.height - 0.5;
          pointerLayers.forEach((_, index) => {
            const direction = cardAngles[index] / maxAngle;
            const depth = 0.35 + Math.abs(direction) * 0.65;
            moveX[index](cursorX * direction * 14);
            moveY[index](cursorY * depth * 8);
          });
        };
        const handlePointerLeave = () => {
          moveX.forEach((move) => move(0));
          moveY.forEach((move) => move(0));
        };

        visual.addEventListener('pointermove', handlePointerMove);
        visual.addEventListener('pointerleave', handlePointerLeave);
        return () => {
          visual.removeEventListener('pointermove', handlePointerMove);
          visual.removeEventListener('pointerleave', handlePointerLeave);
          gsap.killTweensOf(pointerLayers);
        };
      });
    }, visual);

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <div ref={visualRef} className="shell hero-visual">
      <div className="fan-stage" aria-label={label}>
        <div className="fan-cards">
          {heroCards.map((card, index) => {
            const angle = cardAngles[index];
            const initial = getInitialCardState(angle);
            const style = {
              '--fan-angle': `${angle}deg`,
              '--hover-counter-angle': `${angle * -0.08}deg`,
              zIndex: 35 + index * 50,
              opacity: 0,
              transform: `translateX(calc(-50% + ${initial.x}px)) translateY(${initial.y}px) rotate(${initial.rotation}deg) scale(${initial.scale})`,
            } as CSSProperties;

            return (
              <div
                ref={(element) => { cardRefs.current[index] = element; }}
                className="fan-card-motion"
                key={card.src}
                style={style}
              >
                <div ref={(element) => { parallaxRefs.current[index] = element; }} className="fan-card-parallax">
                  <div ref={(element) => { pointerRefs.current[index] = element; }} className="fan-card-pointer">
                    <div className="fan-card-hover">
                      <Image
                        src={card.src}
                        alt={`${cardLabel} ${index + 1}`}
                        fill
                        sizes="(max-width:809px) 110px, 300px"
                        priority={index >= 2 && index <= 6}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
