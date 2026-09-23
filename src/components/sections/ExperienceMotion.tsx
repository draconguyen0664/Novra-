'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const words = ['Experiência', 'Inovação', 'Design', 'Tecnologia'];

export function ExperienceMotion() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    ScrollTrigger.getById('experience-kinetic')?.kill(true);
    let active = true;

    const context = gsap.context(() => {
      const characters = wordRefs.current.map((word) =>
        word ? gsap.utils.toArray<HTMLElement>('.word-character', word) : [],
      );

      gsap.set(wordRefs.current, { visibility: 'visible' });
      characters.forEach((letters, index) => {
        gsap.set(letters, {
          yPercent: index === 0 ? 0 : 100,
          autoAlpha: index === 0 ? 1 : 0,
        });
      });

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'experience-kinetic',
          trigger: section,
          start: 'top top',
          end: () => '+=' + (innerHeight * 4.5),
          scrub: true,
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: false,
        },
      })
        .to(characters[0], {
          yPercent: -100,
          autoAlpha: 0,
          duration: 0.075,
          stagger: { amount: 0.13, from: 'start' },
        }, 0.093)
        .to(characters[1], {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.1,
          stagger: { amount: 0.126, from: 'start' },
        }, 0.14)
        .to(characters[1], {
          yPercent: -100,
          autoAlpha: 0,
          duration: 0.075,
          stagger: { amount: 0.098, from: 'start' },
        }, 0.41)
        .to(characters[2], {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.08,
          stagger: { amount: 0.125, from: 'start' },
        }, 0.45)
        .to(characters[2], {
          yPercent: -100,
          autoAlpha: 0,
          duration: 0.07,
          stagger: { amount: 0.11, from: 'start' },
        }, 0.71)
        .to(characters[3], {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.07,
          stagger: { amount: 0.115, from: 'start' },
        }, 0.771)
        .to({}, { duration: 0.015 }, 0.985);
    }, section);

    const refresh = () => {
      if (!active) return;
      ScrollTrigger.refresh();
      ScrollTrigger.update();
      section.dataset.motionReady = 'true';
    };
    const refreshFrame = requestAnimationFrame(refresh);
    const handlePageShow = () => refresh();
    window.addEventListener('pageshow', handlePageShow);
    document.fonts.ready.then(refresh);

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      window.removeEventListener('pageshow', handlePageShow);
      delete section.dataset.motionReady;
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="experience experience-section"
      aria-label="Experiência, inovação, design e tecnologia"
      data-dark
    >
      <div ref={stageRef} className="experience-stage experience-sticky">
        <div className="word-window" aria-hidden="true">
          {words.map((word, wordIndex) => (
            <p
              className="experience-word"
              key={word}
              data-word={wordIndex}
              ref={(element) => { wordRefs.current[wordIndex] = element; }}
            >
              {[...word].map((letter, letterIndex) => (
                <span className="word-character-mask" key={`${letter}-${letterIndex}`}>
                  <span className="word-character">{letter}</span>
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}