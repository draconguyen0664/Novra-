# Motion audit v2

Audit date: 2026-09-22  
Reference: https://wama.com.br/  
Local: http://localhost:3000/

## Scope and method

This pass changes motion and interaction only. It preserves the existing section order, copy, typography, spacing, colors, assets, and responsive layout.

The reference and local page were measured at 1440 × 900 from the first rendered frame through 1.5 seconds. Both pages were then inspected while scrolling down and back up at 0%, 10%, 25%, 50%, 75%, and 100% of the document. Hover states were sampled on navigation, projects, blog cards, and footer links. The local page was also exercised at 390 × 844 with reduced motion enabled.

Artifacts are stored in `docs/motion-v2/`, including the full JSON report and screenshots for loading and scroll checkpoints.

## Reference behavior observed

- The header remains fixed, changes theme over dark sections, and clears the stage during the long experience sequence.
- The hero uses a staged visual entrance. Eight browser animations remain active after the opening delay on the reference.
- The project fan is the primary continuous hero movement; interaction stays restrained.
- Section content enters near the viewport rather than appearing all at once.
- Project cards reveal independently and their media remains the focus of hover feedback.
- “Experiência / Inovação / Design / Tecnologia” is a long sticky, scroll-scrubbed character sequence.
- Service media carries continuous movement while cards enter in groups.
- Statistic cards retain the measured sticky cascade; their values do not count up.
- The FAQ keeps one answer open initially and animates the transition between answers.
- Blog, contact, and footer motion is subtle and resolves fully at the end of the page.

## First pass: ten largest gaps fixed

1. Added an actual staged hero load sequence for the header, title, support copy, visual, and fan cards.
2. Moved GSAP plugin registration to the client module boundary.
3. Wrapped all page motion in `gsap.context()` and added deterministic teardown.
4. Connected Lenis scroll events to `ScrollTrigger.update()` and GSAP ticker time to `lenis.raf(time * 1000)`.
5. Disabled ticker lag smoothing while Lenis is active and restored it during cleanup.
6. Added masked section-heading reveals with section-specific trigger starts.
7. Replaced the single generic project scale with independent card and description reveals.
8. Rebuilt the experience sequence as a reversible scrubbed character timeline.
9. Added grouped service-card reveals without changing the service grid.
10. Replaced the FAQ `hidden` toggle with an animated height and opacity transition.

## Second pass: next ten gaps fixed

1. Added staggered client-logo entrances while preserving the existing logo hover.
2. Synced header theme and visibility from both native scroll and Lenis updates.
3. Added low-amplitude pointer response to the hero fan.
4. Kept the fan moving continuously with a slow, reversible phase tween.
5. Added separate reveal timing for wide and standard project cards.
6. Added statistic-card and testimonial entrances without altering sticky offsets or values.
7. Added FAQ list and aside staging after the accordion fix.
8. Added staggered blog-card reveals while retaining the measured image hover scale.
9. Added staged contact copy, form, and form-control entrances.
10. Added footer-column reveals and a scroll-linked final wordmark entrance.

## Runtime and lifecycle notes

- Video previews are lazy-loaded near the viewport, played while visible, paused while outside it, and disconnected on unmount.
- Pointer listeners, Lenis listeners, ticker callbacks, delayed refreshes, observers, and GSAP animations are removed on teardown.
- `document.fonts.ready` triggers a refresh so positions are measured after font metrics settle.
- Reduced-motion mode skips smooth scrolling and decorative entrance timelines, displays one experience word, and leaves primary content immediately visible.

## Verification

- `npm run lint`: pass with no warnings.
- `npm run build`: pass; production TypeScript and static generation complete.
- `node scripts/motion-audit-v2.mjs`: pass with no console or page errors on reference or local; full down/up scroll path completed.
- `node scripts/motion-smoke.mjs`: pass at desktop and reduced-motion mobile sizes.
- `npm run qa`: pass at all 12 widths from 360 px through 1920 px with no horizontal overflow.
- No tracked element was stuck at opacity 0 while intersecting the viewport at any audited scroll checkpoint.
- Hero opacity progressed from 0–0.07 during entry to 1.00 after completion.
- FAQ panels animated from 102 px to 0 px and from 0 px to 102 px when switching answers.
- The final footer wordmark reached opacity 1 at the document end.
